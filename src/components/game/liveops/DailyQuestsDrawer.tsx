import React, { useState } from 'react';
import {
  X,
  Target,
  Sparkles,
  CheckCircle,
  Coins,
  Zap,
  Award,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { triggerVictoryExplosion } from '../../../utils/confetti';
import { useGame } from '../../../context/GameContext';
import { triggerSuccessHaptic } from '../../../utils/haptics';

interface DailyQuestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass?: () => void;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  creditsReward: number;
  xpReward: number;
  isClaimed: boolean;
}

export const DailyQuestsDrawer: React.FC<DailyQuestsDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPass,
}) => {
  const { addCredits } = useGame();

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem('petslam_daily_quests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'q1',
        title: 'Apex Striker',
        description: 'Land 5 Pounces or Special Moves in Arena Combat',
        current: 3,
        target: 5,
        creditsReward: 250,
        xpReward: 60,
        isClaimed: false,
      },
      {
        id: 'q2',
        title: 'Sanctuary Caretaker',
        description: 'Feed, Wash, or Pet your companion in the Sanctuary',
        current: 3,
        target: 3,
        creditsReward: 150,
        xpReward: 40,
        isClaimed: false,
      },
      {
        id: 'q3',
        title: 'Ranked Gladiator',
        description: 'Compete in 1 Authoritative Ranked 1v1 Multiplayer Duel',
        current: 1,
        target: 1,
        creditsReward: 350,
        xpReward: 80,
        isClaimed: false,
      },
    ];
  });

  if (!isOpen) return null;

  const handleClaim = (questId: string) => {
    sound.playVictory();
    triggerSuccessHaptic();

    setQuests((prev) => {
      const updated = prev.map((q) => {
        if (q.id === questId) {
          addCredits(q.creditsReward);
          return { ...q, isClaimed: true };
        }
        return q;
      });
      try {
        localStorage.setItem('petslam_daily_quests', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm select-none font-sans animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-[#080C16] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden text-white animate-slideInRight">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0C1222] via-[#090D18] to-[#06080E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Daily Arena Directives</span>
                <span className="text-[10px] bg-cyan-400 text-black px-2 py-0.5 rounded-full font-black font-mono">
                  3 ACTIVE
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono mt-0.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Resets in: 14h 22m</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {quests.map((q) => {
            const isCompleted = q.current >= q.target;
            const pct = Math.min(100, (q.current / q.target) * 100);

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  q.isClaimed
                    ? 'border-white/5 bg-[#0A0E18]/60 opacity-60'
                    : isCompleted
                    ? 'border-cyan-400/50 bg-[#0C1426] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'border-white/10 bg-[#0A0E1A]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase">{q.title}</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-300">
                    {q.current} / {q.target}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 mb-2 leading-relaxed">{q.description}</p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-[#CCFF00]' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Rewards & Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-[#CCFF00] font-bold">+{q.creditsReward} Credits</span>
                    <span>·</span>
                    <span className="text-cyan-300 font-bold">+{q.xpReward} Pass XP</span>
                  </div>

                  {q.isClaimed ? (
                    <span className="text-[10px] font-mono text-neutral-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(q.id)}
                      className="py-1 px-3 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono text-[10px] font-black uppercase cursor-pointer transition-all shadow-[0_0_12px_rgba(204,255,0,0.4)] active:scale-95"
                    >
                      Claim Reward
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA to Battle Pass */}
        <div className="p-4 border-t border-white/10 bg-[#0A0E18]">
          <button
            onClick={() => {
              onClose();
              onOpenPass?.();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>View Slam Battle Pass (50 Tiers)</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};
