export const VERSION = '1.0.0';
export const BUILD = '2026-07-14-alchemy-lab-v10';

export const CONFIG = {
  gridColumns: 3,
  gridRows: 3,
  startingUnlockedCells: 6,
  unlockCellCosts: [12, 28, 55],
  catalystBaseCost: 16,
  catalystCostGrowth: 1.85,
  catalystRewardBonus: 0.25,
  dailyClaimWindowHours: 20,
};

export const ALCHEMY_ITEMS = [
  { tier: 0, name: 'Искра', emoji: '✨', color: '#f7d774', description: 'Базовый элемент для всех первых рецептов.' },
  { tier: 1, name: 'Свет-трава', emoji: '🌿', color: '#8de57d', description: 'Первый живой ингредиент лаборатории.' },
  { tier: 2, name: 'Лунный цветок', emoji: '🌸', color: '#d8a8ff', description: 'Редкий алхимический цветок для сильных заказов.' },
  { tier: 3, name: 'Эфирный кристалл', emoji: '💎', color: '#7fd5ff', description: 'Кристалл концентрированной алхимической силы.' },
  { tier: 4, name: 'Солнечный эликсир', emoji: '🧪', color: '#ffbe6b', description: 'Главное зелье вертикального среза.' },
] as const;

export const ORDER_BASE_REWARDS: Record<number, number> = {
  1: 12,
  2: 28,
  3: 65,
  4: 150,
};

export const DAILY_REWARDS = [8, 12, 18, 25, 40, 65, 100] as const;

export const MISSION_DEFINITIONS = [
  { id: 'mission_first_merge', title: 'Первое слияние', description: 'Сделай 1 merge', reward: 8 },
  { id: 'mission_two_orders', title: 'Первые заказы', description: 'Выполни 2 заказа', reward: 18 },
  { id: 'mission_three_discoveries', title: 'Журнал алхимика', description: 'Открой 3 формулы', reward: 25 },
  { id: 'mission_special_contract', title: 'Особый контракт', description: 'Выполни 1 особый заказ', reward: 40 },
] as const;
