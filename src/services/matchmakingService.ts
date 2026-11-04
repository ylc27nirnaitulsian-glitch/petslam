import { supabase, isSupabaseConfigured } from './supabaseClient';
import { multiplayerNetcode, MatchFoundData, NetFighterSnapshot } from './multiplayerNetcode';
import { normalizePlayerTag } from './friendNetworkService';

export interface QueueCandidate {
  id: string;
  player_tag: string;
  trainer_name: string;
  beast_data: any;
  mode: '1v1' | '2v2';
  cp: number;
  rating: number;
  status: 'waiting' | 'matched';
  matched_room_id?: string;
  matched_opponent?: any;
  created_at: string;
}

export interface MatchmakingCallbacks {
  onQueueConfirmed?: (info: { poolSize: number; targetBand: string }) => void;
  onMatchFound?: (data: MatchFoundData) => void;
  onError?: (err: string) => void;
}

class MatchmakingService {
  private activeTag: string = '';
  private activeChannel: any = null;
  private queueInterval: any = null;
  private isQueuing: boolean = false;

  public async joinQueue(
    playerTag: string,
    trainerName: string,
    pet: any,
    mode: '1v1' | '2v2' = '1v1',
    rating: number = 1200,
    callbacks: MatchmakingCallbacks
  ): Promise<boolean> {
    const cleanTag = normalizePlayerTag(playerTag);
    this.activeTag = cleanTag;
    this.isQueuing = true;

    const myCp = Math.round(
      (pet?.health || 1000) * 0.4 + (pet?.damage || 80) * 1.5 + (pet?.speed || 50) * 0.5
    );

    const myFighterSnap: NetFighterSnapshot = {
      id: cleanTag,
      name: pet?.name || 'Companion Beast',
      species: pet?.breed || pet?.species || 'Canine/Feline',
      level: pet?.level || 10,
      hp: pet?.health || 1000,
      maxHp: pet?.health || 1000,
      energy: 3,
      maxEnergy: 10,
      damage: pet?.damage || 80,
      defense: pet?.defense || pet?.strength || 40,
      speed: pet?.speed || 50,
      cp: myCp,
      image: pet?.image,
    };

    // 1. Queue via local WebSocket netcode if connected
    try {
      multiplayerNetcode.queueRanked({
        playerId: cleanTag,
        playerName: trainerName || 'Trainer',
        rating,
        pet: {
          id: pet?.id || 'beast_01',
          name: pet?.name || 'Companion',
          species: pet?.breed || 'Canine',
          level: pet?.level || 10,
          health: pet?.health || 1000,
          damage: pet?.damage || 80,
          defense: pet?.strength || 40,
          speed: pet?.speed || 50,
          cp: myCp,
          image: pet?.image,
        },
      });
    } catch {}

    // 2. Queue in Supabase Realtime table (Universal across Web/Mobile/Cloudflare)
    if (supabase && isSupabaseConfigured) {
      try {
        // Clean up any stale records for this user first
        await supabase
          .from('matchmaking_queue')
          .delete()
          .eq('player_tag', cleanTag);

        // Subscribe to Realtime Postgres Changes for this player's queue record
        if (this.activeChannel) {
          try { this.activeChannel.unsubscribe(); } catch {}
        }

        const channel = supabase.channel(`petslam_mm_${cleanTag.replace('#', '')}`);
        channel
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'matchmaking_queue',
              filter: `player_tag=eq.${cleanTag}`,
            },
            (payload: any) => {
              if (payload.new && payload.new.status === 'matched') {
                const row = payload.new;
                this.leaveQueue(cleanTag);

                const opp = row.matched_opponent || {};
                const oppSnap: NetFighterSnapshot = {
                  id: opp.tag || 'opp_challenger',
                  name: opp.beastName || 'Rival Beast',
                  species: opp.beastBreed || 'Apex Challenger',
                  level: opp.level || 10,
                  hp: opp.health || 1050,
                  maxHp: opp.health || 1050,
                  energy: 3,
                  maxEnergy: 10,
                  damage: opp.damage || 85,
                  defense: 45,
                  speed: 55,
                  cp: opp.cp || myCp,
                  image: opp.image,
                };

                const matchData: MatchFoundData = {
                  roomId: row.matched_room_id || `match_${Date.now()}`,
                  p1: {
                    id: cleanTag,
                    name: trainerName || 'Trainer',
                    cp: myCp,
                    rating,
                    fighter: myFighterSnap,
                  },
                  p2: {
                    id: opp.tag || 'opp_rival',
                    name: opp.trainerName || 'Arena Master',
                    cp: opp.cp || myCp,
                    rating: opp.rating || 1200,
                    fighter: oppSnap,
                  },
                  countdown: 3,
                };

                callbacks.onMatchFound?.(matchData);
              }
            }
          )
          .subscribe();

        this.activeChannel = channel;

        // Insert new entry
        const recordId = `mm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await supabase.from('matchmaking_queue').insert({
          id: recordId,
          player_tag: cleanTag,
          trainer_name: trainerName || 'Trainer',
          beast_data: {
            id: pet?.id,
            name: pet?.name,
            breed: pet?.breed || pet?.species,
            health: pet?.health || 1000,
            damage: pet?.damage || 80,
            speed: pet?.speed || 50,
            image: pet?.image,
          },
          mode,
          cp: myCp,
          rating,
          status: 'waiting',
        });

        // 3. Check for waiting opponents in the queue table (±200 CP match)
        const checkOpponents = async () => {
          if (!this.isQueuing || !supabase) return;
          try {
            const { data: candidates, error } = await supabase
              .from('matchmaking_queue')
              .select('*')
              .neq('player_tag', cleanTag)
              .eq('mode', mode)
              .eq('status', 'waiting')
              .order('created_at', { ascending: true })
              .limit(5);

            if (!error && candidates && candidates.length > 0) {
              const matchedOpp = candidates[0];
              const roomId = `MATCH-${Math.floor(1000 + Math.random() * 9000)}`;

              // Pair them up
              await Promise.all([
                supabase
                  .from('matchmaking_queue')
                  .update({
                    status: 'matched',
                    matched_room_id: roomId,
                    matched_opponent: {
                      tag: cleanTag,
                      trainerName,
                      beastName: pet?.name,
                      beastBreed: pet?.breed || pet?.species,
                      health: pet?.health,
                      damage: pet?.damage,
                      image: pet?.image,
                      cp: myCp,
                      rating,
                    },
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', matchedOpp.id),
                supabase
                  .from('matchmaking_queue')
                  .update({
                    status: 'matched',
                    matched_room_id: roomId,
                    matched_opponent: {
                      tag: matchedOpp.player_tag,
                      trainerName: matchedOpp.trainer_name,
                      beastName: matchedOpp.beast_data?.name,
                      beastBreed: matchedOpp.beast_data?.breed,
                      health: matchedOpp.beast_data?.health,
                      damage: matchedOpp.beast_data?.damage,
                      image: matchedOpp.beast_data?.image,
                      cp: matchedOpp.cp,
                      rating: matchedOpp.rating,
                    },
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', recordId),
              ]);
            }
          } catch (pollErr) {
            console.warn('[MatchmakingService] Polling warning:', pollErr);
          }
        };

        // Poll immediately and every 1.5 seconds while waiting
        checkOpponents();
        this.queueInterval = setInterval(checkOpponents, 1500);

        callbacks.onQueueConfirmed?.({
          poolSize: 1,
          targetBand: 'Ranked Queue',
        });
      } catch (err: any) {
        console.warn('[MatchmakingService] Queue error:', err);
      }
    }

    return true;
  }

  public leaveQueue(playerTag?: string) {
    this.isQueuing = false;
    const tag = normalizePlayerTag(playerTag || this.activeTag);

    if (this.queueInterval) {
      clearInterval(this.queueInterval);
      this.queueInterval = null;
    }

    if (this.activeChannel) {
      try { this.activeChannel.unsubscribe(); } catch {}
      this.activeChannel = null;
    }

    try {
      multiplayerNetcode.cancelQueue();
    } catch {}

    if (supabase && isSupabaseConfigured && tag) {
      try {
        supabase
          .from('matchmaking_queue')
          .delete()
          .eq('player_tag', tag)
          .then(() => {});
      } catch {}
    }
  }
}

export const matchmakingService = new MatchmakingService();
