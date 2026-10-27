import React, { useState } from 'react';
import {
  PawPrint,
  Dumbbell,
  Zap,
  Flame,
  Shield,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Coins,
  ChevronRight,
  Award,
  Swords,
  Plus,
  Check,
  Activity,
  Layers,
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { Animal, ANIMALS_DATA } from '../../../data/animals';
import { sound } from '../../../utils/audio';
import { getRarityBadgeClasses } from '../../../utils/petVisuals';

export const BeastsScreen: React.FC = () => {
  const {
    ownedBeasts,
    activeBeastId,
    selectActiveBeast,
    battleDeckIds,
    setDeckSlot,
    trainBeast,
    getEffectiveStats,
    energy,
    refillEnergy,
    credits,
  } = useGame();

  const [inspectedBeastId, setInspectedBeastId] = useState<string>(activeBeastId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statDeltaToast, setStatDeltaToast] = useState<{ stat: string; delta: string } | null>(null);
  const [trainingAnim, setTrainingAnim] = useState<boolean>(false);

  // Retrieve selected beast from ownedBeasts or fallback
  const currentBeast =
    ownedBeasts.find((b) => b.id === inspectedBeastId) ||
    ownedBeasts.find((b) => b.id === activeBeastId) ||
    ownedBeasts[0];

  const effectiveStats = getEffectiveStats(currentBeast);
  const isActiveFighter = currentBeast.id === activeBeastId;

  // Categories
  const categories = ['All Pets', 'Dogs', 'Cats'];

  // All animals from game roster, marking owned vs available
  const filteredAnimals = ANIMALS_DATA.filter((animal) => {
    const matchesCat =
      selectedCategory === 'All Pets' ||
      selectedCategory === 'All' ||
      (selectedCategory === 'Dogs' && animal.category === 'Canines') ||
      (selectedCategory === 'Cats' && animal.category === 'Felines');
    const matchesQuery =
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Conditioning Drills
  const handleTrain = (type: 'nutrition' | 'agility' | 'biteForce') => {
    sound.playCardPlay();
    setTrainingAnim(true);
    const result = trainBeast(currentBeast.id, type);

    if (result.success) {
      if (type === 'nutrition') {
        sound.playCoin();
        setStatDeltaToast({
          stat: 'Nutrition Feeding',
          delta: '+45 Vitality HP, +1.2 kg Muscle Mass',
        });
      } else if (type === 'agility') {
        sound.playAttack();
        setStatDeltaToast({
          stat: 'Agility Sprint',
          delta: '+4 km/h Speed, +2 Evasion Rating',
        });
      } else if (type === 'biteForce') {
        sound.playCrit();
        setStatDeltaToast({
          stat: 'Combat Sparring',
          delta: '+25 Jaw PSI, +140J Strike Force',
        });
      }
    } else {
      sound.playClick();
      setStatDeltaToast({
        stat: 'Exhausted Energy',
        delta: 'Refill conditioning energy using the + button above.',
      });
    }

    setTimeout(() => {
      setTrainingAnim(false);
    }, 400);

    setTimeout(() => {
      setStatDeltaToast(null);
    }, 3200);
  };

  const handleSelectActive = (beastId: string) => {
    sound.playVictory();
    selectActiveBeast(beastId);
    setStatDeltaToast({
      stat: 'Champion Assigned',
      delta: `${currentBeast.name} is now your primary arena battle pet!`,
    });
    setTimeout(() => setStatDeltaToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-white select-none overflow-y-auto pb-32 max-w-xl mx-auto w-full overscroll-contain">
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#0e121a]/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#CCFF00]">
              <PawPrint className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Pet Slam Arena Roster</span>
            </div>
            <h1 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
              Battle Deck & Roster ({ownedBeasts.length}/{ANIMALS_DATA.length})
            </h1>
          </div>

          {/* Energy Widget */}
          <div className="flex items-center gap-1.5 bg-[#141926] border border-white/10 px-3 py-1.5 rounded-xl shadow">
            <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span className="font-mono font-bold text-xs text-white">{energy}/100</span>
            <button
              onClick={refillEnergy}
              className="text-[#CCFF00] hover:text-white cursor-pointer ml-1"
              title="Refill Energy"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Feedback Toast */}
      {statDeltaToast && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#CCFF00]/20 to-emerald-500/20 border border-[#CCFF00]/50 text-center animate-in fade-in z-20 shadow-lg">
          <p className="text-xs font-display font-black text-[#CCFF00] uppercase">
            {statDeltaToast.stat}
          </p>
          <p className="text-[11px] font-mono text-neutral-200 mt-0.5">{statDeltaToast.delta}</p>
        </div>
      )}

      {/* 4-BEAST ACTIVE BATTLE DECK (CLASH ROYALE STYLE) */}
      <div className="px-3.5 sm:px-4 pt-3 pb-1">
        <div className="bg-[#0e121a] border border-white/10 rounded-2xl p-3 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-display font-black uppercase text-white tracking-wider">
              <Layers className="w-4 h-4 text-[#CCFF00]" />
              <span>Active 4-Animal Battle Deck</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold">
              Clash Royale Tag-In Deck
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {battleDeckIds.map((id, idx) => {
              const beast = ownedBeasts.find((b) => b.id === id) || ownedBeasts[idx] || ownedBeasts[0];
              const isSelected = beast.id === currentBeast.id;
              const isLead = beast.id === activeBeastId;
              const slotRoles = ['Slot 1 (Lead)', 'Slot 2 (Striker)', 'Slot 3 (Assassin)', 'Slot 4 (Tank)'];
              const slotElixir = ['0 💧 Lead', '2 💧 Tag', '3 💧 Tag', '4 💧 Tag'];

              return (
                <div
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setInspectedBeastId(beast.id);
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-[#182030] border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.3)] scale-[1.02]'
                      : 'bg-[#121622] border-white/10 hover:border-white/20'
                  }`}
                >
                  {isLead && (
                    <span className="absolute -top-1.5 -right-1 bg-[#CCFF00] text-black font-display font-black text-[8px] px-1 rounded uppercase shadow">
                      LEAD
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/15 bg-black relative">
                    <img
                      src={beast.image}
                      alt={beast.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = beast.fallbackImage;
                      }}
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-[#CCFF00]">
                      L{beast.level}
                    </span>
                  </div>
                  <span className="font-display font-black text-[10px] text-white uppercase mt-1 truncate max-w-full">
                    {beast.name}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400 truncate max-w-full">
                    {slotRoles[idx]}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-purple-300 mt-0.5">
                    {slotElixir[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] font-mono text-neutral-400 text-center pt-0.5">
            Tap a card to inspect. Use "Assign to Deck Slot" below to swap any pet into your 4-animal team!
          </p>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SECTION 1: ACTIVE FIGHTER CARD INSPECTOR & TRAINING DECK
          ------------------------------------------------------------- */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="bg-gradient-to-b from-[#121724] to-[#0c0f17] border-2 border-[#CCFF00]/40 rounded-3xl p-4 shadow-xl relative overflow-hidden">
          {/* Card Ambient Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#CCFF00]/10 blur-[60px] pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            {/* 3D Card Artwork Portrait */}
            <div className="relative w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.25)] shrink-0 bg-black group">
              <img
                src={currentBeast.image}
                alt={currentBeast.name}
                className={`w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
                  trainingAnim ? 'animate-pulse scale-105' : ''
                }`}
                onError={(e) => {
                  e.currentTarget.src = currentBeast.fallbackImage;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              {/* Rarity & Level Badges */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 border border-[#CCFF00]/50 font-mono font-bold text-[10px] text-[#CCFF00]">
                LVL {currentBeast.level}
              </div>

              <div className={`absolute top-2 right-2 ${getRarityBadgeClasses(currentBeast.rarity)}`}>
                {currentBeast.rarity}
              </div>

              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="font-display font-black text-xs text-white uppercase tracking-wider block truncate">
                  {currentBeast.name}
                </span>
                <span className="text-[10px] text-[#CCFF00] font-mono block truncate">
                  {currentBeast.breed}
                </span>
              </div>
            </div>

            {/* Quick Stats & Equip Button */}
            <div className="flex-1 w-full space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-lg text-white uppercase">
                    {currentBeast.name}
                  </h2>
                  <p className="text-xs font-mono text-neutral-400">
                    {currentBeast.breed} · {currentBeast.combatArchetype}
                  </p>
                </div>

                {isActiveFighter ? (
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black font-display font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Equipped</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelectActive(currentBeast.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#CCFF00] to-emerald-400 hover:from-[#d4ff1a] hover:to-emerald-300 text-black font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95"
                  >
                    EQUIP CHAMPION
                  </button>
                )}
              </div>

              {/* 3 Core Combat Metrics (Esports Pet Combat style) */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#141926] border border-white/10 rounded-xl p-2">
                  <span className="text-[9px] text-emerald-400 uppercase font-bold block">
                    Health
                  </span>
                  <span className="font-bold text-sm text-white">
                    {effectiveStats.endurance * 12}
                  </span>
                </div>
                <div className="bg-[#141926] border border-white/10 rounded-xl p-2">
                  <span className="text-[9px] text-red-400 uppercase font-bold block">
                    Damage
                  </span>
                  <span className="font-bold text-sm text-white">
                    {effectiveStats.strength * 2.8}
                  </span>
                </div>
                <div className="bg-[#141926] border border-white/10 rounded-xl p-2">
                  <span className="text-[9px] text-cyan-400 uppercase font-bold block">
                    Speed
                  </span>
                  <span className="font-bold text-sm text-white">
                    {effectiveStats.speed}
                  </span>
                </div>
              </div>

              {/* 3 Direct Conditioning Drills */}
              <div className="pt-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1.5">
                  Gym Training Drills (-15 Energy):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleTrain('nutrition')}
                    className="p-2 rounded-xl bg-[#161d2d] hover:bg-[#1e273d] border border-emerald-400/30 text-white flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                    <span className="font-display font-black text-[10px] uppercase">Feed</span>
                    <span className="text-[8px] font-mono text-emerald-400">+HP</span>
                  </button>

                  <button
                    onClick={() => handleTrain('biteForce')}
                    className="p-2 rounded-xl bg-[#161d2d] hover:bg-[#1e273d] border border-red-500/30 text-white flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow"
                  >
                    <Flame className="w-3.5 h-3.5 text-red-400 mb-0.5" />
                    <span className="font-display font-black text-[10px] uppercase">Spar</span>
                    <span className="text-[8px] font-mono text-red-400">+DMG</span>
                  </button>

                  <button
                    onClick={() => handleTrain('agility')}
                    className="p-2 rounded-xl bg-[#161d2d] hover:bg-[#1e273d] border border-cyan-400/30 text-white flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
                    <span className="font-display font-black text-[10px] uppercase">Sprint</span>
                    <span className="text-[8px] font-mono text-cyan-400">+SPD</span>
                  </button>
                </div>
              </div>

              {/* Quick Assign to Battle Deck Slots */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest block mb-1">
                  Assign {currentBeast.name} to 4-Animal Deck:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const isCurrentSlot = battleDeckIds[slotIdx] === currentBeast.id;
                    const slotLabels = ['Slot 1 (Lead)', 'Slot 2 (Atk)', 'Slot 3 (Spd)', 'Slot 4 (Tank)'];
                    return (
                      <button
                        key={slotIdx}
                        onClick={() => {
                          setDeckSlot(slotIdx, currentBeast.id);
                          if (slotIdx === 0) selectActiveBeast(currentBeast.id);
                          sound.playVictory();
                          setStatDeltaToast({
                            stat: 'Battle Deck Updated',
                            delta: `${currentBeast.name} assigned to ${slotLabels[slotIdx]}!`,
                          });
                          setTimeout(() => setStatDeltaToast(null), 2500);
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
                          isCurrentSlot
                            ? 'bg-[#CCFF00] text-black shadow'
                            : 'bg-[#182030] hover:bg-[#222c42] text-neutral-300 border border-white/10'
                        }`}
                      >
                        {isCurrentSlot ? '✓ ' : '+ '}
                        {slotLabels[slotIdx]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SECTION 2: FULL SCROLLABLE ANIMAL ROSTER (ALL 16 ANIMALS)
         ------------------------------------------------------------- */}
      <div className="px-3.5 sm:px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#CCFF00]" />
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Full Animal Collection ({filteredAnimals.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Tap any card to inspect or equip
          </span>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pets by name or breed (Shepherd, Husky, Bengal, Maine Coon)..."
              className="w-full bg-[#121622] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* Category Chips with Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'bg-[#121622] text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Card Grid (Clash Royale Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {filteredAnimals.map((animal) => {
            const isOwned = ownedBeasts.some((b) => b.id === animal.id);
            const isSelected = animal.id === currentBeast.id;
            const isLead = animal.id === activeBeastId;

            return (
              <button
                key={animal.id}
                onClick={() => {
                  sound.playClick();
                  setInspectedBeastId(animal.id);
                }}
                className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between p-2.5 ${
                  isSelected
                    ? 'border-[#CCFF00] bg-[#161e30] shadow-[0_0_18px_rgba(204,255,0,0.3)] scale-[1.02]'
                    : isLead
                    ? 'border-emerald-400 bg-[#121a24]'
                    : 'border-white/10 hover:border-white/30 bg-[#0e121a]'
                }`}
              >
                {/* 3D Animal Artwork */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/60 mb-2 border border-white/10">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = animal.fallbackImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  {/* Level & Rarity Tags */}
                  <span className="absolute top-1.5 left-1.5 bg-black/80 border border-white/20 font-mono font-bold text-[9px] text-[#CCFF00] px-1.5 py-0.5 rounded">
                    L{animal.level}
                  </span>

                  {isLead && (
                    <span className="absolute top-1.5 right-1.5 bg-[#CCFF00] text-black font-black text-[8px] px-1.5 py-0.5 rounded uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs uppercase text-white truncate">
                      {animal.name}
                    </span>
                    <span className="text-[9px] font-mono text-purple-400 font-bold">
                      {animal.rarity.substring(0, 3)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 block truncate">
                    {animal.species}
                  </span>
                </div>

                {/* Elixir & Status Bar */}
                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className={getRarityBadgeClasses(animal.rarity)}>{animal.rarity}</span>
                  <span className="text-[#CCFF00] font-bold">{animal.elixirCost} Elixir</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
