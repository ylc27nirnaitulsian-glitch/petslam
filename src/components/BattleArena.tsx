import React, { useState } from 'react';
import { Swords, Trophy, Play, RotateCcw, Shield, Activity, Flame } from 'lucide-react';
import { animalImages } from '../assets/images';

interface CombatLogEntry {
  round: number;
  attacker: string;
  action: string;
  damage: number;
  status: string;
}

export const BattleArena: React.FC = () => {
  const [matchState, setMatchState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [p1Hp, setP1Hp] = useState<number>(100);
  const [p2Hp, setP2Hp] = useState<number>(100);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([
    {
      round: 0,
      attacker: 'Arena Referee',
      action: 'Both beasts locked in starter inspection cages. Awaiting bout signal.',
      damage: 0,
      status: 'Match Initialized',
    },
  ]);

  const runSimulation = () => {
    setMatchState('fighting');
    setP1Hp(100);
    setP2Hp(100);
    setWinner(null);

    const simulationRounds: CombatLogEntry[] = [
      {
        round: 1,
        attacker: 'Kaiser (Nirn)',
        action: 'Explosive lateral leap and high collar clamp.',
        damage: 28,
        status: 'Tactical Strike Landed',
      },
      {
        round: 1,
        attacker: 'Vulkan (Alex)',
        action: 'Low brute shoulder charge and chest shockwave tackle.',
        damage: 22,
        status: 'Counter Shockwave',
      },
      {
        round: 2,
        attacker: 'Vulkan (Alex)',
        action: 'Jaw lock clamp on front defensive paw sleeve.',
        damage: 34,
        status: 'Heavy Grapple',
      },
      {
        round: 2,
        attacker: 'Kaiser (Nirn)',
        action: 'Tactical Counter-Lock reversal into neck pin.',
        damage: 42,
        status: 'Critical Reversal',
      },
      {
        round: 3,
        attacker: 'Kaiser (Nirn)',
        action: 'Decisive stamina exhaustion rush and arena perimeter takedown.',
        damage: 36,
        status: 'Knockout Finisher',
      },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < simulationRounds.length) {
        const roundData = simulationRounds[step];
        setCombatLogs((prev) => [roundData, ...prev]);
        setCurrentRound(roundData.round);

        if (roundData.attacker.includes('Nirn')) {
          setP2Hp((prev) => Math.max(0, prev - roundData.damage));
        } else {
          setP1Hp((prev) => Math.max(0, prev - roundData.damage));
        }

        step++;
      } else {
        clearInterval(interval);
        setMatchState('finished');
        setWinner('PLAYER 01: NIRN (Kaiser)');
      }
    }, 900);
  };

  const resetMatch = () => {
    setMatchState('idle');
    setP1Hp(100);
    setP2Hp(100);
    setCurrentRound(0);
    setWinner(null);
    setCombatLogs([
      {
        round: 0,
        attacker: 'Arena Referee',
        action: 'Both beasts locked in starter inspection cages. Awaiting bout signal.',
        damage: 0,
        status: 'Match Initialized',
      },
    ]);
  };

  return (
    <section id="arena" className="relative border-b border-white/5 bg-[#0B0C10] py-20 lg:py-28 overflow-hidden">
      {/* Background Esports Stadium Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#CCFF00]/5 blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5500]/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            <span>Esports Bout Simulation</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Illustrative Showcase</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            IT'S NOT JUST ABOUT WHAT YOU OWN.{' '}
            <span className="text-[#CCFF00] block">IT'S ABOUT HOW YOU FIGHT.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            Raw stats set the threshold, but strategic positioning, endurance conditioning, and timing command the ring. Battles reward tactical mastery, not superficial rarity.
          </p>
        </div>

        {/* Esports Arena Main Clashing Board */}
        <div className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-8 shadow-2xl">
          {/* Top Arena Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <Swords className="h-5 w-5 text-[#CCFF00]" />
              <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Main Card Bout · Tier I Championship Circuit
              </span>
            </div>

            <div className="flex items-center gap-3">
              {matchState === 'finished' ? (
                <button
                  onClick={resetMatch}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-white border border-white/15 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Match</span>
                </button>
              ) : (
                <button
                  onClick={runSimulation}
                  disabled={matchState === 'fighting'}
                  className="inline-flex items-center gap-2 bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black px-5 py-2 text-xs font-display font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  <Play className="h-3.5 w-3.5 fill-black" />
                  <span>{matchState === 'fighting' ? 'Simulating Bout...' : 'Simulate Arena Clash'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Versus Split Matrix */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Fighter 1: Nirn / German Shepherd */}
            <div className={`lg:col-span-5 border transition-all duration-300 ${winner?.includes('Nirn') ? 'border-[#CCFF00] bg-[#14181F] shadow-[0_0_30px_rgba(204,255,0,0.15)]' : 'border-white/10 bg-[#14161E]'}`}>
              {/* Photo Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={animalImages.germanShepherd}
                  alt="German Shepherd Kaiser"
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14161E] via-transparent to-black/40" />

                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 text-xs font-mono font-bold text-[#CCFF00] border border-white/10">
                  PLAYER 01
                </div>

                {winner?.includes('Nirn') && (
                  <div className="absolute top-3 right-3 bg-[#CCFF00] text-black px-3 py-1 font-display font-black text-xs uppercase tracking-wider shadow-lg">
                    VICTORIOUS
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider block">Trainer: NIRN</span>
                  <div className="font-display text-2xl font-black uppercase text-white">
                    Kaiser · German Shepherd
                  </div>
                </div>
              </div>

              {/* Fighter 1 Stats & Health */}
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="text-neutral-400">Conditioning Stamina (HP)</span>
                      <span className="text-white font-bold">{p1Hp}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/60 border border-white/10">
                      <div
                        className="h-full bg-[#CCFF00] transition-all duration-500 ease-out"
                        style={{ width: `${p1Hp}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-black/40 py-2 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Level</span>
                      <span className="font-mono font-bold text-white text-sm">12</span>
                    </div>
                    <div className="bg-black/40 py-2 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Strength</span>
                      <span className="font-mono font-bold text-white text-sm">85</span>
                    </div>
                    <div className="bg-black/40 py-2 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Endurance</span>
                      <span className="font-mono font-bold text-white text-sm">90</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center VS Indicator */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-none border border-white/20 bg-black/80 font-display text-2xl font-black text-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                VS
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-mono uppercase text-neutral-400 block">Round {currentRound || 'Ready'}</span>
                <span className="text-[11px] text-neutral-300">Sanctioned Ring</span>
              </div>
            </div>

            {/* Fighter 2: Alex / Rottweiler */}
            <div className={`lg:col-span-5 border transition-all duration-300 ${winner?.includes('Alex') ? 'border-[#CCFF00] bg-[#14181F] shadow-[0_0_30px_rgba(204,255,0,0.15)]' : 'border-white/10 bg-[#14161E]'}`}>
              {/* Photo Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={animalImages.rottweiler}
                  alt="Rottweiler Vulkan"
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14161E] via-transparent to-black/40" />

                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 text-xs font-mono font-bold text-[#FF5500] border border-white/10">
                  PLAYER 02
                </div>

                {winner?.includes('Alex') && (
                  <div className="absolute top-3 right-3 bg-[#CCFF00] text-black px-3 py-1 font-display font-black text-xs uppercase tracking-wider shadow-lg">
                    VICTORIOUS
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider block">Trainer: ALEX</span>
                  <div className="font-display text-2xl font-black uppercase text-white">
                    Vulkan · Rottweiler
                  </div>
                </div>
              </div>

              {/* Fighter 2 Stats & Health */}
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="text-neutral-400">Conditioning Stamina (HP)</span>
                      <span className="text-white font-bold">{p2Hp}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/60 border border-white/10">
                      <div
                        className="h-full bg-[#FF5500] transition-all duration-500 ease-out"
                        style={{ width: `${p2Hp}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-black/40 py-2 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Level</span>
                      <span className="font-mono font-bold text-white text-sm">10</span>
                    </div>
                    <div className="bg-black/40 py-2 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Strength</span>
                      <span className="font-mono font-bold text-white text-sm">79</span>
                    </div>
                    <div className="bg-black/40 py-2 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Endurance</span>
                      <span className="font-mono font-bold text-white text-sm">86</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Telemetry Feed */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-neutral-400">
                Live Bout Action Logs
              </span>
              <span className="font-mono text-neutral-300">
                {matchState === 'finished' ? 'Combat Completed' : matchState === 'fighting' ? 'Round Processing...' : 'Standby'}
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto bg-black/50 p-4 border border-white/5 font-mono text-xs">
              {combatLogs.map((log, index) => (
                <div key={index} className="flex items-start justify-between border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                  <div>
                    <span className="text-[#CCFF00] font-bold mr-2">
                      {log.round > 0 ? `[RND ${log.round}]` : '[INIT]'}
                    </span>
                    <span className="text-white font-medium mr-2">{log.attacker}:</span>
                    <span className="text-neutral-300">{log.action}</span>
                  </div>
                  {log.damage > 0 && (
                    <span className="text-[#FF5500] font-bold shrink-0 ml-4">
                      -{log.damage} HP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
