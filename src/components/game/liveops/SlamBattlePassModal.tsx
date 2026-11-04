import React, { useRef, useEffect } from 'react';
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
  Flame,
  Target,
  Swords,
  Heart,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { triggerVictoryExplosion } from '../../../utils/confetti';
import { useGame } from '../../../context/GameContext';
import { triggerSuccessHaptic } from '../../../utils/haptics';

interface SlamBattlePassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlamBattlePassModal: React.FC<SlamBattlePassModalProps> = ({ isOpen, onClose }) => {
  const {
    trainerName,
    credits,
    passPoints,
    royalPassTier,
    claimedRoyalPassTiers,
    claimRoyalPassTier,
  } = useGame();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current active tier on open
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-tier="${royalPassTier}"]`);
      if (activeElement) {
        setTimeout(() => {
          activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 150);
      }
    }
  }, [isOpen, royalPassTier]);

  if (!isOpen) return null;

  // 50 Tiers of 100% Free Progression
  const tiers = Array.from({ length: 50 }, (_, i) => {
    const tierNum = i + 1;
    const isMajorMilestone = tierNum % 10 === 0;
    const isMinorMilestone = tierNum % 5 === 0 && !isMajorMilestone;

    let rewardTitle = '';
    let rewardCredits = 0;
    let bonusItem = '';

    if (tierNum === 1) {
      rewardTitle = 'Welcome Recruit Package';
      rewardCredits = 500;
      bonusItem = '500 Starter Credits';
    } else if (tierNum === 50) {
      rewardTitle = 'Royal Grand Championship Trophy';
      rewardCredits = 10000;
      bonusItem = '10,000 CR + Apex Champion Sigil';
    } else if (isMajorMilestone) {
      rewardTitle = `Major Milestone Tier ${tierNum}`;
      rewardCredits = tierNum * 200;
      bonusItem = `${(rewardCredits).toLocaleString()} CR + Rare Cyber Treat`;
    } else if (isMinorMilestone) {
      rewardTitle = `Supply Drop Tier ${tierNum}`;
      rewardCredits = tierNum * 120;
      bonusItem = `${(rewardCredits).toLocaleString()} CR + Energy Booster`;
    } else {
      rewardTitle = `Ranked Reward Tier ${tierNum}`;
      rewardCredits = 250 + tierNum * 40;
      bonusItem = `${(rewardCredits).toLocaleString()} CR + Training Berries`;
    }

    return {
      tier: tierNum,
      title: rewardTitle,
      credits: rewardCredits,
      bonus: bonusItem,
      pointsRequired: (tierNum - 1) * 100,
      isMajor: isMajorMilestone || tierNum === 50,
      isMinor: isMinorMilestone,
    };
  });

  const handleClaim = (tierNum: number, creditReward: number) => {
    const success = claimRoyalPassTier(tierNum, creditReward);
    if (success) {
      triggerVictoryExplosion();
      triggerSuccessHaptic();
    }
  };

  const pointsIntoCurrentTier = passPoints % 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none font-sans animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#080C16] border border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(251,191,36,0.25)] flex flex-col overflow-hidden text-white max-h-[92vh]">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/50 via-[#130E1E] to-[#0A0D16]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-black uppercase tracking-wider text-white">
                  Slam Royal Pass · Season 1
                </h2>
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-black px-2.5 py-0.5 rounded-full font-black font-mono shadow-sm">
                  TIER {royalPassTier} / 50
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono mt-0.5">
                100% Free Progression Track · Earn Royal Points through Battles, Care & Quests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{credits.toLocaleString()} CR Balance</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Season Progression & Point Sources Telemetry Bar */}
        <div className="p-4 border-b border-white/10 bg-[#0A0F1D]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
          {/* Progress to Next Tier */}
          <div className="w-full md:w-80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tier {royalPassTier} Progress
              </span>
              <span className="text-neutral-400 font-semibold">
                {royalPassTier >= 50 ? 'MAX TIER REACHED' : `${pointsIntoCurrentTier} / 100 PTS`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-[#CCFF00] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                style={{ width: `${royalPassTier >= 50 ? 100 : pointsIntoCurrentTier}%` }}
              />
            </div>
          </div>

          {/* Quick Points Source Guide */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-300">
            <span className="text-neutral-400 uppercase font-black tracking-wider text-[9px] mr-1">
              Earn Points:
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-bold flex items-center gap-1">
              <Swords className="w-3 h-3" /> Arena Win (+100)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" /> Arena Bout (+40)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-300 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Training (+50)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-lime-500/15 border border-lime-400/30 text-lime-300 font-bold flex items-center gap-1">
              <Heart className="w-3 h-3" /> Pet Care (+25)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold flex items-center gap-1">
              <Target className="w-3 h-3" /> Quests (+75)
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Timeline */}
        <div ref={scrollContainerRef} className="p-4 sm:p-6 flex-1 overflow-x-auto space-y-4 scrollbar-thin">
          <div className="flex items-center gap-3.5 min-w-max pb-4">
            {tiers.map((t) => {
              const isUnlocked = royalPassTier >= t.tier;
              const isClaimed = Boolean(claimedRoyalPassTiers[t.tier]);
              const isCurrent = royalPassTier === t.tier;

              return (
                <div
                  key={t.tier}
                  data-tier={t.tier}
                  className={`w-52 rounded-2xl border p-4 flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 via-[#10162A] to-[#0A0E18] shadow-[0_0_25px_rgba(251,191,36,0.3)] scale-[1.02]'
                      : isUnlocked
                      ? 'border-amber-500/30 bg-[#0E1424] shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                      : 'border-white/10 bg-[#080B14] opacity-65 hover:opacity-85'
                  }`}
                >
                  {/* Top Tier Badge & Lock Status */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-amber-300">
                        TIER {t.tier}
                      </span>
                      {t.isMajor && (
                        <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.2 rounded font-black uppercase">
                          Milestone
                        </span>
                      )}
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3 text-neutral-500" /> {t.pointsRequired} PTS
                      </span>
                    )}
                  </div>

                  {/* Reward Visual Box */}
                  <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/10 space-y-2 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                      {t.tier === 50 ? (
                        <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
                      ) : t.isMajor ? (
                        <Award className="w-6 h-6 text-amber-300" />
                      ) : (
                        <Gift className="w-5 h-5 text-amber-400" />
                      )}
                    </div>

                    <div className="font-display font-black text-sm text-white truncate px-1">
                      {t.title}
                    </div>

                    <div className="text-xs font-mono font-black text-[#CCFF00] flex items-center justify-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{t.credits.toLocaleString()} Credits</span>
                    </div>

                    <div className="text-[10px] font-mono text-neutral-300 truncate">
                      {t.bonus}
                    </div>
                  </div>

                  {/* Claim or Status Button */}
                  <div className="pt-1">
                    {isUnlocked ? (
                      isClaimed ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Claimed ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaim(t.tier, t.credits)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-display font-black text-xs uppercase cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Gift className="w-3.5 h-3.5 text-black" />
                          <span>Claim Reward</span>
                        </button>
                      )
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-500 font-mono text-[10px] text-center">
                        Reach Tier {t.tier} ({t.pointsRequired - passPoints} pts needed)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-[11px] font-mono text-neutral-400 px-5">
          <span>All 50 Royal Tiers are 100% free to unlock via gameplay.</span>
          <span className="text-amber-400 font-bold">Season 1 Active</span>
        </div>
      </div>
    </div>
  );
};
