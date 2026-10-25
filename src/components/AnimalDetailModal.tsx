import React, { useState } from 'react';
import { X, Check, Zap, Shield, Flame, Activity, Award } from 'lucide-react';
import { Animal } from '../data/animals';

interface AnimalDetailModalProps {
  animal: Animal | null;
  onClose: () => void;
  onJoinWaitlist: () => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  onClose,
  onJoinWaitlist,
}) => {
  const [bidValue, setBidValue] = useState<number>(animal ? animal.currentPriceCredits + 500 : 15000);
  const [bidStatus, setBidStatus] = useState<string | null>(null);

  if (!animal) return null;

  const handleSimulateBid = (e: React.FormEvent) => {
    e.preventDefault();
    setBidStatus(`Simulated bid of ${bidValue.toLocaleString()} Credits placed! To participate in live mainnet bidding, join the priority waitlist.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl border border-white/10 bg-[#12141A] text-white shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-white bg-black/60 border border-white/10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left: Beast Portrait */}
          <div className="relative md:col-span-5 bg-black min-h-[300px] md:min-h-full overflow-hidden">
            <img
              src={animal.image}
              alt={animal.name}
              className="h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = animal.fallbackImage || animal.image;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-transparent to-black/40" />

            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-xs uppercase tracking-wider text-[#CCFF00] font-semibold">
                {animal.combatArchetype}
              </span>
              <h3 className="font-display text-3xl font-black uppercase text-white">
                {animal.name}
              </h3>
              <p className="text-xs text-neutral-300 italic">{animal.scientificName}</p>
            </div>
          </div>

          {/* Right: Dossier & Stats */}
          <div className="p-6 md:p-8 md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Header metadata */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-white font-medium">{animal.species}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#CCFF00] font-bold">Level {animal.level}</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase text-neutral-300 font-semibold">{animal.rarity} Tier</span>
                </div>
                <div className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-300">
                  {animal.acquisitionStatus}
                </div>
              </div>

              {/* Bio Description */}
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                {animal.description}
              </p>

              {/* Signature Combat Ability */}
              <div className="mt-5 border border-[#CCFF00]/20 bg-[#CCFF00]/5 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                  <Zap className="h-4 w-4" />
                  <span>Signature Move: {animal.signatureAbility.split(':')[0]}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                  {animal.signatureAbility.split(':')[1] || animal.signatureAbility}
                </p>
              </div>

              {/* Attributes Matrix */}
              <div className="mt-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Biometric Attributes Matrix
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Strength (Bite/Kinetic Force)</span>
                    <span className="font-mono text-white font-bold">{animal.strength}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10">
                    <div
                      className="h-full bg-[#CCFF00]"
                      style={{ width: `${animal.strength}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Velocity & Acceleration</span>
                    <span className="font-mono text-white font-bold">{animal.speed}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10">
                    <div
                      className="h-full bg-[#00E5FF]"
                      style={{ width: `${animal.speed}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Cardiovascular Endurance</span>
                    <span className="font-mono text-white font-bold">{animal.endurance}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10">
                    <div
                      className="h-full bg-[#FF5500]"
                      style={{ width: `${animal.endurance}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Tactical Agility</span>
                    <span className="font-mono text-white font-bold">{animal.agility}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${animal.agility}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Simulated Acquisition / Waitlist Trigger */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-neutral-400 block">Current Valuation</span>
                  <span className="font-display text-2xl font-black text-white">
                    {animal.currentPriceCredits.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-neutral-400">Credits</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#CCFF00] font-semibold block">Marketplace Status</span>
                  <span className="text-xs text-neutral-300">Sandbox Preview Mode</span>
                </div>
              </div>

              {bidStatus ? (
                <div className="p-3 bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 mb-4 flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span>{bidStatus}</span>
                </div>
              ) : (
                <form onSubmit={handleSimulateBid} className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={bidValue}
                    onChange={(e) => setBidValue(Number(e.target.value))}
                    min={animal.currentPriceCredits + 100}
                    step={100}
                    className="flex-1 bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                  <button
                    type="submit"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-white"
                  >
                    Simulate Bid
                  </button>
                </form>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onJoinWaitlist();
                  }}
                  className="flex-1 bg-[#CCFF00] text-black font-display font-bold text-sm uppercase py-3 tracking-wider hover:bg-[#b8e600] transition-colors"
                >
                  Join Waitlist For First Bidding Rights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
