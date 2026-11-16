import { Animal, ANIMALS_DATA } from '../data/animals';

export interface GhostDefenseSnapshot {
  playerTag: string;
  trainerName: string;
  pet: Animal;
  level: number;
  trophies: number;
  lastActive: string;
}

export interface OfflineDefenseReport {
  raidsDefended: number;
  raidsLost: number;
  trophiesGained: number;
  creditsGained: number;
  defendingPetName: string;
}

// Built-in realistic community ghost defense builds
const COMMUNITY_GHOST_SNAPSHOTS: GhostDefenseSnapshot[] = [
  {
    playerTag: '#SLAM-4921',
    trainerName: 'Trainer Valkyrie',
    pet: {
      ...ANIMALS_DATA[0], // German Shepherd
      name: 'Kaiser',
      level: 9,
      health: 1180,
      damage: 195,
      speed: 78,
    },
    level: 9,
    trophies: 1420,
    lastActive: '2h ago',
  },
  {
    playerTag: '#SLAM-8812',
    trainerName: 'Master Chen',
    pet: {
      ...ANIMALS_DATA[3], // Cat / Calico
      name: 'Mochi',
      level: 10,
      health: 960,
      damage: 245,
      speed: 98,
    },
    level: 10,
    trophies: 1680,
    lastActive: '45m ago',
  },
  {
    playerTag: '#SLAM-2309',
    trainerName: 'Marcus Blade',
    pet: {
      ...ANIMALS_DATA[2], // Rottweiler
      name: 'Buster',
      level: 8,
      health: 1220,
      damage: 210,
      speed: 68,
    },
    level: 8,
    trophies: 1350,
    lastActive: '5h ago',
  },
  {
    playerTag: '#SLAM-7734',
    trainerName: 'Sophia Zoom',
    pet: {
      ...ANIMALS_DATA[4] || ANIMALS_DATA[1], // Corgi
      name: 'Ein',
      level: 8,
      health: 1020,
      damage: 205,
      speed: 86,
    },
    level: 8,
    trophies: 1290,
    lastActive: '1d ago',
  },
  {
    playerTag: '#SLAM-1190',
    trainerName: 'Jax Apex',
    pet: {
      ...ANIMALS_DATA[1], // Lion / Beast
      name: 'Titan',
      level: 11,
      health: 1300,
      damage: 260,
      speed: 82,
    },
    level: 11,
    trophies: 1850,
    lastActive: '12m ago',
  },
];

class GhostDefenseService {
  private localKey = 'petslam_ghost_roster_v1';
  private lastCheckKey = 'petslam_last_defense_check_ts';

  // Save the player's current defense snapshot so others can challenge it
  public recordPlayerDefense(pet: Animal, trainerName: string, playerTag: string, trophies: number) {
    if (typeof window === 'undefined') return;
    try {
      const snap: GhostDefenseSnapshot = {
        playerTag,
        trainerName: trainerName || 'Trainer',
        pet,
        level: pet.level || 1,
        trophies,
        lastActive: 'Just now',
      };
      const existing = this.getCommunityGhosts();
      const updated = [snap, ...existing.filter((g) => g.playerTag !== playerTag)].slice(0, 15);
      localStorage.setItem(this.localKey, JSON.stringify(updated));
    } catch {}
  }

  // Get ghost roster for asynchronous matchmaking
  public getCommunityGhosts(): GhostDefenseSnapshot[] {
    if (typeof window === 'undefined') return COMMUNITY_GHOST_SNAPSHOTS;
    try {
      const saved = localStorage.getItem(this.localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return COMMUNITY_GHOST_SNAPSHOTS;
  }

  // Pick a realistic ghost opponent matching the player's trophy band
  public pickGhostOpponent(playerTrophies: number, excludeTag?: string): GhostDefenseSnapshot {
    const list = this.getCommunityGhosts().filter((g) => g.playerTag !== excludeTag);
    if (list.length === 0) return COMMUNITY_GHOST_SNAPSHOTS[0];

    // Score by closest trophies
    const sorted = [...list].sort(
      (a, b) => Math.abs(a.trophies - playerTrophies) - Math.abs(b.trophies - playerTrophies)
    );
    // Pick from top 3 closest
    const pickIdx = Math.floor(Math.random() * Math.min(3, sorted.length));
    return sorted[pickIdx];
  }

  // Check if player has offline defense rewards to claim
  public checkOfflineDefenseRewards(pet: Animal): OfflineDefenseReport | null {
    if (typeof window === 'undefined') return null;
    try {
      const now = Date.now();
      const lastCheck = Number(localStorage.getItem(this.lastCheckKey) || '0');
      localStorage.setItem(this.lastCheckKey, now.toString());

      // If first session ever or checked less than 15 minutes ago, don't trigger
      if (!lastCheck || now - lastCheck < 15 * 60 * 1000) {
        return null;
      }

      // Elapsed hours (capped at 24h)
      const elapsedHours = Math.min(24, (now - lastCheck) / (3600 * 1000));
      if (elapsedHours < 0.25) return null;

      // Simulate 1 to 4 raids based on elapsed time and pet level
      const totalRaids = Math.min(4, Math.max(1, Math.floor(elapsedHours * 0.4 + Math.random() * 1.5)));
      // Win rate based on pet stats
      const petPower = (pet.health || 1000) * 0.4 + (pet.damage || 150) * 1.2;
      const winChance = Math.min(0.85, Math.max(0.5, petPower / 1200));

      let won = 0;
      let lost = 0;
      for (let i = 0; i < totalRaids; i++) {
        if (Math.random() < winChance) won++;
        else lost++;
      }

      // If at least 1 defense succeeded
      if (won > 0) {
        return {
          raidsDefended: won,
          raidsLost: lost,
          trophiesGained: won * 15,
          creditsGained: won * 180,
          defendingPetName: pet.name,
        };
      }
    } catch {}
    return null;
  }
}

export const ghostDefenseService = new GhostDefenseService();
