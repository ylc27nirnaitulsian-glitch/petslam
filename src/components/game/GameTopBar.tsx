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
  Target,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import { sound } from '../../utils/audio';
import { GameGuideModal } from './GameGuideModal';
import { AccountAuthModal } from './AccountAuthModal';
import { FriendsHubModal } from './FriendsHubModal';
import { VipPassesModal } from './VipPassesModal';
import { FriendsVoiceRoomModal } from './FriendsVoiceRoomModal';

interface GameTopBarProps {
  onOpenSystemDetails: () => void;
  onReturnToTitle?: () => void;
  onChallengeFriend?: (friend: any) => void;
  onStartPracticeDrill?: () => void;
  onOpenQuests?: () => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  onReturnToTitle,
  onChallengeFriend,
  onStartPracticeDrill,
  onOpenQuests,
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
  const { isOverlayActive, toggleOverlay } = usePetCompanion();

  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#090D17]/98 backdrop-blur-xl border-b border-white/20 shadow-xl px-3 sm:px-5 py-2.5 flex items-center justify-between select-none text-white gap-3">
        {/* Left Side: Profile & Account (Truncates gracefully, NEVER overlaps right controls) */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          {onReturnToTitle && (
            <button
              onClick={onReturnToTitle}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white cursor-pointer shrink-0 transition-colors shadow-xs"
              title="Return to Title Screen"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {/* Account Button (Google Cloud Player Hub) */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-white/20 rounded-xl px-2.5 py-1.5 transition-all cursor-pointer shadow-sm min-w-0 shrink text-left"
            title="Google Player Hub"
          >
            {connectedAccount.avatarUrl ? (
              <div className="w-7 h-7 rounded-lg overflow-hidden border-2 border-[#CCFF00] shrink-0 shadow-sm">
                <img src={connectedAccount.avatarUrl} alt={trainerName} className="w-full h-full object-cover" />
              </div>
            ) : connectedAccount.provider === 'Google' ? (
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                ID
              </div>
            )}
            <div className="flex flex-col leading-tight min-w-0 pr-1">
              <span className="font-display font-black text-sm text-white uppercase truncate max-w-[85px] sm:max-w-[140px] drop-shadow-xs">
                {trainerName}
              </span>
              <span className="text-xs font-mono text-[#CCFF00] font-black truncate max-w-[85px] sm:max-w-[140px]">
                {connectedAccount.isLoggedIn ? `${connectedAccount.provider} ✓` : playerTag}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side: Resources & Utilities (Locked shrink-0, zero overlap) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Trophies Pill */}
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/50 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-sm font-black text-amber-200 tabular-nums">{trophies}</span>
          </div>

          {/* Coins Pill */}
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/50 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-sm font-black text-amber-200 tabular-nums">
              {credits.toLocaleString()}
            </span>
          </div>

          {/* Live Desktop Buddy Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              toggleOverlay();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-mono font-black transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
              isOverlayActive
                ? 'bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white'
            }`}
            title={isOverlayActive ? 'Companion Roaming Screen (Click to Dock)' : 'Summon Live Screen Companion'}
          >
            <span className="text-sm">🐾</span>
            <span className="text-xs hidden md:inline">
              {isOverlayActive ? 'Buddy Live 🟢' : 'Summon Buddy'}
            </span>
          </button>

          {/* Daily Quests Drawer Button */}
          {onOpenQuests && (
            <button
              onClick={onOpenQuests}
              className="flex items-center gap-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-400/60 rounded-xl px-2.5 py-1.5 text-xs font-mono font-black text-cyan-200 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="Daily Quests & Battle Directives"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black hidden sm:inline">Quests</span>
            </button>
          )}

          {/* VIP Pass Button */}
          <button
            onClick={() => setVipModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600/30 to-fuchsia-600/30 hover:from-amber-600/40 hover:to-fuchsia-600/40 border border-amber-400/60 rounded-xl px-2.5 py-1.5 text-xs font-mono font-black text-amber-200 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="VIP Licenses (Auction $1.99, Avatar $0.99)"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-black">VIP</span>
          </button>

          {/* Voice Chat Room Button */}
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/50 text-purple-200 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Multiplayer Voice Chat Room"
          >
            <Radio className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </button>

          {/* Friends Button */}
          <button
            onClick={() => setFriendsModalOpen(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-cyan-300 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Multiplayer Friends & Clan"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Guide Button */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-[#CCFF00] transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Game Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#CCFF00]" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </header>

      {/* Guide Modal */}
      {guideModalOpen && (
        <GameGuideModal
          isOpen={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
          onStartPracticeDrill={onStartPracticeDrill}
        />
      )}

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
