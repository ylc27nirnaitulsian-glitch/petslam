import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Animal } from '../data/animals';

export interface FriendRequestItem {
  id: string;
  sender_tag: string;
  sender_name: string;
  sender_beast: string;
  receiver_tag: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at?: string;
}

export interface FriendLobbyItem {
  id: string;
  room_code: string;
  host_tag: string;
  host_name: string;
  host_beast: any;
  guest_tag?: string;
  guest_name?: string;
  guest_beast?: any;
  mode: 'duel' | '2v2' | 'hangout';
  status: 'waiting' | 'ready' | 'fighting' | 'closed';
  opponents?: any[];
  created_at: string;
  updated_at?: string;
}

export interface SocialCallbacks {
  onIncomingRequest?: (req: FriendRequestItem) => void;
  onRequestAccepted?: (req: FriendRequestItem) => void;
  onLobbyInvite?: (lobby: FriendLobbyItem) => void;
  onLobbyUpdated?: (lobby: FriendLobbyItem) => void;
}

/**
 * Normalizes player tags (e.g. "4821" -> "#SLAM-4821", "slam-4821" -> "#SLAM-4821", "#VIPER-99" -> "#VIPER-99")
 */
export function normalizePlayerTag(tag: string): string {
  if (!tag) return '';
  let clean = tag.trim().toUpperCase();
  if (!clean.startsWith('#')) {
    clean = `#${clean}`;
  }
  // If user only typed 4 digits like #4821, expand to standard #SLAM-4821 format
  if (/^#\d{4}$/.test(clean)) {
    clean = clean.replace('#', '#SLAM-');
  }
  return clean;
}

class FriendNetworkService {
  private activeChannel: any = null;
  private currentTag: string = '';
  private localBroadcast: BroadcastChannel | null = null;
  private listeners: Set<SocialCallbacks> = new Set();
  private isSubscribed: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcast = new BroadcastChannel('petslam_social_local');
        this.localBroadcast.onmessage = (ev) => {
          const { type, data } = ev.data || {};
          this.handleMessage(type, data);
        };
      } catch {}
    }
  }

  // Subscribe to real-time incoming requests & invites for current user's tag
  public init(myTag: string, callbacks: SocialCallbacks) {
    const cleanTag = normalizePlayerTag(myTag);
    this.listeners.add(callbacks);

    // If tag changed or not subscribed yet, setup channel
    if (cleanTag && (cleanTag !== this.currentTag || !this.isSubscribed)) {
      this.currentTag = cleanTag;
      this.setupRealtimeSubscription(cleanTag);
    }

    return () => {
      this.listeners.delete(callbacks);
    };
  }

  private setupRealtimeSubscription(tag: string) {
    if (this.activeChannel) {
      try {
        this.activeChannel.unsubscribe();
      } catch {}
      this.activeChannel = null;
      this.isSubscribed = false;
    }

    if (!supabase || !isSupabaseConfigured) return;

    try {
      const channelName = `petslam_social_${tag.replace('#', '')}`;
      const channel = supabase.channel(channelName, {
        config: { broadcast: { self: false } },
      });

      // 1. Postgres Changes (Guaranteed database-backed push for friend requests)
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friend_requests',
            filter: `receiver_tag=eq.${tag}`,
          },
          (payload: any) => {
            if (payload.new) {
              this.notifyIncomingRequest(payload.new as FriendRequestItem);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'friend_requests',
            filter: `sender_tag=eq.${tag}`,
          },
          (payload: any) => {
            if (payload.new && payload.new.status === 'accepted') {
              this.notifyRequestAccepted(payload.new as FriendRequestItem);
            }
          }
        )
        // 2. Postgres Changes for Friend Lobbies
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friend_lobbies',
            filter: `guest_tag=eq.${tag}`,
          },
          (payload: any) => {
            if (payload.new) {
              this.notifyLobbyInvite(payload.new as FriendLobbyItem);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'friend_lobbies',
          },
          (payload: any) => {
            const lobby = payload.new as FriendLobbyItem;
            if (
              lobby &&
              (normalizePlayerTag(lobby.host_tag) === tag ||
                normalizePlayerTag(lobby.guest_tag || '') === tag)
            ) {
              this.notifyLobbyUpdated(lobby);
            }
          }
        )
        // 3. Low-Latency Ephemeral Broadcasts (Immediate instant signal)
        .on('broadcast', { event: 'friend_request' }, ({ payload }) => {
          if (payload && normalizePlayerTag(payload.receiver_tag) === tag) {
            this.notifyIncomingRequest(payload);
          }
        })
        .on('broadcast', { event: 'friend_accepted' }, ({ payload }) => {
          if (payload && normalizePlayerTag(payload.sender_tag) === tag) {
            this.notifyRequestAccepted(payload);
          }
        })
        .on('broadcast', { event: 'lobby_invite' }, ({ payload }) => {
          if (payload && normalizePlayerTag(payload.guest_tag || '') === tag) {
            this.notifyLobbyInvite(payload);
          }
        })
        .on('broadcast', { event: 'lobby_updated' }, ({ payload }) => {
          if (
            payload &&
            (normalizePlayerTag(payload.host_tag) === tag ||
              normalizePlayerTag(payload.guest_tag || '') === tag)
          ) {
            this.notifyLobbyUpdated(payload);
          }
        });

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true;
        }
      });

      this.activeChannel = channel;
    } catch (err) {
      console.warn('[FriendNetwork] Realtime subscription notice:', err);
    }
  }

  private handleMessage(type: string, data: any) {
    if (!data) return;
    const currentNorm = normalizePlayerTag(this.currentTag);

    if (type === 'friend_request' && normalizePlayerTag(data.receiver_tag) === currentNorm) {
      this.notifyIncomingRequest(data);
    } else if (type === 'friend_accepted' && normalizePlayerTag(data.sender_tag) === currentNorm) {
      this.notifyRequestAccepted(data);
    } else if (type === 'lobby_invite' && normalizePlayerTag(data.guest_tag || '') === currentNorm) {
      this.notifyLobbyInvite(data);
    } else if (
      type === 'lobby_updated' &&
      (normalizePlayerTag(data.host_tag) === currentNorm || normalizePlayerTag(data.guest_tag || '') === currentNorm)
    ) {
      this.notifyLobbyUpdated(data);
    }
  }

  private notifyIncomingRequest(req: FriendRequestItem) {
    this.listeners.forEach((l) => l.onIncomingRequest?.(req));
  }

  private notifyRequestAccepted(req: FriendRequestItem) {
    this.listeners.forEach((l) => l.onRequestAccepted?.(req));
  }

  private notifyLobbyInvite(lobby: FriendLobbyItem) {
    this.listeners.forEach((l) => l.onLobbyInvite?.(lobby));
  }

  private notifyLobbyUpdated(lobby: FriendLobbyItem) {
    this.listeners.forEach((l) => l.onLobbyUpdated?.(lobby));
  }

  // 1. Send Friend Request across devices
  public async sendFriendRequest(
    receiverTag: string,
    senderTag: string,
    senderName: string,
    senderBeastName: string
  ): Promise<{ success: boolean; message: string; req?: FriendRequestItem }> {
    const cleanReceiver = normalizePlayerTag(receiverTag);
    const cleanSender = normalizePlayerTag(senderTag);

    if (!cleanReceiver || cleanReceiver.length < 3) {
      return { success: false, message: 'Please enter a valid player tag (e.g. #SLAM-1234).' };
    }
    if (cleanReceiver === cleanSender) {
      return { success: false, message: 'You cannot send a friend request to yourself!' };
    }

    const payload: FriendRequestItem = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      sender_tag: cleanSender,
      sender_name: senderName || 'Trainer',
      sender_beast: senderBeastName || 'Kaiser (Shepherd)',
      receiver_tag: cleanReceiver,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Save to Supabase table
    let savedToSupabase = false;
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('friend_requests').insert({
          id: payload.id,
          sender_tag: payload.sender_tag,
          sender_name: payload.sender_name,
          sender_beast: payload.sender_beast,
          receiver_tag: payload.receiver_tag,
          status: 'pending',
        });

        if (error) {
          console.warn('[FriendNetwork] Supabase insert friend_requests error:', error.message);
        } else {
          savedToSupabase = true;
        }

        // Broadcast directly to target player's channel
        const receiverChannelName = `petslam_social_${cleanReceiver.replace('#', '')}`;
        const targetChannel = supabase.channel(receiverChannelName);
        targetChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            targetChannel.send({
              type: 'broadcast',
              event: 'friend_request',
              payload,
            });
            setTimeout(() => {
              try { targetChannel.unsubscribe(); } catch {}
            }, 2500);
          }
        });
      } catch (err: any) {
        console.warn('[FriendNetwork] Could not insert to Supabase friend_requests:', err.message);
      }
    }

    // Broadcast on local channel for same-machine tab testing
    this.localBroadcast?.postMessage({ type: 'friend_request', data: payload });

    // Store in sent requests in localStorage
    try {
      const existingSent = JSON.parse(localStorage.getItem('petslam_sent_friend_requests') || '[]');
      if (!existingSent.some((r: any) => r.receiver_tag === cleanReceiver)) {
        existingSent.unshift(payload);
        localStorage.setItem('petslam_sent_friend_requests', JSON.stringify(existingSent.slice(0, 20)));
      }
    } catch {}

    return {
      success: true,
      message: `Friend request sent to ${cleanReceiver}! Awaiting their confirmation.`,
      req: payload,
    };
  }

  // 2. Fetch Incoming Friend Requests
  public async fetchIncomingRequests(myTag: string): Promise<FriendRequestItem[]> {
    const cleanTag = normalizePlayerTag(myTag);
    if (!cleanTag) return [];

    let requests: FriendRequestItem[] = [];

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('receiver_tag', cleanTag)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && Array.isArray(data)) {
          requests = data as FriendRequestItem[];
        } else if (error) {
          console.warn('[FriendNetwork] Error fetching friend requests:', error.message);
        }
      } catch (err: any) {
        console.warn('[FriendNetwork] Error fetching friend requests exception:', err.message);
      }
    }

    // Merge with any cached incoming requests
    try {
      const cached = JSON.parse(localStorage.getItem('petslam_pending_friend_requests') || '[]');
      const map = new Map<string, FriendRequestItem>();
      requests.forEach((r) => map.set(r.id, r));
      cached.forEach((c: FriendRequestItem) => {
        if (normalizePlayerTag(c.receiver_tag) === cleanTag && c.status === 'pending') {
          map.set(c.id, c);
        }
      });
      requests = Array.from(map.values());
    } catch {}

    return requests;
  }

  // 2b. Fetch Accepted Friends from Supabase
  public async fetchAcceptedFriends(myTag: string): Promise<FriendRequestItem[]> {
    const cleanTag = normalizePlayerTag(myTag);
    if (!cleanTag) return [];

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`sender_tag.eq.${cleanTag},receiver_tag.eq.${cleanTag}`)
          .eq('status', 'accepted')
          .order('updated_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data as FriendRequestItem[];
        }
      } catch (err) {
        console.warn('[FriendNetwork] Error fetching accepted friends:', err);
      }
    }
    return [];
  }

  // 3. Accept Friend Request
  public async acceptFriendRequest(
    request: FriendRequestItem,
    myTag: string,
    myName: string
  ): Promise<boolean> {
    const cleanTag = normalizePlayerTag(myTag);
    const updated: FriendRequestItem = { ...request, status: 'accepted', updated_at: new Date().toISOString() };

    // Update in Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('friend_requests')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', request.id);

        if (error) {
          console.warn('[FriendNetwork] Error updating friend request in Supabase:', error.message);
        }

        // Broadcast to sender that request was accepted
        const senderChannelName = `petslam_social_${normalizePlayerTag(request.sender_tag).replace('#', '')}`;
        const senderChannel = supabase.channel(senderChannelName);
        senderChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            senderChannel.send({
              type: 'broadcast',
              event: 'friend_accepted',
              payload: updated,
            });
            setTimeout(() => {
              try { senderChannel.unsubscribe(); } catch {}
            }, 2500);
          }
        });
      } catch (err: any) {
        console.warn('[FriendNetwork] Error updating friend request in Supabase:', err.message);
      }
    }

    // Broadcast local
    this.localBroadcast?.postMessage({ type: 'friend_accepted', data: updated });

    // Remove from local pending
    try {
      const cached = JSON.parse(localStorage.getItem('petslam_pending_friend_requests') || '[]');
      const filtered = cached.filter((r: any) => r.id !== request.id);
      localStorage.setItem('petslam_pending_friend_requests', JSON.stringify(filtered));
    } catch {}

    return true;
  }

  // 4. Decline Friend Request
  public async declineFriendRequest(requestId: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('friend_requests')
          .update({ status: 'declined', updated_at: new Date().toISOString() })
          .eq('id', requestId);
      } catch {}
    }

    try {
      const cached = JSON.parse(localStorage.getItem('petslam_pending_friend_requests') || '[]');
      const filtered = cached.filter((r: any) => r.id !== requestId);
      localStorage.setItem('petslam_pending_friend_requests', JSON.stringify(filtered));
    } catch {}

    return true;
  }

  // 5. Create Shared Party Lobby / Duel Challenge
  public async createLobby(
    hostTag: string,
    hostName: string,
    hostBeast: Animal,
    guestTag?: string,
    mode: 'duel' | '2v2' | 'hangout' = 'duel'
  ): Promise<FriendLobbyItem> {
    const cleanHost = normalizePlayerTag(hostTag);
    const cleanGuest = guestTag ? normalizePlayerTag(guestTag) : undefined;
    const roomCode = `SLAM-${Math.floor(1000 + Math.random() * 9000)}`;

    const lobby: FriendLobbyItem = {
      id: `lob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      room_code: roomCode,
      host_tag: cleanHost,
      host_name: hostName || 'Trainer',
      host_beast: {
        id: hostBeast.id,
        name: hostBeast.name,
        breed: hostBeast.breed,
        image: hostBeast.image,
        rarity: hostBeast.rarity,
        category: hostBeast.category,
        health: hostBeast.health,
        damage: hostBeast.damage,
        level: hostBeast.level || 10,
      },
      guest_tag: cleanGuest,
      mode,
      status: 'waiting',
      created_at: new Date().toISOString(),
    };

    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('friend_lobbies').insert({
          id: lobby.id,
          room_code: lobby.room_code,
          host_tag: lobby.host_tag,
          host_name: lobby.host_name,
          host_beast: lobby.host_beast,
          guest_tag: lobby.guest_tag,
          mode: lobby.mode,
          status: 'waiting',
        });

        if (error) {
          console.warn('[FriendNetwork] Supabase insert lobby error:', error.message);
        }

        // Broadcast invite to guest's channel if specified
        if (cleanGuest) {
          const guestChannelName = `petslam_social_${cleanGuest.replace('#', '')}`;
          const guestChannel = supabase.channel(guestChannelName);
          guestChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              guestChannel.send({
                type: 'broadcast',
                event: 'lobby_invite',
                payload: lobby,
              });
              setTimeout(() => {
                try { guestChannel.unsubscribe(); } catch {}
              }, 2500);
            }
          });
        }
      } catch (err: any) {
        console.warn('[FriendNetwork] Error inserting lobby into Supabase:', err.message);
      }
    }

    this.localBroadcast?.postMessage({ type: 'lobby_invite', data: lobby });
    return lobby;
  }

  // 5b. Send Lobby Invite to a friend
  public async sendLobbyInvite(
    roomCode: string,
    guestTag: string,
    hostName: string,
    hostBeast: Animal,
    mode: 'duel' | '2v2' = 'duel'
  ): Promise<boolean> {
    const cleanGuest = normalizePlayerTag(guestTag);
    if (!cleanGuest) return false;

    const lobbyData: FriendLobbyItem = {
      id: `lob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      room_code: roomCode,
      host_tag: this.currentTag,
      host_name: hostName || 'Trainer',
      host_beast: {
        id: hostBeast.id,
        name: hostBeast.name,
        breed: hostBeast.breed,
        image: hostBeast.image,
      },
      guest_tag: cleanGuest,
      mode,
      status: 'waiting',
      created_at: new Date().toISOString(),
    };

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('friend_lobbies')
          .update({ guest_tag: cleanGuest })
          .eq('room_code', roomCode);

        const guestChannelName = `petslam_social_${cleanGuest.replace('#', '')}`;
        const guestChannel = supabase.channel(guestChannelName);
        guestChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            guestChannel.send({
              type: 'broadcast',
              event: 'lobby_invite',
              payload: lobbyData,
            });
            setTimeout(() => {
              try { guestChannel.unsubscribe(); } catch {}
            }, 2500);
          }
        });
      } catch (err) {
        console.warn('[FriendNetwork] Error sending lobby invite:', err);
      }
    }

    this.localBroadcast?.postMessage({ type: 'lobby_invite', data: lobbyData });
    return true;
  }

  // 6. Join / Accept Shared Party Lobby
  public async joinLobby(
    lobbyId: string,
    guestTag: string,
    guestName: string,
    guestBeast: Animal
  ): Promise<FriendLobbyItem | null> {
    const cleanGuest = normalizePlayerTag(guestTag);

    const guestBeastData = {
      id: guestBeast.id,
      name: guestBeast.name,
      breed: guestBeast.breed,
      image: guestBeast.image,
      rarity: guestBeast.rarity,
      category: guestBeast.category,
      health: guestBeast.health,
      damage: guestBeast.damage,
      level: guestBeast.level || 10,
    };

    let updatedLobby: FriendLobbyItem | null = null;

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('friend_lobbies')
          .update({
            guest_tag: cleanGuest,
            guest_name: guestName || 'Trainer',
            guest_beast: guestBeastData,
            status: 'ready',
            updated_at: new Date().toISOString(),
          })
          .eq('id', lobbyId)
          .select('*')
          .single();

        if (!error && data) {
          updatedLobby = data as FriendLobbyItem;

          // Broadcast to host that guest has joined
          const hostChannelName = `petslam_social_${normalizePlayerTag(updatedLobby.host_tag).replace('#', '')}`;
          const hostChannel = supabase.channel(hostChannelName);
          hostChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              hostChannel.send({
                type: 'broadcast',
                event: 'lobby_updated',
                payload: updatedLobby,
              });
              setTimeout(() => {
                try { hostChannel.unsubscribe(); } catch {}
              }, 2500);
            }
          });
        }
      } catch (err) {
        console.warn('[FriendNetwork] Error joining lobby in Supabase:', err);
      }
    }

    if (!updatedLobby) {
      updatedLobby = {
        id: lobbyId,
        room_code: 'SLAM-LOCAL',
        host_tag: 'HOST',
        host_name: 'Trainer Host',
        host_beast: guestBeastData,
        guest_tag: cleanGuest,
        guest_name: guestName,
        guest_beast: guestBeastData,
        mode: 'duel',
        status: 'ready',
        created_at: new Date().toISOString(),
      };
    }

    this.localBroadcast?.postMessage({ type: 'lobby_updated', data: updatedLobby });
    return updatedLobby;
  }

  // 6b. Host Launches Battle from Party Lobby (Broadcasts to guest so both launch together)
  public async launchPartyMatch(
    lobbyId: string | undefined,
    roomCode: string,
    mode: 'duel' | '2v2',
    hostTag: string,
    hostName: string,
    hostBeast: Animal,
    guestTag?: string,
    opponents?: Animal[]
  ): Promise<void> {
    const cleanRoom = roomCode.trim().toUpperCase();
    const payload: Partial<FriendLobbyItem> = {
      room_code: cleanRoom,
      host_tag: hostTag,
      host_name: hostName,
      host_beast: hostBeast,
      guest_tag: guestTag,
      mode,
      status: 'fighting',
      opponents,
      updated_at: new Date().toISOString(),
    };

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('friend_lobbies')
          .update({
            status: 'fighting',
            mode,
            opponents,
            updated_at: new Date().toISOString(),
          })
          .eq('room_code', cleanRoom);

        if (guestTag) {
          const guestChannelName = `petslam_social_${normalizePlayerTag(guestTag).replace('#', '')}`;
          const guestChannel = supabase.channel(guestChannelName);
          guestChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              guestChannel.send({
                type: 'broadcast',
                event: 'lobby_updated',
                payload,
              });
              setTimeout(() => {
                try { guestChannel.unsubscribe(); } catch {}
              }, 2500);
            }
          });
        }
      } catch (err) {
        console.warn('[FriendNetwork] Error updating lobby status to fighting:', err);
      }
    }

    this.localBroadcast?.postMessage({ type: 'lobby_updated', data: payload });
  }

  // 6b. Join Lobby by Room Code
  public async joinLobbyByCode(
    roomCode: string,
    guestTag: string,
    guestName: string,
    guestBeast: Animal
  ): Promise<FriendLobbyItem | null> {
    let cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode.startsWith('SLAM-')) {
      cleanCode = `SLAM-${cleanCode.replace(/[^0-9]/g, '')}`;
    }
    const cleanGuest = normalizePlayerTag(guestTag);

    if (supabase && isSupabaseConfigured) {
      try {
        const { data: existing, error: fetchErr } = await supabase
          .from('friend_lobbies')
          .select('*')
          .eq('room_code', cleanCode)
          .single();

        if (existing && !fetchErr) {
          return this.joinLobby(existing.id, cleanGuest, guestName, guestBeast);
        }
      } catch (err) {
        console.warn('[FriendNetwork] Error fetching lobby by code:', err);
      }
    }
    return null;
  }

  // 7. Fetch Lobby Details by Code
  public async getLobbyByCode(roomCode: string): Promise<FriendLobbyItem | null> {
    let cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode.startsWith('SLAM-')) {
      cleanCode = `SLAM-${cleanCode.replace(/[^0-9]/g, '')}`;
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('friend_lobbies')
          .select('*')
          .eq('room_code', cleanCode)
          .single();

        if (!error && data) {
          return data as FriendLobbyItem;
        }
      } catch {}
    }
    return null;
  }
}

export const friendNetwork = new FriendNetworkService();
