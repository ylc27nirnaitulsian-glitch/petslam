import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  MessageSquare,
  UserPlus,
  Swords,
  Send,
  Circle,
  Trophy,
  Smile,
  Shield,
  Sparkles,
  Check,
  Copy,
  Clock,
  UserCheck,
  UserX,
  Radio,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGame } from '../../context/GameContext';
import { FriendsVoiceRoomModal } from './FriendsVoiceRoomModal';
import { friendNetwork, FriendRequestItem } from '../../services/friendNetworkService';

export interface Friend {
  id: string;
  name: string;
  tag: string;
  beastName: string;
  trophies: number;
  status: 'Online in Arena' | 'In Menu' | 'Offline';
  avatarColor: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'ViperQueen',
    tag: '#VIPER-99',
    beastName: 'Khan (Tiger)',
    trophies: 1640,
    status: 'Online in Arena',
    avatarColor: 'from-amber-400 to-red-500',
  },
  {
    id: 'f2',
    name: 'Leonidas_Fan',
    tag: '#LEO-44',
    beastName: 'Leonidas (Cat)',
    trophies: 1380,
    status: 'In Menu',
    avatarColor: 'from-[#CCFF00] to-emerald-500',
  },
  {
    id: 'f3',
    name: 'TitanBrawler',
    tag: '#TITAN-12',
    beastName: 'Ghost (Husky)',
    trophies: 1520,
    status: 'Online in Arena',
    avatarColor: 'from-cyan-400 to-blue-600',
  },
];

interface FriendsHubModalProps {
  onChallengeFriend: (friend: Friend) => void;
  onClose: () => void;
}

export const FriendsHubModal: React.FC<FriendsHubModalProps> = ({
  onChallengeFriend,
  onClose,
}) => {
  const { playerTag, trainerName, activeBeast } = useGame();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'chat' | 'add'>('friends');
  const [showVoiceRoom, setShowVoiceRoom] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);

  // Load friends from localStorage or defaults
  const [friendsList, setFriendsList] = useState<Friend[]>(() => {
    try {
      const saved = localStorage.getItem('petslam_friends_roster');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FRIENDS;
  });

  const [pendingRequests, setPendingRequests] = useState<FriendRequestItem[]>([]);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [newFriendTag, setNewFriendTag] = useState('');
  const [toastMessage, setToastMessage] = useState<{ msg: string; error?: boolean } | null>(null);

  const saveFriends = (newList: Friend[]) => {
    setFriendsList(newList);
    try {
      localStorage.setItem('petslam_friends_roster', JSON.stringify(newList));
    } catch {}
  };

  // Sync incoming requests and accepted friends from Supabase Realtime
  useEffect(() => {
    let active = true;

    async function syncNetworkData() {
      if (!playerTag) return;
      const [reqs, accepted] = await Promise.all([
        friendNetwork.fetchIncomingRequests(playerTag),
        friendNetwork.fetchAcceptedFriends(playerTag),
      ]);

      if (!active) return;
      setPendingRequests(reqs);

      // Merge accepted friends into the active roster
      if (accepted && accepted.length > 0) {
        setFriendsList((prev) => {
          const map = new Map<string, Friend>();
          prev.forEach((f) => map.set(f.tag.toUpperCase(), f));

          accepted.forEach((a) => {
            const isMeSender = a.sender_tag.toUpperCase() === playerTag.toUpperCase();
            const friendTag = isMeSender ? a.receiver_tag : a.sender_tag;
            const friendName = isMeSender
              ? `Trainer_${friendTag.replace('#', '')}`
              : a.sender_name || 'Allied Trainer';
            const friendBeast = isMeSender ? 'Champion Partner' : a.sender_beast || 'Companion';

            if (!map.has(friendTag.toUpperCase())) {
              map.set(friendTag.toUpperCase(), {
                id: a.id,
                name: friendName,
                tag: friendTag,
                beastName: friendBeast,
                trophies: 1450,
                status: 'Online in Arena',
                avatarColor: 'from-[#CCFF00] to-emerald-500',
              });
            }
          });

          const merged = Array.from(map.values());
          try {
            localStorage.setItem('petslam_friends_roster', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }

    syncNetworkData();

    // Subscribe to live broadcast updates
    const unsub = friendNetwork.init(playerTag, {
      onIncomingRequest: (req) => {
        sound.playMatchFound();
        setPendingRequests((prev) => [req, ...prev.filter((r) => r.id !== req.id)]);
        setToastMessage({ msg: `New friend request from ${req.sender_tag}!` });
        setTimeout(() => setToastMessage(null), 4000);
      },
      onRequestAccepted: (req) => {
        sound.playLevelUp();
        const otherTag =
          req.sender_tag.toUpperCase() === playerTag.toUpperCase()
            ? req.receiver_tag
            : req.sender_tag;
        const newFriend: Friend = {
          id: req.id,
          name: otherTag.replace('#', 'Trainer_'),
          tag: otherTag,
          beastName: req.sender_beast || 'Champion Partner',
          trophies: 1500,
          status: 'Online in Arena',
          avatarColor: 'from-cyan-400 to-blue-600',
        };
        setFriendsList((prev) => {
          const updated = [newFriend, ...prev.filter((f) => f.tag.toUpperCase() !== otherTag.toUpperCase())];
          try {
            localStorage.setItem('petslam_friends_roster', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        setToastMessage({ msg: `${otherTag} accepted your friend request! 🎉` });
        setTimeout(() => setToastMessage(null), 4500);
      },
    });

    return () => {
      active = false;
      unsub();
    };
  }, [playerTag, trainerName]);

  const handleCopyMyTag = () => {
    sound.playCoin();
    try {
      navigator.clipboard?.writeText?.(playerTag);
    } catch {}
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ViperQueen',
      text: 'Good bout earlier! Ready for a 2v2 Tag Team?',
      timestamp: '2m ago',
      isSelf: false,
    },
    {
      id: 'm2',
      sender: 'You',
      text: 'Yes! Let’s queue together in the Lobby!',
      timestamp: '1m ago',
      isSelf: true,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const quickEmotes = ['Good Game! 🏆', 'Ready to Spar? ⚔️', 'Claw Power! 🐾', 'Well Played! 👏', '2v2 Tag Team? 🛡️'];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    sound.playClick();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'You',
      text: text.trim(),
      timestamp: 'Just now',
      isSelf: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  // SEND FRIEND REQUEST
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newFriendTag.trim().toUpperCase();
    if (!cleanTag) return;

    const formattedTag = cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;

    if (formattedTag === playerTag.toUpperCase()) {
      sound.playDefeat();
      setToastMessage({ msg: 'Cannot add yourself! Enter another trainer’s tag.', error: true });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (friendsList.some((f) => f.tag.toUpperCase() === formattedTag)) {
      sound.playClick();
      setToastMessage({ msg: `${formattedTag} is already on your Friends Roster!`, error: true });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmittingAdd(true);
    sound.playLevelUp();

    const res = await friendNetwork.sendFriendRequest(
      formattedTag,
      playerTag,
      trainerName || 'Trainer',
      activeBeast?.name || 'Companion Pet'
    );

    setIsSubmittingAdd(false);
    setToastMessage({
      msg: res.message,
      error: !res.success,
    });
    setNewFriendTag('');
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ACCEPT INCOMING FRIEND REQUEST
  const handleAcceptRequest = async (req: FriendRequestItem) => {
    sound.playLevelUp();
    await friendNetwork.acceptFriendRequest(req, playerTag, trainerName || 'Trainer');

    // Add to local friends roster
    const newFriend: Friend = {
      id: req.id,
      name: req.sender_name || `Trainer_${req.sender_tag.replace('#', '')}`,
      tag: req.sender_tag,
      beastName: req.sender_beast || 'Companion Ally',
      trophies: 1350 + Math.floor(Math.random() * 200),
      status: 'Online in Arena',
      avatarColor: 'from-[#CCFF00] to-emerald-500',
    };

    const updated = [newFriend, ...friendsList.filter((f) => f.tag.toUpperCase() !== req.sender_tag.toUpperCase())];
    saveFriends(updated);

    // Remove from pending
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));

    setToastMessage({
      msg: `Accepted request! Added ${newFriend.name} (${req.sender_tag}) to Friends!`,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // DECLINE INCOMING FRIEND REQUEST
  const handleDeclineRequest = async (reqId: string) => {
    sound.playClick();
    await friendNetwork.declineFriendRequest(reqId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    setToastMessage({ msg: 'Friend request declined.' });
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e121a] border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="bg-[#151c2a] border-b border-white/10 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Multiplayer Friends & Clan Chat
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                {friendsList.filter((f) => f.status !== 'Offline').length} Friends Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#101420] border-b border-white/5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('friends');
            }}
            className={`py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-cyan-400 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Friends ({friendsList.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('requests');
            }}
            className={`py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer relative flex items-center justify-center gap-1 ${
              activeTab === 'requests'
                ? 'bg-emerald-400 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('add');
            }}
            className={`py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'add'
                ? 'bg-amber-400 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>Add</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('chat');
            }}
            className={`py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'chat'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </button>
        </div>

        {/* Quick Voice Party Banner */}
        <div className="mx-4 mt-2.5 p-2 rounded-2xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span>Multiplayer Voice Room</span>
                <span className="text-[8px] font-mono bg-purple-500/40 text-purple-200 px-1 rounded">LIVE</span>
              </div>
              <div className="text-[9px] text-neutral-400 font-mono">Talk with friends while clashing</div>
            </div>
          </div>
          <button
            onClick={() => setShowVoiceRoom(true)}
            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-bold cursor-pointer transition-all active:scale-95 shadow"
          >
            🎙️ Join Voice
          </button>
        </div>

        {/* Dynamic Toast Feedback */}
        {toastMessage && (
          <div
            className={`mx-4 mt-2 p-2.5 rounded-xl border text-center animate-in fade-in shrink-0 ${
              toastMessage.error
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
            }`}
          >
            <p className="text-xs font-mono font-bold">{toastMessage.msg}</p>
          </div>
        )}

        {/* TAB 1: FRIENDS ROSTER */}
        {activeTab === 'friends' && (
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            {friendsList.length === 0 ? (
              <div className="text-center p-6 text-neutral-400 font-mono text-xs">
                No friends on your roster yet. Share your tag to connect!
              </div>
            ) : (
              friendsList.map((friend) => {
                const isOnline = friend.status !== 'Offline';

                return (
                  <div
                    key={friend.id}
                    className="bg-[#121622] hover:bg-[#161c2b] border border-white/10 rounded-2xl p-3 flex items-center justify-between transition-all shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${friend.avatarColor} flex items-center justify-center text-white font-black text-sm shadow shrink-0 relative`}
                      >
                        {friend.name.substring(0, 2).toUpperCase()}
                        <Circle
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${
                            isOnline ? 'text-emerald-400 fill-emerald-400' : 'text-neutral-500 fill-neutral-500'
                          }`}
                        />
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-black text-xs uppercase text-white">
                            {friend.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">{friend.tag}</span>
                        </div>
                        <p className="text-[10px] text-[#CCFF00] font-mono">
                          {friend.beastName} · {friend.trophies} 🏆
                        </p>
                        <span
                          className={`text-[9px] font-mono block ${
                            friend.status === 'Online in Arena'
                              ? 'text-emerald-400'
                              : friend.status === 'In Menu'
                              ? 'text-cyan-300'
                              : 'text-neutral-500'
                          }`}
                        >
                          {friend.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Challenge / Lobby Button */}
                    {isOnline && (
                      <button
                        onClick={() => {
                          sound.playCardPlay();
                          onChallengeFriend(friend);
                        }}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-black text-[11px] uppercase tracking-wider shrink-0 cursor-pointer shadow flex items-center gap-1.5 active:scale-95 transition-transform"
                        title="Invite to Battle Lobby or Duel"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Party / Duel</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: INCOMING FRIEND REQUESTS */}
        {activeTab === 'requests' && (
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            {pendingRequests.length === 0 ? (
              <div className="text-center p-8 text-neutral-400 font-mono text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-neutral-500 opacity-50" />
                <p className="font-bold text-white">No Pending Friend Requests</p>
                <p className="text-[10px]">
                  When someone enters your tag (<span className="text-[#CCFF00]">{playerTag}</span>), their request will show up here!
                </p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#121622] border-2 border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-xs uppercase text-white">
                        {req.sender_name || 'Trainer'}
                      </span>
                      <span className="text-[10px] text-[#CCFF00] font-mono font-bold">
                        {req.sender_tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-300 font-mono">
                      🐾 Beast: {req.sender_beast || 'Companion'}
                    </p>
                    <span className="text-[9px] font-mono text-neutral-400">
                      Wants to add you as a rival & teammate
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer active:scale-95 shadow"
                      title="Accept Friend Request"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 font-mono text-[10px] cursor-pointer"
                      title="Decline"
                    >
                      <UserX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ADD FRIEND BY PLAYER TAG */}
        {activeTab === 'add' && (
          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-2 text-center bg-[#141926] p-3 rounded-2xl border border-white/10">
              <h4 className="font-display font-black text-sm uppercase text-white">
                Share Your Tag With Friends
              </h4>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-mono text-neutral-400">Your Unique Tag:</span>
                <span className="text-sm font-mono font-black text-[#CCFF00] tracking-wider px-2 py-0.5 rounded bg-black/60 border border-[#CCFF00]/40">
                  {playerTag}
                </span>
                <button
                  onClick={handleCopyMyTag}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  title="Copy Your Player Tag"
                >
                  {copiedTag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#CCFF00]" />}
                  <span>{copiedTag ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                Send this tag to friends so they can add and challenge you!
              </p>
            </div>

            <form onSubmit={handleAddFriend} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">
                  Enter Friend's Player Tag
                </label>
                <input
                  type="text"
                  value={newFriendTag}
                  onChange={(e) => setNewFriendTag(e.target.value)}
                  placeholder="e.g. #SLAM-4363 or #VIPER-99"
                  required
                  disabled={isSubmittingAdd}
                  className="w-full bg-[#121622] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAdd}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmittingAdd ? 'Sending Request...' : 'Send Friend Request'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden p-4">
            {/* Quick Emotes */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none shrink-0">
              {quickEmotes.map((emote) => (
                <button
                  key={emote}
                  onClick={() => handleSendMessage(emote)}
                  className="px-2.5 py-1 rounded-full bg-[#182030] hover:bg-[#222c42] border border-white/10 text-[11px] font-mono font-bold text-white whitespace-nowrap cursor-pointer transition-all active:scale-95 shadow"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] font-mono text-neutral-400 px-1 mb-0.5">
                    {msg.sender} · {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs font-mono shadow ${
                      msg.isSelf
                        ? 'bg-[#CCFF00] text-black font-semibold rounded-tr-none'
                        : 'bg-[#182030] text-white border border-white/10 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="pt-2 flex items-center gap-2 border-t border-white/10 shrink-0">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message clan & friends..."
                className="flex-1 bg-[#121622] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#CCFF00]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#d4ff1a] text-black cursor-pointer shadow active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Voice Room Overlay */}
        {showVoiceRoom && (
          <FriendsVoiceRoomModal
            onClose={() => setShowVoiceRoom(false)}
            onStartDuelWithFriend={(_fname) => {
              setShowVoiceRoom(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};
