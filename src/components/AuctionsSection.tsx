import React, { useState } from 'react';
import { Home, Shield, Check, Heart, Sparkles, Compass } from 'lucide-react';
import { animalImages } from '../assets/images';

interface AuctionsSectionProps {
  onJoinWaitlist: () => void;
}

export const AuctionsSection: React.FC<AuctionsSectionProps> = ({ onJoinWaitlist }) => {
  const [adopted, setAdopted] = useState(false);
  const [adoptionFeedback, setAdoptionFeedback] = useState<string | null>(null);

  const handleAdoptDemo = () => {
    setAdopted(true);
    setAdoptionFeedback('🎉 Companion Sultan successfully welcomed into your kennel stable!');
  };

  const sanctuarySteps = [
    {
      step: '01',
      title: 'Rescues & Retirees Listed',
      desc: 'Sheltered animals and retired champions enter the permanent adoption registry.',
    },
    {
      step: '02',
      title: 'Trait & Synergy Audit',
      desc: 'Inspect biological traits, health metrics, and combat synergy before adopting.',
    },
    {
      step: '03',
      title: 'Fixed In-Game Pricing',
      desc: 'Adopt transparently with earned in-game credits—100% fixed cost, zero bidding.',
    },
    {
      step: '04',
      title: 'Instant Kennel Transfer',
      desc: 'Your newly adopted companion is immediately added to your roster and companion screen.',
    },
    {
      step: '05',
      title: 'Zero Real-Money Wagering',
      desc: 'Strictly non-speculative digital gameplay. Pure companion joy and colosseum honor.',
    },
  ];

  return (
    <section id="sanctuary" className="relative border-b border-white/5 bg-[#0F1015] py-20 lg:py-28">
      {/* Anchor alias for backwards compatibility */}
      <span id="auctions" className="sr-only">Sanctuary Adoption Shelter</span>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Companion Adoption Shelter</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Fixed-Price Registry</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            ADOPT. TRAIN. BOND. RULE THE ARENA.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            A transparent animal rescue and adoption center. Welcome sheltered pets into your kennel stable and train generational bloodlines through fair-play in-game credits with 100% fixed pricing.
          </p>
        </div>

        {/* 5-Step Flow Strip */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sanctuarySteps.map((st) => (
            <div key={st.step} className="border border-white/10 bg-[#14161E] p-5">
              <span className="font-display text-2xl font-black text-[#CCFF00]">
                {st.step}
              </span>
              <h4 className="mt-2 font-display text-lg font-bold uppercase text-white">
                {st.title}
              </h4>
              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Live Feature Showcase Card */}
        <div className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Beast Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-black border border-white/10">
                <img
                  src={animalImages.africanLion}
                  alt="African Lion Sultan available for adoption"
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-transparent to-black/30" />

                {/* Shelter Tag */}
                <div className="absolute top-4 left-4 bg-[#CCFF00] text-black px-3 py-1 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Heart className="h-3.5 w-3.5 text-rose-600 fill-rose-600" />
                  <span>Sanctuary Resident #082</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#CCFF00] block">
                    Panthera leo · Vanguard Class
                  </span>
                  <div className="font-display text-3xl font-black uppercase text-white">
                    Sultan · Male Lion (Ready for Adoption)
                  </div>
                </div>
              </div>
            </div>

            {/* Shelter Terminal Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              {/* Adoption Status */}
              <div className="border border-white/10 bg-[#161822] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-[#CCFF00]" />
                    <span>Adoption Availability</span>
                  </span>
                  <div className="mt-1 font-mono text-xl sm:text-2xl font-black text-emerald-400 tracking-wide">
                    {adopted ? 'ADOPTED TO KENNEL' : 'OPEN FOR RE-HOMING'}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Pricing Type</span>
                  <span className="font-mono text-sm font-bold text-[#CCFF00]">
                    Fixed Credits Only
                  </span>
                </div>
              </div>

              {/* Fixed Adoption Fee Box */}
              <div className="border border-white/10 bg-black/40 p-5">
                <span className="text-xs text-neutral-400 uppercase block tracking-wider">
                  Standard Shelter Adoption Fee
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white">
                    25,000
                  </span>
                  <span className="text-sm font-bold text-neutral-400 uppercase">In-Game Credits</span>
                </div>
                <div className="mt-2 text-xs text-neutral-300">
                  Fair-play standard fee: <span className="text-white font-mono font-semibold">100% Fixed Cost</span> · No bidding, wagering, or cash auctioning
                </div>
              </div>

              {/* Adoption Action */}
              <div>
                {!adopted ? (
                  <button
                    onClick={handleAdoptDemo}
                    className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black px-6 py-3.5 font-display font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Heart className="w-4 h-4 text-black" />
                    <span>Adopt Sultan to Stable (Demo)</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{adoptionFeedback}</span>
                  </div>
                )}
              </div>

              {/* Fair-Play Disclaimer */}
              <div className="pt-2 text-[11px] text-neutral-400 border-t border-white/5 flex items-center justify-between">
                <span>*In-game simulation only. Zero real-money wagering or betting.</span>
                <button
                  type="button"
                  onClick={onJoinWaitlist}
                  className="text-xs text-[#CCFF00] hover:underline font-semibold uppercase tracking-wider"
                >
                  Join Waitlist For Access →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
