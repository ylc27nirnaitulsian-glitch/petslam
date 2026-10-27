import React, { useState } from 'react';
import {
  X,
  Crown,
  Lock,
  CheckCircle,
  Sparkles,
  Zap,
  Coins,
  Award,
  ChevronRight,
  Shield,
  Gift,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { triggerVictoryExplosion } from '../../../utils/confetti';
import { useGame } from '../../../context/GameContext';
import { triggerLightImpactHaptic, triggerSuccessHaptic } from '../../../utils/haptics';

interface SlamBattlePassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlamBattlePassModal: React.FC<SlamBattlePassModalProps> = ({ isOpen, onClose }) => {
  const { trainerName, credits, addCredits, hasExtensionPass } = useGame();

  const [currentTier, setCurrentTier] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('petslam_pass_tier')) || 12;
    } catch {
      return 12;
    }
  });

  const [hasVipPass, setHasVipPass] = useState<boolean>(() => {
    try {
      return localStorage.getItem('petslam_pass_vip_pass') === 'true';
    } catch {
      return false;
    }
  });

  const [claimedTiers, setClaimedTiers] = useState<Record<number, { free: boolean; vip: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('petslam_claimed_tiers');
      return saved ? JSON.parse(saved) : { 1: { free: true, vip: false }, 2: { free: true, vip: false } };
    } catch {
      return {};
    }
  });

  if (!isOpen) return null;

  // Generate 50 tiers
  const tiers = Array.from({ length: 50 }, (_, i) => {
    const tierNum = i + 1;
    const isFreeSpecial = tierNum % 5 === 0;
    const isVipSpecial = tierNum % 10 === 0;

    return {
      tier: tierNum,
      freeReward: isFreeSpecial ? `${tierNum * 100} Credits + Rare Berry` : `${tierNum * 50} Credits`,
      freeCredits: isFreeSpecial ? tierNum * 100 : tierNum * 50,
      vipReward: isVipSpecial
        ? `✦ Cyber Morph Skin + ${tierNum * 300} Credits`
        : `Holo Shard + ${tierNum * 150} Credits`,
      vipCredits: isVipSpecial ? tierNum * 300 : tierNum * 150,
    };
  });

  const handleClaimReward = (tier: number, track: 'free' | 'vip', creditAmount: number) => {
    sound.playVictory();
    triggerSuccessHaptic();
    addCredits(creditAmount);

    setClaimedTiers((prev) => {
      const updated = {
        ...prev,
        [tier]: {
          free: track === 'free' ? true : prev[tier]?.free || false,
          vip: track === 'vip' ? true : prev[tier]?.vip || false,
        },
      };
      try {
        localStorage.setItem('petslam_claimed_tiers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUnlockVip = () => {
    sound.playVictory();
    triggerVictoryExplosion();
    setHasVipPass(true);
    try {
      localStorage.setItem('petslam_pass_vip_pass', 'true');
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-4xl bg-[#080C16] border border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(251,191,36,0.25)] flex flex-col overflow-hidden text-white max-h-[92vh]">
        {/* Header Banner */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#130E1E] to-[#0A0D16]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">
                  Slam Pass · Season 1: Cyber Genesis
                </h2>
                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black font-mono">
                  TIER {currentTier} / 50
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Level up by battling in Arena & completing Daily Quests · 50 Premium Tiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!hasVipPass && (
              <button
                onClick={handleUnlockVip}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-mono text-xs font-black uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4 text-black" />
                <span>Unlock VIP Pass ($4.99)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Timeline */}
        <div className="p-4 flex-1 overflow-x-auto space-y-4">
          <div className="flex items-center gap-3 min-w-max pb-4">
            {tiers.map((t) => {
              const isUnlocked = currentTier >= t.tier;
              const isFreeClaimed = claimedTiers[t.tier]?.free;
              const isVipClaimed = claimedTiers[t.tier]?.vip;

              return (
                <div
                  key={t.tier}
                  className={`w-44 rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? 'border-amber-400/50 bg-[#0E1424] shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'border-white/10 bg-[#090D18] opacity-75'
                  }`}
                >
                  {/* Tier Number & Progress */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
                    <span className="font-black text-amber-300">TIER {t.tier}</span>
                    {isUnlocked ? (
                      <span className="text-[10px] text-emerald-400 font-bold">UNLOCKED ✓</span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </div>

                  {/* Free Track Card */}
                  <div className="my-2 p-2 rounded-xl bg-black/40 border border-white/10 space-y-1">
                    <div className="text-[9px] font-mono font-bold text-neutral-400 uppercase">
                      Free Track
                    </div>
                    <div className="text-[11px] font-bold text-white truncate">{t.freeReward}</div>
                    {isUnlocked ? (
                      isFreeClaimed ? (
                        <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Claimed
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimReward(t.tier, 'free', t.freeCredits)}
                          className="w-full py-1 rounded bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono text-[10px] font-black uppercase cursor-pointer"
                        >
                          Claim
                        </button>
                      )
                    ) : (
                      <div className="text-[9px] font-mono text-neutral-500">Locked</div>
                    )}
                  </div>

                  {/* VIP Track Card */}
                  <div
                    className={`p-2 rounded-xl border space-y-1 ${
                      hasVipPass
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-black/60 border-dashed border-white/15'
                    }`}
                  >
                    <div className="text-[9px] font-mono font-bold text-amber-300 uppercase flex items-center justify-between">
                      <span>VIP Track</span>
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                    <div className="text-[11px] font-bold text-amber-100 truncate">{t.vipReward}</div>
                    {hasVipPass ? (
                      isUnlocked ? (
                        isVipClaimed ? (
                          <div className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Claimed
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaimReward(t.tier, 'vip', t.vipCredits)}
                            className="w-full py-1 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono text-[10px] font-black uppercase cursor-pointer"
                          >
                            Claim VIP
                          </button>
                        )
                      ) : (
                        <div className="text-[9px] font-mono text-neutral-500">Reach Lv.{t.tier}</div>
                      )
                    ) : (
                      <div className="text-[9px] font-mono text-amber-400/70">VIP Pass Required</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
