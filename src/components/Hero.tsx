import React from 'react';
import { ArrowRight, ChevronRight, Shield, Zap, Trophy, Users } from 'lucide-react';
import { animalImages } from '../assets/images';

interface HeroProps {
  onJoinWaitlist: () => void;
  onExploreGame: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onJoinWaitlist, onExploreGame }) => {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[#0B0C10] pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#CCFF00]/5 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-[#FF5500]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headlines & Conversion */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Tagline / Kicker without pills */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
              <span>Next-Gen Competitive Animal Esports</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-300">Free Playable Alpha Rolling Out</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-400">Smogon & TFT Discords</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-5xl font-black tracking-tight text-white uppercase sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl leading-[0.95] text-balance">
              OWN YOUR BEAST.{' '}
              <span className="text-[#CCFF00] block mt-1">RULE THE ARENA.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-300">
              Choose your animal. Build its strength. Challenge players. Compete for the top spot.
              Launching a free playable alpha to competitive gaming communities on Discord and Reddit, with Genesis Founder cosmetic packs available at launch.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onJoinWaitlist}
                className="group relative inline-flex items-center justify-center gap-2 bg-[#CCFF00] px-8 py-4 font-display text-base font-bold uppercase tracking-wider text-black transition-all hover:bg-[#b8e600] active:scale-[0.98] shadow-[0_0_30px_rgba(204,255,0,0.3)] cursor-pointer"
              >
                <span>Join The Waitlist</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreGame}
                className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 px-7 py-4 font-display text-base font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 active:scale-[0.98] cursor-pointer"
              >
                <span>Explore The Game</span>
                <ChevronRight className="h-4 w-4 text-[#CCFF00]" />
              </button>
            </div>

            {/* Clean Proof Bar - No Pills */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-neutral-400">
              <div>
                <span className="block font-display text-2xl font-black text-white">100% REAL</span>
                <span className="text-neutral-400">Species Biology</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-white">SKILL-BASED</span>
                <span className="text-neutral-400">No Pay-To-Win</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-white">SANCTIONED</span>
                <span className="text-neutral-400">Global PvP Circuit</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-white">AUCTIONS</span>
                <span className="text-neutral-400">Player Economy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dramatic Cinematic Real Beast Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-none border border-white/10 bg-[#12141A] shadow-2xl group">
              {/* Image Frame */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={animalImages.heroBeastArena}
                  alt="Bengal Tiger and Grey Wolf in dramatic arena lighting"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Contrast scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-black/20 to-transparent" />
              </div>

              {/* Beast Card Overlay Details */}
              <div className="p-6 bg-[#14161E] border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-xl font-bold uppercase text-white tracking-wide">
                      Apex Predators · Arena Division
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Bengal Tiger (Khan) · Grey Wolf (Fenrir)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-lg font-black text-[#CCFF00]">TIER I</span>
                    <span className="block text-[11px] text-neutral-400 uppercase tracking-wider">Alpha Registry</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-xs">
                  <div className="bg-black/40 py-2 border border-white/5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Strength</span>
                    <span className="font-display font-bold text-white text-base">98/100</span>
                  </div>
                  <div className="bg-black/40 py-2 border border-white/5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Speed</span>
                    <span className="font-display font-bold text-white text-base">92/100</span>
                  </div>
                  <div className="bg-black/40 py-2 border border-white/5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Endurance</span>
                    <span className="font-display font-bold text-white text-base">96/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corner Decorative Esports Mark */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-3 border border-[#CCFF00]/30 bg-[#0B0C10] px-4 py-2.5 shadow-xl">
              <Zap className="h-4 w-4 text-[#CCFF00]" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Championship Ranked Season 01
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
