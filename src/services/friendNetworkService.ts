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
  created_at: string;
}

export interface SocialCallbacks {
  onIncomingRequest?: (req: FriendRequestItem) => void;
  onRequestAccepted?: (req: FriendRequestItem) => void;
  onLobbyInvite?: (lobby: FriendLobbyItem) => void;
  onLobbyUpdated?: (lobby: FriendLobbyItem) => void;
}

class FriendNetworkService {
  private activeChannel: any = null;
  private currentTag: string = '';
  private localBroadcast: BroadcastChannel | null = null;
  private listeners: Set<SocialCallbacks> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.localBroadcast = new BroadcastChannel('petslam_social_local');
      this.localBroadcast.onmessage = (ev) => {
        const { type, data } = ev.data || {};
        this.handleMessage(type, data);
      };
    }
  }

  // Subscribe to real-time incoming requests & invites for current user's tag
  public init(myTag: string, callbacks: SocialCallbacks) {
    this.currentTag = myTag.trim().toUpperCase();
    this.listeners.add(callbacks);

    if (this.activeChannel) {
      try { this.activeChannel.unsubscribe(); } catch {}
    }

    if (supabase && isSupabaseConfigured) {
      const channel = supabase.channel(`petslam_social_${this.currentTag}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'friend_request' }, ({ payload }) => {
          if (payload && payload.receiver_tag?.toUpperCase() === this.currentTag) {
            this.notifyIncomingRequest(payload);
          }
        })
        .on('broadcast', { event: 'friend_accepted' }, ({ payload }) => {
          if (payload && payload.sender_tag?.toUpperCase() === this.currentTag) {
            this.notifyRequestAccepted(payload);
          }
        })
        .on('broadcast', { event: 'lobby_invite' }, ({ payload }) => {
          if (payload && payload.guest_tag?.toUpperCase() === this.currentTag) {
            this.notifyLobbyInvite(payload);
          }
        })
        .on('broadcast', { event: 'lobby_updated' }, ({ payload }) => {
          if (
            payload &&
            (payload.host_tag?.toUpperCase() === this.currentTag ||
              payload.guest_tag?.toUpperCase() === this.currentTag)
          ) {
            this.notifyLobbyUpdated(payload);
          }
        })
        .subscribe();

      this.activeChannel = channel;
    }

    return () => {
      this.listeners.delete(callbacks);
    };
  }

  private handleMessage(type: string, data: any) {
    if (!data) return;
    if (type === 'friend_request' && data.receiver_tag?.toUpperCase() === this.currentTag) {
      this.notifyIncomingRequest(data);
    } else if (type === 'friend_accepted' && data.sender_tag?.toUpperCase() === this.currentTag) {
      this.notifyRequestAccepted(data);
    } else if (type === 'lobby_invite' && data.guest_tag?.toUpperCase() === this.currentTag) {
      this.notifyLobbyInvite(data);
    } else if (
      type === 'lobby_updated' &&
      (data.host_tag?.toUpperCase() === this.currentTag || data.guest_tag?.toUpperCase() === this.currentTag)
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
  ): Promise<{ success: boolean; message: string }> {
    const cleanReceiver = receiverTag.trim().toUpperCase();
    const cleanSender = senderTag.trim().toUpperCase();

    if (!cleanReceiver) {
      return { success: false, message: 'Please enter a valid player tag.' };
    }
    if (cleanReceiver === cleanSender) {
      return { success: false, message: 'You cannot send a friend request to yourself!' };
    }

    const payload: FriendRequestItem = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_tag: cleanSender,
      sender_name: senderName || 'Trainer',
      sender_beast: senderBeastName || 'Kaiser (Shepherd)',
      receiver_tag: cleanReceiver,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Save to Supabase table
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('friend_requests').insert({
          id: payload.id,
          sender_tag: payload.sender_tag,
          sender_name: payload.sender_name,
          sender_beast: payload.sender_beast,
          receiver_tag: payload.receiver_tag,
          status: 'pending',
        });

        // Broadcast to target player's channel
        const targetChannel = supabase.channel(`petslam_social_${cleanReceiver}`);
        targetChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            targetChannel.send({
              type: 'broadcast',
              event: 'friend_request',
              payload,
            });
            setTimeout(() => targetChannel.unsubscribe(), 1000);
          }
        });
      } catch (err) {
        console.warn('Could not insert to Supabase friend_requests:', err);
      }
    }

    // Broadcast on local channel as well for same-machine tab testing
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
    };
  }

  // 2. Fetch Incoming Friend Requests
  public async fetchIncomingRequests(myTag: string): Promise<FriendRequestItem[]> {
    const cleanTag = myTag.trim().toUpperCase();
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
          .limit(20);

        if (!error && Array.isArray(data)) {
          requests = data as FriendRequestItem[];
        }
      } catch (err) {
        console.warn('Error fetching friend requests:', err);
      }
    }

    // Merge with any cached incoming requests
    try {
      const cached = JSON.parse(localStorage.getItem('petslam_pending_friend_requests') || '[]');
      const map = new Map<string, FriendRequestItem>();
      requests.forEach((r) => map.set(r.id, r));
      cached.forEach((c: FriendRequestItem) => {
        if (c.receiver_tag === cleanTag && c.status === 'pending') {
          map.set(c.id, c);
        }
      });
      requests = Array.from(map.values());
    } catch {}

    return requests;
  }

  // 2b. Fetch Accepted Friends from Supabase
  public async fetchAcceptedFriends(myTag: string): Promise<FriendRequestItem[]> {
    const cleanTag = myTag.trim().toUpperCase();
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
        console.warn('Error fetching accepted friends:', err);
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
    const updated: FriendRequestItem = { ...request, status: 'accepted' };

    // Update in Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('friend_requests')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', request.id);

        // Broadcast to sender that request was accepted
        const senderChannel = supabase.channel(`petslam_social_${request.sender_tag.toUpperCase()}`);
        senderChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            senderChannel.send({
              type: 'broadcast',
              event: 'friend_accepted',
              payload: updated,
            });
            setTimeout(() => senderChannel.unsubscribe(), 1000);
          }
        });
      } catch (err) {
        console.warn('Error updating friend request in Supabase:', err);
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
    guestTag: string,
    mode: 'duel' | '2v2' | 'hangout' = 'duel'
  ): Promise<FriendLobbyItem> {
    const cleanHost = hostTag.trim().toUpperCase();
    const cleanGuest = guestTag.trim().toUpperCase();
    const roomCode = `SLAM-${Math.floor(1000 + Math.random() * 9000)}`;

    const lobby: FriendLobbyItem = {
      id: `lob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      room_code: roomCode,
      host_tag: cleanHost,
      host_name: hostName || 'Trainer',
      host_beast: {
        id: hostBeast.id,
        name: hostBeast.name,
        breed: hostBeast.breed,
        image: hostBeast.image,
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
        await supabase.from('friend_lobbies').insert({
          id: lobby.id,
          room_code: lobby.room_code,
          host_tag: lobby.host_tag,
          host_name: lobby.host_name,
          host_beast: lobby.host_beast,
          guest_tag: lobby.guest_tag,
          mode: lobby.mode,
          status: 'waiting',
        });

        // Broadcast invite to guest's channel
        const guestChannel = supabase.channel(`petslam_social_${cleanGuest}`);
        guestChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            guestChannel.send({
              type: 'broadcast',
              event: 'lobby_invite',
              payload: lobby,
            });
            setTimeout(() => guestChannel.unsubscribe(), 1000);
          }
        });
      } catch (err) {
        console.warn('Error inserting lobby into Supabase:', err);
      }
    }

    this.localBroadcast?.postMessage({ type: 'lobby_invite', data: lobby });
    return lobby;
  }

  // 6. Join / Accept Shared Party Lobby
  public async joinLobby(
    lobbyId: string,
    guestTag: string,
    guestName: string,
    guestBeast: Animal
  ): Promise<FriendLobbyItem | null> {
    const cleanGuest = guestTag.trim().toUpperCase();

    const guestBeastData = {
      id: guestBeast.id,
      name: guestBeast.name,
      breed: guestBeast.breed,
      image: guestBeast.image,
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
          const hostChannel = supabase.channel(`petslam_social_${updatedLobby.host_tag.toUpperCase()}`);
          hostChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              hostChannel.send({
                type: 'broadcast',
                event: 'lobby_updated',
                payload: updatedLobby,
              });
              setTimeout(() => hostChannel.unsubscribe(), 1000);
            }
          });
        }
      } catch (err) {
        console.warn('Error joining lobby in Supabase:', err);
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
}

export const friendNetwork = new FriendNetworkService();
