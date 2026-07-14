export const VERSION = '0.2.0';
export const BUILD = '2026-07-14-black-hole-v02';

export const ARENA_WIDTH = 1040;
export const ARENA_HEIGHT = 620;
export const START_LIVES = 3;
export const TARGET_MASS_TO_WIN = 220;
export const MAX_OBJECTS = 24;
export const BOOST_DURATION_MS = 900;
export const BOOST_COOLDOWN_MS = 4800;

export const SIZE_LEVELS = [
  { level: 1, minMass: 0, radius: 28 },
  { level: 2, minMass: 20, radius: 36 },
  { level: 3, minMass: 55, radius: 46 },
  { level: 4, minMass: 110, radius: 58 },
  { level: 5, minMass: 190, radius: 72 },
] as const;

export const DISTRICTS = [
  { id: 0, name: 'Двор', goal: 'Ешь монеты, коробки и всё лёгкое', minMass: 0, accent: '#7fd6ff' },
  { id: 1, name: 'Парковка', goal: 'Переходи на скутеры и машины', minMass: 45, accent: '#ffd166' },
  { id: 2, name: 'Проспект', goal: 'Дорасти до автобуса и проглоти его', minMass: 120, accent: '#ff7a7a' },
] as const;

export const OBJECT_TYPES = {
  coin: { id: 'coin', label: 'Монета', emoji: '🪙', tier: 1, radius: 16, value: 2, color: '#ffd166' },
  crate: { id: 'crate', label: 'Коробка', emoji: '📦', tier: 1, radius: 20, value: 4, color: '#f0b36b' },
  cone: { id: 'cone', label: 'Конус', emoji: '🚧', tier: 2, radius: 20, value: 5, color: '#ff9f43' },
  scooter: { id: 'scooter', label: 'Скутер', emoji: '🛴', tier: 2, radius: 24, value: 8, color: '#7bdff2' },
  car: { id: 'car', label: 'Авто', emoji: '🚗', tier: 3, radius: 34, value: 16, color: '#ff6b6b' },
  taxi: { id: 'taxi', label: 'Такси', emoji: '🚕', tier: 4, radius: 42, value: 24, color: '#ffe066' },
  bus: { id: 'bus', label: 'Автобус', emoji: '🚌', tier: 5, radius: 54, value: 40, color: '#4dabf7' },
} as const;

export type ObjectTypeId = keyof typeof OBJECT_TYPES;

export const DISTRICT_POOLS: Record<number, ObjectTypeId[]> = {
  0: ['coin', 'coin', 'crate', 'crate', 'cone', 'scooter'],
  1: ['coin', 'crate', 'cone', 'scooter', 'scooter', 'car'],
  2: ['crate', 'cone', 'scooter', 'car', 'taxi', 'bus'],
};
