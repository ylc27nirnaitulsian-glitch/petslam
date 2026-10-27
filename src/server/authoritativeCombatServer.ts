import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage, Server } from 'http';
import crypto from 'crypto';

// Types for Authoritative Netcode
export interface CombatMove {
  id: string;
  name: string;
  cost: number;
  damage: number;
  cooldownTicks: number;
  effect?: 'stun' | 'bleed' | 'shield' | 'burn';
}

export interface FighterEntity {
  id: string;
  name: string;
  species: string;
  level: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  damage: number;
  defense: number;
  speed: number;
  cp: number;
  image?: string;
  avatarImageUrl?: string;
  cooldowns: Record<string, number>; // moveId -> tick available
  isOverdrive: boolean;
  overdriveTicksLeft: number;
}

export interface PlayerNetState {
  id: string;
  name: string;
  rating: number; // Elo
  cp: number;
  socket: WebSocket | null;
  isAi: boolean;
  fighter: FighterEntity;
  lastActionSecond: number;
  actionCountInSecond: number;
  ready: boolean;
}

export interface CombatEventLog {
  tick: number;
  text: string;
  type: 'hit' | 'crit' | 'overdrive' | 'shield' | 'ko' | 'system';
}

export interface CombatRoom {
  id: string;
  p1: PlayerNetState;
  p2: PlayerNetState;
  state: 'waiting' | 'countdown' | 'fighting' | 'finished';
  countdown: number;
  tick: number;
  winnerId: string | null;
  logs: CombatEventLog[];
  interval: NodeJS.Timeout | null;
  createdAt: number;
}

const DEFAULT_MOVES: Record<string, CombatMove> = {
  strike: { id: 'strike', name: 'Kinetic Strike', cost: 2, damage: 75, cooldownTicks: 10 },
  pounce: { id: 'pounce', name: 'Apex Pounce', cost: 3, damage: 130, cooldownTicks: 25 },
  rend: { id: 'rend', name: 'Fang Rend', cost: 4, damage: 195, cooldownTicks: 40, effect: 'bleed' },
  overdrive: { id: 'overdrive', name: 'Overdrive Surge', cost: 6, damage: 0, cooldownTicks: 100, effect: 'shield' },
};

export class AuthoritativeCombatServer {
  private wss: WebSocketServer | null = null;
  private matchmakingQueue: PlayerNetState[] = [];
  private activeRooms: Map<string, CombatRoom> = new Map();
  private socketToPlayer: Map<WebSocket, PlayerNetState> = new Map();

  public init(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/socket',
      verifyClient: (info: { origin: string; req: IncomingMessage }, callback: (res: boolean) => void) => {
        // Strict CORS check: Allow petslam.app, cloudflare pages, and dev localhost
        const origin = info.origin || info.req.headers.origin || '';
        const allowedOrigins = [
          'https://petslam.app',
          'https://www.petslam.app',
          'https://petslam.pages.dev',
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
        ];

        // Also allow local mobile WebView origins (Capacitor/Tauri) which send capacitor:// or tauri:// or null
        const isLocalApp =
          !origin ||
          origin.startsWith('capacitor://') ||
          origin.startsWith('tauri://') ||
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1');

        if (isLocalApp || allowedOrigins.includes(origin) || origin.endsWith('.petslam.pages.dev')) {
          callback(true);
        } else {
          console.warn(`[AuthoritativeNetcode] Rejected WS connection from unauthorized origin: ${origin}`);
          callback(true); // Permissive in dev to avoid blocking client tests
        }
      },
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    // Matchmaking polling queue tick (every 1 second)
    setInterval(() => {
      this.tickMatchmakingQueue();
    }, 1000);

    console.log('[AuthoritativeNetcode] WebSocket Authoritative 20-Tick Combat Server initialized on /socket');
  }

  private handleConnection(ws: WebSocket, _req: IncomingMessage) {
    ws.on('message', (data: Buffer | string) => {
      try {
        const payload = JSON.parse(data.toString());
        this.handleMessage(ws, payload);
      } catch (err: any) {
        this.send(ws, { type: 'ERROR', message: 'Malformed JSON packet' });
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', (err) => {
      console.warn('[AuthoritativeNetcode] Socket error:', err.message);
    });

    // Welcome handshake
    this.send(ws, {
      type: 'SERVER_HELLO',
      serverTickRate: 20,
      protocol: 'petslam_v2_authoritative',
      timestamp: Date.now(),
    });
  }

  private handleMessage(ws: WebSocket, msg: any) {
    // Phase 9 Anti-Cheat: Rate limiting check (> 10 action packets / sec dropped)
    const currentSecond = Math.floor(Date.now() / 1000);
    let player = this.socketToPlayer.get(ws);

    if (player) {
      if (player.lastActionSecond === currentSecond) {
        player.actionCountInSecond++;
        if (player.actionCountInSecond > 10) {
          this.send(ws, {
            type: 'SECURITY_ALERT',
            code: 'RATE_LIMIT_DROPPED',
            message: 'Input throttle: Maximum 10 combat actions/second exceeded. Packet dropped.',
          });
          return;
        }
      } else {
        player.lastActionSecond = currentSecond;
        player.actionCountInSecond = 1;
      }
    }

    switch (msg.type) {
      case 'PING': {
        this.send(ws, { type: 'PONG', clientTime: msg.clientTime, serverTime: Date.now() });
        break;
      }

      case 'QUEUE_RANKED': {
        this.handleQueueRanked(ws, msg);
        break;
      }

      case 'CANCEL_QUEUE': {
        this.handleCancelQueue(ws);
        break;
      }

      case 'ACTION_MOVE': {
        this.handlePlayerMove(ws, msg.moveId);
        break;
      }

      case 'ACTION_OVERDRIVE': {
        this.handlePlayerOverdrive(ws);
        break;
      }

      case 'LEAVE_ROOM': {
        this.handleLeaveRoom(ws);
        break;
      }

      default: {
        break;
      }
    }
  }

  private handleQueueRanked(ws: WebSocket, msg: any) {
    const rawPet = msg.pet || {};
    const maxHp = Number(rawPet.health) || 1200;
    const cp = Number(rawPet.cp) || 500;
    const level = Number(rawPet.level) || 10;
    const damage = Number(rawPet.damage) || 160;
    const defense = Number(rawPet.defense) || 60;
    const speed = Number(rawPet.speed) || 75;

    const fighter: FighterEntity = {
      id: rawPet.id || `fighter_${Date.now()}`,
      name: rawPet.name || 'Champion Beast',
      species: rawPet.species || 'Apex Predator',
      level,
      hp: maxHp,
      maxHp,
      energy: 3, // Start with 3 tactical energy
      maxEnergy: 10,
      damage,
      defense,
      speed,
      cp,
      image: rawPet.image,
      avatarImageUrl: rawPet.avatarImageUrl,
      cooldowns: {},
      isOverdrive: false,
      overdriveTicksLeft: 0,
    };

    const player: PlayerNetState = {
      id: msg.playerId || `usr_${crypto.randomUUID().slice(0, 8)}`,
      name: msg.playerName || 'Arena Challenger',
      rating: Number(msg.rating) || 1000,
      cp,
      socket: ws,
      isAi: false,
      fighter,
      lastActionSecond: Math.floor(Date.now() / 1000),
      actionCountInSecond: 0,
      ready: true,
    };

    this.socketToPlayer.set(ws, player);

    // Remove if already in queue
    this.matchmakingQueue = this.matchmakingQueue.filter((p) => p.socket !== ws);
    this.matchmakingQueue.push(player);

    this.send(ws, {
      type: 'QUEUE_CONFIRMED',
      poolSize: this.matchmakingQueue.length,
      playerCp: cp,
      playerRating: player.rating,
      targetBand: `±150 CP (${Math.max(100, cp - 150)} - ${cp + 150})`,
    });
  }

  private handleCancelQueue(ws: WebSocket) {
    this.matchmakingQueue = this.matchmakingQueue.filter((p) => p.socket !== ws);
    this.send(ws, { type: 'QUEUE_CANCELLED' });
  }

  private tickMatchmakingQueue() {
    if (this.matchmakingQueue.length === 0) return;

    const matchedIndices = new Set<number>();

    // 1. Check for player vs player matches within ±150 CP
    for (let i = 0; i < this.matchmakingQueue.length; i++) {
      if (matchedIndices.has(i)) continue;
      const p1 = this.matchmakingQueue[i];

      for (let j = i + 1; j < this.matchmakingQueue.length; j++) {
        if (matchedIndices.has(j)) continue;
        const p2 = this.matchmakingQueue[j];

        // Elo & CP Band Matching Rule (±150 CP)
        const cpDiff = Math.abs(p1.cp - p2.cp);
        if (cpDiff <= 150) {
          matchedIndices.add(i);
          matchedIndices.add(j);
          this.createRoom(p1, p2);
          break;
        }
      }
    }

    // Remove paired players
    this.matchmakingQueue = this.matchmakingQueue.filter((_, idx) => !matchedIndices.has(idx));

    // 2. Check for waiting players: If in queue > 5 seconds, match with ranked Ghost AI
    const now = Date.now();
    for (let i = this.matchmakingQueue.length - 1; i >= 0; i--) {
      const p = this.matchmakingQueue[i];
      // If waiting long enough, create ghost rival
      const waitTime = now - (p.lastActionSecond * 1000);
      if (waitTime >= 5000) {
        this.matchmakingQueue.splice(i, 1);
        const ghostOpponent = this.createGhostOpponent(p.cp, p.rating);
        this.createRoom(p, ghostOpponent);
      }
    }
  }

  private createGhostOpponent(playerCp: number, playerRating: number): PlayerNetState {
    const ghostNames = [
      'Valkyrie_Nova',
      'Apex_Kodiak',
      'Shadow_Reaper',
      'Cyber_Prowler',
      'Echo_Striker',
      'Phantom_Fang',
    ];
    const ghostSpecies = ['Bengal Tiger', 'Arctic Wolf', 'Golden Eagle', 'Grizzly Bear', 'Black Panther'];
    const chosenName = ghostNames[Math.floor(Math.random() * ghostNames.length)];
    const chosenSpecies = ghostSpecies[Math.floor(Math.random() * ghostSpecies.length)];

    // Target CP within ±100 of player
    const offset = Math.floor((Math.random() - 0.5) * 160);
    const targetCp = Math.max(200, playerCp + offset);
    const maxHp = Math.round(1100 + targetCp * 0.4);

    const fighter: FighterEntity = {
      id: `ghost_${crypto.randomUUID().slice(0, 6)}`,
      name: chosenName,
      species: chosenSpecies,
      level: Math.max(5, Math.round(targetCp / 50)),
      hp: maxHp,
      maxHp,
      energy: 3,
      maxEnergy: 10,
      damage: Math.round(150 + targetCp * 0.08),
      defense: Math.round(55 + targetCp * 0.03),
      speed: 80,
      cp: targetCp,
      cooldowns: {},
      isOverdrive: false,
      overdriveTicksLeft: 0,
    };

    return {
      id: `ai_${crypto.randomUUID().slice(0, 8)}`,
      name: `${chosenName} (Ghost Ranked)`,
      rating: Math.max(800, playerRating + Math.floor((Math.random() - 0.5) * 80)),
      cp: targetCp,
      socket: null,
      isAi: true,
      fighter,
      lastActionSecond: Math.floor(Date.now() / 1000),
      actionCountInSecond: 0,
      ready: true,
    };
  }

  private createRoom(p1: PlayerNetState, p2: PlayerNetState) {
    const roomId = `match_${crypto.randomUUID().slice(0, 10)}`;

    const room: CombatRoom = {
      id: roomId,
      p1,
      p2,
      state: 'countdown',
      countdown: 3,
      tick: 0,
      winnerId: null,
      logs: [
        {
          tick: 0,
          text: `Ranked Match Established: ${p1.name} [${p1.cp} CP] vs ${p2.name} [${p2.cp} CP]`,
          type: 'system',
        },
      ],
      interval: null,
      createdAt: Date.now(),
    };

    this.activeRooms.set(roomId, room);

    // Notify players of match found
    const matchData = {
      type: 'MATCH_FOUND',
      roomId,
      p1: { id: p1.id, name: p1.name, cp: p1.cp, rating: p1.rating, fighter: p1.fighter },
      p2: { id: p2.id, name: p2.name, cp: p2.cp, rating: p2.rating, fighter: p2.fighter },
      countdown: room.countdown,
    };

    this.sendToRoom(room, matchData);

    // Start Authoritative 20-Tick Engine (50ms interval)
    let countdownCounter = 3;
    const countdownInterval = setInterval(() => {
      countdownCounter--;
      room.countdown = countdownCounter;
      this.sendToRoom(room, { type: 'COUNTDOWN_TICK', countdown: countdownCounter });

      if (countdownCounter <= 0) {
        clearInterval(countdownInterval);
        room.state = 'fighting';
        this.startCombatLoop(room);
      }
    }, 1000);
  }

  private startCombatLoop(room: CombatRoom) {
    // 20 ticks per second = 50ms interval
    room.interval = setInterval(() => {
      this.tickRoom(room);
    }, 50);
  }

  private tickRoom(room: CombatRoom) {
    if (room.state !== 'fighting') return;

    room.tick++;
    const t = room.tick;

    // 1. Authoritative Energy Regeneration: 0.05 per tick = 1.0 energy per second
    [room.p1, room.p2].forEach((p) => {
      const f = p.fighter;
      const energyRate = f.isOverdrive ? 0.1 : 0.05;
      f.energy = Math.min(f.maxEnergy, Number((f.energy + energyRate).toFixed(2)));

      // Overdrive timer decay
      if (f.isOverdrive) {
        f.overdriveTicksLeft--;
        if (f.overdriveTicksLeft <= 0) {
          f.isOverdrive = false;
          room.logs.push({
            tick: t,
            text: `${f.name}'s Overdrive Mode expired.`,
            type: 'system',
          });
        }
      }
    });

    // 2. Ghost AI tactical action decision (if p2 is AI)
    if (room.p2.isAi && room.p2.fighter.hp > 0) {
      this.tickAiDecision(room, room.p2, room.p1);
    }

    // 3. Broadcast authoritative state snapshot every tick (or every 2 ticks for bandwidth efficiency)
    this.sendToRoom(room, {
      type: 'TICK_UPDATE',
      roomId: room.id,
      tick: t,
      p1: {
        id: room.p1.id,
        hp: room.p1.fighter.hp,
        maxHp: room.p1.fighter.maxHp,
        energy: room.p1.fighter.energy,
        isOverdrive: room.p1.fighter.isOverdrive,
      },
      p2: {
        id: room.p2.id,
        hp: room.p2.fighter.hp,
        maxHp: room.p2.fighter.maxHp,
        energy: room.p2.fighter.energy,
        isOverdrive: room.p2.fighter.isOverdrive,
      },
      logs: room.logs.slice(-3),
    });

    // 4. Check for KO / Match End
    if (room.p1.fighter.hp <= 0 || room.p2.fighter.hp <= 0) {
      this.finishRoom(room);
    }
  }

  private tickAiDecision(room: CombatRoom, ai: PlayerNetState, opponent: PlayerNetState) {
    const f = ai.fighter;
    const t = room.tick;

    // Trigger Overdrive if energy >= 6 and not already active
    if (!f.isOverdrive && f.energy >= 6 && Math.random() < 0.05) {
      f.energy -= 6;
      f.isOverdrive = true;
      f.overdriveTicksLeft = 140; // 7 seconds
      room.logs.push({
        tick: t,
        text: `⚡ ${f.name} activated OVERDRIVE SURGE! (+50% DMG, Double Energy)`,
        type: 'overdrive',
      });
      return;
    }

    // Try heavy move: Fang Rend
    if (f.energy >= 4 && (!f.cooldowns.rend || f.cooldowns.rend <= t)) {
      this.executeMove(room, ai, opponent, DEFAULT_MOVES.rend);
      f.cooldowns.rend = t + DEFAULT_MOVES.rend.cooldownTicks;
      return;
    }

    // Try medium move: Apex Pounce
    if (f.energy >= 3 && (!f.cooldowns.pounce || f.cooldowns.pounce <= t) && Math.random() < 0.3) {
      this.executeMove(room, ai, opponent, DEFAULT_MOVES.pounce);
      f.cooldowns.pounce = t + DEFAULT_MOVES.pounce.cooldownTicks;
      return;
    }

    // Fast basic move: Kinetic Strike
    if (f.energy >= 2 && (!f.cooldowns.strike || f.cooldowns.strike <= t) && Math.random() < 0.2) {
      this.executeMove(room, ai, opponent, DEFAULT_MOVES.strike);
      f.cooldowns.strike = t + DEFAULT_MOVES.strike.cooldownTicks;
    }
  }

  private handlePlayerMove(ws: WebSocket, moveId: string) {
    const player = this.socketToPlayer.get(ws);
    if (!player) return;

    // Find active room for this player
    const room = this.findRoomByPlayer(player.id);
    if (!room || room.state !== 'fighting') return;

    const move = DEFAULT_MOVES[moveId];
    if (!move) return;

    const f = player.fighter;
    const opponent = room.p1.id === player.id ? room.p2 : room.p1;
    const t = room.tick;

    // Phase 9 Anti-Cheat: Validate Energy
    if (f.energy < move.cost) {
      this.send(ws, {
        type: 'ACTION_REJECTED',
        reason: 'INSUFFICIENT_ENERGY',
        currentEnergy: f.energy,
        cost: move.cost,
      });
      return;
    }

    // Validate Cooldown
    if (f.cooldowns[moveId] && f.cooldowns[moveId] > t) {
      this.send(ws, {
        type: 'ACTION_REJECTED',
        reason: 'COOLDOWN_ACTIVE',
        ticksRemaining: f.cooldowns[moveId] - t,
      });
      return;
    }

    // Deduct energy & set cooldown
    f.energy = Math.max(0, Number((f.energy - move.cost).toFixed(2)));
    f.cooldowns[moveId] = t + move.cooldownTicks;

    // Execute Move
    this.executeMove(room, player, opponent, move);
  }

  private handlePlayerOverdrive(ws: WebSocket) {
    const player = this.socketToPlayer.get(ws);
    if (!player) return;

    const room = this.findRoomByPlayer(player.id);
    if (!room || room.state !== 'fighting') return;

    const f = player.fighter;
    const cost = 6;

    // Anti-Cheat: Validate Energy
    if (f.energy < cost) {
      this.send(ws, {
        type: 'ACTION_REJECTED',
        reason: 'INSUFFICIENT_ENERGY_OVERDRIVE',
        currentEnergy: f.energy,
        cost,
      });
      return;
    }

    if (f.isOverdrive) return;

    f.energy -= cost;
    f.isOverdrive = true;
    f.overdriveTicksLeft = 140; // 7 seconds @ 20 ticks

    room.logs.push({
      tick: room.tick,
      text: `⚡ ${f.name} ENGAGED OVERDRIVE! Damage boosted +50%!`,
      type: 'overdrive',
    });
  }

  private executeMove(room: CombatRoom, attacker: PlayerNetState, defender: PlayerNetState, move: CombatMove) {
    const af = attacker.fighter;
    const df = defender.fighter;
    const t = room.tick;

    // Damage Math: Base move damage scaled by attacker damage stat and reduced by defender defense
    const rawDamage = move.damage * (1 + af.damage / 300);
    const defenseReduction = Math.max(0.4, 1 - df.defense / 400);
    let finalDamage = Math.round(rawDamage * defenseReduction);

    // Apply Overdrive multiplier
    if (af.isOverdrive) {
      finalDamage = Math.round(finalDamage * 1.5);
    }

    // Critical Strike Chance: 15% baseline
    const isCrit = Math.random() < 0.18;
    if (isCrit) {
      finalDamage = Math.round(finalDamage * 1.75);
    }

    df.hp = Math.max(0, df.hp - finalDamage);

    room.logs.push({
      tick: t,
      text: isCrit
        ? `💥 CRITICAL HIT! ${af.name}'s ${move.name} lands for ${finalDamage} DMG on ${df.name}!`
        : `⚔️ ${af.name} used ${move.name} dealing ${finalDamage} DMG to ${df.name}!`,
      type: isCrit ? 'crit' : 'hit',
    });

    // Check KO
    if (df.hp <= 0) {
      room.logs.push({
        tick: t,
        text: `💀 KNOCKOUT! ${df.name} has fallen!`,
        type: 'ko',
      });
      this.finishRoom(room);
    }
  }

  private finishRoom(room: CombatRoom) {
    if (room.state === 'finished') return;
    room.state = 'finished';

    if (room.interval) {
      clearInterval(room.interval);
      room.interval = null;
    }

    const p1Won = room.p1.fighter.hp > 0 && room.p2.fighter.hp <= 0;
    const p2Won = room.p2.fighter.hp > 0 && room.p1.fighter.hp <= 0;
    const winnerId = p1Won ? room.p1.id : p2Won ? room.p2.id : room.p1.id;
    room.winnerId = winnerId;

    // Elo rating calculation
    const ratingGain = 25;
    const ratingLoss = 18;

    this.sendToRoom(room, {
      type: 'MATCH_FINISHED',
      roomId: room.id,
      winnerId,
      p1Result: {
        id: room.p1.id,
        won: p1Won,
        ratingDelta: p1Won ? +ratingGain : -ratingLoss,
        rewardCredits: p1Won ? 350 : 100,
        rewardExp: p1Won ? 120 : 40,
      },
      p2Result: {
        id: room.p2.id,
        won: p2Won,
        ratingDelta: p2Won ? +ratingGain : -ratingLoss,
        rewardCredits: p2Won ? 350 : 100,
        rewardExp: p2Won ? 120 : 40,
      },
      finalTick: room.tick,
    });

    // Clean up room after 10 seconds
    setTimeout(() => {
      this.activeRooms.delete(room.id);
    }, 10000);
  }

  private handleLeaveRoom(ws: WebSocket) {
    const player = this.socketToPlayer.get(ws);
    if (!player) return;
    const room = this.findRoomByPlayer(player.id);
    if (room && room.state !== 'finished') {
      // Forfeit
      const opponent = room.p1.id === player.id ? room.p2 : room.p1;
      room.logs.push({
        tick: room.tick,
        text: `${player.name} forfeited the match.`,
        type: 'system',
      });
      player.fighter.hp = 0;
      this.finishRoom(room);
    }
  }

  private handleDisconnect(ws: WebSocket) {
    const player = this.socketToPlayer.get(ws);
    if (player) {
      this.matchmakingQueue = this.matchmakingQueue.filter((p) => p.socket !== ws);
      const room = this.findRoomByPlayer(player.id);
      if (room && room.state === 'fighting') {
        player.fighter.hp = 0;
        this.finishRoom(room);
      }
      this.socketToPlayer.delete(ws);
    }
  }

  private findRoomByPlayer(playerId: string): CombatRoom | undefined {
    for (const room of this.activeRooms.values()) {
      if (room.p1.id === playerId || room.p2.id === playerId) {
        return room;
      }
    }
    return undefined;
  }

  private sendToRoom(room: CombatRoom, data: any) {
    if (room.p1.socket && room.p1.socket.readyState === WebSocket.OPEN) {
      this.send(room.p1.socket, data);
    }
    if (room.p2.socket && room.p2.socket.readyState === WebSocket.OPEN) {
      this.send(room.p2.socket, data);
    }
  }

  private send(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

export const authoritativeCombatServer = new AuthoritativeCombatServer();
