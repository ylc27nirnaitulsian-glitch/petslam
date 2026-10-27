import React, { useState } from 'react';
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
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { FriendsVoiceRoomModal } from './FriendsVoiceRoomModal';

interface Friend {
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
  {
    id: 'f4',
    name: 'ShadowFang',
    tag: '#NIGHT-88',
    beastName: 'Shadow (Black Cat)',
    trophies: 1410,
    status: 'Offline',
    avatarColor: 'from-purple-500 to-indigo-600',
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
  const [activeTab, setActiveTab] = useState<'friends' | 'chat' | 'add'>('friends');
  const [showVoiceRoom, setShowVoiceRoom] = useState(false);
  const [friendsList, setFriendsList] = useState<Friend[]>(INITIAL_FRIENDS);
  const [newFriendTag, setNewFriendTag] = useState('');
  const [addSuccessToast, setAddSuccessToast] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ViperQueen',
      text: 'Good bout earlier! Your German Shepherd has insane clamp force.',
      timestamp: '2m ago',
      isSelf: false,
    },
    {
      id: 'm2',
      sender: 'You',
      text: 'Thanks! Just upgraded his jaw conditioning. Ready for a 2v2 Tag Team?',
      timestamp: '1m ago',
      isSelf: true,
    },
    {
      id: 'm3',
      sender: 'ViperQueen',
      text: 'Yes! Send the challenge!',
      timestamp: 'Just now',
      isSelf: false,
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

    // Mock quick reply after 1.5s
    setTimeout(() => {
      sound.playClick();
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          sender: 'ViperQueen',
          text: 'Accepted! Let’s crush the arena!',
          timestamp: 'Just now',
          isSelf: false,
        },
      ]);
    }, 1500);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendTag.trim()) return;
    sound.playLevelUp();

    const newFriend: Friend = {
      id: `f_${Date.now()}`,
      name: newFriendTag.replace('#', 'Trainer_'),
      tag: newFriendTag.startsWith('#') ? newFriendTag : `#${newFriendTag}`,
      beastName: 'Kaiser (Shepherd)',
      trophies: 1250,
      status: 'Online in Arena',
      avatarColor: 'from-amber-400 to-emerald-400',
    };

    setFriendsList((prev) => [newFriend, ...prev]);
    setAddSuccessToast(`Added ${newFriend.name} to your Friends Roster!`);
    setNewFriendTag('');
    setTimeout(() => setAddSuccessToast(null), 3000);
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
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#101420] border-b border-white/5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('friends');
            }}
            className={`py-2 text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
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
              setActiveTab('chat');
            }}
            className={`py-2 text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('add');
            }}
            className={`py-2 text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'add'
                ? 'bg-amber-400 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
        </div>

        {/* Quick Voice Party Banner */}
        <div className="mx-4 mt-2.5 p-2 rounded-2xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-purple-500/30 flex items-center justify-between">
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
        {addSuccessToast && (
          <div className="mx-4 mt-2.5 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-center animate-in fade-in">
            <p className="text-xs font-mono font-bold text-emerald-300">{addSuccessToast}</p>
          </div>
        )}

        {/* TAB 1: FRIENDS ROSTER */}
        {activeTab === 'friends' && (
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            {friendsList.map((friend) => {
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

                  {/* Challenge Button */}
                  {isOnline && (
                    <button
                      onClick={() => {
                        sound.playCardPlay();
                        onChallengeFriend(friend);
                      }}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-black text-[11px] uppercase tracking-wider shrink-0 cursor-pointer shadow flex items-center gap-1"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Duel</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: LIVE IN-GAME CHAT & QUICK BATTLE EMOTES */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden p-4">
            {/* Quick Emote Action Pills */}
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

            {/* Chat Messages List */}
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

            {/* Message Input Box */}
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

        {/* TAB 3: ADD FRIEND BY PLAYER TAG */}
        {activeTab === 'add' && (
          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-1 text-center">
              <h4 className="font-display font-black text-sm uppercase text-white">
                Connect With Other Trainers
              </h4>
              <p className="text-xs font-mono text-neutral-400">
                Your Player Tag: <span className="text-[#CCFF00] font-bold">#SLAM-7749</span>
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
                  placeholder="e.g. #VIPER-99"
                  required
                  className="w-full bg-[#121622] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-black fill-black" />
                <span>Send Friend Request</span>
              </button>
            </form>
          </div>
        )}
        {/* Voice Room Modal */}
        {showVoiceRoom && (
          <FriendsVoiceRoomModal
            onClose={() => setShowVoiceRoom(false)}
            onStartDuelWithFriend={(friendName) => {
              setShowVoiceRoom(false);
              onClose();
              onChallengeFriend?.({
                id: 'f_voice',
                name: friendName,
                tag: '#VOICE-1',
                beastName: 'Ghost (Husky)',
                trophies: 1500,
                status: 'Online in Arena',
                avatarColor: 'from-purple-500 to-cyan-500',
              });
            }}
          />
        )}
      </div>
    </div>
  );
};
