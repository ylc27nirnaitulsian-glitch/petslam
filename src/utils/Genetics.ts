/**
 * Breeding Genetics & Procedural Chimera Engine for PET SLAM
 * Inherits parent attributes with ±10% gaussian variance, blends 6-tone coat hex colors,
 * implements a 5-tier weighted rarity ladder (Common -> Rare -> Epic -> Legendary -> Mythic)
 * with level/affection boost, creates true procedural Chimera hybrid cross-breeds,
 * and rolls rare mutations (Radioactive Neon, Void Nebula, Solar God, Blood Eclipse).
 */

import { CompanionPet, PetCustomPalette, PetSpecies, PetCategory, PetRarity, PetCustomFeatures } from '../types/pet';

export const RARITY_TIERS: PetRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export const RARITY_LEVEL_MAP: Record<PetRarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
  mythic: 4,
};

export const RARITY_BADGE_COLORS: Record<PetRarity, { bg: string; text: string; border: string; glow: string }> = {
  common: { bg: 'bg-neutral-800', text: 'text-neutral-300', border: 'border-neutral-600', glow: 'rgba(163,163,163,0.3)' },
  rare: { bg: 'bg-cyan-950', text: 'text-cyan-400', border: 'border-cyan-500', glow: 'rgba(0,240,255,0.4)' },
  epic: { bg: 'bg-purple-950', text: 'text-purple-400', border: 'border-purple-500', glow: 'rgba(168,85,247,0.45)' },
  legendary: { bg: 'bg-amber-950', text: 'text-amber-400', border: 'border-amber-500', glow: 'rgba(245,158,11,0.5)' },
  mythic: { bg: 'bg-gradient-to-r from-fuchsia-950 to-rose-950', text: 'text-fuchsia-300', border: 'border-fuchsia-400', glow: 'rgba(217,70,239,0.7)' },
};

export interface EggEntity {
  id: string;
  parent1Id: string;
  parent2Id: string;
  parent1Name: string;
  parent2Name: string;
  species: PetSpecies;
  category: PetCategory;
  name: string;
  rarity: PetRarity;
  isChimera: boolean;
  hybridSpeciesName?: string;
  customFeatures: PetCustomFeatures;
  ascendedTier: boolean;
  ascensionChancePercent: number;
  offspringPalette: PetCustomPalette;
  offspringStats: {
    attack: number;
    defense: number;
    agility: number;
    stamina: number;
    cp: number;
  };
  isMutant: boolean;
  mutationType?: string;
  laidAt: number;
  hatchDurationSeconds: number;
  isReadyToHatch: boolean;
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Blend two hex colors
export function blendHexColors(hex1: string, hex2: string, weight = 0.5): string {
  try {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = c1.r * weight + c2.r * (1 - weight);
    const g = c1.g * weight + c2.g * (1 - weight);
    const b = c1.b * weight + c2.b * (1 - weight);
    return rgbToHex(r, g, b);
  } catch {
    return hex1;
  }
}

// Extract pet rarity safely
export function getPetRarity(pet: CompanionPet): PetRarity {
  if (pet.rarity) return pet.rarity;
  const t = pet.title.toLowerCase();
  if (t.includes('mythic')) return 'mythic';
  if (t.includes('mutant') || t.includes('titan') || t.includes('legendary')) return 'legendary';
  if (pet.level >= 15 || pet.stats.cp >= 550) return 'epic';
  if (pet.level >= 8 || pet.stats.cp >= 400) return 'rare';
  return 'common';
}

// Calculate ascension probability based on parent level and affection
export function calculateAscensionChance(parent1: CompanionPet, parent2: CompanionPet): number {
  const p1Rarity = getPetRarity(parent1);
  const p2Rarity = getPetRarity(parent2);
  const highestTierIdx = Math.max(RARITY_LEVEL_MAP[p1Rarity], RARITY_LEVEL_MAP[p2Rarity]);
  if (highestTierIdx >= RARITY_TIERS.length - 1) {
    return 0; // Already max tier (Mythic)
  }

  // 30% baseline chance
  let chance = 0.30;

  // Level bonus: up to +10% (scaled across parent levels)
  const avgLevel = ((parent1.level || 5) + (parent2.level || 5)) / 2;
  const levelBonus = Math.min(0.10, (avgLevel / 30) * 0.10);

  // Affection hearts bonus: up to +10% (scaled across 0-5 hearts)
  const avgHearts = ((parent1.affectionHearts || 1) + (parent2.affectionHearts || 1)) / 2;
  const heartBonus = Math.min(0.10, (avgHearts / 5) * 0.10);

  // Same tier synergy: if both parents are same high tier, +5%
  const synergy = (p1Rarity === p2Rarity && highestTierIdx > 0) ? 0.05 : 0;

  chance = Math.min(0.50, chance + levelBonus + heartBonus + synergy);
  return Math.round(chance * 100) / 100;
}

// Rare Mutations (5% chance)
const RARE_MUTATIONS = [
  {
    type: 'Radioactive Neon',
    title: 'Radioactive Chimera',
    paletteOverride: {
      primary: '#39FF14',
      secondary: '#00F0FF',
      belly: '#CCFF00',
      ear: '#FF007A',
      eye: '#00F0FF',
      nose: '#0B0F19',
    },
    statMultiplier: 1.15,
  },
  {
    type: 'Void Nebula',
    title: 'Cosmic Starborn',
    paletteOverride: {
      primary: '#6D28D9',
      secondary: '#4C1D95',
      belly: '#C4B5FD',
      ear: '#A855F7',
      eye: '#38BDF8',
      nose: '#1E1B4B',
    },
    statMultiplier: 1.18,
  },
  {
    type: 'Solar Apex God',
    title: 'Solarized Monarch',
    paletteOverride: {
      primary: '#F59E0B',
      secondary: '#B45309',
      belly: '#FEF3C7',
      ear: '#D97706',
      eye: '#FFFFFF',
      nose: '#78350F',
    },
    statMultiplier: 1.2,
  },
  {
    type: 'Blood Eclipse',
    title: 'Eclipse Hellhound',
    paletteOverride: {
      primary: '#DC2626',
      secondary: '#991B1B',
      belly: '#FEE2E2',
      ear: '#7F1D1D',
      eye: '#FBBF24',
      nose: '#450A0A',
    },
    statMultiplier: 1.16,
  },
];

const SPECIES_DISPLAY_NAMES: Record<string, string> = {
  bengal: 'Bengal',
  mainecoon: 'Maine Coon',
  siamese: 'Siamese',
  tabby: 'Tabby',
  british: 'British Shorthair',
  scottish: 'Scottish Fold',
  calico: 'Calico',
  blackcat: 'Shadow Cat',
  germanshepherd: 'Shepherd',
  rottweiler: 'Rottweiler',
  retriever: 'Retriever',
  husky: 'Husky',
  bulldog: 'Bulldog',
  shiba: 'Shiba',
  doberman: 'Doberman',
  corgi: 'Corgi',
  kodiak: 'Kodiak',
  bagheera: 'Panther',
  ignis: 'Ignis',
  sultan: 'Sultan',
};

export function breedCompanionPets(parent1: CompanionPet, parent2: CompanionPet): EggEntity {
  const p1Stats = parent1.stats || { attack: 60, defense: 60, agility: 60, stamina: 60, cp: 400 };
  const p2Stats = parent2.stats || { attack: 60, defense: 60, agility: 60, stamina: 60, cp: 400 };

  // 1. Stat Inheritance (Weighted Average +-10% Gaussian variance)
  const calcStat = (s1: number, s2: number) => {
    const base = (s1 + s2) / 2;
    const variance = 1 + (Math.random() - 0.5) * 0.2; // 0.90 to 1.10
    return Math.round(base * variance);
  };

  let attack = calcStat(p1Stats.attack, p2Stats.attack);
  let defense = calcStat(p1Stats.defense, p2Stats.defense);
  let agility = calcStat(p1Stats.agility, p2Stats.agility);
  let stamina = calcStat(p1Stats.stamina, p2Stats.stamina);

  // 2. Coat Hex Color Blending
  const p1Pal = parent1.customPalette || {
    primary: '#E07A5F',
    secondary: '#3D405B',
    belly: '#F4F1DE',
    ear: '#F2CC8F',
    eye: '#2A9D8F',
    nose: '#1E1E24',
  };
  const p2Pal = parent2.customPalette || {
    primary: '#94A3B8',
    secondary: '#475569',
    belly: '#F8FAFC',
    ear: '#CBD5E1',
    eye: '#38BDF8',
    nose: '#0F172A',
  };

  const weight = 0.35 + Math.random() * 0.3; // 0.35 - 0.65
  let offspringPalette: PetCustomPalette = {
    primary: blendHexColors(p1Pal.primary, p2Pal.primary, weight),
    secondary: blendHexColors(p1Pal.secondary, p2Pal.secondary, weight),
    belly: blendHexColors(p1Pal.belly, p2Pal.belly, weight),
    ear: blendHexColors(p1Pal.ear, p2Pal.ear, weight),
    eye: Math.random() > 0.5 ? p1Pal.eye : p2Pal.eye,
    nose: Math.random() > 0.5 ? p1Pal.nose : p2Pal.nose,
  };

  // 3. Rarity Progression Ladder
  const p1Rarity = getPetRarity(parent1);
  const p2Rarity = getPetRarity(parent2);
  const higherTierIdx = Math.max(RARITY_LEVEL_MAP[p1Rarity], RARITY_LEVEL_MAP[p2Rarity]);
  const ascensionChance = calculateAscensionChance(parent1, parent2);
  const rollAscend = Math.random() < ascensionChance && higherTierIdx < RARITY_TIERS.length - 1;
  const finalRarity: PetRarity = rollAscend ? RARITY_TIERS[higherTierIdx + 1] : RARITY_TIERS[higherTierIdx];

  // Rarity stat scaling multiplier
  const rarityMultipliers: Record<PetRarity, number> = {
    common: 1.0,
    rare: 1.08,
    epic: 1.18,
    legendary: 1.30,
    mythic: 1.48,
  };
  const rMult = rarityMultipliers[finalRarity];
  attack = Math.round(attack * rMult);
  defense = Math.round(defense * rMult);
  agility = Math.round(agility * rMult);
  stamina = Math.round(stamina * rMult);

  // 4. Rare Mutation Roll (5% chance)
  const isMutant = Math.random() < 0.05;
  let mutationType: string | undefined = undefined;

  if (isMutant) {
    const mutation = RARE_MUTATIONS[Math.floor(Math.random() * RARE_MUTATIONS.length)];
    mutationType = mutation.type;
    offspringPalette = { ...mutation.paletteOverride };
    attack = Math.round(attack * mutation.statMultiplier);
    defense = Math.round(defense * mutation.statMultiplier);
    agility = Math.round(agility * mutation.statMultiplier);
    stamina = Math.round(stamina * mutation.statMultiplier);
  }

  const cp = Math.round(attack * 1.8 + defense * 1.4 + agility * 1.6 + stamina * 1.5);

  // 5. Procedural Chimera Hybrid Fusion
  const isCrossBreed = parent1.species !== parent2.species || parent1.category !== parent2.category;
  const isChimera = isCrossBreed;

  const p1Breed = SPECIES_DISPLAY_NAMES[parent1.species] || parent1.species;
  const p2Breed = SPECIES_DISPLAY_NAMES[parent2.species] || parent2.species;

  const hybridSpeciesName = isChimera
    ? `${p1Breed}-${p2Breed} Chimera`
    : `Purebred ${p1Breed}`;

  // Species inheritance base for physics/animation
  const species = Math.random() > 0.5 ? parent1.species : parent2.species;
  const category = Math.random() > 0.5 ? parent1.category : parent2.category;

  // Custom physical features blending
  const p1Feat = parent1.customFeatures || {};
  const p2Feat = parent2.customFeatures || {};

  const customFeatures: PetCustomFeatures = {
    isCat: category === 'cat',
    isChimera,
    hybridSpeciesName,
    parent1Species: parent1.species,
    parent2Species: parent2.species,
    earType: p1Feat.earType || (category === 'cat' ? 'pointed' : 'floppy'),
    chimeraSecondaryEarType: p2Feat.earType || (p2Feat.isCat ? 'pointed' : 'floppy'),
    hasWhiskers: category === 'cat' || parent1.category === 'cat' || parent2.category === 'cat',
    hasRosettes: parent1.species === 'bengal' || parent2.species === 'bengal' || Math.random() < 0.35,
    hasStripes: parent1.species === 'tabby' || parent2.species === 'tabby' || Math.random() < 0.35,
    hasMuzzleMask: parent1.species === 'husky' || parent2.species === 'husky' || parent1.species === 'germanshepherd' || parent2.species === 'germanshepherd' || Math.random() < 0.4,
    hasEyebrowDots: parent1.species === 'rottweiler' || parent2.species === 'rottweiler' || parent1.species === 'doberman' || parent2.species === 'doberman' || Math.random() < 0.3,
    eyePatch: Math.random() < 0.25,
    fluffyTail: true,
    collarColor: finalRarity === 'mythic' ? '#FF007A' : finalRarity === 'legendary' ? '#F59E0B' : '#CCFF00',
    signatureMove: {
      name: isChimera ? `${p1Breed}-${p2Breed} Fusion Slam` : `Genetic Instinct Pounce`,
      description: isChimera
        ? `Dual-discipline hybrid strike combining canine crushing power with feline razor agility!`
        : `Inherited ancestral technique delivering high critical-hit damage!`,
    },
  };

  const names = ['Aegis', 'Blitz', 'Cipher', 'Draco', 'Echo', 'Fable', 'Gale', 'Hyperion', 'Kaiser', 'Luna', 'Valkyrie', 'Titan', 'Zephyr', 'Orion', 'Nova'];
  const name = `${names[Math.floor(Math.random() * names.length)]} ${isChimera ? 'Chimera' : 'Junior'}`;

  return {
    id: `egg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    parent1Id: parent1.id,
    parent2Id: parent2.id,
    parent1Name: parent1.name,
    parent2Name: parent2.name,
    species,
    category,
    name,
    rarity: finalRarity,
    isChimera,
    hybridSpeciesName,
    customFeatures,
    ascendedTier: rollAscend,
    ascensionChancePercent: Math.round(ascensionChance * 100),
    offspringPalette,
    offspringStats: { attack, defense, agility, stamina, cp },
    isMutant,
    mutationType,
    laidAt: Date.now(),
    hatchDurationSeconds: 10, // 10s fast incubation for awesome gameplay feel
    isReadyToHatch: false,
  };
}

export function hatchEggToCompanionPet(egg: EggEntity): CompanionPet {
  const isMythic = egg.rarity === 'mythic';
  const isLegendary = egg.rarity === 'legendary';

  let title = `${egg.rarity.toUpperCase()} Prodigy`;
  if (isMythic) {
    title = `Mythic ${egg.hybridSpeciesName || 'Chimera Sovereign'}`;
  } else if (egg.isMutant) {
    title = `Mutant ${egg.mutationType}`;
  } else if (egg.isChimera) {
    title = `${egg.rarity.toUpperCase()} Chimera Hybrid`;
  }

  return {
    id: `bred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    species: egg.species,
    category: egg.category,
    name: egg.name,
    title,
    rarity: egg.rarity,
    isChimera: egg.isChimera,
    hybridSpeciesName: egg.hybridSpeciesName,
    stage: 1,
    level: 1,
    exp: 0,
    maxExp: 100,
    affectionHearts: 5,
    affectionPoints: 120,
    hunger: 100,
    happiness: 100,
    energy: 100,
    mood: 'excited',
    stats: egg.offspringStats,
    battleBuff: {
      name: isMythic
        ? 'Mythic Celestial Aura'
        : egg.isMutant
        ? 'Mutant Surge'
        : egg.isChimera
        ? 'Chimera Hybrid Vigor'
        : 'Hereditary Instinct',
      description: isMythic
        ? '+35% Overdrive & +20% Critical Strike Chance from Mythic lineage.'
        : egg.isMutant
        ? '+25% Overdrive Damage from rare genetic mutation.'
        : egg.isChimera
        ? '+15% All-Round Combat Attributes from cross-species hybrid vigor.'
        : '+10% Speed in battle.',
      effectType: 'crit_chance',
      potency: isMythic ? 35 : egg.isMutant ? 25 : egg.isChimera ? 15 : 10,
    },
    createdAt: Date.now(),
    lastFedAt: Date.now(),
    lastPettedAt: Date.now(),
    totalPats: 0,
    totalBerriesEaten: 0,
    caughtAt: 'Sanctuary Genetics Lab',
    isFavorite: true,
    customPalette: egg.offspringPalette,
    customFeatures: egg.customFeatures,
    breedName: egg.isChimera ? egg.hybridSpeciesName : `Bred Gen-2 ${egg.species}`,
    personalityTraits: isMythic
      ? ['Mythic Sovereign', 'Celestial Lineage', 'Apex Predator']
      : egg.isMutant
      ? ['Rare Mutant', 'Genetic Marvel', 'Arena Apex']
      : egg.isChimera
      ? ['Chimera Hybrid', 'Dual Instinct', 'Adaptive Fighter']
      : ['Playful', 'Loyal', 'High Potential'],
    quirk: isMythic
      ? 'Radiates an iridescent celestial aura that mesmerizes opponents in the arena!'
      : egg.isMutant
      ? 'Glows in dark arenas with neon cyber radiation!'
      : egg.isChimera
      ? 'Can vocalize both a piercing bark and a stealthy purr!'
      : 'Inherited strong instincts from both parents.',
    isCustomAvatar: true,
  };
}
