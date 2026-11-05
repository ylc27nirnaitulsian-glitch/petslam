import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Animal } from '../data/animals';

export interface BattlePlayerAction {
  senderTag: string;
  senderName: string;
  cardType: 'pounce' | 'bark' | 'shield' | 'bite' | 'slam' | 'tag';
  target: 'opponent' | 'opponentAlly';
  damage: number;
  isCrit: boolean;
  isBlocked: boolean;
  newOpponentHp: number;
  newOpponentAllyHp?: number;
  log: string;
  timestamp: number;
}

export interface BattleOpponentAction {
  attacker: 'opponent' | 'opponentAlly';
  target: 'host' | 'partner';
  targetTag: string; // The specific player tag who took the hit
  moveName: string;
  damage: number;
  isUlt?: boolean;
  newHostHp: number;
  newPartnerHp: number;
  isBlocked: boolean;
  log: string;
  timestamp: number;
}

export interface BattleSyncState {
  timerSec: number;
  opponentHp: number;
  opponentAllyHp: number;
  hostHp: number;
  partnerHp: number;
  timestamp: number;
}

export interface BattleConclusion {
  won: boolean;
  reason: 'ko' | 'timeout' | 'forfeit';
  senderTag: string;
}

export interface BattleTacticalChat {
  senderTag: string;
  senderName: string;
  phrase: string;
  timestamp: number;
}

export interface BattleSyncCallbacks {
  onPlayerAction?: (action: BattlePlayerAction) => void;
  onOpponentAction?: (action: BattleOpponentAction) => void;
  onSyncState?: (state: BattleSyncState) => void;
  onBattleConclusion?: (conclusion: BattleConclusion) => void;
  onTacticalChat?: (chat: BattleTacticalChat) => void;
}

class MultiplayerBattleSyncService {
  private activeChannel: any = null;
  private localBroadcast: BroadcastChannel | null = null;
  private currentRoomCode: string = '';
  private myTag: string = '';
  private isHost: boolean = false;
  private callbacks: BattleSyncCallbacks = {};
  public isConnected: boolean = false;

  public initBattle(
    roomCode: string,
    playerTag: string,
    isHost: boolean,
    callbacks: BattleSyncCallbacks
  ): () => void {
    this.leaveBattle();

    const cleanCode = (roomCode || 'SLAM-MATCH').trim().toUpperCase();
    this.currentRoomCode = cleanCode;
    this.myTag = playerTag;
    this.isHost = isHost;
    this.callbacks = callbacks;

    // 1. Setup local BroadcastChannel (instant zero-latency for same-browser multi-tab tests)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcast = new BroadcastChannel(`petslam_battle_${cleanCode}`);
        this.localBroadcast.onmessage = (event) => {
          const { type, payload } = event.data || {};
          this.handleIncomingEvent(type, payload);
        };
      } catch (err) {
        console.warn('[BattleSync] Local BroadcastChannel unavailable:', err);
      }
    }

    // 2. Setup Supabase Realtime Broadcast Channel (for cross-device, mobile & desktop over internet)
    if (supabase && isSupabaseConfigured) {
      try {
        const channelName = `battle_${cleanCode.replace(/[^A-Za-z0-9_]/g, '_')}`;
        const channel = supabase.channel(channelName, {
          config: { broadcast: { self: false } },
        });

        channel
          .on('broadcast', { event: 'player_action' }, ({ payload }) => {
            this.handleIncomingEvent('player_action', payload);
          })
          .on('broadcast', { event: 'opponent_action' }, ({ payload }) => {
            this.handleIncomingEvent('opponent_action', payload);
          })
          .on('broadcast', { event: 'sync_state' }, ({ payload }) => {
            this.handleIncomingEvent('sync_state', payload);
          })
          .on('broadcast', { event: 'battle_concluded' }, ({ payload }) => {
            this.handleIncomingEvent('battle_concluded', payload);
          })
          .on('broadcast', { event: 'tactical_chat' }, ({ payload }) => {
            this.handleIncomingEvent('tactical_chat', payload);
          });

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
          }
        });

        this.activeChannel = channel;
      } catch (err) {
        console.warn('[BattleSync] Realtime channel setup warning:', err);
      }
    }

    return () => {
      this.leaveBattle();
    };
  }

  private handleIncomingEvent(type: string, payload: any) {
    if (!payload) return;

    // Ignore echoes sent by self if broadcast delivers to self
    if (payload.senderTag && payload.senderTag.toUpperCase() === this.myTag.toUpperCase()) {
      return;
    }

    switch (type) {
      case 'player_action':
        this.callbacks.onPlayerAction?.(payload as BattlePlayerAction);
        break;
      case 'opponent_action':
        this.callbacks.onOpponentAction?.(payload as BattleOpponentAction);
        break;
      case 'sync_state':
        this.callbacks.onSyncState?.(payload as BattleSyncState);
        break;
      case 'battle_concluded':
        this.callbacks.onBattleConclusion?.(payload as BattleConclusion);
        break;
      case 'tactical_chat':
        this.callbacks.onTacticalChat?.(payload as BattleTacticalChat);
        break;
    }
  }

  // Send player combat move
  public sendPlayerAction(action: Omit<BattlePlayerAction, 'timestamp'>) {
    const fullAction: BattlePlayerAction = {
      ...action,
      timestamp: Date.now(),
    };

    this.broadcastEvent('player_action', fullAction);
  }

  // Send opponent AI move (executed authoritatively by Host)
  public sendOpponentAction(action: Omit<BattleOpponentAction, 'timestamp'>) {
    const fullAction: BattleOpponentAction = {
      ...action,
      timestamp: Date.now(),
    };

    this.broadcastEvent('opponent_action', fullAction);
  }

  // Host sends periodic state sync heartbeat
  public sendSyncState(state: Omit<BattleSyncState, 'timestamp'>) {
    const fullState: BattleSyncState = {
      ...state,
      timestamp: Date.now(),
    };

    this.broadcastEvent('sync_state', fullState);
  }

  // Send match conclusion (KO / timeout / surrender)
  public sendBattleConclusion(conclusion: BattleConclusion) {
    this.broadcastEvent('battle_concluded', conclusion);
  }

  // Send in-battle quick chat
  public sendTacticalChat(phrase: string, senderName: string) {
    const chat: BattleTacticalChat = {
      senderTag: this.myTag,
      senderName,
      phrase,
      timestamp: Date.now(),
    };

    this.broadcastEvent('tactical_chat', chat);
  }

  private broadcastEvent(event: string, payload: any) {
    // 1. Post to local BroadcastChannel
    try {
      this.localBroadcast?.postMessage({ type: event, payload });
    } catch {}

    // 2. Broadcast to Supabase Realtime channel
    if (this.activeChannel) {
      try {
        this.activeChannel.send({
          type: 'broadcast',
          event,
          payload,
        });
      } catch (err) {
        console.warn(`[BattleSync] Error broadcasting ${event}:`, err);
      }
    }
  }

  public leaveBattle() {
    if (this.localBroadcast) {
      try {
        this.localBroadcast.close();
      } catch {}
      this.localBroadcast = null;
    }

    if (this.activeChannel) {
      try {
        this.activeChannel.unsubscribe();
      } catch {}
      this.activeChannel = null;
    }

    this.currentRoomCode = '';
    this.callbacks = {};
    this.isConnected = false;
  }
}

export const multiplayerBattleSync = new MultiplayerBattleSyncService();
