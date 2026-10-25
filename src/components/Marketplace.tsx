import React, { useState, useMemo } from 'react';
import { ANIMALS_DATA, Animal } from '../data/animals';
import { AnimalDetailModal } from './AnimalDetailModal';
import { Eye, ArrowUpDown, Sparkles } from 'lucide-react';

interface MarketplaceProps {
  onJoinWaitlist: () => void;
}

type CategoryFilter = 'All Animals' | 'Dogs' | 'Cats';
type SortOption = 'Highest Level' | 'Highest Strength' | 'Rarest' | 'Recently Added';

export const Marketplace: React.FC<MarketplaceProps> = ({ onJoinWaitlist }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All Animals');
  const [sortBy, setSortBy] = useState<SortOption>('Highest Level');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const categories: CategoryFilter[] = [
    'All Animals',
    'Dogs',
    'Cats',
  ];

  const rarityWeights: Record<string, number> = {
    Legendary: 5,
    Apex: 4,
    Alpha: 3,
    Vanguard: 2,
    Common: 1,
  };

  const filteredAndSortedAnimals = useMemo(() => {
    let result = [...ANIMALS_DATA];

    if (selectedCategory === 'Dogs') {
      result = result.filter((a) => a.category === 'Canines');
    } else if (selectedCategory === 'Cats') {
      result = result.filter((a) => a.category === 'Felines');
    }

    result.sort((a, b) => {
      if (sortBy === 'Highest Level') {
        return b.level - a.level;
      }
      if (sortBy === 'Highest Strength') {
        return b.strength - a.strength;
      }
      if (sortBy === 'Rarest') {
        return (rarityWeights[b.rarity] || 0) - (rarityWeights[a.rarity] || 0);
      }
      if (sortBy === 'Recently Added') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });

    return result;
  }, [selectedCategory, sortBy]);

  return (
    <section id="marketplace" className="relative border-b border-white/5 bg-[#0B0C10] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading & Demo Disclaimer */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
              <span>Live Trading Floor Preview</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-400">Interactive Pre-Launch Sandbox</span>
            </div>
            <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
              YOUR NEXT CHAMPION IS OUT THERE.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-neutral-400 leading-relaxed">
              Explore authentic registered beasts. Inspect biological telemetry, review combat archetypes, and preview acquisition terms ahead of genesis deployment.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs uppercase text-neutral-400 font-medium">Sort By:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#14161E] border border-white/10 px-3.5 py-2 text-xs font-semibold text-white uppercase focus:outline-none focus:border-[#CCFF00] cursor-pointer"
              >
                <option value="Highest Level">Highest Level</option>
                <option value="Highest Strength">Highest Strength</option>
                <option value="Rarest">Rarest Tier</option>
                <option value="Recently Added">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters (Interactive Functional Buttons per Constitution) */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                    : 'bg-[#14161E] text-neutral-300 hover:text-white hover:bg-[#1E222E] border border-white/5'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Animals Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedAnimals.map((animal) => {
            return (
              <div
                key={animal.id}
                className="group relative flex flex-col justify-between border border-white/10 bg-[#12141A] transition-all duration-300 hover:border-white/30 hover:bg-[#161822]"
              >
                {/* Animal Photo with Scrim */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={animal.image}
                    alt={`${animal.name} - ${animal.species}`}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-transparent to-black/30" />

                  {/* Top Clean Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px]">
                    <span className="bg-black/80 px-2 py-0.5 text-white font-mono font-bold border border-white/10">
                      LVL {animal.level}
                    </span>
                    <span className="bg-black/80 px-2 py-0.5 text-[#CCFF00] font-bold uppercase tracking-wider border border-white/10">
                      {animal.rarity}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#CCFF00] block">
                      {animal.combatArchetype}
                    </span>
                    <h3 className="font-display text-2xl font-black uppercase text-white leading-tight">
                      {animal.name}
                    </h3>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Unboxed Metadata per Constitution */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="text-white font-medium">{animal.species}</span>
                      <span aria-hidden="true">·</span>
                      <span>{animal.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-neutral-400">{animal.acquisitionStatus}</span>
                    </div>

                    {/* Stat Progress Bars */}
                    <div className="mt-4 space-y-2 pt-3 border-t border-white/5">
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-neutral-400">Strength</span>
                          <span className="font-mono text-white">{animal.strength}</span>
                        </div>
                        <div className="h-1 w-full bg-white/10">
                          <div className="h-full bg-[#CCFF00]" style={{ width: `${animal.strength}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-neutral-400">Speed</span>
                          <span className="font-mono text-white">{animal.speed}</span>
                        </div>
                        <div className="h-1 w-full bg-white/10">
                          <div className="h-full bg-[#00E5FF]" style={{ width: `${animal.speed}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-neutral-400">Endurance</span>
                          <span className="font-mono text-white">{animal.endurance}</span>
                        </div>
                        <div className="h-1 w-full bg-white/10">
                          <div className="h-full bg-[#FF5500]" style={{ width: `${animal.endurance}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block tracking-wider">Estimate</span>
                      <span className="font-display text-lg font-bold text-white">
                        {animal.currentPriceCredits.toLocaleString()}{' '}
                        <span className="text-[10px] text-neutral-400 font-normal">CR</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAnimal(animal)}
                      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-[#CCFF00] hover:text-black border border-white/15 px-3 py-2 text-xs font-display font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Dossier Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onJoinWaitlist={onJoinWaitlist}
        />
      )}
    </section>
  );
};
