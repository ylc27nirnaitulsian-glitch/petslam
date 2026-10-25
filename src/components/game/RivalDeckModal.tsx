import React from 'react';
import { X, Swords, Trophy, Zap, Shield, Flame, Skull, ChevronRight } from 'lucide-react';
import { Animal, ANIMALS_DATA } from '../../data/animals';
import { sound } from '../../utils/audio';

interface RivalDeckModalProps {
  playerBeast: Animal;
  onSelectOpponent: (opponent: Animal) => void;
  onClose: () => void;
}

export const RivalDeckModal: React.FC<RivalDeckModalProps> = ({
  playerBeast,
  onSelectOpponent,
  onClose,
}) => {
  const rivals = ANIMALS_DATA.filter((b) => b.id !== playerBeast.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e111a] border-2 border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#161a26] border-b border-white/10 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Choose Arena Rival
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Select an opponent to battle in the Colosseum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rival Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {rivals.map((rival) => {
            const isBoss = rival.rarity === 'Legendary';
            const difficultyLabel = isBoss
              ? 'Apex Boss'
              : rival.rarity === 'Apex'
              ? 'Hard'
              : 'Normal';
            const diffColor = isBoss
              ? 'text-red-400 bg-red-500/10 border-red-500/30'
              : rival.rarity === 'Apex'
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';

            return (
              <div
                key={rival.id}
                className="bg-[#131622] hover:bg-[#181d2c] border border-white/10 hover:border-[#CCFF00]/50 rounded-2xl p-3.5 flex items-center justify-between transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5">
                  {/* Avatar with Rarity Ring */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shrink-0 shadow-md">
                    <img
                      src={rival.image}
                      alt={rival.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.src = rival.fallbackImage;
                      }}
                    />
                    <div className="absolute top-1 left-1 bg-black/80 px-1 rounded text-[9px] font-mono font-bold text-white">
                      L{rival.level}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm uppercase text-white tracking-wide">
                        {rival.name}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${diffColor}`}>
                        {difficultyLabel}
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-400 font-mono italic">
                      {rival.species} · {rival.scientificName}
                    </p>

                    <div className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-300">
                      <span className="text-white font-semibold">
                        {rival.weightKg} kg
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-red-400 font-semibold">
                        {rival.biteForcePsi} PSI
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-cyan-400 font-semibold">
                        {rival.topSpeedKmh} km/h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Battle CTA */}
                <button
                  onClick={() => {
                    sound.playCardPlay();
                    onSelectOpponent(rival);
                  }}
                  className="ml-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-display font-black text-xs uppercase tracking-wider shrink-0 shadow-md flex items-center gap-1 cursor-pointer group-hover:scale-105 transition-transform"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Fight</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
