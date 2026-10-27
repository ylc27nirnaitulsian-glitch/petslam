import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Users,
  Copy,
  Check,
  Swords,
  Radio,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Shield,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGame } from '../../context/GameContext';

interface FriendsVoiceRoomModalProps {
  onClose: () => void;
  onStartDuelWithFriend?: (friendName: string) => void;
}

export const FriendsVoiceRoomModal: React.FC<FriendsVoiceRoomModalProps> = ({
  onClose,
  onStartDuelWithFriend,
}) => {
  const { trainerName, playerTag } = useGame();

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Simulated party members
  const [partyMembers, setPartyMembers] = useState([
    {
      id: 'm1',
      name: trainerName || 'Nirnai',
      tag: playerTag,
      isHost: true,
      isTalking: false,
      isMuted: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'm2',
      name: 'Alex Vanguard',
      tag: '#ALEX-11',
      isHost: false,
      isTalking: true,
      isMuted: false,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'm3',
      name: 'Maya S.',
      tag: '#MAYA-92',
      isHost: false,
      isTalking: false,
      isMuted: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'm4',
      name: 'Kenji & Hachi',
      tag: '#DOGE-44',
      isHost: false,
      isTalking: false,
      isMuted: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
  ]);

  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize real microphone audio stream and live volume metering
  useEffect(() => {
    let active = true;

    async function initMic() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(normalized);

          // Update talking ring for host
          setPartyMembers((prev) =>
            prev.map((m) => (m.isHost ? { ...m, isTalking: normalized > 15 && !isMicMuted } : m))
          );

          animFrameRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();
      } catch (e) {
        // Microphone permission denied or unavailable; use simulated voice fluctuation
        const interval = setInterval(() => {
          if (!active) return;
          const sim = Math.floor(Math.random() * 45);
          setAudioLevel(sim);
        }, 300);
        return () => clearInterval(interval);
      }
    }

    initMic();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isMicMuted]);

  // Periodic member speech simulation
  useEffect(() => {
    const talkTimer = setInterval(() => {
      setPartyMembers((prev) =>
        prev.map((m) => {
          if (m.isHost || m.isMuted) return m;
          return { ...m, isTalking: Math.random() < 0.4 };
        })
      );
    }, 2400);

    return () => clearInterval(talkTimer);
  }, []);

  const handleToggleMic = () => {
    sound.playClick();
    setIsMicMuted((prev) => {
      const next = !prev;
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next;
        });
      }
      return next;
    });
  };

  const handleCopyCode = () => {
    sound.playCoin();
    navigator.clipboard?.writeText?.('SLAM-VOICE-842');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D111A] border-2 border-cyan-400/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#131926] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
              <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                  Multiplayer Voice Party
                </h3>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>CONNECTED</span>
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Room Code: #SLAM-VOICE-842 · Low-Latency 18ms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer Bar */}
        <div className="bg-black/40 px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <span>Voice Activity:</span>
            <div className="flex items-center gap-1 h-3 w-32">
              {Array.from({ length: 12 }).map((_, i) => {
                const active = !isMicMuted && audioLevel > i * 8;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-75 ${
                      active
                        ? i > 8
                          ? 'bg-red-400 h-3 shadow-[0_0_6px_#ef4444]'
                          : 'bg-[#CCFF00] h-2.5 shadow-[0_0_6px_#ccff00]'
                        : 'bg-neutral-800 h-1'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 cursor-pointer transition-colors"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCode ? 'Copied Link!' : 'Invite Friend'}</span>
          </button>
        </div>

        {/* Party Members List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
            Party Members in Channel ({partyMembers.length})
          </div>

          <div className="grid grid-cols-2 gap-2">
            {partyMembers.map((member) => (
              <div
                key={member.id}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 ${
                  member.isTalking
                    ? 'bg-[#152336] border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : 'bg-[#121622] border-white/10'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 ${
                      member.isTalking
                        ? 'border-emerald-400 shadow-[0_0_10px_#34d399]'
                        : 'border-white/20'
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {member.isTalking && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0D111A] flex items-center justify-center">
                      <Radio className="w-2 h-2 text-white animate-pulse" />
                    </span>
                  )}
                  {member.isMuted && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0D111A] flex items-center justify-center">
                      <MicOff className="w-2 h-2 text-white" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <span>{member.name}</span>
                    {member.isHost && (
                      <span className="text-[8px] bg-[#CCFF00]/20 text-[#CCFF00] font-mono px-1 rounded">
                        HOST
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate">
                    {member.tag}
                  </div>
                  <div className="text-[9px] font-mono">
                    {member.isTalking ? (
                      <span className="text-emerald-400 font-bold">Speaking...</span>
                    ) : member.isMuted ? (
                      <span className="text-neutral-500">Muted</span>
                    ) : (
                      <span className="text-cyan-400">Listening</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick 1v1 Battle Invitation Banner */}
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-red-500/15 via-[#1A1828] to-cyan-500/15 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-red-400" />
                <span>Instant Friendly Duel</span>
              </div>
              <div className="text-[10px] text-neutral-300 font-mono">
                Challenge anyone in voice party to a live 1v1 Clash!
              </div>
            </div>

            <button
              onClick={() => {
                sound.playBattleStart();
                if (onStartDuelWithFriend) {
                  onStartDuelWithFriend('Alex Vanguard');
                }
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-md active:scale-95 transition-all"
            >
              Challenge
            </button>
          </div>
        </div>

        {/* Bottom Voice Controls */}
        <div className="bg-[#131926] border-t border-white/10 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mic Toggle Button */}
            <button
              onClick={handleToggleMic}
              className={`p-2.5 rounded-2xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isMicMuted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
              }`}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMicMuted ? 'Muted' : 'Mic Live'}</span>
            </button>

            {/* Deafen / Speaker Button */}
            <button
              onClick={() => setIsDeafened((prev) => !prev)}
              className={`p-2.5 rounded-2xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isDeafened
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
              }`}
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isDeafened ? 'Deafened' : 'Sound ON'}</span>
            </button>
          </div>

          {/* Leave Voice Room */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2.5 px-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
};
