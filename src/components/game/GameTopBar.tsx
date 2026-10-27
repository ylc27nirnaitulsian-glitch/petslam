import React, { useState } from 'react';
import {
  Coins,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  Home,
  Users,
  Shield,
  Crown,
  Radio,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameGuideModal } from './GameGuideModal';
import { AccountAuthModal } from './AccountAuthModal';
import { FriendsHubModal } from './FriendsHubModal';
import { VipPassesModal } from './VipPassesModal';
import { FriendsVoiceRoomModal } from './FriendsVoiceRoomModal';

interface GameTopBarProps {
  onOpenSystemDetails: () => void;
  onReturnToTitle?: () => void;
  onChallengeFriend?: (friend: any) => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  onReturnToTitle,
  onChallengeFriend,
}) => {
  const {
    trainerName,
    setTrainerName,
    connectedAccount,
    playerTag,
    credits,
    trophies,
    soundEnabled,
    toggleSound,
  } = useGame();

  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0D111A]/95 backdrop-blur-md border-b border-white/10 shadow-md px-2.5 sm:px-4 py-2 flex items-center justify-between select-none text-white gap-2">
        {/* Left Side: Profile & Account (Truncates gracefully, NEVER overlaps right controls) */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          {onReturnToTitle && (
            <button
              onClick={onReturnToTitle}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white cursor-pointer shrink-0 transition-colors"
              title="Return to Title Screen"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Account Button (Google Cloud Player Hub) */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-2 py-1 transition-all cursor-pointer shadow-xs min-w-0 shrink text-left"
            title="Google Player Hub"
          >
            {connectedAccount.avatarUrl ? (
              <div className="w-6 h-6 rounded-lg overflow-hidden border border-[#CCFF00]/60 shrink-0 shadow-xs">
                <img src={connectedAccount.avatarUrl} alt={trainerName} className="w-full h-full object-cover" />
              </div>
            ) : connectedAccount.provider === 'Google' ? (
              <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-xs shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                ID
              </div>
            )}
            <div className="flex flex-col leading-tight min-w-0 pr-1">
              <span className="font-display font-black text-[11px] text-white uppercase truncate max-w-[75px] sm:max-w-[120px]">
                {trainerName}
              </span>
              <span className="text-[8px] font-mono text-[#CCFF00] font-bold truncate max-w-[75px] sm:max-w-[120px]">
                {connectedAccount.isLoggedIn ? `${connectedAccount.provider} ✓` : playerTag}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side: Resources & Utilities (Locked shrink-0, zero overlap) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Trophies Pill */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-400/30 rounded-xl px-2 py-1 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">{trophies}</span>
          </div>

          {/* Coins Pill */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-400/30 rounded-xl px-2 sm:px-2.5 py-1 shadow-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {credits.toLocaleString()}
            </span>
          </div>

          {/* VIP Pass Button */}
          <button
            onClick={() => setVipModalOpen(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 hover:from-amber-500/30 hover:to-fuchsia-500/30 border border-amber-400/40 rounded-xl px-2 py-1 text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="VIP Licenses (Auction $1.99, Avatar $0.99)"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold">VIP</span>
          </button>

          {/* Voice Chat Room Button */}
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 transition-colors cursor-pointer shrink-0"
            title="Multiplayer Voice Chat Room"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* Friends Button */}
          <button
            onClick={() => setFriendsModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-400 transition-colors cursor-pointer shrink-0"
            title="Multiplayer Friends & Clan"
          >
            <Users className="w-3.5 h-3.5" />
          </button>

          {/* Guide Button */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#CCFF00] transition-colors cursor-pointer shrink-0"
            title="Game Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#CCFF00]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </button>
        </div>
      </header>

      {/* Guide Modal */}
      {guideModalOpen && <GameGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />}

      {/* Account Auth Modal (Google Player Hub) */}
      {authModalOpen && (
        <AccountAuthModal
          currentTrainerName={trainerName}
          onUpdateTrainerName={setTrainerName}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Friends & Clan Hub */}
      {friendsModalOpen && (
        <FriendsHubModal
          onClose={() => setFriendsModalOpen(false)}
          onChallengeFriend={(friend) => {
            onChallengeFriend?.(friend);
            setFriendsModalOpen(false);
          }}
        />
      )}

      {/* Voice Chat Room */}
      {voiceModalOpen && (
        <FriendsVoiceRoomModal
          onClose={() => setVoiceModalOpen(false)}
          onStartDuelWithFriend={(friendName) => {
            setVoiceModalOpen(false);
            onChallengeFriend?.({ name: friendName });
          }}
        />
      )}

      {/* VIP Passes Modal */}
      {vipModalOpen && <VipPassesModal isOpen={vipModalOpen} onClose={() => setVipModalOpen(false)} />}
    </>
  );
};
