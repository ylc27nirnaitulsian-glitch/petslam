import React, { useState, useEffect } from 'react';
import { Swords, Shield, Trophy, Sparkles, User, Zap, X } from 'lucide-react';
import { Animal, ANIMALS_DATA } from '../../data/animals';
import { sound } from '../../utils/audio';

interface MatchmakingModalProps {
  playerBeast: Animal;
  trainerName: string;
  trophies: number;
  playerLevel: number;
  onMatchFound: (opponent: Animal, opponentTrainer: string) => void;
  onCancel: () => void;
}

const BOT_TRAINERS = [
  { name: 'ApexStriker', tag: '#CLAW99', trophiesDelta: 15 },
  { name: 'ViperKing', tag: '#VIPER7', trophiesDelta: -10 },
  { name: 'ColosseumMax', tag: '#GLAD42', trophiesDelta: 30 },
  { name: 'ShadowClaw', tag: '#NIGHT8', trophiesDelta: -5 },
  { name: 'TitanTamer', tag: '#TITAN1', trophiesDelta: 25 },
  { name: 'WildFury', tag: '#FURY88', trophiesDelta: 10 },
  { name: 'BrawlChampion', tag: '#WINNER', trophiesDelta: 40 },
];

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  playerBeast,
  trainerName,
  trophies,
  playerLevel,
  onMatchFound,
  onCancel,
}) => {
  const [phase, setPhase] = useState<'searching' | 'found' | 'versus'>('searching');
  const [searchTime, setSearchTime] = useState<number>(0);
  const [displayOpponent, setDisplayOpponent] = useState<Animal>(ANIMALS_DATA[1]);
  const [displayTrainer, setDisplayTrainer] = useState<string>('Searching...');
  const [countdown, setCountdown] = useState<number>(3);

  // Available rivals excluding active beast
  const candidates = ANIMALS_DATA.filter((b) => b.id !== playerBeast.id);

  // Matchmaking simulation effect
  useEffect(() => {
    sound.playMatchSearch();
    const interval = setInterval(() => {
      setSearchTime((prev) => prev + 1);
      // Rapid shuffle of candidates
      const randomBeast = candidates[Math.floor(Math.random() * candidates.length)];
      const randomTrainer = BOT_TRAINERS[Math.floor(Math.random() * BOT_TRAINERS.length)];
      setDisplayOpponent(randomBeast);
      setDisplayTrainer(randomTrainer.name);
      sound.playMatchSearch();
    }, 450);

    // Pick final match after 2.2 seconds
    const matchTimer = setTimeout(() => {
      clearInterval(interval);
      const chosenBeast = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0];
      const chosenTrainer = BOT_TRAINERS[Math.floor(Math.random() * BOT_TRAINERS.length)];
      setDisplayOpponent(chosenBeast);
      setDisplayTrainer(chosenTrainer.name);
      setPhase('found');
      sound.playMatchFound();

      // Transition to VS clash
      setTimeout(() => {
        setPhase('versus');
      }, 900);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(matchTimer);
    };
  }, []);

  // Countdown timer in versus phase
  useEffect(() => {
    if (phase !== 'versus') return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
        sound.playCardSelect();
      }, 700);
      return () => clearTimeout(timer);
    } else {
      // Launch match!
      onMatchFound(displayOpponent, displayTrainer);
    }
  }, [phase, countdown, displayOpponent, displayTrainer, onMatchFound]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e111a] border-2 border-[#CCFF00]/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(204,255,0,0.25)] flex flex-col">
        {/* Top Header */}
        <div className="bg-[#161a26] border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#CCFF00] animate-pulse" />
            <span className="font-display font-black text-sm uppercase tracking-wider text-white">
              {phase === 'searching'
                ? 'Apex Global Live Matchmaking'
                : phase === 'found'
                ? 'Challenger Located!'
                : 'Colosseum Arena Clash'}
            </span>
          </div>

          {phase === 'searching' && (
            <button
              onClick={onCancel}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Searching Phase */}
        {phase === 'searching' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            {/* Spinning Radar Animation */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#CCFF00]/30 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border border-dashed border-[#CCFF00]/50 animate-spin" />
              <div className="absolute inset-6 rounded-full bg-[#182032] border border-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src={displayOpponent.image}
                  alt="searching"
                  className="w-full h-full object-cover scale-110 filter brightness-75 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = displayOpponent.fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Swords className="w-8 h-8 text-[#CCFF00] animate-bounce" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-black text-xl text-white tracking-wide">
                Searching for Opponent...
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Finding rival in <span className="text-[#CCFF00]">Apex Arena Tier III</span> ({searchTime}s)
              </p>
            </div>

            {/* Scrolling Opponent Preview */}
            <div className="w-full bg-[#141824] border border-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={displayOpponent.image}
                    alt={displayOpponent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = displayOpponent.fallbackImage;
                    }}
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white uppercase">{displayTrainer}</p>
                  <p className="text-[10px] text-[#CCFF00] font-mono">{displayOpponent.name} · Lvl {displayOpponent.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                <Trophy className="w-3.5 h-3.5" />
                <span>{trophies + Math.floor(Math.random() * 40 - 20)}</span>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* Found / Versus Phase */}
        {(phase === 'found' || phase === 'versus') && (
          <div className="p-6 flex flex-col items-center space-y-6">
            <div className="w-full text-center">
              <span className="inline-block px-4 py-1 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider animate-bounce shadow-[0_0_20px_rgba(204,255,0,0.5)]">
                MATCH READY!
              </span>
            </div>

            {/* Split Screen Matchup Cards */}
            <div className="w-full grid grid-cols-2 gap-3 relative">
              {/* Center VS Emblem */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-red-600 border-2 border-white shadow-[0_0_25px_rgba(239,68,68,0.8)] flex items-center justify-center font-display font-black text-lg text-white italic scale-110 animate-pulse">
                VS
              </div>

              {/* Player Side */}
              <div className="bg-[#141824] border-2 border-[#CCFF00]/50 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-lg">
                  <img
                    src={playerBeast.image}
                    alt={playerBeast.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = playerBeast.fallbackImage;
                    }}
                  />
                </div>
                <div>
                  <p className="font-display font-black text-sm text-white uppercase">{trainerName}</p>
                  <p className="text-xs text-[#CCFF00] font-bold">{playerBeast.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{playerBeast.species} · {playerBeast.weightKg}kg</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{trophies}</span>
                </div>
              </div>

              {/* Opponent Side */}
              <div className="bg-[#141824] border-2 border-red-500/50 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-red-500 shadow-lg">
                  <img
                    src={displayOpponent.image}
                    alt={displayOpponent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = displayOpponent.fallbackImage;
                    }}
                  />
                </div>
                <div>
                  <p className="font-display font-black text-sm text-white uppercase">{displayTrainer}</p>
                  <p className="text-xs text-red-400 font-bold">{displayOpponent.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{displayOpponent.species} · {displayOpponent.weightKg}kg</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{trophies + 25}</span>
                </div>
              </div>
            </div>

            {/* Countdown to Battle */}
            <div className="w-full text-center space-y-1">
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                Entering Arena in
              </p>
              <div className="font-display font-black text-3xl text-[#CCFF00] animate-ping">
                {countdown > 0 ? countdown : 'FIGHT!'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
