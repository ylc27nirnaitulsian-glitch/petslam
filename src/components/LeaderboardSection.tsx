import React, { useState } from 'react';
import {
  LEADERBOARD_WEEKLY,
  LEADERBOARD_MONTHLY,
  LEADERBOARD_ALL_TIME,
  LeaderboardPlayer,
} from '../data/leaderboard';
import { Trophy, Medal, Flame } from 'lucide-react';

export const LeaderboardSection: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  const players: LeaderboardPlayer[] =
    timeframe === 'weekly'
      ? LEADERBOARD_WEEKLY
      : timeframe === 'monthly'
      ? LEADERBOARD_MONTHLY
      : LEADERBOARD_ALL_TIME;

  return (
    <section id="leaderboard" className="relative border-b border-white/5 bg-[#0B0C10] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
              <span>Global Sanctioned Rankings</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-400">Competitive Standings</span>
            </div>
            <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
              THE ARENA REMEMBERS THE BEST.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-neutral-400 leading-relaxed">
              Ascend through regional qualifiers to claim a position on the global stage. Points are recalibrated at the close of every competitive season cycle.
            </p>
          </div>

          {/* Timeframe Tabs (Interactive Functional Controls per Constitution) */}
          <div className="flex items-center gap-1 bg-[#14161E] p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider transition-colors cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Weekly Circuit
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider transition-colors cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly Masters
            </button>
            <button
              onClick={() => setTimeframe('allTime')}
              className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider transition-colors cursor-pointer ${
                timeframe === 'allTime'
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All-Time Hall
            </button>
          </div>
        </div>

        {/* Leaderboard Table Container */}
        <div className="mt-12 overflow-x-auto border border-white/10 bg-[#12141A]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#161822] text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-display">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Competitor Profile</th>
                <th className="py-4 px-6">Primary Champion Beast</th>
                <th className="py-4 px-6 text-center">Record (W / L)</th>
                <th className="py-4 px-6 text-center">Win Rate</th>
                <th className="py-4 px-6 text-right">Arena Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {players.map((player) => {
                const isFirst = player.rank === 1;
                const isSecond = player.rank === 2;
                const isThird = player.rank === 3;

                return (
                  <tr
                    key={player.playerName}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      isFirst ? 'bg-[#CCFF00]/[0.02]' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        {isFirst ? (
                          <div className="flex h-8 w-8 items-center justify-center bg-[#CCFF00] text-black font-display font-black text-sm">
                            #1
                          </div>
                        ) : isSecond ? (
                          <div className="flex h-8 w-8 items-center justify-center bg-neutral-300 text-black font-display font-bold text-sm">
                            #2
                          </div>
                        ) : isThird ? (
                          <div className="flex h-8 w-8 items-center justify-center bg-amber-600 text-white font-display font-bold text-sm">
                            #3
                          </div>
                        ) : (
                          <span className="font-mono text-neutral-400 text-xs">
                            #{player.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Competitor Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-neutral-800 border border-white/10 flex items-center justify-center font-display font-bold text-white text-xs uppercase">
                          {player.playerName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-base text-white tracking-wide">
                              {player.playerName}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {player.tag}
                            </span>
                            <span className="text-[10px] text-neutral-400 uppercase">
                              [{player.country}]
                            </span>
                          </div>
                          {player.currentStreak >= 5 && (
                            <div className="flex items-center gap-1 text-[11px] text-[#CCFF00]">
                              <Flame className="h-3 w-3" />
                              <span>{player.currentStreak} Win Streak</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Primary Beast */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-display font-bold text-white text-base block">
                          {player.mainAnimal.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span>{player.mainAnimal.species}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#CCFF00] font-mono font-medium">
                            LVL {player.mainAnimal.level}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Record */}
                    <td className="py-4 px-6 text-center font-mono text-xs tabular-nums">
                      <span className="text-[#CCFF00] font-bold">{player.totalWins}W</span>
                      <span className="text-neutral-600 mx-1.5">/</span>
                      <span className="text-neutral-400">{player.totalLosses}L</span>
                    </td>

                    {/* Win Rate */}
                    <td className="py-4 px-6 text-center font-mono text-xs font-bold text-white tabular-nums">
                      {player.winRate}%
                    </td>

                    {/* Points */}
                    <td className="py-4 px-6 text-right font-mono text-base font-bold text-[#CCFF00] tabular-nums">
                      {player.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Qualifier note */}
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
          <span>*Live leaderboard synchronized with sanctioned arena bouts. Minimum 20 ranked matches for placement.</span>
          <span className="font-mono text-neutral-300">Seasonal Reset: 14 Days</span>
        </div>
      </div>
    </section>
  );
};
