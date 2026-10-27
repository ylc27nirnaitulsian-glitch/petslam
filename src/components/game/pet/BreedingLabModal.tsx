import React, { useState, useEffect } from 'react';
import {
  X,
  Dna,
  Sparkles,
  Heart,
  Zap,
  Egg,
  Award,
  Shield,
  ChevronRight,
  Flame,
  CheckCircle,
  Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../../utils/audio';
import { triggerVictoryExplosion } from '../../../utils/confetti';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { useGame } from '../../../context/GameContext';
import { CompanionPet } from '../../../types/pet';
import { Animal } from '../../../data/animals';
import { animalImages } from '../../../assets/images';
import {
  breedCompanionPets,
  hatchEggToCompanionPet,
  EggEntity,
} from '../../../utils/Genetics';
import { ProceduralPetCanvas } from './ProceduralPetCanvas';
import { triggerHeavyImpactHaptic, triggerMediumImpactHaptic } from '../../../utils/haptics';

interface BreedingLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreedingLabModal: React.FC<BreedingLabModalProps> = ({ isOpen, onClose }) => {
  const { kennelPets, pet, addCustomAvatarPet } = usePetCompanion();
  const { registerCustomFighter } = useGame();

  const [parent1, setParent1] = useState<CompanionPet | null>(null);
  const [parent2, setParent2] = useState<CompanionPet | null>(null);
  const [currentEgg, setCurrentEgg] = useState<EggEntity | null>(null);
  const [hatchCountdown, setHatchCountdown] = useState<number>(10);
  const [isHatching, setIsHatching] = useState<boolean>(false);
  const [hatchedPet, setHatchedPet] = useState<CompanionPet | null>(null);

  // Auto-select parents if available
  useEffect(() => {
    const availablePets = kennelPets && kennelPets.length > 0 ? kennelPets : (pet ? [pet] : []);
    if (availablePets.length >= 2) {
      if (!parent1) setParent1(availablePets[0]);
      if (!parent2) setParent2(availablePets[1]);
    } else if (availablePets.length >= 1) {
      setParent1(availablePets[0]);
      // Synthetic companion mentor parent
      setParent2({
        id: 'mentor_parent',
        name: 'Alpha Luna',
        title: 'Sanctuary Alpha Mentor',
        species: 'husky',
        category: 'dog',
        stage: 2,
        level: 15,
        exp: 0,
        maxExp: 100,
        affectionHearts: 5,
        affectionPoints: 100,
        hunger: 100,
        happiness: 100,
        energy: 100,
        mood: 'excited',
        stats: { attack: 85, defense: 78, agility: 82, stamina: 80, cp: 580 },
        battleBuff: {
          name: 'Alpha Aura',
          description: '+15% Genetic Prowess',
          effectType: 'crit_chance',
          potency: 15,
        },
        createdAt: Date.now(),
        lastFedAt: Date.now(),
        lastPettedAt: Date.now(),
        totalPats: 10,
        totalBerriesEaten: 5,
        caughtAt: 'Sanctuary Elite Roster',
        customPalette: {
          primary: '#38BDF8',
          secondary: '#0284C7',
          belly: '#F0F9FF',
          ear: '#E0F2FE',
          eye: '#F59E0B',
          nose: '#0F172A',
        },
      });
    }
  }, [kennelPets, pet, parent1, parent2]);

  // Egg Incubation countdown timer
  useEffect(() => {
    if (!currentEgg || currentEgg.isReadyToHatch) return;

    const timer = setInterval(() => {
      setHatchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCurrentEgg((egg) => (egg ? { ...egg, isReadyToHatch: true } : null));
          sound.playLevelUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentEgg]);

  if (!isOpen) return null;

  const handleStartBreeding = () => {
    if (!parent1 || !parent2) return;
    sound.playVictory();
    triggerMediumImpactHaptic();

    const egg = breedCompanionPets(parent1, parent2);
    setCurrentEgg(egg);
    setHatchCountdown(egg.hatchDurationSeconds);
    setHatchedPet(null);
  };

  const handleHatchEgg = () => {
    if (!currentEgg) return;
    setIsHatching(true);
    sound.playAttack();
    triggerHeavyImpactHaptic();

    setTimeout(() => {
      const babyPet = hatchEggToCompanionPet(currentEgg);
      setHatchedPet(babyPet);
      setIsHatching(false);
      sound.playVictory();
      triggerVictoryExplosion();

      // Register baby pet into Companion Kennel
      addCustomAvatarPet(babyPet);

      // Register into GameContext as playable arena beast
      const fighter: Animal = {
        id: `fighter_${babyPet.id}`,
        name: babyPet.name,
        species: babyPet.species,
        breed: babyPet.breedName || babyPet.species,
        scientificName: 'Canis / Felis Gen-2',
        category: babyPet.category === 'cat' ? 'Felines' : 'Canines',
        rarity: babyPet.title.includes('Mutant') ? 'Legendary' : 'Rare',
        level: 5,
        health: 1050,
        damage: 180,
        speed: 84,
        weightKg: 25,
        biteForcePsi: 220,
        topSpeedKmh: 45,
        strikeJoules: 640,
        elixirCost: 3,
        strength: 82,
        endurance: 84,
        agility: 84,
        biteForce: 220,
        image: animalImages.bengalTiger,
        fallbackImage: animalImages.bengalTiger,
        acquisitionStatus: 'Available',
        currentPriceCredits: 10000,
        combatArchetype: 'Precision Striker',
        description: `Bred Gen-2 prodigy combining traits from ${currentEgg.parent1Name} & ${currentEgg.parent2Name}.`,
        signatureAbility: `${babyPet.customFeatures?.signatureMove?.name || 'Genetic Pounce'}: Inherited genetic fury.`,
      };
      registerCustomFighter(fighter);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-2xl bg-[#080C16] border border-fuchsia-500/40 rounded-3xl shadow-[0_0_50px_rgba(217,70,239,0.25)] flex flex-col overflow-hidden text-white max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#1E0F2E] via-[#120A1D] to-[#080C16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Breeding Genetics & Hybrid Lab
                </h2>
                <span className="text-[10px] bg-fuchsia-400 text-black px-2 py-0.5 rounded-full font-black font-mono">
                  GEN-2 PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Stat Variance ±10% · Hex Coat Color Blending · 5% Rare Mutant Roll
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!currentEgg ? (
            /* STEP 1: SELECT PARENTS & PREVIEW GENETICS */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Parent 1 */}
                <div className="bg-[#101424] border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase mb-2">
                    Parent 1 (Alpha)
                  </span>
                  <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center overflow-hidden mb-2">
                    {parent1 && (
                      <ProceduralPetCanvas
                        species={parent1.species}
                        stage={1}
                        width={90}
                        height={90}
                        interactive={false}
                        customPalette={parent1.customPalette}
                      />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white uppercase">{parent1?.name}</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Lv.{parent1?.level || 10} · CP {parent1?.stats.cp || 500}
                  </div>
                </div>

                {/* Parent 2 */}
                <div className="bg-[#1A1024] border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center">
                  <span className="text-[10px] font-mono font-bold text-fuchsia-300 uppercase mb-2">
                    Parent 2 (Beta)
                  </span>
                  <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center overflow-hidden mb-2">
                    {parent2 && (
                      <ProceduralPetCanvas
                        species={parent2.species}
                        stage={1}
                        width={90}
                        height={90}
                        interactive={false}
                        customPalette={parent2.customPalette}
                      />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white uppercase">{parent2?.name}</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Lv.{parent2?.level || 15} · CP {parent2?.stats.cp || 580}
                  </div>
                </div>
              </div>

              {/* Genetic Projection Card */}
              <div className="bg-gradient-to-r from-fuchsia-950/30 via-[#101526] to-cyan-950/30 border border-fuchsia-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Projected Offspring Biometrics</span>
                  </span>
                  <span className="text-[#CCFF00] text-[10px]">5% Rare Mutation Chance</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                  <div className="bg-black/40 p-1.5 rounded-xl border border-white/10">
                    <div className="text-neutral-400">EST. ATK</div>
                    <div className="text-xs font-bold text-rose-400">
                      {Math.round(((parent1?.stats.attack || 70) + (parent2?.stats.attack || 80)) / 2)} ±10%
                    </div>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-white/10">
                    <div className="text-neutral-400">EST. DEF</div>
                    <div className="text-xs font-bold text-blue-400">
                      {Math.round(((parent1?.stats.defense || 70) + (parent2?.stats.defense || 75)) / 2)} ±10%
                    </div>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-white/10">
                    <div className="text-neutral-400">EST. AGI</div>
                    <div className="text-xs font-bold text-emerald-400">
                      {Math.round(((parent1?.stats.agility || 75) + (parent2?.stats.agility || 85)) / 2)} ±10%
                    </div>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-white/10">
                    <div className="text-neutral-400">EST. CP</div>
                    <div className="text-xs font-bold text-[#CCFF00]">
                      {Math.round(((parent1?.stats.cp || 500) + (parent2?.stats.cp || 580)) / 2)} ±10%
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 font-mono italic">
                  Coat hex pigments blend procedurally. Mutations roll Radioactive Neon, Void Nebula, or Solar God coats!
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartBreeding}
                className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-400 hover:to-cyan-300 text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_25px_rgba(217,70,239,0.35)] flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer active:scale-98 transition-all"
              >
                <Dna className="w-4 h-4 text-black" />
                <span>Initiate Genetic Fusion & Incubate Egg</span>
              </button>
            </div>
          ) : !hatchedPet ? (
            /* STEP 2: EGG INCUBATION & HATCHING ANIMATION */
            <div className="space-y-6 py-6 text-center animate-fadeIn">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Radiant Glow Behind Egg */}
                <div
                  className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
                    currentEgg.isMutant
                      ? 'bg-gradient-to-r from-fuchsia-500 to-lime-400 opacity-70 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 opacity-40'
                  }`}
                />

                {/* Framer Motion Animated Cyber Egg */}
                <motion.div
                  animate={
                    isHatching
                      ? { rotate: [-10, 10, -15, 15, -20, 20, 0], scale: [1, 1.25, 0.9, 1.3, 0] }
                      : currentEgg.isReadyToHatch
                      ? { rotate: [-4, 4, -4], scale: [1, 1.05, 1] }
                      : { y: [0, -6, 0] }
                  }
                  transition={
                    isHatching
                      ? { duration: 1.4 }
                      : { repeat: Infinity, duration: currentEgg.isReadyToHatch ? 0.6 : 2 }
                  }
                  className="relative z-10 w-28 h-36 rounded-[50%_50%_45%_45%] border-2 border-white/30 p-2 shadow-2xl flex items-center justify-center cursor-pointer"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${currentEgg.offspringPalette.primary} 50%, ${currentEgg.offspringPalette.secondary} 100%)`,
                  }}
                  onClick={() => {
                    if (currentEgg.isReadyToHatch && !isHatching) handleHatchEgg();
                  }}
                >
                  <Egg className="w-12 h-12 text-white/80" />
                </motion.div>
              </div>

              <div>
                <h3 className="text-lg font-display font-black uppercase text-white tracking-wider">
                  {currentEgg.isReadyToHatch ? 'EGG IS READY TO CRACK!' : 'INCUBATING GENETIC EMBRYO...'}
                </h3>
                <div className="text-xs font-mono text-fuchsia-300 mt-1">
                  Parents: {currentEgg.parent1Name} × {currentEgg.parent2Name}
                </div>
                {!currentEgg.isReadyToHatch && (
                  <div className="text-2xl font-mono font-black text-[#CCFF00] mt-2">
                    {hatchCountdown}s
                  </div>
                )}
              </div>

              {currentEgg.isReadyToHatch ? (
                <button
                  onClick={handleHatchEgg}
                  disabled={isHatching}
                  className="w-full max-w-sm mx-auto bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_25px_rgba(204,255,0,0.5)] flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer active:scale-98 transition-all animate-bounce"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Crack Egg & Reveal Gen-2 Baby!</span>
                </button>
              ) : (
                <div className="text-[11px] font-mono text-neutral-400">
                  Stabilizing chromosome pairs & synthesizing coat pigments...
                </div>
              )}
            </div>
          ) : (
            /* STEP 3: HATCH REVEAL & BABY STATS */
            <div className="space-y-4 py-2 text-center animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40 flex items-center justify-center shadow-[0_0_25px_rgba(204,255,0,0.4)]">
                <Crown className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#CCFF00] bg-[#CCFF00]/15 px-2.5 py-0.5 rounded-full border border-[#CCFF00]/40">
                  {hatchedPet.title}
                </span>
                <h3 className="text-2xl font-display font-black uppercase text-white tracking-wider mt-1.5">
                  {hatchedPet.name}
                </h3>
                <p className="text-xs font-mono text-cyan-300">
                  {hatchedPet.breedName} · Combat Power: CP {hatchedPet.stats.cp}
                </p>
              </div>

              {/* Baby Pet Interactive Avatar */}
              <div className="w-40 h-40 mx-auto rounded-2xl bg-black/50 border-2 border-[#CCFF00]/50 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                <ProceduralPetCanvas
                  species={hatchedPet.species}
                  stage={1}
                  width={150}
                  height={150}
                  interactive={true}
                  customPalette={hatchedPet.customPalette}
                  customFeatures={hatchedPet.customFeatures}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto font-mono text-[10px]">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="text-neutral-400">ATK</div>
                  <div className="text-xs font-bold text-rose-400">{hatchedPet.stats.attack}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="text-neutral-400">DEF</div>
                  <div className="text-xs font-bold text-blue-400">{hatchedPet.stats.defense}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="text-neutral-400">AGI</div>
                  <div className="text-xs font-bold text-emerald-400">{hatchedPet.stats.agility}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="text-neutral-400">STA</div>
                  <div className="text-xs font-bold text-amber-400">{hatchedPet.stats.stamina}</div>
                </div>
              </div>

              <div className="flex gap-2 max-w-sm mx-auto">
                <button
                  onClick={() => {
                    setCurrentEgg(null);
                    setHatchedPet(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Breed Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono text-xs font-black uppercase cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                >
                  View in Sanctuary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
