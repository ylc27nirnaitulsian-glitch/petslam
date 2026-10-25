import React, { createContext, useContext, useState, useEffect } from 'react';
import { Animal, ANIMALS_DATA } from '../data/animals';
import { GearItem, GEAR_ITEMS } from '../data/armory';
import { sound } from '../utils/audio';

export interface MatchHistoryEntry {
  id: string;
  timestamp: number;
  beastName: string;
  opponentName: string;
  result: 'VICTORY' | 'DEFEAT';
  rounds: number;
  creditsEarned: number;
  trophiesChange: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  rewardCredits: number;
  claimed: boolean;
  progress: number;
  target: number;
}

export interface EquippedGear {
  collar?: GearItem;
  armor?: GearItem;
  paws?: GearItem;
  serum?: GearItem;
}

export interface ConnectedAccountData {
  isLoggedIn: boolean;
  provider: 'Google' | 'Apple' | 'Guest' | string;
  email: string;
  name?: string;
  avatarUrl?: string;
  sub?: string;
  lastSyncedAt?: string;
}

interface GameContextType {
  // Wallet & Profile
  trainerName: string;
  setTrainerName: (name: string) => void;
  playerTag: string;
  connectedAccount: ConnectedAccountData;
  loginAccount: (provider: string, email?: string, name?: string, avatarUrl?: string, sub?: string) => void;
  logoutAccount: () => void;
  credits: number;
  addCredits: (amount: number) => void;
  energy: number;
  maxEnergy: number;
  trophies: number;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  wins: number;
  losses: number;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Beasts & 4-Pet Squad Battle Deck
  ownedBeasts: Animal[];
  activeBeast: Animal;
  activeBeastId: string;
  selectActiveBeast: (id: string) => void;
  battleDeckIds: string[];
  setBattleDeckIds: (ids: string[]) => void;
  setDeckSlot: (slotIndex: number, beastId: string) => void;
  trainBeast: (beastId: string, trainingType: 'nutrition' | 'agility' | 'biteForce') => { success: boolean; message: string; leveledUp?: boolean };
  buyBeast: (beast: Animal) => boolean;

  // Custom Pet Champion Registration
  registerCustomFighter: (fighter: Animal) => void;

  // VIP Monetization Passes
  hasAuctionPass: boolean;
  hasAvatarStudioPass: boolean;
  hasExtensionPass: boolean;
  unlockPass: (passType: 'auction' | 'avatar' | 'extension' | 'bundle', useCredits?: boolean) => { success: boolean; message: string };

  // Armory
  equippedGear: EquippedGear;
  inventoryGear: GearItem[];
  buyGear: (item: GearItem) => boolean;
  equipGear: (item: GearItem) => void;
  unequipGear: (slot: 'collar' | 'armor' | 'paws' | 'serum') => void;

  // Combat Outcomes
  recordMatchResult: (won: boolean, opponent: Animal, rounds: number) => { creditsEarned: number; trophiesChange: number; leveledUp?: boolean };
  matchHistory: MatchHistoryEntry[];

  // Achievements
  achievements: Achievement[];
  claimAchievement: (id: string) => void;

  // Utilities
  refillEnergy: () => boolean;
  resetProgress: () => void;
  getEffectiveStats: (beast: Animal) => {
    strength: number;
    speed: number;
    endurance: number;
    agility: number;
    biteForce: number;
    armor: number;
  };
}

const STORAGE_KEY = 'petslam_v2_gamestate';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_blood',
    title: 'First Arena Blood',
    desc: 'Win your first real-time championship combat bout.',
    rewardCredits: 3000,
    claimed: false,
    progress: 1,
    target: 1,
  },
  {
    id: 'ach_apex_trainer',
    title: 'Conditioning Specialist',
    desc: 'Complete 5 training sessions across nutrition or agility.',
    rewardCredits: 4500,
    claimed: false,
    progress: 2,
    target: 5,
  },
  {
    id: 'ach_high_roller',
    title: 'Apex Collector',
    desc: 'Acquire at least 3 distinct animal species in your kennel.',
    rewardCredits: 8000,
    claimed: false,
    progress: 3,
    target: 3,
  },
  {
    id: 'ach_gear_master',
    title: 'Tactical Outfitter',
    desc: 'Equip your active beast with collar, harness, and paw claws.',
    rewardCredits: 5000,
    claimed: false,
    progress: 2,
    target: 3,
  },
  {
    id: 'ach_grandmaster',
    title: 'Championship Contender',
    desc: 'Reach 1,500 MMR trophy rating in the Arena.',
    rewardCredits: 12000,
    claimed: false,
    progress: 1240,
    target: 1500,
  },
];

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Starter dogs and cats
  const defaultOwnedBeasts: Animal[] = [
    { ...ANIMALS_DATA[0], level: 12 }, // Kaiser (German Shepherd)
    { ...ANIMALS_DATA[8], level: 13 }, // Leonidas (Bengal Cat)
    { ...ANIMALS_DATA[3], level: 11 }, // Ghost (Siberian Husky)
    { ...ANIMALS_DATA[10], level: 11 }, // Mochi (Siamese Cat)
    { ...ANIMALS_DATA[1], level: 12 }, // Vulkan (Rottweiler)
    { ...ANIMALS_DATA[11], level: 10 }, // Ginger (Orange Tabby)
  ];

  const [trainerName, setTrainerName] = useState<string>('Nirn');
  const [playerTag] = useState<string>('#SLAM-7749');
  const [connectedAccount, setConnectedAccount] = useState<ConnectedAccountData>(() => {
    try {
      const savedAuth = localStorage.getItem('petslam_auth_account');
      if (savedAuth) return JSON.parse(savedAuth);
    } catch {}
    return { isLoggedIn: false, provider: 'Guest', email: '' };
  });

  const loginAccount = (
    provider: string,
    email?: string,
    name?: string,
    avatarUrl?: string,
    sub?: string
  ) => {
    const acc: ConnectedAccountData = {
      isLoggedIn: true,
      provider,
      email: email || `${provider.toLowerCase().replace(/\s+/g, '')}.user@petslam.net`,
      name: name || trainerName,
      avatarUrl: avatarUrl || (provider === 'Google' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' : undefined),
      sub: sub || `usr_${Date.now()}`,
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConnectedAccount(acc);
    if (name) setTrainerName(name);
    try {
      localStorage.setItem('petslam_auth_account', JSON.stringify(acc));
    } catch {}
  };

  const logoutAccount = () => {
    const acc: ConnectedAccountData = { isLoggedIn: false, provider: 'Guest', email: '' };
    setConnectedAccount(acc);
    try {
      localStorage.removeItem('petslam_auth_account');
    } catch {}
  };

  const [credits, setCredits] = useState<number>(24500);
  const addCredits = (amount: number) => {
    setCredits((prev) => Math.max(0, prev + amount));
  };
  const [energy, setEnergy] = useState<number>(85);
  const maxEnergy = 100;
  const [trophies, setTrophies] = useState<number>(1240);
  const [playerLevel, setPlayerLevel] = useState<number>(14);
  const [playerExp, setPlayerExp] = useState<number>(450);
  const playerMaxExp = 1000;
  const [wins, setWins] = useState<number>(18);
  const [losses, setLosses] = useState<number>(4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [ownedBeasts, setOwnedBeasts] = useState<Animal[]>(defaultOwnedBeasts);
  const [activeBeastId, setActiveBeastId] = useState<string>('dog_01');
  const [battleDeckIds, setBattleDeckIds] = useState<string[]>([
    'dog_01', // Kaiser (German Shepherd) - Slot 1 (Lead Vanguard)
    'cat_01', // Leonidas (Bengal Cat) - Slot 2 (Agile Striker)
    'dog_04', // Ghost (Husky) - Slot 3 (Speed Blitz)
    'cat_03', // Mochi (Siamese) - Slot 4 (Shadow Assassin)
  ]);

  const setDeckSlot = (slotIndex: number, beastId: string) => {
    sound.playClick();
    setBattleDeckIds((prev) => {
      const copy = [...prev];
      copy[slotIndex] = beastId;
      return copy;
    });
  };

  const [hasAuctionPass, setHasAuctionPass] = useState<boolean>(() => {
    try {
      return localStorage.getItem('petslam_pass_auction') === 'true';
    } catch {
      return false;
    }
  });

  const [hasAvatarStudioPass, setHasAvatarStudioPass] = useState<boolean>(() => {
    try {
      return localStorage.getItem('petslam_pass_avatar') === 'true';
    } catch {
      return false;
    }
  });

  const [hasExtensionPass, setHasExtensionPass] = useState<boolean>(() => {
    try {
      return localStorage.getItem('petslam_pass_extension') === 'true';
    } catch {
      return false;
    }
  });

  const unlockPass = (passType: 'auction' | 'avatar' | 'extension' | 'bundle', useCredits = false) => {
    const creditPrices: Record<string, number> = {
      auction: 1500, // Reduced to $1.99 / 1,500 credits
      avatar: 1000,
      extension: 1500,
      bundle: 3500,
    };

    if (useCredits) {
      const price = creditPrices[passType] || 2500;
      if (credits < price) {
        sound.playClick();
        return { success: false, message: `Need ${price.toLocaleString()} Credits to unlock this pass!` };
      }
      setCredits((prev) => prev - price);
    }

    sound.playLevelUp();

    if (passType === 'auction' || passType === 'bundle') {
      setHasAuctionPass(true);
      try { localStorage.setItem('petslam_pass_auction', 'true'); } catch {}
    }
    if (passType === 'avatar' || passType === 'bundle') {
      setHasAvatarStudioPass(true);
      try { localStorage.setItem('petslam_pass_avatar', 'true'); } catch {}
    }
    if (passType === 'extension' || passType === 'bundle') {
      setHasExtensionPass(true);
      try { localStorage.setItem('petslam_pass_extension', 'true'); } catch {}
    }

    return {
      success: true,
      message: passType === 'bundle' ? 'All-Access Genesis VIP Bundle Activated!' : `${passType.toUpperCase()} VIP Pass Activated!`,
    };
  };

  const registerCustomFighter = (fighter: Animal) => {
    setOwnedBeasts((prev) => {
      const idx = prev.findIndex((b) => b.id === fighter.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fighter;
        return copy;
      }
      return [fighter, ...prev];
    });

    setActiveBeastId(fighter.id);

    setBattleDeckIds((prev) => {
      const filtered = prev.filter((id) => id !== fighter.id);
      return [fighter.id, ...filtered.slice(0, 3)];
    });

    sound.playVictory();
  };

  const [equippedGear, setEquippedGear] = useState<EquippedGear>({
    collar: GEAR_ITEMS[0], // Titanium Spike Collar
    armor: GEAR_ITEMS[3],  // Kevlar Ballistic Harness
  });

  const [inventoryGear, setInventoryGear] = useState<GearItem[]>([
    GEAR_ITEMS[1], // Carbon Micro-Sensor Collar
    GEAR_ITEMS[6], // Agility Traction Claws
    GEAR_ITEMS[8], // Adrenaline Bio-Stim
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([
    {
      id: 'match_01',
      timestamp: Date.now() - 3600000 * 2,
      beastName: 'Kaiser',
      opponentName: 'Vulkan (Alex)',
      result: 'VICTORY',
      rounds: 3,
      creditsEarned: 1800,
      trophiesChange: +32,
    },
    {
      id: 'match_02',
      timestamp: Date.now() - 3600000 * 5,
      beastName: 'Fenrir',
      opponentName: 'Sultan (Devon)',
      result: 'VICTORY',
      rounds: 4,
      creditsEarned: 2400,
      trophiesChange: +45,
    },
    {
      id: 'match_03',
      timestamp: Date.now() - 3600000 * 12,
      beastName: 'Kaiser',
      opponentName: 'Khan (Soren)',
      result: 'DEFEAT',
      rounds: 2,
      creditsEarned: 400,
      trophiesChange: -18,
    },
  ]);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.credits !== undefined) setCredits(parsed.credits);
        if (parsed.energy !== undefined) setEnergy(parsed.energy);
        if (parsed.trophies !== undefined) setTrophies(parsed.trophies);
        if (parsed.trainerName) setTrainerName(parsed.trainerName);
        if (parsed.playerLevel) setPlayerLevel(parsed.playerLevel);
        if (parsed.playerExp !== undefined) setPlayerExp(parsed.playerExp);
        if (parsed.wins !== undefined) setWins(parsed.wins);
        if (parsed.losses !== undefined) setLosses(parsed.losses);
        if (parsed.activeBeastId) setActiveBeastId(parsed.activeBeastId);
        if (parsed.battleDeckIds && Array.isArray(parsed.battleDeckIds) && parsed.battleDeckIds.length === 4) {
          setBattleDeckIds(parsed.battleDeckIds);
        }
        if (parsed.ownedBeasts && parsed.ownedBeasts.length > 0) setOwnedBeasts(parsed.ownedBeasts);
        if (parsed.equippedGear) setEquippedGear(parsed.equippedGear);
        if (parsed.inventoryGear) setInventoryGear(parsed.inventoryGear);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.matchHistory) setMatchHistory(parsed.matchHistory);
      }
    } catch {
      // Local storage read fallback
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      const state = {
        credits,
        energy,
        trophies,
        trainerName,
        playerLevel,
        playerExp,
        wins,
        losses,
        activeBeastId,
        battleDeckIds,
        ownedBeasts,
        equippedGear,
        inventoryGear,
        achievements,
        matchHistory,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [
    credits,
    energy,
    trophies,
    trainerName,
    playerLevel,
    playerExp,
    wins,
    losses,
    activeBeastId,
    battleDeckIds,
    ownedBeasts,
    equippedGear,
    inventoryGear,
    achievements,
    matchHistory,
  ]);

  // Sound sync
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const activeBeast = ownedBeasts.find((b) => b.id === activeBeastId) || ownedBeasts[0];

  const selectActiveBeast = (id: string) => {
    sound.playClick();
    setActiveBeastId(id);
  };

  const getEffectiveStats = (beast: Animal) => {
    let strength = beast.strength;
    let speed = beast.speed;
    let endurance = beast.endurance;
    let agility = beast.agility;
    let biteForce = beast.biteForce || Math.round(beast.strength * 3.5);
    let armor = 0;

    Object.values(equippedGear).forEach((gear) => {
      if (!gear) return;
      if (gear.statBonus.strength) strength += gear.statBonus.strength;
      if (gear.statBonus.speed) speed += gear.statBonus.speed;
      if (gear.statBonus.endurance) endurance += gear.statBonus.endurance;
      if (gear.statBonus.agility) agility += gear.statBonus.agility;
      if (gear.statBonus.biteForce) biteForce += gear.statBonus.biteForce;
      if (gear.statBonus.armor) armor += gear.statBonus.armor;
    });

    return { strength, speed, endurance, agility, biteForce, armor };
  };

  const trainBeast = (beastId: string, type: 'nutrition' | 'agility' | 'biteForce') => {
    const energyCost = 15;
    const creditCost = 800;

    if (energy < energyCost) {
      return { success: false, message: 'Insufficient energy! Refill or await recovery.' };
    }
    if (credits < creditCost) {
      return { success: false, message: 'Insufficient credits! Win arena bouts to earn credits.' };
    }

    setEnergy((prev) => Math.max(0, prev - energyCost));
    setCredits((prev) => prev - creditCost);

    let leveledUp = false;
    let statMessage = '';

    setOwnedBeasts((prev) =>
      prev.map((b) => {
        if (b.id !== beastId) return b;

        const updated = { ...b };
        if (type === 'nutrition') {
          updated.endurance = Math.min(100, updated.endurance + 2);
          statMessage = '+2 Endurance & Vitality conditioning!';
        } else if (type === 'agility') {
          updated.agility = Math.min(100, updated.agility + 2);
          updated.speed = Math.min(100, updated.speed + 1);
          statMessage = '+2 Agility & +1 Sprint reaction!';
        } else if (type === 'biteForce') {
          updated.strength = Math.min(100, updated.strength + 2);
          updated.biteForce = (updated.biteForce || 200) + 15;
          statMessage = '+2 Strength & +15 PSI Bite Force!';
        }

        // Random chance or threshold to level up beast
        if (Math.random() > 0.4) {
          updated.level += 1;
          leveledUp = true;
        }
        return updated;
      })
    );

    if (leveledUp) {
      sound.playLevelUp();
      // Update achievements
      setAchievements((prev) =>
        prev.map((ach) =>
          ach.id === 'ach_apex_trainer' ? { ...ach, progress: Math.min(ach.target, ach.progress + 1) } : ach
        )
      );
      return { success: true, message: `${statMessage} Beast advanced to Level ${activeBeast.level + 1}!`, leveledUp: true };
    } else {
      sound.playClick();
      return { success: true, message: statMessage, leveledUp: false };
    }
  };

  const buyBeast = (beast: Animal) => {
    if (credits < beast.currentPriceCredits) {
      return false;
    }
    setCredits((prev) => prev - beast.currentPriceCredits);
    const newBeast: Animal = {
      ...beast,
      id: `beast_${Date.now()}`,
      acquisitionStatus: 'Reserved',
    };
    setOwnedBeasts((prev) => [...prev, newBeast]);
    setActiveBeastId(newBeast.id);
    sound.playVictory();

    // Update achievement
    setAchievements((prev) =>
      prev.map((ach) =>
        ach.id === 'ach_high_roller' ? { ...ach, progress: Math.min(ach.target, prev.length + 1) } : ach
      )
    );
    return true;
  };

  const buyGear = (item: GearItem) => {
    if (credits < item.price) return false;
    setCredits((prev) => prev - item.price);
    setInventoryGear((prev) => [...prev, item]);
    sound.playClick();
    return true;
  };

  const equipGear = (item: GearItem) => {
    sound.playClick();
    // If something was already equipped in that slot, put it back in inventory
    const existing = equippedGear[item.slot];
    setEquippedGear((prev) => ({
      ...prev,
      [item.slot]: item,
    }));
    setInventoryGear((prev) => {
      const filtered = prev.filter((g) => g.id !== item.id);
      return existing ? [...filtered, existing] : filtered;
    });

    // Check gear master achievement
    const count = Object.values({ ...equippedGear, [item.slot]: item }).filter(Boolean).length;
    setAchievements((prev) =>
      prev.map((ach) =>
        ach.id === 'ach_gear_master' ? { ...ach, progress: Math.min(ach.target, count) } : ach
      )
    );
  };

  const unequipGear = (slot: 'collar' | 'armor' | 'paws' | 'serum') => {
    const item = equippedGear[slot];
    if (!item) return;
    sound.playClick();
    setEquippedGear((prev) => {
      const copy = { ...prev };
      delete copy[slot];
      return copy;
    });
    setInventoryGear((prev) => [...prev, item]);
  };

  const recordMatchResult = (won: boolean, opponent: Animal, rounds: number) => {
    const rewardCredits = won ? Math.floor(1800 + Math.random() * 800) : 400;
    const trophiesChange = won ? +35 : -15;
    const expGained = won ? 250 : 80;

    setCredits((prev) => prev + rewardCredits);
    setTrophies((prev) => Math.max(0, prev + trophiesChange));
    if (won) {
      setWins((prev) => prev + 1);
      sound.playVictory();
    } else {
      setLosses((prev) => prev + 1);
    }

    let leveledUp = false;
    setPlayerExp((prev) => {
      const total = prev + expGained;
      if (total >= playerMaxExp) {
        setPlayerLevel((lvl) => lvl + 1);
        leveledUp = true;
        sound.playLevelUp();
        return total - playerMaxExp;
      }
      return total;
    });

    const entry: MatchHistoryEntry = {
      id: `match_${Date.now()}`,
      timestamp: Date.now(),
      beastName: activeBeast.name,
      opponentName: opponent.name,
      result: won ? 'VICTORY' : 'DEFEAT',
      rounds,
      creditsEarned: rewardCredits,
      trophiesChange,
    };

    setMatchHistory((prev) => [entry, ...prev.slice(0, 19)]);

    // Check First Blood achievement
    if (won) {
      setAchievements((prev) =>
        prev.map((ach) =>
          ach.id === 'ach_first_blood' ? { ...ach, progress: 1 } : ach
        )
      );
    }

    return { creditsEarned: rewardCredits, trophiesChange, leveledUp };
  };

  const claimAchievement = (id: string) => {
    const target = achievements.find((a) => a.id === id);
    if (!target || target.claimed || target.progress < target.target) return;
    sound.playVictory();
    setCredits((prev) => prev + target.rewardCredits);
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, claimed: true } : a))
    );
  };

  const refillEnergy = () => {
    const cost = 1200;
    if (credits < cost || energy >= maxEnergy) return false;
    sound.playClick();
    setCredits((prev) => prev - cost);
    setEnergy(maxEnergy);
    return true;
  };

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <GameContext.Provider
      value={{
        trainerName,
        setTrainerName,
        playerTag,
        connectedAccount,
        loginAccount,
        logoutAccount,
        credits,
        addCredits,
        energy,
        maxEnergy,
        trophies,
        playerLevel,
        playerExp,
        playerMaxExp,
        wins,
        losses,
        soundEnabled,
        toggleSound,
        ownedBeasts,
        activeBeast,
        activeBeastId,
        selectActiveBeast,
        battleDeckIds,
        setBattleDeckIds,
        setDeckSlot,
        trainBeast,
        buyBeast,
        equippedGear,
        inventoryGear,
        buyGear,
        equipGear,
        unequipGear,
        recordMatchResult,
        matchHistory,
        achievements,
        claimAchievement,
        refillEnergy,
        resetProgress,
        getEffectiveStats,
        hasAuctionPass,
        hasAvatarStudioPass,
        hasExtensionPass,
        unlockPass,
        registerCustomFighter,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
