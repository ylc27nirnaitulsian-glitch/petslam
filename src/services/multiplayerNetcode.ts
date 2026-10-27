/**
 * Client Authoritative Multiplayer Netcode Client for PET SLAM
 * Connects to ws(s)://.../socket, measures latency, and synchronizes combat ticks
 */

export interface NetFighterSnapshot {
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
  isOverdrive?: boolean;
}

export interface MatchFoundData {
  roomId: string;
  p1: { id: string; name: string; cp: number; rating: number; fighter: NetFighterSnapshot };
  p2: { id: string; name: string; cp: number; rating: number; fighter: NetFighterSnapshot };
  countdown: number;
}

export interface TickUpdateData {
  roomId: string;
  tick: number;
  p1: { id: string; hp: number; maxHp: number; energy: number; isOverdrive: boolean };
  p2: { id: string; hp: number; maxHp: number; energy: number; isOverdrive: boolean };
  logs: Array<{ tick: number; text: string; type: string }>;
}

export interface MatchFinishedData {
  roomId: string;
  winnerId: string;
  p1Result: { id: string; won: boolean; ratingDelta: number; rewardCredits: number; rewardExp: number };
  p2Result: { id: string; won: boolean; ratingDelta: number; rewardCredits: number; rewardExp: number };
  finalTick: number;
}

type NetcodeListener = (event: string, data: any) => void;

class MultiplayerNetcodeClient {
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;
  private listeners: Set<NetcodeListener> = new Set();
  private pingInterval: any = null;
  public latencyMs: number = 0;
  public isConnected: boolean = false;
  public currentRoomId: string | null = null;
  public inQueue: boolean = false;

  private resolveSocketUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:3000/socket';

    // If native Capacitor or Tauri, connect directly to production WSS
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
    const isTauri = !!(window as any).__TAURI__;

    if (isCapacitor || isTauri) {
      return 'wss://petslam.app/socket';
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/socket`;
  }

  public connect(): Promise<boolean> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }
    if (this.isConnecting) {
      return Promise.resolve(false);
    }

    this.isConnecting = true;
    const url = this.resolveSocketUrl();

    return new Promise((resolve) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.startPingLoop();
          this.emit('connected', { latency: this.latencyMs });
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.handleIncoming(msg);
          } catch {}
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.stopPingLoop();
          this.emit('disconnected', {});
          resolve(false);
        };

        this.socket.onerror = () => {
          this.isConnecting = false;
          resolve(false);
        };
      } catch {
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  private startPingLoop() {
    this.stopPingLoop();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({ type: 'PING', clientTime: Date.now() });
      }
    }, 3000);
  }

  private stopPingLoop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleIncoming(msg: any) {
    switch (msg.type) {
      case 'PONG': {
        this.latencyMs = Math.max(5, Math.round(Date.now() - msg.clientTime));
        this.emit('latency', { latencyMs: this.latencyMs });
        break;
      }

      case 'QUEUE_CONFIRMED': {
        this.inQueue = true;
        this.emit('queue_confirmed', msg);
        break;
      }

      case 'QUEUE_CANCELLED': {
        this.inQueue = false;
        this.emit('queue_cancelled', msg);
        break;
      }

      case 'MATCH_FOUND': {
        this.inQueue = false;
        this.currentRoomId = msg.roomId;
        this.emit('match_found', msg as MatchFoundData);
        break;
      }

      case 'COUNTDOWN_TICK': {
        this.emit('countdown_tick', msg.countdown);
        break;
      }

      case 'TICK_UPDATE': {
        this.emit('tick_update', msg as TickUpdateData);
        break;
      }

      case 'MATCH_FINISHED': {
        this.emit('match_finished', msg as MatchFinishedData);
        break;
      }

      case 'ACTION_REJECTED': {
        this.emit('action_rejected', msg);
        break;
      }

      case 'SECURITY_ALERT': {
        console.warn('[Netcode] Security Alert from server:', msg.message);
        this.emit('security_alert', msg);
        break;
      }

      default:
        this.emit(msg.type, msg);
    }
  }

  public queueRanked(playerData: {
    playerId: string;
    playerName: string;
    rating: number;
    pet: any;
  }) {
    if (!this.isConnected) {
      this.connect().then(() => {
        this.send({ type: 'QUEUE_RANKED', ...playerData });
      });
      return;
    }
    this.send({ type: 'QUEUE_RANKED', ...playerData });
  }

  public cancelQueue() {
    this.send({ type: 'CANCEL_QUEUE' });
    this.inQueue = false;
  }

  public sendMove(moveId: string) {
    this.send({ type: 'ACTION_MOVE', moveId, timestamp: Date.now() });
  }

  public sendOverdrive() {
    this.send({ type: 'ACTION_OVERDRIVE', timestamp: Date.now() });
  }

  public leaveRoom() {
    this.send({ type: 'LEAVE_ROOM' });
    this.currentRoomId = null;
  }

  public subscribe(listener: NetcodeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: string, data: any) {
    this.listeners.forEach((fn) => fn(event, data));
  }

  private send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

export const multiplayerNetcode = new MultiplayerNetcodeClient();
