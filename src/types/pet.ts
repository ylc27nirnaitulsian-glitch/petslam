export type PetSpecies =
  // Cat Breeds
  | 'bengal'
  | 'mainecoon'
  | 'siamese'
  | 'tabby'
  | 'british'
  | 'scottish'
  | 'calico'
  | 'blackcat'
  // Dog Breeds
  | 'germanshepherd'
  | 'rottweiler'
  | 'retriever'
  | 'husky'
  | 'bulldog'
  | 'shiba'
  | 'doberman'
  | 'corgi'
  // Backwards Compatibility Aliases
  | 'kodiak'
  | 'bagheera'
  | 'ignis'
  | 'sultan';

export type PetCategory = 'cat' | 'dog';

export type PetStage = 1 | 2 | 3; // 1 = Baby Kitten/Puppy, 2 = Prime, 3 = Champion Titan

export type PetMood = 'happy' | 'playful' | 'hungry' | 'sleepy' | 'battle_ready' | 'excited' | 'dizzy';

export type PetAnimationState =
  | 'idle'
  | 'walk'
  | 'pet'
  | 'eat'
  | 'sleep'
  | 'celebrate'
  | 'fetch'
  | 'drag'
  | 'talk'       // Voice mimic lip-sync
  | 'dizzy'      // Poke head dizzy
  | 'laugh'      // Tickle belly laugh
  | 'drink_milk' // Hydration / milk bowl
  | 'bath'       // Soap bubbles & wash
  | 'fart';      // Funny cartoon prank

export interface PetStats {
  attack: number;
  defense: number;
  agility: number;
  stamina: number;
  cp: number; // Combat Power (Pokemon GO style)
}

export interface PetBattleBuff {
  name: string;
  description: string;
  effectType: 'elixir_rate' | 'crit_chance' | 'damage_shield';
  potency: number; // e.g. 10 for +10%
}

export interface PetCustomPalette {
  primary: string;    // Main body fur
  secondary: string;  // Markings, patches, outer ear
  belly: string;      // Chest and belly patch
  ear: string;        // Inner ear
  eye: string;        // Iris color
  nose: string;       // Nose / muzzle
}

export interface PetCustomFeatures {
  isCat?: boolean;
  earType?: 'pointed' | 'floppy' | 'round';
  hasWhiskers?: boolean;
  eyePatch?: boolean;
  collarColor?: string;
  fluffyTail?: boolean;
  hat?: 'crown' | 'party' | 'detective' | 'none';
  glasses?: 'shades' | 'vr' | 'none';
  signatureMove?: {
    name: string;
    description: string;
  };
}

export interface CompanionPet {
  id: string;
  species: PetSpecies;
  category: PetCategory;
  name: string;
  title: string;
  stage: PetStage;
  level: number;
  exp: number;
  maxExp: number;
  affectionHearts: number; // 0 to 4 (Good, Great, Ultra, Best Buddy)
  affectionPoints: number; // 0 to 100 towards next heart
  hunger: number; // 0 (starving) to 100 (full)
  happiness: number; // 0 to 100
  energy: number; // 0 to 100
  mood: PetMood;
  stats: PetStats;
  battleBuff: PetBattleBuff;
  createdAt: number;
  lastFedAt: number;
  lastPettedAt: number;
  totalPats: number;
  totalBerriesEaten: number;
  caughtAt?: string; // Location or "Wild Encounter" or "Photo Studio"
  isFavorite?: boolean;
  // Custom Photo Avatar Attributes
  customPalette?: PetCustomPalette;
  customFeatures?: PetCustomFeatures;
  avatarImageUrl?: string; // Uploaded pet photo
  breedName?: string; // Real-world detected breed
  personalityTraits?: string[]; // Custom personality tags
  quirk?: string; // Cute unique quirk
  isCustomAvatar?: boolean;
}

export interface BerryItem {
  id: string;
  name: string;
  color: string;
  hungerRestore: number;
  happinessRestore: number;
  expReward: number;
  icon: string;
  description: string;
  catchBonus?: number; // Catch rate boost for wild encounters
}

export const BERRIES: BerryItem[] = [
  {
    id: 'razz_berry',
    name: 'Razz Berry',
    color: '#EF4444',
    hungerRestore: 30,
    happinessRestore: 15,
    expReward: 20,
    catchBonus: 1.5,
    icon: '🍓',
    description: 'Crisp and sweet. Calms wild pets & boosts catch chance by 1.5x.',
  },
  {
    id: 'nanab_berry',
    name: 'Nanab Berry',
    color: '#F59E0B',
    hungerRestore: 20,
    happinessRestore: 40,
    expReward: 25,
    catchBonus: 1.25,
    icon: '🍌',
    description: 'Soothing calming fruit. Stops wild pets from dodging and jumping.',
  },
  {
    id: 'pinap_berry',
    name: 'Pinap Berry',
    color: '#10B981',
    hungerRestore: 25,
    happinessRestore: 20,
    expReward: 50,
    catchBonus: 1.0,
    icon: '🍍',
    description: 'Tropical power fruit. Doubles EXP and coin bounty when caught!',
  },
  {
    id: 'golden_berry',
    name: 'Golden Slam Berry',
    color: '#CCFF00',
    hungerRestore: 100,
    happinessRestore: 100,
    expReward: 120,
    catchBonus: 2.5,
    icon: '⭐',
    description: 'Legendary radiant fruit. Guarantees near-instant catch and max happiness!',
  },
];

// Pokemon GO Wild Encounter definitions
export interface WildPetEncounter {
  id: string;
  species: PetSpecies;
  category: PetCategory;
  name: string;
  title: string;
  cp: number;
  level: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseCatchRate: number; // e.g. 0.65
  distanceMeters: number;
  spawnTimeRemaining: number; // in seconds
  stats: PetStats;
}

export interface BidHistoryEntry {
  id: string;
  bidder: string;
  amount: number;
  timestamp: number;
  isUser: boolean;
}

export interface MarketActivityEvent {
  id: string;
  type: 'bid' | 'buyout' | 'listing' | 'won';
  petName: string;
  species: PetSpecies;
  actor: string;
  amount: number;
  timestamp: number;
  description: string;
}

// Pet Auction House definitions
export interface PetAuctionItem {
  id: string;
  pet: CompanionPet;
  sellerName: string;
  isUserListing: boolean;
  currentBid: number;
  minNextBid: number;
  buyoutPrice: number;
  bidCount: number;
  highestBidder: string;
  endTime: number; // timestamp
  status: 'active' | 'sold' | 'expired';
  notes?: string;
  bidHistory?: BidHistoryEntry[];
}

