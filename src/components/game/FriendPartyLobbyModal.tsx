import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Swords,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Copy,
  Check,
  Shield,
  Sparkles,
  Zap,
  Play,
  PhoneOff,
  Radio,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGame } from '../../context/GameContext';
import { friendNetwork, FriendLobbyItem } from '../../services/friendNetworkService';

interface FriendPartyLobbyModalProps {
  initialRoomCode?: string;
  initialFriend?: { name: string; tag: string; beastName?: string };
  isHost?: boolean;
  onClose: () => void;
  onLaunchBattle: (mode: 'duel' | '2v2', partner?: any) => void;
}

export const FriendPartyLobbyModal: React.FC<FriendPartyLobbyModalProps> = ({
  initialRoomCode,
  initialFriend,
  isHost = true,
  onClose,
  onLaunchBattle,
}) => {
  const { trainerName, playerTag, activeBeast } = useGame();

  const [roomCode, setRoomCode] = useState<string>(
    initialRoomCode || `LOBBY-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState<'waiting' | 'ready' | 'launching'>('waiting');
  const [friendData, setFriendData] = useState<{
    name: string;
    tag: string;
    beastName: string;
    beastImage?: string;
  } | null>(
    initialFriend
      ? {
          name: initialFriend.name,
          tag: initialFriend.tag,
          beastName: initialFriend.beastName || 'Khan (Bengal Tiger)',
          beastImage:
            'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?auto=format&fit=crop&w=400&q=80',
        }
      : null
  );

  // Voice Chat State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [selectedMode, setSelectedMode] = useState<'duel' | '2v2'>('2v2');

  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Real Microphone Audio & Volume Meter
  useEffect(() => {
    let active = true;

    async function initMic() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        const pollAudio = () => {
          if (!active) return;
          if (analyserRef.current && !isMicMuted) {
            analyserRef.current.getByteFrequencyData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i];
            const avg = sum / buffer.length;
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          } else {
            setMicVolume(0);
          }
          animFrameRef.current = requestAnimationFrame(pollAudio);
        };
        animFrameRef.current = requestAnimationFrame(pollAudio);
      } catch (err) {
        console.warn('Microphone access denied or unavailable:', err);
      }
    }

    initMic();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, [isMicMuted]);

  // Subscribe to real-time lobby updates
  useEffect(() => {
    const unsub = friendNetwork.init(playerTag, {
      onLobbyUpdated: (lobby: FriendLobbyItem) => {
        if (lobby.room_code === roomCode) {
          if (lobby.guest_tag && lobby.guest_tag !== playerTag) {
            setFriendData({
              name: lobby.guest_name || 'Friend Trainer',
              tag: lobby.guest_tag,
              beastName: lobby.guest_beast?.name || 'Allied Companion',
              beastImage: lobby.guest_beast?.image,
            });
            setLobbyStatus('ready');
            sound.playMatchFound();
          }
        }
      },
    });

    // Auto-create or broadcast lobby if host
    if (isHost) {
      friendNetwork
        .createLobby(
          playerTag,
          trainerName || 'Trainer',
          activeBeast,
          initialFriend?.tag,
          selectedMode
        )
        .then((l) => {
          setRoomCode(l.room_code);
          if (initialFriend) {
            friendNetwork.sendLobbyInvite(
              l.room_code,
              initialFriend.tag,
              trainerName || 'Trainer',
              activeBeast,
              selectedMode
            );
          }
        });
    }

    return () => {
      unsub();
    };
  }, [playerTag, trainerName, activeBeast, isHost, roomCode, selectedMode, initialFriend]);

  const handleCopyCode = () => {
    sound.playCoin();
    try {
      navigator.clipboard?.writeText?.(roomCode);
    } catch {}
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleMic = () => {
    sound.playClick();
    setIsMicMuted((prev) => !prev);
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMicMuted;
      });
    }
  };

  const handleStartGame = () => {
    sound.playBattleStart();
    setLobbyStatus('launching');
    setTimeout(() => {
      onLaunchBattle(selectedMode, friendData);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d121c] border-2 border-[#CCFF00]/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(204,255,0,0.25)] flex flex-col">
        {/* Top Header */}
        <div className="bg-[#141b2a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center text-[#CCFF00]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Friend Party Lobby
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Netcode
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Squad up, strategize over live voice, and launch together
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-mono flex items-center gap-1.5 border border-white/10 cursor-pointer active:scale-95 transition-all"
              title="Copy Room Code"
            >
              <span className="text-[#CCFF00] font-black">{roomCode}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Player Showcase */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-b from-transparent to-black/40">
          {/* Host Card (You) */}
          <div className="bg-[#121824] border-2 border-[#CCFF00]/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-lg">
            <div className="absolute top-2 left-2 bg-[#CCFF00] text-black font-display font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              YOU (HOST)
            </div>

            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.3)] my-2 bg-black">
              <img
                src={activeBeast.image}
                alt={activeBeast.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h4 className="font-display font-black text-base text-white uppercase tracking-wider mt-1">
              {trainerName || 'Trainer'}
            </h4>
            <div className="text-xs font-mono text-[#CCFF00] font-bold">
              {playerTag}
            </div>
            <div className="text-xs font-mono text-neutral-300 mt-1">
              🐾 {activeBeast.name} ({activeBeast.breed || 'Companion'})
            </div>

            {/* Mic Meter for Host */}
            <div className="mt-3 w-full bg-black/60 rounded-xl p-2 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMicMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                )}
                <span className="text-[10px] font-mono text-neutral-300">
                  {isMicMuted ? 'Muted' : 'Speaking'}
                </span>
              </div>
              <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#CCFF00] transition-all duration-75"
                  style={{ width: `${isMicMuted ? 0 : micVolume}%` }}
                />
              </div>
            </div>
          </div>

          {/* Partner Card (Friend) */}
          <div className="bg-[#121824] border-2 border-cyan-400/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-lg">
            <div className="absolute top-2 left-2 bg-cyan-400 text-black font-display font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              PARTNER (FRIEND)
            </div>

            {friendData ? (
              <>
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)] my-2 bg-black">
                  <img
                    src={friendData.beastImage || 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?auto=format&fit=crop&w=400&q=80'}
                    alt={friendData.beastName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-display font-black text-base text-white uppercase tracking-wider mt-1">
                  {friendData.name}
                </h4>
                <div className="text-xs font-mono text-cyan-300 font-bold">
                  {friendData.tag}
                </div>
                <div className="text-xs font-mono text-neutral-300 mt-1">
                  🐾 {friendData.beastName}
                </div>

                <div className="mt-3 w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 text-center text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ready in Party Lobby</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/40 flex items-center justify-center text-cyan-400 animate-spin mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs font-display font-bold text-white uppercase">
                  Waiting for Partner...
                </p>
                <p className="text-[10px] font-mono text-neutral-400 mt-1">
                  Share Room Code <span className="text-[#CCFF00] font-black">{roomCode}</span> or friend invite sent
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="px-6 py-2">
          <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Select Game Match Mode
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMode('2v2');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedMode === '2v2'
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="font-display font-black text-sm uppercase text-white">
                  2v2 Tag Team Co-Op
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                Team up with your friend as a duo against global challengers!
              </p>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setSelectedMode('duel');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedMode === 'duel'
                  ? 'bg-[#CCFF00]/20 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Swords className="w-4 h-4 text-[#CCFF00]" />
                <span className="font-display font-black text-sm uppercase text-white">
                  1v1 Friendly Duel
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                Spar against friend in friendly exhibition bout (no trophy loss).
              </p>
            </button>
          </div>
        </div>

        {/* Bottom Voice Bar & Launch Actions */}
        <div className="bg-[#141b2a] border-t border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMic}
              className={`px-3 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isMicMuted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicMuted ? 'Mic Muted' : 'Voice Chat Live'}</span>
            </button>

            <button
              onClick={() => setIsDeafened((p) => !p)}
              className={`p-2 rounded-xl font-mono text-xs border cursor-pointer ${
                isDeafened
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/10 text-neutral-300 border-white/10 hover:text-white'
              }`}
              title="Toggle Sound"
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Action Launch Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white font-mono text-xs font-bold cursor-pointer transition-colors"
            >
              Leave Party
            </button>

            <button
              onClick={handleStartGame}
              className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#d8ff33] text-black font-display font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.5)] cursor-pointer active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch {selectedMode === '2v2' ? '2v2 Queue' : '1v1 Duel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
