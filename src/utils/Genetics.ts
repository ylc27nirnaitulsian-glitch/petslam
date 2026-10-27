/**
 * Breeding Genetics Engine for PET SLAM
 * Inherits parent attributes with ±10% gaussian variance, blends coat hex colors,
 * and rolls a 5% rare mutation chance (Radioactive, Nebula, Solar God, Eclipse).
 */

import { CompanionPet, PetCustomPalette, PetSpecies, PetCategory } from '../types/pet';

export interface EggEntity {
  id: string;
  parent1Id: string;
  parent2Id: string;
  parent1Name: string;
  parent2Name: string;
  species: PetSpecies;
  category: PetCategory;
  name: string;
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

export function breedCompanionPets(parent1: CompanionPet, parent2: CompanionPet): EggEntity {
  const p1Stats = parent1.stats || { attack: 60, defense: 60, agility: 60, stamina: 60, cp: 400 };
  const p2Stats = parent2.stats || { attack: 60, defense: 60, agility: 60, stamina: 60, cp: 400 };

  // 1. Stat Inheritance (Weighted Average ±10% Gaussian variance)
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

  // 3. Rare Mutation Roll (5% chance)
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

  // Species inheritance (50/50 from parents)
  const species = Math.random() > 0.5 ? parent1.species : parent2.species;
  const category = Math.random() > 0.5 ? parent1.category : parent2.category;

  const names = ['Aegis', 'Blitz', 'Cipher', 'Draco', 'Echo', 'Fable', 'Gale', 'Hyperion', 'Kaiser', 'Luna'];
  const name = `${names[Math.floor(Math.random() * names.length)]} Junior`;

  return {
    id: `egg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    parent1Id: parent1.id,
    parent2Id: parent2.id,
    parent1Name: parent1.name,
    parent2Name: parent2.name,
    species,
    category,
    name,
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
  return {
    id: `bred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    species: egg.species,
    category: egg.category,
    name: egg.name,
    title: egg.isMutant ? `Mutant ${egg.mutationType}` : 'Pedigree Offspring',
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
      name: egg.isMutant ? 'Mutant Surge' : 'Hereditary Instinct',
      description: egg.isMutant ? '+25% Overdrive Damage from rare genetic mutation.' : '+10% Speed in battle.',
      effectType: 'crit_chance',
      potency: egg.isMutant ? 25 : 10,
    },
    createdAt: Date.now(),
    lastFedAt: Date.now(),
    lastPettedAt: Date.now(),
    totalPats: 0,
    totalBerriesEaten: 0,
    caughtAt: 'Sanctuary Genetics Lab',
    isFavorite: true,
    customPalette: egg.offspringPalette,
    customFeatures: {
      earType: 'pointed',
      hasWhiskers: egg.category === 'cat',
      eyePatch: Math.random() < 0.25,
      collarColor: '#CCFF00',
      fluffyTail: true,
      signatureMove: {
        name: `${egg.name}'s Genetic Pounce`,
        description: 'Inherited power blast combining both parents genetic prowess!',
      },
    },
    breedName: `Bred Gen-2 ${egg.species}`,
    personalityTraits: egg.isMutant ? ['Rare Mutant', 'Genetic Marvel', 'Arena Apex'] : ['Playful', 'Loyal', 'High Potential'],
    quirk: egg.isMutant ? 'Glows in dark arenas with neon cyber radiation!' : 'Inherited strong instincts from both parents.',
    isCustomAvatar: true,
  };
}
