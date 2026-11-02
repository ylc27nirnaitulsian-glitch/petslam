import React, { useState } from 'react';
import {
  Coins,
  X,
  Sparkles,
  Zap,
  CheckCircle,
  ShieldCheck,
  Award,
  Swords,
  Target,
  Compass,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { triggerVictoryExplosion } from '../../utils/confetti';
import { trackClarityEvent } from '../../utils/clarity';

interface TokenRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArena?: () => void;
  onOpenQuests?: () => void;
  onOpenRadar?: () => void;
}

export const TokenRefillModal: React.FC<TokenRefillModalProps> = ({
  isOpen,
  onClose,
  onOpenArena,
  onOpenQuests,
  onOpenRadar,
}) => {
  const { credits, addCredits } = useGame();
  const [faucetClaimed, setFaucetClaimed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const lastClaim = localStorage.getItem('petslam_faucet_last_claim');
    if (!lastClaim) return false;
    // Allow claim every 24 hours
    return Date.now() - parseInt(lastClaim, 10) < 24 * 60 * 60 * 1000;
  });
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaimDailyFaucet = () => {
    sound.playVictory();
    triggerVictoryExplosion();
    addCredits(500);
    localStorage.setItem('petslam_faucet_last_claim', Date.now().toString());
    setFaucetClaimed(true);
    setPurchaseToast('🎉 +500 Free Daily Tokens Claimed!');
    trackClarityEvent('claim_daily_faucet');
    setTimeout(() => setPurchaseToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Toast */}
        {purchaseToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 duration-200 pointer-events-none">
            <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-mono font-black text-xs sm:text-sm shadow-xl border border-white/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <span>{purchaseToast}</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-white flex items-center gap-2">
                <span>Slam Tokens Hub</span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Instant Refill
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Current Balance:{' '}
                <span className="text-amber-400 font-black">{credits.toLocaleString()} Coins</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 scrollbar-thin">
          {/* Daily Free Faucet Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-display font-bold uppercase text-white flex items-center gap-1.5">
                  <span>Daily Free Faucet</span>
                  <span className="text-[9px] font-mono font-bold bg-[#CCFF00] text-black px-1.5 py-0.2 rounded-sm">
                    FREE
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 font-mono">
                  Claim +500 free Slam Coins every 24 hours to keep your companion energized.
                </p>
              </div>
            </div>

            <button
              onClick={handleClaimDailyFaucet}
              disabled={faucetClaimed}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black uppercase transition-all shrink-0 cursor-pointer shadow-md ${
                faucetClaimed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black active:scale-95 shadow-[0_0_12px_rgba(204,255,0,0.4)]'
              }`}
            >
              {faucetClaimed ? 'Claimed Today ✓' : 'Claim +500 🪙'}
            </button>
          </div>

          {/* Fair-Play Zero Pay-to-Win Notice */}
          <div className="p-4 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Zero Pay-to-Win Fair Play Economy
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">100% Earnable</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In strict compliance with competitive fair-play and Dodo Payments non-wagering guidelines, combat tokens cannot be purchased with real money. Win arena bouts, complete daily quests, or claim the free 24h faucet to grow your token balance!
            </p>
          </div>

          {/* In-Game Free Ways to Earn Tokens */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Earn Free Tokens In-Game</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenArena?.();
                }}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                  <Swords className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>PvP Arena Wins</span>
                    <span className="text-amber-400 font-mono">+1,800 - 2,600 🪙</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Battle trainer opponents in live combat
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenQuests?.();
                }}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>Daily Directives</span>
                    <span className="text-amber-400 font-mono">+3,000 - 12,000 🪙</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Complete 3 daily trainer mission quests
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenRadar?.();
                }}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-emerald-400/40 transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>World Map Catches</span>
                    <span className="text-amber-400 font-mono">+450 🪙 / catch</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Track & capture wild purebreds on GPS radar
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>Buddy Interactions</span>
                    <span className="text-amber-400 font-mono">+35 - 50 🪙</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Feed berries and play catch with your screen companion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Secure Dodo Payments Integration</span>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
