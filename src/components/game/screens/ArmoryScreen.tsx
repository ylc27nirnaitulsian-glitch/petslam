import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Plus,
  Check,
  ShoppingCart,
  Zap,
  Flame,
  HeartPulse,
  ChevronRight,
  X,
  CheckCircle2,
  Gift,
  Crown,
  Heart,
  Award,
  ShieldCheck,
  ArrowRight,
  Utensils,
  Smile,
  Coffee,
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { GEAR_ITEMS, GearItem } from '../../../data/armory';
import { sound } from '../../../utils/audio';

export const ArmoryScreen: React.FC = () => {
  const {
    activeBeast,
    equippedGear,
    inventoryGear,
    equipGear,
    unequipGear,
    buyGear,
    credits,
    getEffectiveStats,
    refillEnergy,
  } = useGame();
  const { pet, strokePet } = usePetCompanion();

  const [armoryTab, setArmoryTab] = useState<'loadout' | 'store'>('loadout');
  const [storeFilter, setStoreFilter] = useState<'all' | 'free' | 'cosmetics' | 'tactical'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Daily Free Supply Drops (State saved in memory/localStorage)
  const [dailyClaimed, setDailyClaimed] = useState<{ kibble: boolean; drill: boolean; chew: boolean }>({
    kibble: false,
    drill: false,
    chew: false,
  });

  const effectiveStats = getEffectiveStats(activeBeast);

  const handleClaimFreeDaily = (type: 'kibble' | 'drill' | 'chew', label: string) => {
    if (dailyClaimed[type]) {
      setFeedbackMsg({ text: `Already claimed today's ${label}! Resets at midnight.`, type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 2500);
      return;
    }
    sound.playVictory();
    setDailyClaimed((prev) => ({ ...prev, [type]: true }));
    if (type === 'kibble') {
      refillEnergy();
      setFeedbackMsg({ text: `Claimed Daily Free Kibble! Restored +25 conditioning energy!`, type: 'success' });
    } else if (type === 'drill') {
      sound.playLevelUp();
      setFeedbackMsg({ text: `Completed Daily Free Agility Drill! +20 Speed & Reflex XP granted to ${activeBeast.name}!`, type: 'success' });
    } else {
      strokePet();
      setFeedbackMsg({ text: `Claimed Daily Free Vitamin Chew! +20 Vitality & max morale for ${activeBeast.name}!`, type: 'success' });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleBuy = (item: GearItem) => {
    if (credits < item.price) {
      sound.playClick();
      setFeedbackMsg({ text: 'Insufficient credits to procure this equipment!', type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 2500);
      return;
    }
    const success = buyGear(item);
    if (success) {
      setFeedbackMsg({
        text: `Procured ${item.name}! Added to Inventory. Tap 'Equip' to attach to ${activeBeast.name}.`,
        type: 'success',
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleEquip = (item: GearItem) => {
    equipGear(item);
    sound.playClick();
    const statBonusSummary = Object.entries(item.statBonus)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
      .join(', ');
    setFeedbackMsg({
      text: `Equipped ${item.name} onto ${activeBeast.name}! (${statBonusSummary}) applied to combat!`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMsg(null), 3200);
  };

  const handleUnequip = (slot: 'collar' | 'armor' | 'paws' | 'serum', name: string) => {
    unequipGear(slot);
    sound.playClick();
    setFeedbackMsg({
      text: `Unequipped ${name} from ${activeBeast.name}. Returned to Inventory.`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const slots: { slot: 'collar' | 'armor' | 'paws' | 'serum'; label: string; desc: string }[] = [
    { slot: 'collar', label: 'Tactical Collar', desc: 'Neck reinforcement & sensor targeting' },
    { slot: 'armor', label: 'Body Exo-Rig Armor', desc: 'Ballistic torso protection & impact dissipation' },
    { slot: 'paws', label: 'Paw Grip Sleeves', desc: 'Lateral friction & kinetic claw strikes' },
    { slot: 'serum', label: 'Bio-Stim Serum', desc: 'Adrenaline metabolic accelerator' },
  ];

  // Fair Play Cosmetic Outfits ($0.49 / 50¢ or 500 Credits)
  const COSMETIC_ITEMS = [
    {
      id: 'cosm_crown',
      name: 'Royal Sovereign Crown',
      price: 500,
      priceUsd: '$0.49',
      category: 'Headwear',
      icon: Crown,
      description: 'Gilded monarch crown with ruby gems. Visible in arena duels, sanctuary, and browser extension buddy.',
    },
    {
      id: 'cosm_shades',
      name: 'Cyber Matrix Shades',
      price: 500,
      priceUsd: '$0.49',
      category: 'Eyewear',
      icon: Sparkles,
      description: 'Ultraviolet polarized cyber shades. Equips directly to your dog or cat avatar.',
    },
    {
      id: 'cosm_detective',
      name: 'Sherlock Tweed Cap',
      price: 500,
      priceUsd: '$0.49',
      category: 'Headwear',
      icon: Award,
      description: 'Classic British houndstooth detective cap. Stylish and charming for both canines and felines.',
    },
    {
      id: 'cosm_party',
      name: 'Festive Party Cone',
      price: 500,
      priceUsd: '$0.49',
      category: 'Headwear',
      icon: Smile,
      description: 'Neon confetti party hat with sparkler tassel. Makes your companion celebrate with cheerful bobs.',
    },
  ];

  // Gourmet Treats ($0.49 / 50¢ or 300 Credits)
  const GOURMET_TREATS = [
    {
      id: 'treat_salmon',
      name: 'Alaskan Wild Salmon Filet',
      price: 300,
      priceUsd: '$0.49',
      icon: '🐟',
      bonus: '+30 Happiness & Lustrous Fur',
      description: 'Fresh omega-rich wild salmon steak. A favorite gourmet delicacy for cats and athletic dogs.',
    },
    {
      id: 'treat_wagyu',
      name: 'A5 Wagyu Beef Cube',
      price: 300,
      priceUsd: '$0.49',
      icon: '🥩',
      bonus: '+35 Morale & Full Satiety',
      description: 'Tender gourmet beef morsel. Boosts buddy loyalty hearts instantly.',
    },
    {
      id: 'treat_bacon',
      name: 'Crispy Honey Bacon Chew',
      price: 300,
      priceUsd: '$0.49',
      icon: '🥓',
      bonus: '+25 Energy & Playfulness',
      description: 'Slow-smoked artisan bacon strip. Dogs go wild and cats eagerly purr.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#08090D] overflow-y-auto pb-32 select-none max-w-xl mx-auto w-full overscroll-contain">
      {/* Top Banner */}
      <div className="p-4 border-b border-white/10 bg-[#0E1017]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#CCFF00]">
              <Shield className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Tactical Rigging & Fair Shop</span>
            </div>
            <h2 className="font-display font-black text-xl uppercase tracking-wider text-white mt-0.5">
              Armory & Dojo · {activeBeast.name}
            </h2>
          </div>

          <div className="flex bg-[#161822] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setArmoryTab('loadout');
                sound.playClick();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                armoryTab === 'loadout'
                  ? 'bg-[#CCFF00] text-black shadow font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Loadout
            </button>
            <button
              onClick={() => {
                setArmoryTab('store');
                sound.playClick();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                armoryTab === 'store'
                  ? 'bg-[#CCFF00] text-black shadow font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Dojo & Shop</span>
            </button>
          </div>
        </div>

        {/* Dynamic Action Toast */}
        {feedbackMsg && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn ${
              feedbackMsg.type === 'success'
                ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-[#CCFF00]'
                : 'bg-red-500/10 border border-red-500/40 text-red-400'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {armoryTab === 'loadout' ? (
          <>
            {/* Active Rig Status Card */}
            <div className="bg-[#12141C] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shrink-0 shadow-lg">
                <img
                  src={activeBeast.image}
                  alt={activeBeast.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/85 text-center py-0.5 text-[9px] font-mono text-[#CCFF00] font-bold">
                  Active Fighter
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Equipment Target
                </span>
                <h3 className="font-display font-black text-lg uppercase text-white">
                  {activeBeast.name} ({activeBeast.species})
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Gear equipped below directly amplifies {activeBeast.name}'s battle ratings in the arena!
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#181B26] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] text-neutral-400 font-mono">Bite Force</span>
                    <div className="text-xs font-mono font-black text-[#CCFF00]">
                      {effectiveStats.biteForce} PSI
                    </div>
                  </div>
                  <div className="bg-[#181B26] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] text-neutral-400 font-mono">Armor</span>
                    <div className="text-xs font-mono font-black text-cyan-300">
                      +{effectiveStats.armor} DEF
                    </div>
                  </div>
                  <div className="bg-[#181B26] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] text-neutral-400 font-mono">Agility</span>
                    <div className="text-xs font-mono font-black text-amber-300">
                      {effectiveStats.agility}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Gear Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map(({ slot, label, desc }) => {
                const item = equippedGear[slot];

                return (
                  <div
                    key={slot}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item
                        ? 'bg-[#141722] border-emerald-500/40 shadow-lg ring-1 ring-emerald-500/20'
                        : 'bg-[#10121A] border-white/10 border-dashed'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                        <span className="font-display font-bold text-xs uppercase tracking-wide text-neutral-200">
                          {label}
                        </span>
                      </div>
                      {item ? (
                        <button
                          onClick={() => handleUnequip(slot, item.name)}
                          className="text-[10px] font-mono text-neutral-400 hover:text-red-400 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          Unequip
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">
                          Empty
                        </span>
                      )}
                    </div>

                    {item ? (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-sm text-white">
                            {item.name}
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[9px] font-mono text-[#CCFF00] font-bold">
                            EQUIPPED
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                          {item.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                          {Object.entries(item.statBonus).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold"
                            >
                              +{v} {k.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <span className="text-xs font-semibold text-neutral-400">Slot Available</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Owned Gear Inventory */}
            <div className="bg-[#12141C] border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-wide text-white">
                  Armory Inventory ({inventoryGear.length})
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  Tap 'Equip' to attach to {activeBeast.name}
                </span>
              </div>

              {inventoryGear.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  Inventory empty. Visit the <strong className="text-[#CCFF00]">Store</strong> tab above to procure tactical equipment.
                </div>
              ) : (
                <div className="space-y-2">
                  {inventoryGear.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#161822] border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between transition-all"
                    >
                      <div className="pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-white">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono text-[#CCFF00] uppercase bg-[#CCFF00]/10 px-1.5 py-0.2 rounded">
                            {item.slot}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                        <div className="mt-1 flex gap-1.5 text-[9px] font-mono">
                          {Object.entries(item.statBonus).map(([k, v]) => (
                            <span key={k} className="text-emerald-400 font-bold">
                              +{v} {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleEquip(item)}
                        className="px-3.5 py-2 rounded-xl text-xs font-display font-black uppercase text-black bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 transition-all cursor-pointer shrink-0 shadow-md shadow-[#CCFF00]/20 flex items-center gap-1"
                      >
                        <span>Equip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* =========================================================================
             ARMORY DOJO & STORE (FREE SUPPLIES + FAIR PLAY COSMETICS + TACTICAL GEAR)
             ========================================================================= */
          <div className="space-y-4">
            {/* 100% FAIR PLAY GUARANTEE BADGE */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-[#121A24] to-[#12141C] border border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-xs uppercase tracking-wider text-emerald-400">
                    100% Fair Play Guarantee
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] font-mono text-emerald-300 font-bold">
                    ZERO PAY-TO-WIN
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                  Pet Slam is strictly skill-based. Outfits, crowns, and gourmet treats are purely aesthetic customizations or accessible at micro-prices ($0.49). Battle outcomes depend 100% on elixir management and timing!
                </p>
              </div>
            </div>

            {/* SECTION 1: FREE DAILY SUPPLY DROPS (100% FREE DAILY) */}
            <div className="bg-[#12141C] border border-amber-400/30 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-white">
                    Free Daily Supply Drops
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[9px] font-mono text-amber-300 font-bold">
                  Refreshes Daily · 100% Free
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Free Drop 1 */}
                <div className="bg-[#181B26] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xl mb-1">🥣</div>
                    <div className="font-display font-bold text-xs text-white">Kibble Energy Bowl</div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-0.5">+25 Free Energy</div>
                    <p className="text-[10px] text-neutral-400 mt-1">Full bowl of organic conditioning kibble.</p>
                  </div>
                  <button
                    onClick={() => handleClaimFreeDaily('kibble', 'Kibble Bowl')}
                    disabled={dailyClaimed.kibble}
                    className={`mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      dailyClaimed.kibble
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow font-black'
                    }`}
                  >
                    {dailyClaimed.kibble ? 'Claimed ✓' : 'Claim Free'}
                  </button>
                </div>

                {/* Free Drop 2 */}
                <div className="bg-[#181B26] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xl mb-1">⚡</div>
                    <div className="font-display font-bold text-xs text-white">Agility Sprint Drill</div>
                    <div className="text-[10px] font-mono text-cyan-400 mt-0.5">+20 Speed Drill XP</div>
                    <p className="text-[10px] text-neutral-400 mt-1">Free 15-minute agility cone workout.</p>
                  </div>
                  <button
                    onClick={() => handleClaimFreeDaily('drill', 'Agility Drill')}
                    disabled={dailyClaimed.drill}
                    className={`mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      dailyClaimed.drill
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow font-black'
                    }`}
                  >
                    {dailyClaimed.drill ? 'Claimed ✓' : 'Start Drill'}
                  </button>
                </div>

                {/* Free Drop 3 */}
                <div className="bg-[#181B26] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xl mb-1">💊</div>
                    <div className="font-display font-bold text-xs text-white">Daily Vitamin Chew</div>
                    <div className="text-[10px] font-mono text-pink-400 mt-0.5">+20 Vitality & Morale</div>
                    <p className="text-[10px] text-neutral-400 mt-1">Multivitamin chew for immune health.</p>
                  </div>
                  <button
                    onClick={() => handleClaimFreeDaily('chew', 'Vitamin Chew')}
                    disabled={dailyClaimed.chew}
                    className={`mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      dailyClaimed.chew
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-pink-400 hover:bg-pink-300 text-black shadow font-black'
                    }`}
                  >
                    {dailyClaimed.chew ? 'Claimed ✓' : 'Claim Free'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: FAIR PLAY COSMETIC WARDROBE ($0.49 / 50¢ OR 500 CR) */}
            <div className="bg-[#12141C] border border-purple-500/30 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-white">
                    Cosmetic Wardrobe (Hats & Glasses)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300">
                  Micro-Price $0.49 (or 500 Cr)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COSMETIC_ITEMS.map((cosm) => {
                  const IconComp = cosm.icon;
                  return (
                    <div
                      key={cosm.id}
                      className="bg-[#161822] border border-white/5 hover:border-purple-500/40 rounded-xl p-3 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase text-purple-400 font-bold">
                            {cosm.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {cosm.priceUsd} or {cosm.price} Cr
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <IconComp className="w-4 h-4 text-[#CCFF00]" />
                          <h4 className="font-display font-black text-xs text-white uppercase">
                            {cosm.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-snug">
                          {cosm.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          sound.playCoin();
                          setFeedbackMsg({
                            text: `Unlocked ${cosm.name}! Wearable on ${activeBeast.name} in arena & sanctuary!`,
                            type: 'success',
                          });
                          setTimeout(() => setFeedbackMsg(null), 3000);
                        }}
                        className="mt-3 w-full py-1.5 rounded-lg text-[10px] font-display font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer shadow"
                      >
                        Unlock ({cosm.priceUsd})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: GOURMET PET TREATS ($0.49 OR 300 CR) */}
            <div className="bg-[#12141C] border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-white">
                    Gourmet Treats & Nutrition
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">
                  Micro-Price $0.49 (or 300 Cr)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GOURMET_TREATS.map((treat) => (
                  <div
                    key={treat.id}
                    className="bg-[#161822] border border-white/5 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xl mb-1">{treat.icon}</div>
                      <div className="font-display font-bold text-xs text-white">{treat.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{treat.bonus}</div>
                      <p className="text-[10px] text-neutral-400 mt-1">{treat.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        sound.playChew();
                        setFeedbackMsg({
                          text: `Fed ${treat.name} to ${activeBeast.name}! Happiness restored!`,
                          type: 'success',
                        });
                        setTimeout(() => setFeedbackMsg(null), 3000);
                      }}
                      className="mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-cyan-500 hover:bg-cyan-400 text-black transition-all cursor-pointer shadow"
                    >
                      Feed ({treat.priceUsd})
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: TACTICAL COMBAT GEAR (EARNABLE VIA BATTLE CREDITS) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-sm uppercase tracking-wide text-white">
                  Tactical Body Rigs & Armor (Battle Credits)
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  Earned via Ranked Arena Victories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GEAR_ITEMS.map((item) => {
                  const isEquipped = Object.values(equippedGear).some((g) => g?.id === item.id);
                  const isInInventory = inventoryGear.some((g) => g.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-[#12141C] border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:border-white/20 transition-all shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-[#CCFF00] font-bold">
                            {item.rarity} · {item.slot}
                          </span>
                          <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                            {item.price.toLocaleString()} Credits
                          </div>
                        </div>

                        <h4 className="font-display font-black text-base text-white mt-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                          {item.description}
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-mono">
                          {Object.entries(item.statBonus).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold"
                            >
                              +{v} {k.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        {isEquipped ? (
                          <div className="w-full py-2 rounded-xl text-xs font-bold text-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                            Currently Equipped on {activeBeast.name}
                          </div>
                        ) : isInInventory ? (
                          <button
                            onClick={() => {
                              handleEquip(item);
                              setArmoryTab('loadout');
                            }}
                            className="w-full py-2 rounded-xl text-xs font-display font-black uppercase tracking-wide bg-[#CCFF00] hover:bg-[#b8e600] text-black transition-all cursor-pointer shadow-md shadow-[#CCFF00]/20"
                          >
                            Equip to {activeBeast.name} Now
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuy(item)}
                            disabled={credits < item.price}
                            className="w-full py-2 rounded-xl text-xs font-bold bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-lg shadow-[#CCFF00]/15 disabled:opacity-40 transition-all cursor-pointer font-display uppercase tracking-wide"
                          >
                            Procure Item ({item.price.toLocaleString()} Cr)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
