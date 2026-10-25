import React from 'react';
import { X, Swords, Users, Shield, Trophy, Flame, Zap, Award } from 'lucide-react';
import { sound } from '../../utils/audio';

export type GameModeType = '1v1' | '2v2' | 'survival' | 'duel';

interface GameModesModalProps {
  currentMode: GameModeType;
  onSelectMode: (mode: GameModeType) => void;
  onClose: () => void;
}

export const GameModesModal: React.FC<GameModesModalProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  const modes = [
    {
      id: '1v1' as GameModeType,
      title: '1v1 Ranked Colosseum',
      badge: 'Competitive Ladder',
      desc: 'Standard championship rules. Battle solo against live matched rivals to climb global MMR leagues.',
      reward: '+35 Trophies · +2,200 Gold',
      icon: Swords,
      themeColor: 'from-[#CCFF00] to-emerald-500',
      badgeColor: 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/30',
    },
    {
      id: '2v2' as GameModeType,
      title: '2v2 Tag Team Arena',
      badge: 'Multiplayer Co-Op',
      desc: 'Pair up with an ally beast or friend. Tag in and out during combat to perform double-takedown combos!',
      reward: '+50 Trophies · +3,500 Gold',
      icon: Users,
      themeColor: 'from-cyan-400 to-blue-600',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'survival' as GameModeType,
      title: 'Survival Beast Gauntlet',
      badge: 'Endurance Wave',
      desc: 'Endure consecutive waves of apex predators with no health regeneration between rounds.',
      reward: 'Gems 💎 · Rare Gear Chest',
      icon: Flame,
      themeColor: 'from-amber-400 to-red-600',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'duel' as GameModeType,
      title: 'Friendly Duel (Unranked)',
      badge: 'Custom Match',
      desc: 'Spar against clanmates or friends with custom stamina multipliers and zero trophy loss penalty.',
      reward: 'Practice XP · Bragging Rights',
      icon: Shield,
      themeColor: 'from-purple-500 to-fuchsia-600',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e121a] border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#151c2a] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Select Game Mode
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Competitive 1v1 Arena & 2v2 Tag-Team Battle Modes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Mode Cards */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  sound.playLevelUp();
                  onSelectMode(mode.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer shadow flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#151c2d] border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.25)] scale-[1.02]'
                    : 'bg-[#10141f] border-white/10 hover:border-white/25 hover:bg-[#141926]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.themeColor} flex items-center justify-center text-black font-black shadow shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm uppercase text-white tracking-wide">
                        {mode.title}
                      </h4>
                      <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${mode.badgeColor} mt-0.5`}>
                        {mode.badge}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold bg-[#CCFF00] text-black px-2 py-0.5 rounded-full uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-300 font-mono mt-2.5">
                  {mode.desc}
                </p>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Match Rewards:</span>
                  <span className="text-amber-300 font-bold">{mode.reward}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
