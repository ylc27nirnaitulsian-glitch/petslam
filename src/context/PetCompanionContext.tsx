import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CompanionPet,
  PetSpecies,
  PetCategory,
  PetStage,
  PetMood,
  BerryItem,
  BERRIES,
  WildPetEncounter,
  PetAuctionItem,
  PetStats,
  MarketActivityEvent,
  BidHistoryEntry,
} from '../types/pet';
import { sound } from '../utils/audio';

const STORAGE_KEY = 'petslam_active_companion_v3';
const KENNEL_STORAGE_KEY = 'petslam_kennel_pets_v3';
const OVERLAY_STORAGE_KEY = 'petslam_pet_overlay_active';
const AUCTIONS_STORAGE_KEY = 'petslam_pet_auctions_v3';

export const SPECIES_CONFIG: Record<
  PetSpecies,
  {
    name: string;
    title: string;
    category: PetCategory;
    baseStats: PetStats;
    buff: {
      name: string;
      description: string;
      effectType: 'elixir_rate' | 'crit_chance' | 'damage_shield';
      potency: number;
    };
  }
> = {
  // --- DOGS ---
  germanshepherd: {
    name: 'Kaiser',
    title: 'Tactical Vanguard',
    category: 'dog',
    baseStats: { attack: 54, defense: 52, agility: 58, stamina: 64, cp: 440 },
    buff: {
      name: 'Tactical Clamp',
      description: '+15% Damage Shield & Disarm',
      effectType: 'damage_shield',
      potency: 15,
    },
  },
  rottweiler: {
    name: 'Vulkan',
    title: 'Crushing Enforcer',
    category: 'dog',
    baseStats: { attack: 62, defense: 64, agility: 42, stamina: 70, cp: 460 },
    buff: {
      name: 'Bone Crusher',
      description: '+18% Heavy Strike Stun Impact',
      effectType: 'crit_chance',
      potency: 18,
    },
  },
  shiba: {
    name: 'Hachi',
    title: 'The Loyal Shiba',
    category: 'dog',
    baseStats: { attack: 48, defense: 45, agility: 56, stamina: 52, cp: 380 },
    buff: {
      name: 'Doge Spirit',
      description: '+12% Speed & Elixir generation boost',
      effectType: 'elixir_rate',
      potency: 12,
    },
  },
  retriever: {
    name: 'Buddy',
    title: 'Golden Champion',
    category: 'dog',
    baseStats: { attack: 44, defense: 58, agility: 42, stamina: 68, cp: 410 },
    buff: {
      name: 'Loyal Guardian',
      description: '+15% Damage Shield in Arena Battles',
      effectType: 'damage_shield',
      potency: 15,
    },
  },
  husky: {
    name: 'Ghost',
    title: 'Arctic Howler',
    category: 'dog',
    baseStats: { attack: 56, defense: 42, agility: 62, stamina: 54, cp: 440 },
    buff: {
      name: 'Blizzard Sprint',
      description: '+14% Critical strike chance',
      effectType: 'crit_chance',
      potency: 14,
    },
  },
  bulldog: {
    name: 'Rocky',
    title: 'Iron Frenchie',
    category: 'dog',
    baseStats: { attack: 52, defense: 64, agility: 34, stamina: 65, cp: 390 },
    buff: {
      name: 'Bulldog Tenacity',
      description: '+18% Battle Damage Reduction',
      effectType: 'damage_shield',
      potency: 18,
    },
  },
  doberman: {
    name: 'Titan',
    title: 'Apex Pinscher',
    category: 'dog',
    baseStats: { attack: 64, defense: 50, agility: 60, stamina: 60, cp: 470 },
    buff: {
      name: 'Apex Intercept',
      description: '+16% High-Impact Bleed Damage',
      effectType: 'crit_chance',
      potency: 16,
    },
  },
  corgi: {
    name: 'Biscuit',
    title: 'Welsh Grappler',
    category: 'dog',
    baseStats: { attack: 42, defense: 50, agility: 58, stamina: 55, cp: 370 },
    buff: {
      name: 'Low Stance',
      description: '+10% Extra Elixir & Evasion',
      effectType: 'elixir_rate',
      potency: 10,
    },
  },

  // --- CATS ---
  bengal: {
    name: 'Leonidas',
    title: 'Bengal Leopard',
    category: 'cat',
    baseStats: { attack: 66, defense: 40, agility: 74, stamina: 48, cp: 485 },
    buff: {
      name: 'Predatory Pounce',
      description: '+20% Critical Leap Damage',
      effectType: 'crit_chance',
      potency: 20,
    },
  },
  mainecoon: {
    name: 'Thor',
    title: 'Giant Maine Coon',
    category: 'cat',
    baseStats: { attack: 58, defense: 62, agility: 44, stamina: 72, cp: 465 },
    buff: {
      name: 'Titan Paw',
      description: '+16% Knockback & Shield Absorption',
      effectType: 'damage_shield',
      potency: 16,
    },
  },
  tabby: {
    name: 'Ginger',
    title: 'Orange Tabby Prowler',
    category: 'cat',
    baseStats: { attack: 54, defense: 38, agility: 66, stamina: 44, cp: 395 },
    buff: {
      name: 'Feline Reflexes',
      description: '+15% Critical strike multiplier',
      effectType: 'crit_chance',
      potency: 15,
    },
  },
  calico: {
    name: 'Luna',
    title: 'Lucky Calico',
    category: 'cat',
    baseStats: { attack: 46, defense: 52, agility: 58, stamina: 58, cp: 405 },
    buff: {
      name: 'Calico Fortune',
      description: '+10% Extra Elixir & 10% Defense Shield',
      effectType: 'elixir_rate',
      potency: 10,
    },
  },
  siamese: {
    name: 'Mochi',
    title: 'Sapphire Aristocrat',
    category: 'cat',
    baseStats: { attack: 58, defense: 36, agility: 70, stamina: 42, cp: 430 },
    buff: {
      name: 'Royal Pounce',
      description: '+16% High-Impact Strike Chance',
      effectType: 'crit_chance',
      potency: 16,
    },
  },
  blackcat: {
    name: 'Midnight',
    title: 'Shadow Whiskers',
    category: 'cat',
    baseStats: { attack: 62, defense: 35, agility: 68, stamina: 45, cp: 450 },
    buff: {
      name: 'Night Stalker',
      description: '+18% Stealth Ambush Damage',
      effectType: 'crit_chance',
      potency: 18,
    },
  },
  british: {
    name: 'Winston',
    title: 'British Shorthair',
    category: 'cat',
    baseStats: { attack: 50, defense: 58, agility: 48, stamina: 62, cp: 420 },
    buff: {
      name: 'Stoic Bastion',
      description: '+15% Shield Retention',
      effectType: 'damage_shield',
      potency: 15,
    },
  },
  scottish: {
    name: 'Cleo',
    title: 'Scottish Fold',
    category: 'cat',
    baseStats: { attack: 48, defense: 46, agility: 62, stamina: 50, cp: 390 },
    buff: {
      name: 'Fold Feint',
      description: '+12% Evasion Rate',
      effectType: 'elixir_rate',
      potency: 12,
    },
  },

  // Backwards Compatibility Aliases
  kodiak: {
    name: 'Rocky',
    title: 'Iron Frenchie',
    category: 'dog',
    baseStats: { attack: 52, defense: 64, agility: 34, stamina: 65, cp: 390 },
    buff: {
      name: 'Bulldog Tenacity',
      description: '+18% Battle Damage Reduction',
      effectType: 'damage_shield',
      potency: 18,
    },
  },
  bagheera: {
    name: 'Midnight',
    title: 'Shadow Whiskers',
    category: 'cat',
    baseStats: { attack: 62, defense: 35, agility: 68, stamina: 45, cp: 450 },
    buff: {
      name: 'Night Stalker',
      description: '+18% Stealth Ambush Damage',
      effectType: 'crit_chance',
      potency: 18,
    },
  },
  ignis: {
    name: 'Vulkan',
    title: 'Crushing Enforcer',
    category: 'dog',
    baseStats: { attack: 62, defense: 64, agility: 42, stamina: 70, cp: 460 },
    buff: {
      name: 'Bone Crusher',
      description: '+18% Heavy Strike Stun Impact',
      effectType: 'crit_chance',
      potency: 18,
    },
  },
  sultan: {
    name: 'Kaiser',
    title: 'Tactical Vanguard',
    category: 'dog',
    baseStats: { attack: 54, defense: 52, agility: 58, stamina: 64, cp: 440 },
    buff: {
      name: 'Tactical Clamp',
      description: '+15% Damage Shield & Disarm',
      effectType: 'damage_shield',
      potency: 15,
    },
  },
};

export const createInitialPet = (species: PetSpecies = 'shiba'): CompanionPet => {
  const config = SPECIES_CONFIG[species] || SPECIES_CONFIG.shiba;
  return {
    id: `pet_${species}_${Date.now()}`,
    species,
    category: config.category,
    name: config.name,
    title: config.title,
    stage: 1, // Baby Cub / Kitten / Puppy
    level: 1,
    exp: 0,
    maxExp: 100,
    affectionHearts: 1, // Good Buddy
    affectionPoints: 25,
    hunger: 80,
    happiness: 90,
    energy: 95,
    mood: 'playful',
    stats: { ...config.baseStats },
    battleBuff: { ...config.buff },
    createdAt: Date.now(),
    lastFedAt: Date.now(),
    lastPettedAt: Date.now(),
    totalPats: 0,
    totalBerriesEaten: 0,
    caughtAt: 'Sanctuary Meadow',
  };
};

// Initial Wild Encounters for Pokemon GO system
const INITIAL_WILD_ENCOUNTERS: WildPetEncounter[] = [
  {
    id: 'wild_germanshepherd_01',
    species: 'germanshepherd',
    category: 'dog',
    name: 'Wild German Shepherd',
    title: 'Park Patrol Guard',
    cp: 580,
    level: 5,
    rarity: 'rare',
    baseCatchRate: 0.55,
    distanceMeters: 45,
    spawnTimeRemaining: 680,
    stats: { attack: 64, defense: 58, agility: 62, stamina: 68, cp: 580 },
  },
  {
    id: 'wild_bengal_02',
    species: 'bengal',
    category: 'cat',
    name: 'Wild Bengal Leopard',
    title: 'Rooftop Prowler',
    cp: 690,
    level: 7,
    rarity: 'epic',
    baseCatchRate: 0.42,
    distanceMeters: 85,
    spawnTimeRemaining: 510,
    stats: { attack: 76, defense: 44, agility: 82, stamina: 52, cp: 690 },
  },
  {
    id: 'wild_shiba_03',
    species: 'shiba',
    category: 'dog',
    name: 'Wild Shiba Inu',
    title: 'Playful Park Roamer',
    cp: 420,
    level: 3,
    rarity: 'common',
    baseCatchRate: 0.7,
    distanceMeters: 30,
    spawnTimeRemaining: 540,
    stats: { attack: 52, defense: 48, agility: 60, stamina: 55, cp: 420 },
  },
  {
    id: 'wild_calico_04',
    species: 'calico',
    category: 'cat',
    name: 'Wild Calico Cat',
    title: 'Sunbathing Stray',
    cp: 385,
    level: 2,
    rarity: 'common',
    baseCatchRate: 0.75,
    distanceMeters: 60,
    spawnTimeRemaining: 720,
    stats: { attack: 48, defense: 54, agility: 62, stamina: 58, cp: 385 },
  },
  {
    id: 'wild_husky_05',
    species: 'husky',
    category: 'dog',
    name: 'Wild Arctic Husky',
    title: 'Snow Trail Runner',
    cp: 620,
    level: 6,
    rarity: 'rare',
    baseCatchRate: 0.5,
    distanceMeters: 110,
    spawnTimeRemaining: 380,
    stats: { attack: 68, defense: 52, agility: 74, stamina: 65, cp: 620 },
  },
  {
    id: 'wild_siamese_06',
    species: 'siamese',
    category: 'cat',
    name: 'Wild Siamese Shadow',
    title: 'Alleyway Crit Master',
    cp: 540,
    level: 4,
    rarity: 'rare',
    baseCatchRate: 0.6,
    distanceMeters: 75,
    spawnTimeRemaining: 440,
    stats: { attack: 62, defense: 40, agility: 75, stamina: 46, cp: 540 },
  },
];

// Initial Auction Listings
const INITIAL_AUCTIONS: PetAuctionItem[] = [
  {
    id: 'auc_01',
    pet: {
      ...createInitialPet('tabby'),
      name: 'Tiger Claw',
      level: 5,
      stage: 2,
      stats: { attack: 68, defense: 48, agility: 78, stamina: 56, cp: 580 },
    },
    sellerName: 'TokyoBreeder99',
    isUserListing: false,
    currentBid: 1450,
    minNextBid: 1550,
    buyoutPrice: 2800,
    bidCount: 8,
    highestBidder: 'CyberWolf',
    endTime: Date.now() + 1000 * 60 * 45, // 45m left
    status: 'active',
    notes: 'Trained in agility. High critical strike claws!',
    bidHistory: [
      { id: 'b_01', bidder: 'CyberWolf', amount: 1450, timestamp: Date.now() - 1000 * 60 * 3, isUser: false },
      { id: 'b_02', bidder: 'ShadowRanger', amount: 1300, timestamp: Date.now() - 1000 * 60 * 12, isUser: false },
      { id: 'b_03', bidder: 'TokyoBreeder', amount: 1100, timestamp: Date.now() - 1000 * 60 * 25, isUser: false },
    ],
  },
  {
    id: 'auc_02',
    pet: {
      ...createInitialPet('bulldog'),
      name: 'Tank Rocky',
      level: 7,
      stage: 2,
      stats: { attack: 72, defense: 88, agility: 45, stamina: 82, cp: 650 },
    },
    sellerName: 'ParisKennel',
    isUserListing: false,
    currentBid: 2100,
    minNextBid: 2250,
    buyoutPrice: 4200,
    bidCount: 14,
    highestBidder: 'TitanTrainer',
    endTime: Date.now() + 1000 * 60 * 120, // 2h left
    status: 'active',
    notes: 'Max defense bulldog with Iron Shield perk.',
    bidHistory: [
      { id: 'b_04', bidder: 'TitanTrainer', amount: 2100, timestamp: Date.now() - 1000 * 60 * 6, isUser: false },
      { id: 'b_05', bidder: 'IronHound', amount: 1950, timestamp: Date.now() - 1000 * 60 * 18, isUser: false },
      { id: 'b_06', bidder: 'ApexTrainer', amount: 1800, timestamp: Date.now() - 1000 * 60 * 40, isUser: false },
    ],
  },
  {
    id: 'auc_03',
    pet: {
      ...createInitialPet('siamese'),
      name: 'Princess Sapphire',
      level: 10,
      stage: 3,
      stats: { attack: 88, defense: 56, agility: 95, stamina: 68, cp: 890 },
    },
    sellerName: 'ApexDynasty',
    isUserListing: false,
    currentBid: 5600,
    minNextBid: 5900,
    buyoutPrice: 9500,
    bidCount: 23,
    highestBidder: 'ShadowMaster',
    endTime: Date.now() + 1000 * 60 * 15, // 15m left (URGENT)
    status: 'active',
    notes: 'Flawless IVs and Royal Pounce aura. Apex tier.',
    bidHistory: [
      { id: 'b_07', bidder: 'ShadowMaster', amount: 5600, timestamp: Date.now() - 1000 * 60 * 2, isUser: false },
      { id: 'b_08', bidder: 'NeoSamurai', amount: 5200, timestamp: Date.now() - 1000 * 60 * 7, isUser: false },
      { id: 'b_09', bidder: 'CyberWolf', amount: 4800, timestamp: Date.now() - 1000 * 60 * 19, isUser: false },
    ],
  },
  {
    id: 'auc_04',
    pet: {
      ...createInitialPet('husky'),
      name: 'Blizzard Ghost',
      level: 6,
      stage: 2,
      stats: { attack: 68, defense: 54, agility: 76, stamina: 64, cp: 630 },
    },
    sellerName: 'NordicKennel',
    isUserListing: false,
    currentBid: 1800,
    minNextBid: 1950,
    buyoutPrice: 3400,
    bidCount: 9,
    highestBidder: 'FrostBite',
    endTime: Date.now() + 1000 * 60 * 65, // 1h 5m left
    status: 'active',
    notes: 'Arctic scout with high speed blitz trait.',
    bidHistory: [
      { id: 'b_10', bidder: 'FrostBite', amount: 1800, timestamp: Date.now() - 1000 * 60 * 5, isUser: false },
      { id: 'b_11', bidder: 'MountainRider', amount: 1650, timestamp: Date.now() - 1000 * 60 * 20, isUser: false },
    ],
  },
  {
    id: 'auc_05',
    pet: {
      ...createInitialPet('bagheera'),
      name: 'Shadow Bagheera',
      level: 8,
      stage: 2,
      stats: { attack: 78, defense: 50, agility: 84, stamina: 58, cp: 760 },
    },
    sellerName: 'JungleGuild',
    isUserListing: false,
    currentBid: 3200,
    minNextBid: 3450,
    buyoutPrice: 5800,
    bidCount: 16,
    highestBidder: 'NightWalker',
    endTime: Date.now() + 1000 * 60 * 180, // 3h left
    status: 'active',
    notes: 'Mythic panther with stealth critical ambush buff.',
    bidHistory: [
      { id: 'b_12', bidder: 'NightWalker', amount: 3200, timestamp: Date.now() - 1000 * 60 * 8, isUser: false },
      { id: 'b_13', bidder: 'ShadowBlade', amount: 2900, timestamp: Date.now() - 1000 * 60 * 35, isUser: false },
    ],
  },
];

// Initial Live Market Activity Feed
const INITIAL_MARKET_FEED: MarketActivityEvent[] = [
  {
    id: 'feed_1',
    type: 'bid',
    petName: 'Princess Sapphire',
    species: 'siamese',
    actor: 'ShadowMaster',
    amount: 5600,
    timestamp: Date.now() - 1000 * 60 * 2,
    description: '@ShadowMaster placed a bid of 5,600 🪙 on Princess Sapphire!',
  },
  {
    id: 'feed_2',
    type: 'bid',
    petName: 'Tiger Claw',
    species: 'tabby',
    actor: 'CyberWolf',
    amount: 1450,
    timestamp: Date.now() - 1000 * 60 * 3,
    description: '@CyberWolf bid 1,450 🪙 on Tiger Claw (Tabby)!',
  },
  {
    id: 'feed_3',
    type: 'buyout',
    petName: 'Hachi Jr.',
    species: 'shiba',
    actor: 'ApexTrainer',
    amount: 3200,
    timestamp: Date.now() - 1000 * 60 * 11,
    description: '@ApexTrainer executed Instant Buyout on Hachi Jr. (3,200 🪙)!',
  },
  {
    id: 'feed_4',
    type: 'listing',
    petName: 'Blizzard Ghost',
    species: 'husky',
    actor: 'NordicKennel',
    amount: 1800,
    timestamp: Date.now() - 1000 * 60 * 18,
    description: '@NordicKennel listed Blizzard Ghost for auction (Starting: 1,800 🪙)!',
  },
  {
    id: 'feed_5',
    type: 'bid',
    petName: 'Tank Rocky',
    species: 'bulldog',
    actor: 'TitanTrainer',
    amount: 2100,
    timestamp: Date.now() - 1000 * 60 * 24,
    description: '@TitanTrainer bid 2,100 🪙 on Tank Rocky!',
  },
];

interface PetCompanionContextType {
  pet: CompanionPet;
  kennelPets: CompanionPet[];
  isOverlayActive: boolean;
  setOverlayActive: (active: boolean) => void;
  toggleOverlay: () => void;
  feedPet: (berry: BerryItem) => { success: boolean; message: string };
  strokePet: () => { heartsEarned: number; leveledUpHeart: boolean };
  trainPet: (attribute: 'attack' | 'defense' | 'agility') => { success: boolean; expGained: number };
  playFetch: () => void;
  evolvePet: () => { success: boolean; newStage: PetStage };
  switchSpecies: (species: PetSpecies) => void;
  switchActivePet: (petId: string) => void;
  renamePet: (name: string) => void;
  resetPet: () => void;
  availableBerries: BerryItem[];

  // Pokemon GO Wild Catch System
  wildEncounters: WildPetEncounter[];
  activeEncounter: WildPetEncounter | null;
  startEncounter: (encounter: WildPetEncounter) => void;
  exitEncounter: () => void;
  catchWildPet: (
    encounter: WildPetEncounter,
    ballBonus: number,
    usedBerry?: BerryItem
  ) => { outcome: 'caught' | 'broke_free' | 'fled'; caughtPet?: CompanionPet };
  refreshWildSpawns: () => void;

  // Pet Auction House & Marketplace
  auctions: PetAuctionItem[];
  marketFeedEvents: MarketActivityEvent[];
  placeAuctionBid: (auctionId: string, bidAmount: number) => { success: boolean; message: string };
  buyoutAuction: (auctionId: string) => { success: boolean; message: string; boughtPet?: CompanionPet };
  listPetForAuction: (
    petId: string,
    startingBid: number,
    buyoutPrice: number,
    hours: number,
    notes?: string
  ) => { success: boolean; message: string };
  cancelUserAuction: (auctionId: string) => { success: boolean; message: string };
  addCustomAvatarPet: (newPet: CompanionPet) => void;
  addKennelPet: (newPet: CompanionPet) => void;
}

const PetCompanionContext = createContext<PetCompanionContextType | null>(null);

export const PetCompanionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Kennel of all owned pets
  const [kennelPets, setKennelPets] = useState<CompanionPet[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(KENNEL_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Could not parse kennel data:', err);
      }
    }
    // Default kennel with Shiba Inu starter
    return [createInitialPet('shiba'), createInitialPet('tabby')];
  });

  // 2. Active buddy pet
  const [pet, setPet] = useState<CompanionPet>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Could not parse saved pet data:', err);
      }
    }
    return kennelPets[0] || createInitialPet('shiba');
  });

  // 3. Desktop overlay active
  const [isOverlayActive, setIsOverlayActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(OVERLAY_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    }
    return true;
  });

  // 4. Wild Encounters
  const [wildEncounters, setWildEncounters] = useState<WildPetEncounter[]>(INITIAL_WILD_ENCOUNTERS);
  const [activeEncounter, setActiveEncounter] = useState<WildPetEncounter | null>(null);

  // 5. Auctions
  const [auctions, setAuctions] = useState<PetAuctionItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AUCTIONS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_AUCTIONS;
  });

  // 6. Live Market Activity Feed
  const [marketFeedEvents, setMarketFeedEvents] = useState<MarketActivityEvent[]>(INITIAL_MARKET_FEED);

  // Background Simulated Community Bidding & Market Activity Feed
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions((prev) => {
        const activeAuctions = prev.filter((a) => a.status === 'active' && !a.isUserListing);
        if (activeAuctions.length === 0) return prev;

        const target = activeAuctions[Math.floor(Math.random() * activeAuctions.length)];
        const communityTrainers = [
          'Valkyrie99',
          'NeonClaw',
          'DojoMaster',
          'CyberWolf',
          'HyperBeast',
          'SolarisTrainer',
          'ApexSamurai',
          'TokyoRider',
        ];
        const randomTrainer = communityTrainers[Math.floor(Math.random() * communityTrainers.length)];
        if (target.highestBidder === `@${randomTrainer}`) return prev;

        const step = Math.max(100, Math.round(target.currentBid * 0.08));
        const newBid = target.currentBid + step;
        if (newBid >= target.buyoutPrice) return prev;

        const newEntry: BidHistoryEntry = {
          id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          bidder: `@${randomTrainer}`,
          amount: newBid,
          timestamp: Date.now(),
          isUser: false,
        };

        const newFeedEvent: MarketActivityEvent = {
          id: `feed_${Date.now()}`,
          type: 'bid',
          petName: target.pet.name,
          species: target.pet.species,
          actor: randomTrainer,
          amount: newBid,
          timestamp: Date.now(),
          description: `@${randomTrainer} placed a bid of ${newBid.toLocaleString()} 🪙 on ${target.pet.name}!`,
        };

        setMarketFeedEvents((f) => [newFeedEvent, ...f.slice(0, 29)]);

        return prev.map((a) =>
          a.id === target.id
            ? {
                ...a,
                currentBid: newBid,
                minNextBid: newBid + Math.round(newBid * 0.08),
                bidCount: a.bidCount + 1,
                highestBidder: `@${randomTrainer}`,
                bidHistory: [newEntry, ...(a.bidHistory || [])],
              }
            : a
        );
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Save pet to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    } catch (e) {
      console.warn('Failed to save pet', e);
    }
  }, [pet]);

  // Save kennel to storage
  useEffect(() => {
    try {
      localStorage.setItem(KENNEL_STORAGE_KEY, JSON.stringify(kennelPets));
    } catch (e) {
      console.warn('Failed to save kennel', e);
    }
  }, [kennelPets]);

  // Save overlay to storage
  useEffect(() => {
    try {
      localStorage.setItem(OVERLAY_STORAGE_KEY, String(isOverlayActive));
    } catch (e) {
      console.warn('Failed to save overlay', e);
    }
  }, [isOverlayActive]);

  // Save auctions to storage
  useEffect(() => {
    try {
      localStorage.setItem(AUCTIONS_STORAGE_KEY, JSON.stringify(auctions));
    } catch (e) {
      console.warn('Failed to save auctions', e);
    }
  }, [auctions]);

  // Passive decay & mood clock
  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prev) => {
        const newHunger = Math.max(0, prev.hunger - 1);
        let newMood: PetMood = prev.mood;

        if (newHunger <= 20) {
          newMood = 'hungry';
        } else if (prev.energy <= 20) {
          newMood = 'sleepy';
        } else if (prev.happiness >= 75) {
          newMood = 'happy';
        } else {
          newMood = 'playful';
        }

        const updated = {
          ...prev,
          hunger: newHunger,
          mood: newMood,
        };

        // Sync in kennel
        setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
        return updated;
      });
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const toggleOverlay = useCallback(() => {
    sound.playClick();
    setIsOverlayActive((prev) => !prev);
  }, []);

  const setOverlayActive = useCallback((active: boolean) => {
    setIsOverlayActive(active);
  }, []);

  // Feeding action
  const feedPet = useCallback((berry: BerryItem) => {
    sound.playEat();
    let leveledUp = false;

    setPet((prev) => {
      const newHunger = Math.min(100, prev.hunger + berry.hungerRestore);
      const newHappiness = Math.min(100, prev.happiness + berry.happinessRestore);
      let newExp = prev.exp + berry.expReward;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.round(newMaxExp * 1.35);
        leveledUp = true;
      }

      let newAffectionPoints = prev.affectionPoints + 15;
      let newAffectionHearts = prev.affectionHearts;
      if (newAffectionPoints >= 100 && newAffectionHearts < 4) {
        newAffectionPoints -= 100;
        newAffectionHearts = Math.min(4, newAffectionHearts + 1);
      }

      const updated: CompanionPet = {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        exp: newExp,
        level: newLevel,
        maxExp: newMaxExp,
        affectionHearts: newAffectionHearts,
        affectionPoints: newAffectionPoints,
        mood: 'happy',
        lastFedAt: Date.now(),
        totalBerriesEaten: prev.totalBerriesEaten + 1,
      };

      setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });

    if (leveledUp) {
      sound.playLevelUp();
    }

    return {
      success: true,
      message: `${pet.name} loved the ${berry.name}! +${berry.hungerRestore} Hunger, +${berry.expReward} EXP`,
    };
  }, [pet.name]);

  // Tactile Petting / Stroking action
  const strokePet = useCallback(() => {
    if (['tabby', 'calico', 'siamese', 'blackcat', 'bagheera'].includes(pet.species)) {
      sound.playPurr();
    } else {
      sound.playBark();
    }

    let leveledUpHeart = false;
    const earned = 4;

    setPet((prev) => {
      const newHappiness = Math.min(100, prev.happiness + 6);
      let newAffectionPoints = prev.affectionPoints + earned;
      let newAffectionHearts = prev.affectionHearts;

      if (newAffectionPoints >= 100 && newAffectionHearts < 4) {
        newAffectionPoints -= 100;
        newAffectionHearts = (newAffectionHearts + 1) as 1 | 2 | 3 | 4;
        leveledUpHeart = true;
      }

      const updated: CompanionPet = {
        ...prev,
        happiness: newHappiness,
        affectionPoints: newAffectionPoints,
        affectionHearts: newAffectionHearts,
        mood: 'happy',
        lastPettedAt: Date.now(),
        totalPats: prev.totalPats + 1,
      };

      setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });

    if (leveledUpHeart) {
      sound.playVictory();
    }

    return {
      heartsEarned: earned,
      leveledUpHeart,
    };
  }, [pet.species]);

  // Gym training
  const trainPet = useCallback((attribute: 'attack' | 'defense' | 'agility') => {
    sound.playAttack();
    const expGained = 40;

    setPet((prev) => {
      const newStats = { ...prev.stats };
      newStats[attribute] += 2;
      newStats.cp += 15;

      let newExp = prev.exp + expGained;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.round(newMaxExp * 1.35);
      }

      const updated: CompanionPet = {
        ...prev,
        stats: newStats,
        exp: newExp,
        level: newLevel,
        maxExp: newMaxExp,
        energy: Math.max(0, prev.energy - 10),
        mood: 'battle_ready',
      };

      setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });

    return { success: true, expGained };
  }, []);

  // Play fetch
  const playFetch = useCallback(() => {
    sound.playClick();
    setPet((prev) => {
      const updated = {
        ...prev,
        happiness: Math.min(100, prev.happiness + 20),
        energy: Math.max(0, prev.energy - 15),
        mood: 'playful' as PetMood,
      };
      setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });
  }, []);

  // Evolve Pet
  const evolvePet = useCallback(() => {
    if (pet.stage >= 3) {
      return { success: false, newStage: pet.stage };
    }

    const nextStage = (pet.stage + 1) as PetStage;
    sound.playVictory();

    setPet((prev) => {
      const boostedStats = {
        attack: Math.round(prev.stats.attack * 1.4),
        defense: Math.round(prev.stats.defense * 1.4),
        agility: Math.round(prev.stats.agility * 1.35),
        stamina: Math.round(prev.stats.stamina * 1.5),
        cp: Math.round(prev.stats.cp * 1.55),
      };

      const boostedBuff = {
        ...prev.battleBuff,
        potency: prev.battleBuff.potency + 6,
      };

      const updated: CompanionPet = {
        ...prev,
        stage: nextStage,
        stats: boostedStats,
        battleBuff: boostedBuff,
        level: prev.level + 2,
        mood: 'battle_ready',
      };

      setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });

    return { success: true, newStage: nextStage };
  }, [pet.stage]);

  // Switch companion species
  const switchSpecies = useCallback((species: PetSpecies) => {
    sound.playClick();
    const newPet = createInitialPet(species);
    setPet(newPet);
    setKennelPets((prev) => {
      if (!prev.some((p) => p.species === species)) {
        return [newPet, ...prev];
      }
      return prev;
    });
  }, []);

  // Switch active pet by ID from kennel
  const switchActivePet = useCallback((petId: string) => {
    const target = kennelPets.find((p) => p.id === petId);
    if (target) {
      sound.playClick();
      setPet(target);
    }
  }, [kennelPets]);

  const renamePet = useCallback((name: string) => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    setPet((prev) => {
      const updated = { ...prev, name: cleanName };
      setKennelPets((kp) => kp.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });
  }, []);

  const resetPet = useCallback(() => {
    const refreshed = createInitialPet(pet.species);
    setPet(refreshed);
    setKennelPets((kp) => kp.map((p) => (p.id === pet.id ? refreshed : p)));
  }, [pet.id, pet.species]);

  // --- POKEMON GO WILD CATCH LOGIC ---
  const startEncounter = useCallback((encounter: WildPetEncounter) => {
    sound.playClick();
    setActiveEncounter(encounter);
  }, []);

  const exitEncounter = useCallback(() => {
    setActiveEncounter(null);
  }, []);

  const catchWildPet = useCallback(
    (
      encounter: WildPetEncounter,
      ballBonus: number, // 1.0 (Nice), 1.3 (Great), 1.7 (Excellent)
      usedBerry?: BerryItem
    ) => {
      const berryMultiplier = usedBerry?.catchBonus || 1.0;
      const finalCatchChance = Math.min(
        0.95,
        encounter.baseCatchRate * ballBonus * berryMultiplier
      );

      const roll = Math.random();

      if (roll <= finalCatchChance) {
        // Success! Caught the wild pet!
        sound.playPokeBallCatch();

        const config = SPECIES_CONFIG[encounter.species] || SPECIES_CONFIG.shiba;
        const newCaughtPet: CompanionPet = {
          id: `caught_${encounter.species}_${Date.now()}`,
          species: encounter.species,
          category: encounter.category,
          name: encounter.name.replace('Wild ', ''),
          title: encounter.title,
          stage: 1,
          level: encounter.level,
          exp: 0,
          maxExp: 100,
          affectionHearts: 1,
          affectionPoints: 10,
          hunger: 70,
          happiness: 85,
          energy: 90,
          mood: 'happy',
          stats: { ...encounter.stats },
          battleBuff: { ...config.buff },
          createdAt: Date.now(),
          lastFedAt: Date.now(),
          lastPettedAt: Date.now(),
          totalPats: 0,
          totalBerriesEaten: usedBerry ? 1 : 0,
          caughtAt: 'Wild Radar Encounter',
        };

        // Add to kennel collection
        setKennelPets((prev) => [newCaughtPet, ...prev]);

        // Remove from wild spawns
        setWildEncounters((prev) => prev.filter((e) => e.id !== encounter.id));
        setActiveEncounter(null);

        return { outcome: 'caught' as const, caughtPet: newCaughtPet };
      } else {
        // Broke free
        const fleeRoll = Math.random();
        if (fleeRoll < 0.25) {
          // Pet fled
          setWildEncounters((prev) => prev.filter((e) => e.id !== encounter.id));
          setActiveEncounter(null);
          return { outcome: 'fled' as const };
        } else {
          sound.playPokeBallShake();
          return { outcome: 'broke_free' as const };
        }
      }
    },
    []
  );

  const refreshWildSpawns = useCallback(() => {
    sound.playClick();
    const speciesPool: PetSpecies[] = [
      'shiba',
      'retriever',
      'husky',
      'bulldog',
      'tabby',
      'calico',
      'siamese',
      'blackcat',
    ];

    const newSpawns: WildPetEncounter[] = Array.from({ length: 4 }).map((_, idx) => {
      const sp = speciesPool[Math.floor(Math.random() * speciesPool.length)];
      const conf = SPECIES_CONFIG[sp];
      const lvl = Math.floor(Math.random() * 8) + 1;
      const cpVal = 250 + lvl * 55 + Math.floor(Math.random() * 60);
      const isRare = lvl > 5;

      return {
        id: `wild_${sp}_${Date.now()}_${idx}`,
        species: sp,
        category: conf.category,
        name: `Wild ${conf.name} the ${conf.category === 'cat' ? 'Cat' : 'Dog'}`,
        title: conf.title,
        cp: cpVal,
        level: lvl,
        rarity: isRare ? 'rare' : 'common',
        baseCatchRate: isRare ? 0.45 : 0.7,
        distanceMeters: Math.floor(Math.random() * 150) + 20,
        spawnTimeRemaining: 600 + Math.floor(Math.random() * 300),
        stats: {
          ...conf.baseStats,
          attack: conf.baseStats.attack + lvl * 3,
          defense: conf.baseStats.defense + lvl * 3,
          agility: conf.baseStats.agility + lvl * 3,
          stamina: conf.baseStats.stamina + lvl * 3,
          cp: cpVal,
        },
      };
    });

    setWildEncounters(newSpawns);
  }, []);

  // --- AUCTION HOUSE ACTIONS ---
  const placeAuctionBid = useCallback((auctionId: string, bidAmount: number) => {
    let success = false;
    let message = '';

    setAuctions((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        if (bidAmount < auc.minNextBid) {
          message = `Bid must be at least ${auc.minNextBid.toLocaleString()} Credits!`;
          return auc;
        }

        sound.playCoin();
        success = true;
        message = `Bid of ${bidAmount.toLocaleString()} Credits placed successfully for ${auc.pet.name}!`;

        const userBidEntry: BidHistoryEntry = {
          id: `bid_${Date.now()}`,
          bidder: 'You (Trainer)',
          amount: bidAmount,
          timestamp: Date.now(),
          isUser: true,
        };

        const feedEvt: MarketActivityEvent = {
          id: `feed_${Date.now()}`,
          type: 'bid',
          petName: auc.pet.name,
          species: auc.pet.species,
          actor: 'You',
          amount: bidAmount,
          timestamp: Date.now(),
          description: `You placed a bid of ${bidAmount.toLocaleString()} 🪙 on ${auc.pet.name}!`,
        };
        setMarketFeedEvents((f) => [feedEvt, ...f.slice(0, 29)]);

        return {
          ...auc,
          currentBid: bidAmount,
          minNextBid: bidAmount + Math.max(50, Math.round(bidAmount * 0.08)),
          bidCount: auc.bidCount + 1,
          highestBidder: 'You (Trainer)',
          bidHistory: [userBidEntry, ...(auc.bidHistory || [])],
        };
      })
    );

    return { success, message };
  }, []);

  const buyoutAuction = useCallback((auctionId: string) => {
    let success = false;
    let message = '';
    let boughtPet: CompanionPet | undefined;

    setAuctions((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        sound.playVictory();
        success = true;
        message = `Instantly bought out ${auc.pet.name}! Transferred to your Kennel.`;
        boughtPet = auc.pet;

        const buyoutEvt: MarketActivityEvent = {
          id: `feed_${Date.now()}`,
          type: 'buyout',
          petName: auc.pet.name,
          species: auc.pet.species,
          actor: 'You',
          amount: auc.buyoutPrice,
          timestamp: Date.now(),
          description: `You executed Instant Buyout on ${auc.pet.name} (${auc.buyoutPrice.toLocaleString()} 🪙)!`,
        };
        setMarketFeedEvents((f) => [buyoutEvt, ...f.slice(0, 29)]);

        // Add bought pet to kennel
        setKennelPets((kp) => [auc.pet, ...kp]);

        return {
          ...auc,
          status: 'sold',
          highestBidder: 'You (Buyout Winner)',
        };
      })
    );

    return { success, message, boughtPet };
  }, []);

  const listPetForAuction = useCallback(
    (petId: string, startingBid: number, buyoutPrice: number, hours: number, notes?: string) => {
      const targetPet = kennelPets.find((p) => p.id === petId);
      if (!targetPet) {
        return { success: false, message: 'Pet not found in your kennel.' };
      }

      if (kennelPets.length <= 1) {
        return { success: false, message: 'You cannot sell your only companion pet!' };
      }

      const newListing: PetAuctionItem = {
        id: `auc_user_${Date.now()}`,
        pet: targetPet,
        sellerName: 'You (Owner)',
        isUserListing: true,
        currentBid: startingBid,
        minNextBid: Math.round(startingBid * 1.1),
        buyoutPrice,
        bidCount: 0,
        highestBidder: 'None yet',
        endTime: Date.now() + 1000 * 60 * 60 * hours,
        status: 'active',
        notes: notes || `Caught wild ${targetPet.species} with CP ${targetPet.stats.cp}.`,
        bidHistory: [],
      };

      const listingEvt: MarketActivityEvent = {
        id: `feed_${Date.now()}`,
        type: 'listing',
        petName: targetPet.name,
        species: targetPet.species,
        actor: 'You',
        amount: startingBid,
        timestamp: Date.now(),
        description: `You listed ${targetPet.name} (${targetPet.title}) for auction!`,
      };
      setMarketFeedEvents((f) => [listingEvt, ...f.slice(0, 29)]);

      sound.playCoin();
      setAuctions((prev) => [newListing, ...prev]);

      // Remove from active kennel while on auction
      setKennelPets((prev) => prev.filter((p) => p.id !== petId));

      // If active pet was listed, switch active pet to another
      if (pet.id === petId) {
        const remaining = kennelPets.filter((p) => p.id !== petId);
        if (remaining.length > 0) {
          setPet(remaining[0]);
        }
      }

      return {
        success: true,
        message: `${targetPet.name} has been listed on the Pet Auction House!`,
      };
    },
    [kennelPets, pet.id]
  );

  const cancelUserAuction = useCallback(
    (auctionId: string) => {
      const target = auctions.find((a) => a.id === auctionId);
      if (!target || !target.isUserListing) {
        return { success: false, message: 'Cannot cancel this auction.' };
      }

      sound.playClick();
      // Return pet to kennel
      setKennelPets((prev) => [target.pet, ...prev]);
      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));

      return { success: true, message: `${target.pet.name} was returned to your kennel.` };
    },
    [auctions]
  );

  // Add custom photo avatar pet to kennel & set as active companion
  const addCustomAvatarPet = useCallback((newPet: CompanionPet) => {
    setKennelPets((prev) => {
      const filtered = prev.filter((p) => p.id !== newPet.id);
      const updated = [newPet, ...filtered];
      try {
        localStorage.setItem(KENNEL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setPet(newPet);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPet));
    } catch (err) {}

    sound.playLevelUp();
  }, []);

  return (
    <PetCompanionContext.Provider
      value={{
        pet,
        kennelPets,
        isOverlayActive,
        setOverlayActive,
        toggleOverlay,
        feedPet,
        strokePet,
        trainPet,
        playFetch,
        evolvePet,
        switchSpecies,
        switchActivePet,
        renamePet,
        resetPet,
        availableBerries: BERRIES,

        // Wild Catching
        wildEncounters,
        activeEncounter,
        startEncounter,
        exitEncounter,
        catchWildPet,
        refreshWildSpawns,

        // Auction House & Marketplace
        auctions,
        marketFeedEvents,
        placeAuctionBid,
        buyoutAuction,
        listPetForAuction,
        cancelUserAuction,
        addCustomAvatarPet,
        addKennelPet: addCustomAvatarPet,
      }}
    >
      {children}
    </PetCompanionContext.Provider>
  );
};

export const usePetCompanion = (): PetCompanionContextType => {
  const context = useContext(PetCompanionContext);
  if (!context) {
    throw new Error('usePetCompanion must be used within a PetCompanionProvider');
  }
  return context;
};
