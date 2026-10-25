import React, { useState, useEffect } from 'react';
import { Swords, Zap, Shield, Flame, Trophy, AlertTriangle, ArrowRight } from 'lucide-react';
import { Animal } from '../../data/animals';
import { sound } from '../../utils/audio';

interface VersusMatchupScreenProps {
  playerBeast: Animal;
  playerStats: {
    strength: number;
    speed: number;
    endurance: number;
    agility: number;
    biteForce: number;
    armor: number;
  };
  opponent: Animal;
  isRanked: boolean;
  onFightStart: () => void;
  onCancel: () => void;
}

export const VersusMatchupScreen: React.FC<VersusMatchupScreenProps> = ({
  playerBeast,
  playerStats,
  opponent,
  isRanked,
  onFightStart,
  onCancel,
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sound.playClick();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#06070A] text-white flex flex-col justify-between overflow-hidden select-none animate-fadeIn">
      {/* Background Volumetric Clash Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#CCFF00]/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      </div>

      {/* Top Banner */}
      <div className="relative z-20 px-4 py-3 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-display font-black text-xs uppercase tracking-wider text-white">
            {isRanked ? 'Ranked Championship Clash (+45 MMR)' : 'Casual Arena Sparring'}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-mono text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
        >
          Retreat to Staging
        </button>
      </div>

      {/* Center Matchup Stage */}
      <div className="relative z-20 flex-1 flex flex-col justify-around px-4 py-2 max-w-lg mx-auto w-full">
        {/* Player Beast Card (Top / Left in portrait) */}
        <div className="relative bg-gradient-to-r from-[#121620] to-[#0A0D14] border-2 border-[#CCFF00]/60 rounded-3xl p-4 shadow-[0_0_30px_rgba(204,255,0,0.15)] flex items-center justify-between transform transition-all duration-500 translate-x-0 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-lg shrink-0">
              <img
                src={playerBeast.image}
                alt={playerBeast.name}
                className="w-full h-full object-cover scale-105"
                onError={(e) => {
                  e.currentTarget.src = playerBeast.fallbackImage || playerBeast.image;
                }}
              />
              <div className="absolute top-1 left-1 px-1.5 py-0.2 bg-[#CCFF00] text-black text-[9px] font-black uppercase rounded shadow">
                You
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-[#CCFF00] font-bold tracking-wider">
                L{playerBeast.level} · {playerBeast.combatArchetype}
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                {playerBeast.name}
              </h2>
              <div className="text-xs text-neutral-400 font-mono">
                {playerBeast.species}
              </div>

              <div className="mt-2 flex gap-2 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-neutral-300">
                  PWR {playerStats.strength}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-cyan-300">
                  SPD {playerStats.speed}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#CCFF00]">
                  {playerStats.biteForce} PSI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Animated VS Emblem */}
        <div className="relative flex items-center justify-center my-3">
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-[#CCFF00]/40 via-red-500/40 to-transparent" />
          <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-neutral-900 to-black border-2 border-white/20 shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center font-display font-black text-xl italic tracking-wider text-[#CCFF00] scale-110 animate-bounce">
            VS
          </div>
        </div>

        {/* Challenger Card (Bottom / Right) */}
        <div className="relative bg-gradient-to-l from-[#201216] to-[#0D0A0C] border-2 border-red-500/60 rounded-3xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.15)] flex items-center justify-between flex-row-reverse transform transition-all duration-500 animate-fadeIn">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-red-500 shadow-lg shrink-0">
              <img
                src={opponent.image}
                alt={opponent.name}
                className="w-full h-full object-cover scale-105"
                onError={(e) => {
                  e.currentTarget.src = opponent.fallbackImage || opponent.image;
                }}
              />
              <div className="absolute top-1 right-1 px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-black uppercase rounded shadow">
                Rival
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-red-400 font-bold tracking-wider">
                L{opponent.level} · {opponent.combatArchetype}
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                {opponent.name}
              </h2>
              <div className="text-xs text-neutral-400 font-mono">
                {opponent.species}
              </div>

              <div className="mt-2 flex gap-2 justify-end text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-neutral-300">
                  PWR {opponent.strength}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-cyan-300">
                  SPD {opponent.speed}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-red-400">
                  {opponent.biteForce || Math.round(opponent.strength * 3.5)} PSI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fight Trigger with Countdown */}
      <div className="relative z-20 p-4 border-t border-white/10 bg-black/80 backdrop-blur-md flex flex-col items-center">
        <button
          onClick={() => {
            sound.playHeavyHit();
            onFightStart();
          }}
          className="w-full max-w-sm py-4 px-6 rounded-2xl font-display font-black text-base uppercase tracking-wider text-black bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_rgba(204,255,0,0.5)] flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5 fill-black" />
          <span>
            {countdown > 0 ? `START CLASH IN ${countdown}...` : 'FIGHT! ENTER RING'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
