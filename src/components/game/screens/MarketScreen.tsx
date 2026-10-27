import React, { useState } from 'react';
import {
  ShoppingBag,
  Shield,
  Coins,
  Check,
  Zap,
  Flame,
  Award,
  Filter,
  ArrowRight,
  PackageCheck,
  Sparkles,
  HeartPulse,
  Gavel,
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { Animal, ANIMALS_DATA } from '../../../data/animals';
import { GEAR_ITEMS, GearItem } from '../../../data/armory';
import { sound } from '../../../utils/audio';
import { getRarityBadgeClasses } from '../../../utils/petVisuals';
import { PetAuctionHouseModal } from '../pet/PetAuctionHouseModal';

export const MarketScreen: React.FC = () => {
  const { credits, buyBeast, ownedBeasts, trainerName, buyGear, equipGear, activeBeast } = useGame();

  const [activeTab, setActiveTab] = useState<'animals' | 'supplies'>('animals');
  const [showPetAuctions, setShowPetAuctions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purchaseToast, setPurchaseToast] = useState<{ title: string; subtitle: string } | null>(null);

  const categories = ['All Pets', 'Dogs', 'Cats'];

  const filteredAnimals = ANIMALS_DATA.filter((animal) => {
    if (selectedCategory === 'All Pets' || selectedCategory === 'All') return true;
    if (selectedCategory === 'Dogs') return animal.category === 'Canines';
    if (selectedCategory === 'Cats') return animal.category === 'Felines';
    return true;
  });

  const handleAcquireAnimal = (animal: Animal) => {
    if (credits < animal.currentPriceCredits) {
      sound.playClick();
      setPurchaseToast({
        title: 'Insufficient Credits',
        subtitle: `You need ${animal.currentPriceCredits.toLocaleString()} Credits to procure ${animal.name}.`,
      });
      setTimeout(() => setPurchaseToast(null), 3000);
      return;
    }

    const success = buyBeast(animal);
    if (success) {
      sound.playVictory();
      setPurchaseToast({
        title: 'Pedigree Ownership Transfer Complete!',
        subtitle: `${animal.name} (${animal.species}) is now in your kennel facility.`,
      });
      setTimeout(() => setPurchaseToast(null), 3500);
    }
  };

  const handleBuySupply = (item: GearItem) => {
    if (credits < item.price) {
      sound.playClick();
      setPurchaseToast({
        title: 'Insufficient Credits',
        subtitle: `You need ${item.price.toLocaleString()} Credits for ${item.name}.`,
      });
      setTimeout(() => setPurchaseToast(null), 3000);
      return;
    }

    const success = buyGear(item);
    if (success) {
      sound.playCoin();
      equipGear(item);
      setPurchaseToast({
        title: 'Equipment Procured & Equipped!',
        subtitle: `${item.name} attached to active fighter ${activeBeast.name}.`,
      });
      setTimeout(() => setPurchaseToast(null), 3500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080a0f] text-white select-none overflow-y-auto pb-32 max-w-xl mx-auto w-full overscroll-contain">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 bg-[#0e121a] sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#CCFF00]">
              <ShoppingBag className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Official Apex Exchange & Store</span>
            </div>
            <h1 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Breeders & Tactical Supply
            </h1>
          </div>

          <div className="flex items-center gap-1.5 bg-[#141926] border border-amber-400/30 px-3 py-1.5 rounded-xl shadow">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-xs text-amber-300">
              {credits.toLocaleString()} 🪙
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 grid grid-cols-3 gap-1 p-1 bg-[#141926] rounded-xl border border-white/5">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('animals');
            }}
            className={`py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'animals'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Animals ({ANIMALS_DATA.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('supplies');
            }}
            className={`py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'supplies'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Supplies ({GEAR_ITEMS.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setShowPetAuctions(true);
            }}
            className="py-2 text-[11px] font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1 shadow-sm"
          >
            <Gavel className="w-3 h-3" />
            <span>Auctions</span>
          </button>
        </div>
      </div>

      {/* Dynamic Toast Feedback */}
      {purchaseToast && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-[#152018] border-2 border-[#CCFF00]/70 text-center animate-in fade-in duration-200 shadow-xl">
          <p className="font-display font-black text-xs text-[#CCFF00] uppercase tracking-wide">
            {purchaseToast.title}
          </p>
          <p className="text-[11px] font-mono text-neutral-300 mt-0.5">
            {purchaseToast.subtitle}
          </p>
        </div>
      )}

      {/* TAB 1: REAL ANIMALS LIVESTOCK EXCHANGE */}
      {activeTab === 'animals' && (
        <div className="p-4 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-black shadow'
                    : 'bg-[#141824] text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Real Animals List */}
          <div className="space-y-3">
            {filteredAnimals.map((animal) => {
              const isAlreadyOwned = ownedBeasts.some((b) => b.name === animal.name);
              const canAfford = credits >= animal.currentPriceCredits;

              return (
                <div
                  key={animal.id}
                  className="bg-[#10141f] border border-white/10 hover:border-white/25 rounded-2xl p-3.5 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="flex gap-3.5">
                    {/* Real Wildlife Photo */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black">
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="w-full h-full object-cover object-center aspect-square"
                        onError={(e) => {
                          e.currentTarget.src = animal.fallbackImage;
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white border border-white/10">
                        {animal.breed}
                      </div>
                    </div>

                    {/* Real Biological Specs */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-black text-base text-white uppercase truncate">
                          {animal.name}
                        </h3>
                        <span className={getRarityBadgeClasses(animal.rarity)}>
                          {animal.rarity}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-neutral-400 italic truncate">
                        {animal.scientificName}
                      </p>

                      {/* Real Physical Metrics Grid */}
                      <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono">
                        <div className="bg-black/40 rounded p-1 text-center">
                          <span className="text-neutral-500 block text-[8px]">WEIGHT</span>
                          <span className="font-bold text-white">{animal.weightKg} kg</span>
                        </div>
                        <div className="bg-black/40 rounded p-1 text-center">
                          <span className="text-neutral-500 block text-[8px]">JAW PSI</span>
                          <span className="font-bold text-red-400">{animal.biteForcePsi}</span>
                        </div>
                        <div className="bg-black/40 rounded p-1 text-center">
                          <span className="text-neutral-500 block text-[8px]">SPEED</span>
                          <span className="font-bold text-cyan-400">{animal.topSpeedKmh} km/h</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-400 line-clamp-1 pt-0.5">
                        {animal.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action / Price Bar */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-300">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>{animal.currentPriceCredits.toLocaleString()} Credits</span>
                    </div>

                    {isAlreadyOwned ? (
                      <div className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-400 font-mono text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>In Your Kennel</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcquireAnimal(animal)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                          canAfford
                            ? 'bg-[#CCFF00] hover:bg-[#d4ff1a] text-black active:scale-95'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Procure Animal</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TACTICAL & VETERINARY SUPPLIES */}
      {activeTab === 'supplies' && (
        <div className="p-4 space-y-3">
          <p className="text-xs font-mono text-neutral-400">
            Professional conditioning equipment & high-protein nutrition for your lead fighter ({activeBeast.name}):
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {GEAR_ITEMS.map((item) => {
              const canAfford = credits >= item.price;
              const bonusText = Object.entries(item.statBonus)
                .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                .join(', ');

              return (
                <div
                  key={item.id}
                  className="bg-[#10141f] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#161c2b] border border-white/10 flex items-center justify-center shrink-0">
                      <Shield className="w-6 h-6 text-[#CCFF00]" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs text-white uppercase">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        Slot: <span className="text-white uppercase font-bold">{item.slot}</span> · {item.description}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.2 rounded border border-[#CCFF00]/30">
                        {bonusText}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2 space-y-1">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {item.price.toLocaleString()} 🪙
                    </div>
                    <button
                      onClick={() => handleBuySupply(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-display font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-400 hover:bg-amber-300 text-black shadow'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      Buy & Equip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showPetAuctions && (
        <PetAuctionHouseModal onClose={() => setShowPetAuctions(false)} />
      )}
    </div>
  );
};
