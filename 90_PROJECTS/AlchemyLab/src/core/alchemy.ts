import { track } from '../analytics';
import { ALCHEMY_ITEMS, CONFIG, ORDER_BASE_REWARDS } from '../config';
import { addEssence, spendEssence, state, type Order } from '../state';

export interface GatherResult {
  ok: boolean;
  index?: number;
}

export interface MergeEvent {
  targetIndex: number;
  resultTier: number;
  resultName: string;
  discovered: boolean;
}

export interface CellInteractionResult {
  selectedIndex: number | null;
  merge?: MergeEvent;
}

export interface OrderActionResult {
  ok: boolean;
  reward?: number;
  tier?: number;
}

export interface UnlockResult {
  ok: boolean;
  cost?: number;
  unlockedCells?: number;
}

export interface CatalystResult {
  ok: boolean;
  cost?: number;
  nextLevel?: number;
}

function nextOrderId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function getCatalystMultiplier(level = state.get().catalystLevel): number {
  return 1 + level * CONFIG.catalystRewardBonus;
}

export function getCatalystUpgradeCost(level = state.get().catalystLevel): number {
  return Math.round(CONFIG.catalystBaseCost * Math.pow(CONFIG.catalystCostGrowth, level));
}

export function getUnlockNextCellCost(): number | null {
  const current = state.get();
  const extraUnlocked = current.unlockedCells - CONFIG.startingUnlockedCells;
  return CONFIG.unlockCellCosts[extraUnlocked] ?? null;
}

export function getItemCountOnBoard(tier: number): number {
  const current = state.get();
  return current.grid.filter((value, index) => index < current.unlockedCells && value === tier).length;
}

export function getOrderProgress(): { have: number; need: number; completed: boolean } {
  const current = state.get();
  const have = getItemCountOnBoard(current.currentOrder.tier);
  return {
    have,
    need: 1,
    completed: have >= 1,
  };
}

export function canGatherIngredient(): boolean {
  const current = state.get();
  return findFirstEmptyUnlockedCellIndex(current.grid, current.unlockedCells) !== -1;
}

export function createNextOrder(maxDiscoveredTier: number, catalystLevel: number): Order {
  const maxTier = Math.max(1, Math.min(maxDiscoveredTier, ALCHEMY_ITEMS.length - 1));
  const minTier = Math.max(1, maxTier - 1);
  const tier = maxTier === 1
    ? 1
    : Math.floor(Math.random() * (maxTier - minTier + 1)) + minTier;
  const baseReward = ORDER_BASE_REWARDS[tier] || ORDER_BASE_REWARDS[1];
  const reward = Math.round(baseReward * getCatalystMultiplier(catalystLevel));

  return {
    id: nextOrderId(),
    tier,
    reward,
  };
}

export function gatherIngredient(): GatherResult {
  const current = state.get();
  const emptyIndex = findFirstEmptyUnlockedCellIndex(current.grid, current.unlockedCells);
  if (emptyIndex === -1) {
    return { ok: false };
  }

  const nextGrid = [...current.grid];
  nextGrid[emptyIndex] = 0;
  state.set({
    grid: nextGrid,
    gatheredCount: current.gatheredCount + 1,
  });
  track.ingredientGathered();
  return { ok: true, index: emptyIndex };
}

export function interactWithCell(index: number, selectedIndex: number | null): CellInteractionResult {
  const current = state.get();
  const cellValue = current.grid[index];
  if (index >= current.unlockedCells) {
    return { selectedIndex };
  }

  if (cellValue === null) {
    return { selectedIndex: null };
  }

  if (selectedIndex === null) {
    return { selectedIndex: index };
  }

  if (selectedIndex === index) {
    return { selectedIndex: null };
  }

  const selectedValue = current.grid[selectedIndex];
  if (selectedValue === null) {
    return { selectedIndex: index };
  }

  if (selectedValue !== cellValue) {
    return { selectedIndex: index };
  }

  if (cellValue >= ALCHEMY_ITEMS.length - 1) {
    return { selectedIndex: index };
  }

  const nextTier = cellValue + 1;
  const nextGrid = [...current.grid];
  nextGrid[selectedIndex] = null;
  nextGrid[index] = nextTier;

  const discovered = !current.discoveries.includes(nextTier);
  const discoveries = discovered
    ? [...current.discoveries, nextTier].sort((a, b) => a - b)
    : current.discoveries;

  state.set({
    grid: nextGrid,
    highestDiscoveredTier: Math.max(current.highestDiscoveredTier, nextTier),
    discoveries,
    mergesCompleted: current.mergesCompleted + 1,
  });

  track.mergeSuccess(nextTier);
  if (discovered) {
    track.discoveryUnlocked(nextTier);
  }

  const after = state.get();
  if (after.currentOrder.tier > after.highestDiscoveredTier) {
    state.set({ currentOrder: createNextOrder(after.highestDiscoveredTier, after.catalystLevel) });
  }

  return {
    selectedIndex: null,
    merge: {
      targetIndex: index,
      resultTier: nextTier,
      resultName: ALCHEMY_ITEMS[nextTier].name,
      discovered,
    },
  };
}

export function fulfillCurrentOrder(): OrderActionResult {
  const current = state.get();
  const index = current.grid.findIndex((tier, i) => i < current.unlockedCells && tier === current.currentOrder.tier);
  if (index === -1) {
    return { ok: false };
  }

  const nextGrid = [...current.grid];
  nextGrid[index] = null;
  addEssence(current.currentOrder.reward, 'order_completed');
  state.set({
    grid: nextGrid,
    ordersCompleted: current.ordersCompleted + 1,
  });
  track.orderCompleted(current.currentOrder.tier, current.currentOrder.reward);

  const after = state.get();
  state.set({
    currentOrder: createNextOrder(Math.max(after.highestDiscoveredTier, 1), after.catalystLevel),
  });

  return {
    ok: true,
    reward: current.currentOrder.reward,
    tier: current.currentOrder.tier,
  };
}

export function unlockNextCell(): UnlockResult {
  const current = state.get();
  const cost = getUnlockNextCellCost();
  if (cost === null) {
    return { ok: false };
  }
  if (!spendEssence(cost)) {
    return { ok: false, cost };
  }

  const unlockedCells = Math.min(current.grid.length, current.unlockedCells + 1);
  state.set({ unlockedCells });
  track.cellUnlocked(unlockedCells);
  return { ok: true, cost, unlockedCells };
}

export function upgradeCatalyst(): CatalystResult {
  const current = state.get();
  const cost = getCatalystUpgradeCost();
  if (!spendEssence(cost)) {
    return { ok: false, cost };
  }

  const catalystLevel = current.catalystLevel + 1;
  state.set({
    catalystLevel,
    currentOrder: createNextOrder(Math.max(current.highestDiscoveredTier, 1), catalystLevel),
  });
  track.catalystUpgraded(catalystLevel);
  return { ok: true, cost, nextLevel: catalystLevel };
}

function findFirstEmptyUnlockedCellIndex(grid: Array<number | null>, unlockedCells: number): number {
  for (let i = 0; i < unlockedCells; i += 1) {
    if (grid[i] === null) {
      return i;
    }
  }
  return -1;
}
