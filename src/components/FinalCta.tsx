import React from 'react';
import { ArrowRight } from 'lucide-react';
import { animalImages } from '../assets/images';

interface FinalCtaProps {
  onJoinWaitlist: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onJoinWaitlist }) => {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[#0B0C10] py-28 lg:py-36">
      {/* Dramatic Animal Photography Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={animalImages.heroBeastArena}
          alt="Arena Beasts Key Visual"
          className="h-full w-full object-cover object-center filter brightness-40 contrast-125 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Deep Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-[#0B0C10]/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00] mb-4">
          <span>The Next Frontier of Esports</span>
        </div>

        <h2 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl text-balance">
          YOUR ANIMAL. YOUR ARENA.{' '}
          <span className="text-[#CCFF00] block mt-1">YOUR LEGACY.</span>
        </h2>

        <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed">
          The next generation of competitive animal gaming is coming.
          Are you ready?
        </p>

        <div className="mt-10 flex justify-center">
          <button
            onClick={onJoinWaitlist}
            className="group inline-flex items-center justify-center gap-3 bg-[#CCFF00] px-10 py-5 font-display text-lg font-bold uppercase tracking-wider text-black transition-all hover:bg-[#b8e600] active:scale-[0.98] shadow-[0_0_40px_rgba(204,255,0,0.35)] cursor-pointer"
          >
            <span>Join The Waitlist</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
