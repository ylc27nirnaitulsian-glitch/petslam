import React, { useState } from 'react';
import { ShieldCheck, Dumbbell, Utensils, Sparkles, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';
import { animalImages } from '../assets/images';

interface StageData {
  level: number;
  label: string;
  strength: number;
  speed: number;
  endurance: number;
  agility: number;
  unlockedMove: string;
  winRateProjection: number;
  dietPlan: string;
  drills: string;
}

export const EvolutionSection: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Level 10 default

  const stages: StageData[] = [
    {
      level: 1,
      label: 'Genesis Recruit',
      strength: 42,
      speed: 48,
      endurance: 45,
      agility: 50,
      unlockedMove: 'Basic Scent Track & Defensive Bark',
      winRateProjection: 38,
      dietPlan: 'Standard High-Protein Canine Baseline',
      drills: 'Perimeter Leash Conditioning & Focus Drills',
    },
    {
      level: 5,
      label: 'Conditioned Striker',
      strength: 64,
      speed: 66,
      endurance: 68,
      agility: 65,
      unlockedMove: 'Fast Pivot Tackle & Sprint Feint',
      winRateProjection: 61,
      dietPlan: 'Nutrient-Dense Lean Amino Supplementation',
      drills: 'Weighted Sled Pulls & Reaction Whistle Agility',
    },
    {
      level: 10,
      label: 'Apex Veteran',
      strength: 85,
      speed: 78,
      endurance: 90,
      agility: 82,
      unlockedMove: 'Tactical Counter-Lock & Bone Clench',
      winRateProjection: 84,
      dietPlan: 'Raw Carnivore Elite Conditioning Formulation',
      drills: 'Arena Bite Sleeve Sparring & Deep Sand Sprint Intervals',
    },
    {
      level: 15,
      label: 'Arena Sovereign',
      strength: 96,
      speed: 88,
      endurance: 98,
      agility: 92,
      unlockedMove: 'Dominant Pressure Lock & Inescapable Takedown',
      winRateProjection: 94,
      dietPlan: 'Olympic-Grade High-Fat Kinetic Metabolism Blend',
      drills: 'Multi-Opponent Spatial Control & Hypoxic Endurance Regimen',
    },
  ];

  const current = stages[activeStageIndex];

  return (
    <section id="evolution" className="relative border-b border-white/5 bg-[#0F1015] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            Biometric Progression System
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            MORE THAN OWNERSHIP. IT'S ABOUT EVOLUTION.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            Raw biological potential is just the starting point. Every meal, drill session, and conditioning cycle actively permanently reshapes your beast's physiological ceiling.
          </p>
        </div>

        {/* Anti Pay-to-win Notice Strip */}
        <div className="mt-8 border border-white/10 bg-[#14161E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#CCFF00] shrink-0" />
            <span className="font-semibold text-white">Esports Competitive Integrity Guarantee:</span>
            <span>Upgrades reflect gameplay training. Cosmetic purchases never alter raw combat attributes.</span>
          </div>
          <span className="font-mono text-neutral-400 shrink-0">100% Merit Progression</span>
        </div>

        {/* Interactive Comparison Station */}
        <div className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-10">
          {/* Stage Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Subject Case Study
              </span>
              <span className="font-display text-2xl font-black uppercase text-white">
                German Shepherd (Kaiser) · Biological Development Curve
              </span>
            </div>

            {/* Interactive stage buttons */}
            <div className="flex items-center gap-2">
              {stages.map((st, idx) => (
                <button
                  key={st.level}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`px-3.5 py-1.5 text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                    activeStageIndex === idx
                      ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  LVL {st.level}
                </button>
              ))}
            </div>
          </div>

          {/* Main Comparison Body */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Beast Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-black border border-white/10">
                <img
                  src={animalImages.germanShepherd}
                  alt="German Shepherd Evolution"
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-black/30" />

                {/* Level Overlay Badge */}
                <div className="absolute top-4 left-4 bg-black/80 border border-white/15 px-3 py-1 font-mono text-xs text-[#CCFF00] font-bold">
                  STAGE {activeStageIndex + 1}: LEVEL {current.level}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs text-[#CCFF00] font-mono uppercase tracking-wider block">
                    {current.label}
                  </span>
                  <div className="font-display text-2xl font-black uppercase text-white">
                    Canis lupus familiaris
                  </div>
                </div>
              </div>

              {/* Real-time projection metric */}
              <div className="mt-3 flex items-center justify-between border border-white/5 bg-[#161822] px-4 py-2.5 text-xs">
                <span className="text-neutral-400">Projected Ranked Win Probability:</span>
                <span className="font-mono font-bold text-[#CCFF00] text-sm">
                  {current.winRateProjection}%
                </span>
              </div>
            </div>

            {/* Dynamic Attribute Metrics & Training Regimen */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Dynamic Stats Bars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Dynamic Biological Scaling
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Baseline Lv.1 → Active Lv.{current.level}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300 font-medium">Bite Pressure & Muscle Force</span>
                    <span className="font-mono text-white font-bold">{current.strength} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-black/60 border border-white/5">
                    <div
                      className="h-full bg-[#CCFF00] transition-all duration-500 ease-out"
                      style={{ width: `${current.strength}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300 font-medium">Sprint Velocity & Pounce Acceleration</span>
                    <span className="font-mono text-white font-bold">{current.speed} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-black/60 border border-white/5">
                    <div
                      className="h-full bg-[#00E5FF] transition-all duration-500 ease-out"
                      style={{ width: `${current.speed}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300 font-medium">Cardiovascular Stamina Capacity</span>
                    <span className="font-mono text-white font-bold">{current.endurance} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-black/60 border border-white/5">
                    <div
                      className="h-full bg-[#FF5500] transition-all duration-500 ease-out"
                      style={{ width: `${current.endurance}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300 font-medium">Tactical Agility & Reflex Pivot</span>
                    <span className="font-mono text-white font-bold">{current.agility} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-black/60 border border-white/5">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500 ease-out"
                      style={{ width: `${current.agility}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Unlocked Maneuver Callout */}
              <div className="border border-[#CCFF00]/25 bg-[#CCFF00]/5 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Unlocked Maneuver: {current.unlockedMove}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-300 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-neutral-400 block text-[11px] uppercase">Active Dietary Protocol</span>
                    <span className="font-medium text-white">{current.dietPlan}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px] uppercase">Required Training Drill</span>
                    <span className="font-medium text-white">{current.drills}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
