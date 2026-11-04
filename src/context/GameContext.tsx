import React, { createContext, useContext, useState, useEffect } from 'react';
import { Animal, ANIMALS_DATA } from '../data/animals';
import { GearItem, GEAR_ITEMS } from '../data/armory';
import { sound } from '../utils/audio';
import { trackClarityEvent, setClarityTag } from '../utils/clarity';
import { supabase } from '../services/supabaseClient';
import { verifyDodoPaymentSession } from '../services/dodo';

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
  setPlayerTag: (tag: string) => void;
  connectedAccount: ConnectedAccountData;
  loginAccount: (provider: string, email?: string, name?: string, avatarUrl?: string, sub?: string) => void;
  logoutAccount: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
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

  // Software & Extension Licenses (The only 2 payments: $1.00 AI Studio & $1.99 Extension)
  hasAvatarStudioPass: boolean;
  hasExtensionPass: boolean;
  unlockPass: (passType: 'avatar' | 'extension', useCredits?: boolean) => { success: boolean; message: string };

  // Slam Royal Pass (100% Free Season Progression)
  passPoints: number;
  addPassPoints: (amount: number, reason?: string) => void;
  royalPassTier: number;
  claimedRoyalPassTiers: Record<number, boolean>;
  claimRoyalPassTier: (tier: number, creditReward: number) => boolean;

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

const STORAGE_KEY = 'petslam_v3_gamestate';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_blood',
    title: 'First Arena Blood',
    desc: 'Win your first real-time championship combat bout.',
    rewardCredits: 400,
    claimed: false,
    progress: 0,
    target: 1,
  },
  {
    id: 'ach_apex_trainer',
    title: 'Conditioning Specialist',
    desc: 'Complete 5 training sessions across nutrition or agility.',
    rewardCredits: 500,
    claimed: false,
    progress: 0,
    target: 5,
  },
  {
    id: 'ach_high_roller',
    title: 'Apex Collector',
    desc: 'Acquire at least 3 distinct animal species in your kennel.',
    rewardCredits: 800,
    claimed: false,
    progress: 1, // Has 1 starter companion (Kaiser)
    target: 3,
  },
  {
    id: 'ach_gear_master',
    title: 'Tactical Outfitter',
    desc: 'Equip your active beast with collar, harness, and paw claws.',
    rewardCredits: 600,
    claimed: false,
    progress: 0,
    target: 3,
  },
  {
    id: 'ach_grandmaster',
    title: 'Championship Contender',
    desc: 'Reach 1,000 MMR trophy rating in the Arena.',
    rewardCredits: 1500,
    claimed: false,
    progress: 0,
    target: 1000,
  },
];

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Starter companion: Kaiser (German Shepherd) Level 1
  const defaultOwnedBeasts: Animal[] = [
    { ...ANIMALS_DATA[0], level: 1 },
  ];

  const [trainerName, setTrainerName] = useState<string>('Trainer');
  const [playerTag, setPlayerTagState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('petslam_player_tag');
      if (saved && saved.startsWith('#SLAM-') && saved !== '#SLAM-7749') {
        return saved;
      }
      // Generate a unique persistent player ID (e.g. #SLAM-4821)
      const uniqueCode = `#SLAM-${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        localStorage.setItem('petslam_player_tag', uniqueCode);
      } catch {}
      return uniqueCode;
    } catch {
      return `#SLAM-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  });

  const setPlayerTag = (newTag: string) => {
    const clean = newTag.trim().toUpperCase();
    const formatted = clean.startsWith('#') ? clean : `#${clean}`;
    setPlayerTagState(formatted);
    try {
      localStorage.setItem('petslam_player_tag', formatted);
    } catch {}
  };
  const [connectedAccount, setConnectedAccount] = useState<ConnectedAccountData>(() => {
    try {
      const savedAuth = localStorage.getItem('petslam_auth_account');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.provider === 'Apple') {
          parsed.provider = 'Google';
          try { localStorage.setItem('petslam_auth_account', JSON.stringify(parsed)); } catch {}
        }
        return parsed;
      }
    } catch {}
    return { isLoggedIn: false, provider: 'Guest', email: '' };
  });

  const updateUserAvatar = (avatarUrl: string) => {
    setConnectedAccount((prev) => {
      const next: ConnectedAccountData = {
        ...prev,
        isLoggedIn: true,
        avatarUrl,
        provider: prev.provider === 'Apple' ? 'Google' : prev.provider,
      };
      try {
        localStorage.setItem('petslam_auth_account', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

    // Derive deterministic unique player tag for registered user
    if (sub || email) {
      const seed = `${sub || ''}_${email || ''}`;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      const uniqueNum = Math.abs(hash % 9000) + 1000;
      const userTag = `#SLAM-${uniqueNum}`;
      setPlayerTag(userTag);
    }

    // CORE-6: Sync profile progression from Supabase if authenticated
    if (supabase && sub) {
      supabase
        .from('profiles')
        .select('credits, trophies, player_level, trainer_name, player_tag')
        .eq('id', sub)
        .single()
        .then(
          ({ data, error }) => {
            if (data && !error) {
              if (data.credits !== undefined && data.credits !== null) {
                setCredits((prev) => Math.max(prev, Number(data.credits)));
              }
              if (data.trophies !== undefined && data.trophies !== null) {
                setTrophies((prev) => Math.max(prev, Number(data.trophies)));
              }
              if (data.player_level !== undefined && data.player_level !== null) {
                setPlayerLevel((prev) => Math.max(prev, Number(data.player_level)));
              }
              if ((data as any).trainer_name) {
                setTrainerName((data as any).trainer_name);
              }
              if ((data as any).player_tag) {
                setPlayerTag((data as any).player_tag);
              }
            }
          },
          () => {}
        );
    }
  };

  const logoutAccount = () => {
    const acc: ConnectedAccountData = { isLoggedIn: false, provider: 'Guest', email: '' };
    setConnectedAccount(acc);
    const guestTag = `#SLAM-${Math.floor(1000 + Math.random() * 9000)}`;
    setPlayerTag(guestTag);
    try {
      localStorage.removeItem('petslam_auth_account');
      localStorage.removeItem('petslam_has_entered_game');
    } catch {}
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  // Sync Supabase Auth State (OAuth Redirect & Session Restoration)
  useEffect(() => {
    if (!supabase) return;

    // Check active session on initial page mount (e.g. returning from Google OAuth)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const gName =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.user_metadata?.username ||
          u.email?.split('@')[0] ||
          'Trainer';
        const gAvatar = u.user_metadata?.avatar_url || u.user_metadata?.picture;
        loginAccount('Google', u.email, gName, gAvatar, u.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const gName =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.user_metadata?.username ||
          u.email?.split('@')[0] ||
          'Trainer';
        const gAvatar = u.user_metadata?.avatar_url || u.user_metadata?.picture;
        loginAccount('Google', u.email, gName, gAvatar, u.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [credits, setCredits] = useState<number>(1200);
  const addCredits = (amount: number) => {
    setCredits((prev) => Math.max(0, prev + amount));
  };
  const [energy, setEnergy] = useState<number>(100);
  const maxEnergy = 100;
  const [trophies, setTrophies] = useState<number>(0);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [playerExp, setPlayerExp] = useState<number>(0);
  const playerMaxExp = 1000;
  const [wins, setWins] = useState<number>(0);
  const [losses, setLosses] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [ownedBeasts, setOwnedBeasts] = useState<Animal[]>(defaultOwnedBeasts);
  const [activeBeastId, setActiveBeastId] = useState<string>('dog_01');
  const [battleDeckIds, setBattleDeckIds] = useState<string[]>(['dog_01']);

  // Slam Royal Pass (100% Free Progression Track)
  const [passPoints, setPassPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('petslam_royal_pass_points');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [claimedRoyalPassTiers, setClaimedRoyalPassTiers] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('petslam_royal_pass_claimed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const royalPassTier = Math.min(50, Math.max(1, 1 + Math.floor(passPoints / 100)));

  const addPassPoints = (amount: number, _reason?: string) => {
    setPassPoints((prev) => {
      const next = prev + amount;
      try { localStorage.setItem('petslam_royal_pass_points', String(next)); } catch {}
      return next;
    });
  };

  const claimRoyalPassTier = (tier: number, creditReward: number) => {
    if (tier > royalPassTier || claimedRoyalPassTiers[tier]) return false;
    sound.playVictory();
    addCredits(creditReward);
    setClaimedRoyalPassTiers((prev) => {
      const next = { ...prev, [tier]: true };
      try { localStorage.setItem('petslam_royal_pass_claimed', JSON.stringify(next)); } catch {}
      return next;
    });
    return true;
  };

  // Cross-system reactive pass points listener (e.g. sanctuary pet feeding)
  useEffect(() => {
    const handleEarnPassPoints = (e: any) => {
      if (e.detail?.amount) {
        addPassPoints(Number(e.detail.amount), e.detail.reason);
      }
    };
    window.addEventListener('petslam:earn-pass-points', handleEarnPassPoints);
    return () => window.removeEventListener('petslam:earn-pass-points', handleEarnPassPoints);
  }, []);

  const setDeckSlot = (slotIndex: number, beastId: string) => {
    sound.playClick();
    setBattleDeckIds((prev) => {
      const copy = [...prev];
      copy[slotIndex] = beastId;
      return copy;
    });
  };

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

  const unlockPass = (passType: 'avatar' | 'extension', _useCredits = false) => {
    sound.playLevelUp();

    if (passType === 'avatar') {
      setHasAvatarStudioPass(true);
      try { localStorage.setItem('petslam_pass_avatar', 'true'); } catch {}
    }
    if (passType === 'extension') {
      setHasExtensionPass(true);
      try { localStorage.setItem('petslam_pass_extension', 'true'); } catch {}
    }

    return {
      success: true,
      message: passType === 'avatar' ? 'AI Pet Studio Pass Activated!' : 'Desktop Companion License Activated!',
    };
  };

  // PAY-1 & PAY-3: Secure Payment Verification Listener
  // Never unlock passes based on URL params alone. Only grant upon verified server confirmation.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id') || urlParams.get('sessionId');
      const pass = urlParams.get('pass');

      // Clean query params from address bar immediately to prevent tampering
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);

      if (sessionId && pass) {
        verifyDodoPaymentSession(sessionId).then((result) => {
          if (result.verified) {
            const confirmedPass = (result.passType || pass) as any;
            unlockPass(confirmedPass, false);
            trackClarityEvent(`dodo_payment_verified_${confirmedPass}`);
            setClarityTag('license_' + confirmedPass, 'active');
            sound.playVictory();
          } else {
            console.warn('[GameContext] Payment verification failed or pending:', result.error);
          }
        }).catch((e) => {
          console.warn('[GameContext] Failed to contact payment verification endpoint:', e);
        });
      }
    } catch (e) {
      console.warn('[GameContext] Error handling payment return:', e);
    }
  }, []);

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

  const [equippedGear, setEquippedGear] = useState<EquippedGear>({});

  const [inventoryGear, setInventoryGear] = useState<GearItem[]>([]);

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);

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
        const validAnimalIds = new Set(ANIMALS_DATA.map((a) => a.id));
        if (parsed.battleDeckIds && Array.isArray(parsed.battleDeckIds) && parsed.battleDeckIds.length >= 1) {
          const cleanDeck = parsed.battleDeckIds.filter((id: string) => validAnimalIds.has(id));
          setBattleDeckIds(cleanDeck.length > 0 ? cleanDeck : ['dog_01']);
        }
        if (parsed.ownedBeasts && parsed.ownedBeasts.length > 0) {
          const cleanOwned = parsed.ownedBeasts.map((b: Animal, i: number) => {
            const matched = ANIMALS_DATA.find((a) => a.id === b.id);
            if (matched) return { ...matched, level: b.level || 1 };
            return { ...ANIMALS_DATA[i % ANIMALS_DATA.length], level: b.level || 1 };
          });
          setOwnedBeasts(cleanOwned);
        }
        if (parsed.equippedGear) setEquippedGear(parsed.equippedGear);
        if (parsed.inventoryGear) setInventoryGear(parsed.inventoryGear);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.matchHistory) setMatchHistory(parsed.matchHistory);
        if (parsed.passPoints !== undefined) setPassPoints(parsed.passPoints);
        if (parsed.claimedRoyalPassTiers) setClaimedRoyalPassTiers(parsed.claimedRoyalPassTiers);
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
        passPoints,
        claimedRoyalPassTiers,
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
    passPoints,
    claimedRoyalPassTiers,
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
    const creditCost = 400; // Accessible early-game training

    if (energy < energyCost) {
      return { success: false, message: 'Insufficient energy! Refill or await recovery.' };
    }
    if (credits < creditCost) {
      return { success: false, message: 'Insufficient credits! Win arena bouts to earn credits.' };
    }

    setEnergy((prev) => Math.max(0, prev - energyCost));
    setCredits((prev) => prev - creditCost);

    // Earning Royal Pass points from companion training
    addPassPoints(50, 'Companion Conditioning');

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
    const rewardCredits = won ? Math.floor(650 + Math.random() * 350) : 150;
    const trophiesChange = won ? +35 : -15;
    const expGained = won ? 250 : 80;

    // Slam Royal Pass points progression (+100 win, +40 bout completed)
    const passPointsGained = won ? 100 : 40;
    addPassPoints(passPointsGained, won ? 'Arena Victory' : 'Arena Bout');

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
    const cost = 300;
    if (credits < cost || energy >= maxEnergy) return false;
    sound.playClick();
    setCredits((prev) => prev - cost);
    setEnergy(maxEnergy);
    return true;
  };

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('petslam_royal_pass_points');
    localStorage.removeItem('petslam_royal_pass_claimed');
    window.location.reload();
  };

  return (
    <GameContext.Provider
      value={{
        trainerName,
        setTrainerName,
        playerTag,
        setPlayerTag,
        connectedAccount,
        loginAccount,
        logoutAccount,
        updateUserAvatar,
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
        hasAvatarStudioPass,
        hasExtensionPass,
        unlockPass,
        registerCustomFighter,
        passPoints,
        addPassPoints,
        royalPassTier,
        claimedRoyalPassTiers,
        claimRoyalPassTier,
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
