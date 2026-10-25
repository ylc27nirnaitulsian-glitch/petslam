export interface GearItem {
  id: string;
  name: string;
  slot: 'collar' | 'armor' | 'paws' | 'serum';
  rarity: 'Common' | 'Vanguard' | 'Alpha' | 'Apex' | 'Legendary';
  price: number;
  statBonus: {
    strength?: number;
    speed?: number;
    endurance?: number;
    agility?: number;
    biteForce?: number;
    armor?: number;
  };
  description: string;
  iconName: string;
}

export const GEAR_ITEMS: GearItem[] = [
  {
    id: 'gear_collar_01',
    name: 'Titanium Spike Collar',
    slot: 'collar',
    rarity: 'Vanguard',
    price: 4500,
    statBonus: { strength: 12, biteForce: 35 },
    description: 'Reinforced titanium alloy ring. Shields jugular while providing forward kinetic balance for snapping bites.',
    iconName: 'Shield',
  },
  {
    id: 'gear_collar_02',
    name: 'Carbon Micro-Sensor Collar',
    slot: 'collar',
    rarity: 'Alpha',
    price: 6800,
    statBonus: { agility: 16, speed: 10 },
    description: 'Biometric telemetry collar that reads opponent muscle twitch milliseconds before strikes land.',
    iconName: 'Activity',
  },
  {
    id: 'gear_collar_03',
    name: 'Apex Sovereign Gold Choker',
    slot: 'collar',
    rarity: 'Legendary',
    price: 16000,
    statBonus: { strength: 22, endurance: 18, biteForce: 50 },
    description: 'Forged from hardened electroplated alloys. Intimidates rival beasts upon eye contact.',
    iconName: 'Crown',
  },
  {
    id: 'gear_armor_01',
    name: 'Kevlar Ballistic Harness',
    slot: 'armor',
    rarity: 'Vanguard',
    price: 5200,
    statBonus: { endurance: 22, armor: 25 },
    description: 'Layered ballistic aramid fibers absorbing blunt force impacts and rake trauma.',
    iconName: 'ShieldAlert',
  },
  {
    id: 'gear_armor_02',
    name: 'Carbon-Fiber Tactical Exo-Vest',
    slot: 'armor',
    rarity: 'Apex',
    price: 11500,
    statBonus: { endurance: 30, armor: 35, speed: 8 },
    description: 'Ultra-lightweight aerospace weave providing high impact dispersion with zero weight drag.',
    iconName: 'Layers',
  },
  {
    id: 'gear_armor_03',
    name: 'Graphene Heavy Juggernaut Plating',
    slot: 'armor',
    rarity: 'Legendary',
    price: 18500,
    statBonus: { endurance: 45, armor: 50, strength: 15 },
    description: 'Military-grade monolithic shielding. Absorbs crushing bites from apex carnivores.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'gear_paws_01',
    name: 'Agility Traction Claws',
    slot: 'paws',
    rarity: 'Common',
    price: 2800,
    statBonus: { agility: 14, speed: 8 },
    description: 'Micro-textured synthetic pads ensuring instantaneous grip on slick arena carbon.',
    iconName: 'Zap',
  },
  {
    id: 'gear_paws_02',
    name: 'Vibro-Kinetic Paw Sleeves',
    slot: 'paws',
    rarity: 'Alpha',
    price: 7400,
    statBonus: { agility: 20, speed: 15, strength: 8 },
    description: 'Energy-return polymer sleeves amplifying push-off velocity on lateral dashes.',
    iconName: 'Flame',
  },
  {
    id: 'gear_serum_01',
    name: 'Adrenaline Bio-Stim Injection',
    slot: 'serum',
    rarity: 'Common',
    price: 1200,
    statBonus: { strength: 15, speed: 12 },
    description: 'Immediate biological pre-match boost maximizing neural reflex latency.',
    iconName: 'Sparkles',
  },
  {
    id: 'gear_serum_02',
    name: 'Hyper-Electrolyte Infusion',
    slot: 'serum',
    rarity: 'Vanguard',
    price: 1800,
    statBonus: { endurance: 25 },
    description: 'Rapid cellular hydration replenishing stamina reserve and reducing fatigue build-up.',
    iconName: 'HeartPulse',
  },
];
