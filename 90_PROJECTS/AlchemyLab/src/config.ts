export const VERSION = '0.2.0';
export const BUILD = '2026-07-14-alchemy-lab-v02';

export const CONFIG = {
  gridColumns: 3,
  gridRows: 3,
  startingUnlockedCells: 6,
  unlockCellCosts: [12, 28, 55],
  catalystBaseCost: 16,
  catalystCostGrowth: 1.85,
  catalystRewardBonus: 0.25,
};

export const ALCHEMY_ITEMS = [
  { tier: 0, name: 'Spark', emoji: '✨', color: '#f7d774', description: 'Базовая искра для старта любого рецепта.' },
  { tier: 1, name: 'Glow Herb', emoji: '🌿', color: '#8de57d', description: 'Первый живой ингредиент лаборатории.' },
  { tier: 2, name: 'Moon Bloom', emoji: '🌸', color: '#d8a8ff', description: 'Магический цветок для редких заказов.' },
  { tier: 3, name: 'Aether Crystal', emoji: '💎', color: '#7fd5ff', description: 'Кристалл чистой алхимической энергии.' },
  { tier: 4, name: 'Sun Elixir', emoji: '🧪', color: '#ffbe6b', description: 'Главное зелье MVP-цепочки.' },
] as const;

export const ORDER_BASE_REWARDS: Record<number, number> = {
  1: 12,
  2: 28,
  3: 65,
  4: 150,
};
