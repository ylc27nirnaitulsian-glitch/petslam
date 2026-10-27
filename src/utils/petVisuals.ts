import { ANIMALS_DATA, Animal } from '../data/animals';
import { PetSpecies, CompanionPet } from '../types/pet';

/**
 * Universal Breed Mapping: Maps any CompanionPet, species key, or animal identifier
 * to the verified, high-resolution official animal portrait in ANIMALS_DATA.
 * Ensures 100% visual uniformity across Arena, Beasts, Market, Sanctuary, Auctions, and Extension.
 */
export const SPECIES_TO_ANIMAL_ID: Record<string, string> = {
  // Dogs
  germanshepherd: 'dog_01',
  kaiser: 'dog_01',
  rottweiler: 'dog_02',
  vulkan: 'dog_02',
  retriever: 'dog_03',
  goldenretriever: 'dog_03',
  buddy: 'dog_03',
  husky: 'dog_04',
  ghost: 'dog_04',
  bulldog: 'dog_05',
  frenchbulldog: 'dog_05',
  rocky: 'dog_05',
  shiba: 'dog_06',
  shibainu: 'dog_06',
  hachi: 'dog_06',
  doberman: 'dog_07',
  titan: 'dog_07',
  corgi: 'dog_08',
  biscuit: 'dog_08',
  mastiff: 'dog_08',
  conan: 'dog_08',

  // Cats
  bengal: 'cat_01',
  leonidas: 'cat_01',
  mainecoon: 'cat_02',
  thor: 'cat_02',
  siamese: 'cat_03',
  mochi: 'cat_03',
  tabby: 'cat_04',
  garfield: 'cat_04',
  british: 'cat_05',
  britishshorthair: 'cat_05',
  winston: 'cat_05',
  scottish: 'cat_06',
  scottishfold: 'cat_06',
  luna: 'cat_06',
  calico: 'cat_07',
  cleo: 'cat_07',
  blackcat: 'cat_08',
  shadow: 'cat_08',

  // Backwards compat aliases
  kodiak: 'dog_04',
  bagheera: 'cat_08',
  ignis: 'dog_02',
  sultan: 'cat_01',
};

/**
 * Resolves the authentic photo URL for any pet or species.
 */
export function getPetPhoto(
  pet?: Partial<CompanionPet> | Partial<Animal> | { species?: string; name?: string; image?: string; avatarImageUrl?: string } | null
): string {
  if (!pet) return ANIMALS_DATA[0].image;

  // Custom photo avatar priority
  if ('avatarImageUrl' in pet && pet.avatarImageUrl) {
    return pet.avatarImageUrl;
  }

  // Direct image property priority if already set
  if ('image' in pet && pet.image) {
    return pet.image;
  }

  // Lookup by species key
  const speciesKey = (pet.species || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (speciesKey && SPECIES_TO_ANIMAL_ID[speciesKey]) {
    const matched = ANIMALS_DATA.find((a) => a.id === SPECIES_TO_ANIMAL_ID[speciesKey]);
    if (matched?.image) return matched.image;
  }

  // Lookup by pet name
  const nameKey = (pet.name || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (nameKey && SPECIES_TO_ANIMAL_ID[nameKey]) {
    const matched = ANIMALS_DATA.find((a) => a.id === SPECIES_TO_ANIMAL_ID[nameKey]);
    if (matched?.image) return matched.image;
  }

  // Fallback by category
  if ('category' in pet) {
    if (pet.category === 'cat' || pet.category === 'Felines') {
      return ANIMALS_DATA[8].image; // Bengal Cat
    }
  }

  return ANIMALS_DATA[0].image; // German Shepherd
}

/**
 * Resolves the display breed name for any pet
 */
export function getPetBreedName(
  pet?: Partial<CompanionPet> | Partial<Animal> | { species?: string; name?: string; breed?: string; breedName?: string } | null
): string {
  if (!pet) return 'Pedigree Champion';

  if ('breed' in pet && pet.breed) return pet.breed;
  if ('breedName' in pet && pet.breedName) return pet.breedName;

  const speciesKey = (pet.species || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (speciesKey && SPECIES_TO_ANIMAL_ID[speciesKey]) {
    const matched = ANIMALS_DATA.find((a) => a.id === SPECIES_TO_ANIMAL_ID[speciesKey]);
    if (matched?.breed) return matched.breed;
  }

  return pet.species || 'Purebred';
}

/**
 * Returns a visually distinct styling for each rarity tier so no two tiers look the same.
 */
export function getRarityBadgeClasses(rarity: string): string {
  const r = (rarity || 'Common').toLowerCase();
  switch (r) {
    case 'apex':
      return 'border-2 border-[#CCFF00] bg-black text-[#CCFF00] font-display font-black text-[10px] tracking-widest uppercase shadow-[0_0_14px_rgba(204,255,0,0.7)] px-2 py-0.5 rounded-md';
    case 'legendary':
      return 'border border-amber-400 bg-amber-950/90 text-amber-300 font-display font-black text-[9px] tracking-wider uppercase shadow-[0_0_10px_rgba(245,158,11,0.5)] px-2 py-0.5 rounded-md';
    case 'epic':
      return 'border border-purple-400 bg-purple-950/90 text-purple-200 font-mono text-[9px] font-bold uppercase shadow-[0_0_8px_rgba(168,85,247,0.4)] px-1.5 py-0.5 rounded-md';
    case 'rare':
      return 'border border-cyan-400 bg-cyan-950/90 text-cyan-300 font-mono text-[9px] font-bold uppercase shadow-[0_0_6px_rgba(0,229,255,0.3)] px-1.5 py-0.5 rounded-md';
    case 'common':
    default:
      return 'border border-neutral-600 bg-neutral-900/80 text-neutral-300 font-mono text-[9px] font-medium uppercase px-1.5 py-0.5 rounded-md';
  }
}

/**
 * Maps any pet/beast or species string to a strongly-typed PetSpecies
 */
export function mapBeastToSpecies(speciesOrBreed?: string): PetSpecies {
  const s = (speciesOrBreed || '').toLowerCase().replace(/[\s\-_]+/g, '');
  if (s.includes('germanshepherd') || s.includes('shepherd')) return 'germanshepherd';
  if (s.includes('rottweiler')) return 'rottweiler';
  if (s.includes('retriever') || s.includes('golden')) return 'retriever';
  if (s.includes('husky') || s.includes('siberian')) return 'husky';
  if (s.includes('bulldog') || s.includes('french')) return 'bulldog';
  if (s.includes('shiba') || s.includes('inu')) return 'shiba';
  if (s.includes('doberman') || s.includes('pinscher')) return 'doberman';
  if (s.includes('corgi')) return 'corgi';
  if (s.includes('bengal')) return 'bengal';
  if (s.includes('mainecoon') || s.includes('maine')) return 'mainecoon';
  if (s.includes('siamese')) return 'siamese';
  if (s.includes('tabby')) return 'tabby';
  if (s.includes('british') || s.includes('shorthair')) return 'british';
  if (s.includes('scottish') || s.includes('fold')) return 'scottish';
  if (s.includes('calico')) return 'calico';
  if (s.includes('black') || s.includes('bombay') || s.includes('bagheera')) return 'blackcat';
  return 'shiba';
}
