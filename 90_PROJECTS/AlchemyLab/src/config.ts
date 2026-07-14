export const VERSION = '0.1.0';
export const BUILD = '2026-07-14-alchemy-lab';

export const CONFIG = {
  gridColumns: 3,
  gridRows: 3,
  startingUnlockedCells: 6,
  unlockCellCosts: [20, 40, 70],
  catalystBaseCost: 25,
  catalystCostGrowth: 1.8,
  catalystRewardBonus: 0.25,
};

export const ALCHEMY_ITEMS = [
  { tier: 0, name: 'Spark', emoji: '✨', color: '#f7d774' },
  { tier: 1, name: 'Glow Herb', emoji: '🌿', color: '#8de57d' },
  { tier: 2, name: 'Moon Bloom', emoji: '🌸', color: '#d8a8ff' },
  { tier: 3, name: 'Aether Crystal', emoji: '💎', color: '#7fd5ff' },
  { tier: 4, name: 'Sun Elixir', emoji: '🧪', color: '#ffbe6b' },
] as const;

export const ORDER_BASE_REWARDS: Record<number, number> = {
  1: 12,
  2: 28,
  3: 65,
  4: 150,
};
