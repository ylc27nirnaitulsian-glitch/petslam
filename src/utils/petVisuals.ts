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
