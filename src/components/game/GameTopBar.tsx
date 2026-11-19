import React, { useState } from 'react';
import {
  Coins,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  Home,
  Plus,
  Bug,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { GameGuideModal } from './GameGuideModal';
import { AccountAuthModal } from './AccountAuthModal';
import { TokenRefillModal } from './TokenRefillModal';
import { ThemeToggle } from '../ThemeToggle';

interface GameTopBarProps {
  onOpenSystemDetails: () => void;
  onReturnToTitle?: () => void;
  onChallengeFriend?: (friend: any) => void;
  onStartPracticeDrill?: () => void;
  onOpenQuests?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenRadar?: () => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  onReturnToTitle,
  onChallengeFriend,
  onStartPracticeDrill,
  onOpenQuests,
  onOpenLeaderboard,
  onOpenRadar,
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
  const [tokenRefillOpen, setTokenRefillOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden bg-white/95 dark:bg-[#151C28] backdrop-blur-xl border-b border-slate-200 dark:border-[#2A364F] shadow-sm px-2 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between select-none text-slate-900 dark:text-[#F8FAFC] gap-1.5 sm:gap-3 transition-colors duration-150">
        {/* Left Side: Profile & Account (Truncates gracefully, NEVER overlaps right controls) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          {onReturnToTitle && (
            <button
              onClick={onReturnToTitle}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2738] dark:hover:bg-[#2A364F] border border-slate-300 dark:border-[#2A364F] text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-[#F8FAFC] cursor-pointer shrink-0 transition-colors shadow-xs"
              title="Return to Title Screen"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Account Button (Google Cloud Player Hub) */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2738] dark:hover:bg-[#2A364F] border border-slate-300 dark:border-[#2A364F] rounded-xl px-1.5 sm:px-2.5 py-1 sm:py-1.5 transition-all cursor-pointer shadow-sm min-w-0 shrink text-left"
            title="Google Player Hub"
          >
            {connectedAccount.avatarUrl ? (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden border-2 border-emerald-500 shrink-0 shadow-sm">
                <img src={connectedAccount.avatarUrl} alt={trainerName} className="w-full h-full object-cover" />
              </div>
            ) : connectedAccount.provider === 'Google' ? (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white flex items-center justify-center p-0.5 sm:p-1 shadow-sm shrink-0 border border-slate-200">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
            ) : connectedAccount.provider === 'Discord' ? (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#5865F2] flex items-center justify-center p-0.5 sm:p-1 shadow-sm shrink-0 text-white">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#F59E0B] flex items-center justify-center text-[#0B0F17] font-black text-[10px] sm:text-xs shrink-0 shadow-sm">
                ID
              </div>
            )}
            <div className="flex flex-col leading-tight min-w-0 pr-0.5 sm:pr-1">
              <span className="font-display font-black text-xs sm:text-base text-slate-900 dark:text-[#F8FAFC] uppercase truncate max-w-[60px] xs:max-w-[85px] sm:max-w-[140px]">
                {trainerName}
              </span>
              <span className="text-[9px] sm:text-xs font-mono text-emerald-600 dark:text-[#10B981] font-bold truncate max-w-[60px] xs:max-w-[85px] sm:max-w-[140px]">
                {connectedAccount.isLoggedIn ? `${connectedAccount.provider} ✓` : playerTag}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side: Resources & Utilities (Locked shrink-0, zero overlap) */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Trophies Pill / Hall of Fame Leaderboard Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard?.();
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl px-1.5 sm:px-3 py-1 sm:py-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            title="Hall of Fame Leaderboards (PvP Elo & OutbidPet)"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200 tabular-nums">{trophies}</span>
          </button>

          {/* Interactive Coins Pill -> Opens TokenRefillModal */}
          <button
            onClick={() => {
              sound.playClick();
              setTokenRefillOpen(true);
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/70 rounded-xl px-1.5 sm:px-3 py-1 sm:py-1.5 shadow-sm cursor-pointer transition-all active:scale-95 group"
            title="Click to Refill or Earn Slam Tokens"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200 tabular-nums">
              {credits.toLocaleString()}
            </span>
            <span className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-amber-500/30 text-amber-900 dark:text-amber-200 text-[9px] sm:text-[10px] font-black group-hover:bg-amber-500 group-hover:text-black transition-colors">
              +
            </span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-[#1E2738] dark:hover:bg-[#2A364F] dark:border-[#2A364F] text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-[#F8FAFC] transition-colors cursor-pointer shrink-0 shadow-sm"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10B981]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            )}
          </button>

          {/* Guide Button */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-[#1E2738] dark:hover:bg-[#2A364F] dark:border-[#2A364F] text-slate-800 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-[#F8FAFC] transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Game Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Raise a Bug Report Button */}
          <button
            onClick={() => {
              sound.playClick();
              window.dispatchEvent(
                new CustomEvent('petslam:open-bug-report', { detail: { category: 'other' } })
              );
            }}
            className="hidden xs:flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-500 hover:text-amber-400 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Raise a Bug (Direct to nirnaitulsian@34gmail.com)"
          >
            <Bug className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

      {/* Token Refill Modal */}
      {tokenRefillOpen && (
        <TokenRefillModal
          isOpen={tokenRefillOpen}
          onClose={() => setTokenRefillOpen(false)}
          onOpenArena={onStartPracticeDrill}
          onOpenQuests={onOpenQuests}
          onOpenRadar={onOpenRadar}
        />
      )}
    </>
  );
};
