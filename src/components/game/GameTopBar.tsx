import React, { useState } from 'react';
import {
  BatteryCharging,
  Coins,
  Trophy,
  Volume2,
  VolumeX,
  FileCode,
  HelpCircle,
  Home,
  Plus,
  Sparkles,
  X,
  Users,
  Shield,
  User,
  Crown,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameGuideModal } from './GameGuideModal';
import { AccountAuthModal } from './AccountAuthModal';
import { FriendsHubModal } from './FriendsHubModal';
import { VipPassesModal } from './VipPassesModal';

interface GameTopBarProps {
  onOpenSystemDetails: () => void;
  onReturnToTitle?: () => void;
  onChallengeFriend?: (friend: any) => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  onOpenSystemDetails,
  onReturnToTitle,
  onChallengeFriend,
}) => {
  const {
    trainerName,
    setTrainerName,
    connectedAccount,
    playerTag,
    credits,
    energy,
    maxEnergy,
    trophies,
    playerLevel,
    soundEnabled,
    toggleSound,
    refillEnergy,
  } = useGame();

  const [energyRefillModal, setEnergyRefillModal] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleRefill = () => {
    const success = refillEnergy();
    if (success) {
      setFeedbackMsg('Energy fully replenished (+100)!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setEnergyRefillModal(false);
      }, 1200);
    } else {
      setFeedbackMsg('Not enough credits (Requires 1,200).');
      setTimeout(() => setFeedbackMsg(null), 1500);
    }
  };

  const energyPercent = Math.min(100, Math.round((energy / maxEnergy) * 100));

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0D111A]/95 backdrop-blur-md border-b border-white/10 shadow-md px-2 sm:px-3 py-2 flex items-center justify-between select-none text-white">
        {/* Left: Trainer Profile & Google/Apple Account Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onReturnToTitle && (
            <button
              onClick={onReturnToTitle}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white cursor-pointer shrink-0 transition-colors"
              title="Return to Title Screen"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Account Button (Google / Apple Account Hub) */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-2.5 py-1 transition-all cursor-pointer shadow-xs shrink-0 text-left"
            title="Google & Apple Account Hub"
          >
            {connectedAccount.avatarUrl ? (
              <div className="w-6 h-6 rounded-md overflow-hidden border border-[#CCFF00]/50 shrink-0 shadow-xs">
                <img src={connectedAccount.avatarUrl} alt={trainerName} className="w-full h-full object-cover" />
              </div>
            ) : connectedAccount.provider === 'Google' ? (
              <div className="w-6 h-6 rounded-md bg-white border border-white/20 flex items-center justify-center p-0.5 shadow-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
            ) : connectedAccount.provider === 'Apple' ? (
              <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center p-0.5 shadow-xs border border-white/20">
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.06-.51 2.68-1.24z"/>
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">
                ID
              </div>
            )}
            <div className="hidden min-[380px]:flex flex-col leading-tight min-w-0">
              <span className="font-display font-black text-[11px] text-white uppercase truncate max-w-[70px] sm:max-w-[110px]">
                {trainerName}
              </span>
              <span className="text-[9px] font-mono text-[#CCFF00] font-bold">
                {connectedAccount.isLoggedIn ? `${connectedAccount.provider} · Synced` : playerTag}
              </span>
            </div>
          </button>
        </div>

        {/* Right: Resources, Multiplayer Friends & Utilities */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Trophies Badge */}
          <div className="hidden min-[360px]:flex items-center gap-1 bg-amber-500/10 border border-amber-400/30 rounded-full px-2 py-0.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-300">{trophies}</span>
          </div>

          {/* Coins Balance */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-400/30 rounded-full px-2.5 py-0.5 shadow-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {credits.toLocaleString()}
            </span>
          </div>

          {/* VIP Passes Button */}
          <button
            onClick={() => setVipModalOpen(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 hover:from-amber-500/30 hover:to-fuchsia-500/30 border border-amber-400/40 rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
            title="VIP Passes & Licenses (Auction, Custom Pet, Extension)"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden min-[400px]:inline text-[11px]">VIP</span>
          </button>

          {/* Friends & Clan Chat Button */}
          <button
            onClick={() => setFriendsModalOpen(true)}
            className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Friends & Clan Chat"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0D111A]" />
          </button>

          {/* How to Play Guide Button */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#CCFF00]" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </button>
        </div>
      </header>

      {/* VIP Passes Modal */}
      <VipPassesModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
      />

      {/* Google & Apple Account Hub Modal */}
      {authModalOpen && (
        <AccountAuthModal
          currentTrainerName={trainerName}
          onUpdateTrainerName={(name) => setTrainerName(name)}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Friends Hub Modal */}
      {friendsModalOpen && (
        <FriendsHubModal
          onChallengeFriend={(friend) => {
            setFriendsModalOpen(false);
            if (onChallengeFriend) {
              onChallengeFriend(friend);
            }
          }}
          onClose={() => setFriendsModalOpen(false)}
        />
      )}

      {/* Guide Modal */}
      <GameGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      {/* Energy Refill Modal */}
      {energyRefillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-[#12141A] border border-white/15 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-display font-bold uppercase text-sm tracking-wide">
                <BatteryCharging className="w-4 h-4" />
                <span>Electrolyte Infusion</span>
              </div>
              <button
                onClick={() => setEnergyRefillModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-center">
              <p className="text-xs text-neutral-300">
                Replenish combat endurance to 100% capacity for conditioning runs.
              </p>
              <div className="bg-[#181B22] p-2.5 rounded-xl border border-white/5 font-mono text-xs">
                <span className="text-neutral-400">Cost: </span>
                <span className="text-amber-400 font-bold">1,200 Credits</span>
              </div>

              {feedbackMsg && (
                <p className="text-xs font-mono font-bold text-[#CCFF00] animate-pulse">
                  {feedbackMsg}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEnergyRefillModal(false)}
                className="flex-1 py-2 text-xs font-mono text-neutral-400 hover:text-white bg-white/5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRefill}
                className="flex-1 py-2 text-xs font-display font-bold uppercase bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow cursor-pointer"
              >
                Refill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
