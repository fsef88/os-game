import { track } from '../analytics';
import { ALCHEMY_ITEMS, CONFIG, ORDER_BASE_REWARDS } from '../config';
import { addEssence, spendEssence, state, type Order } from '../state';

function nextOrderId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function getCatalystUpgradeCost(level = state.get().catalystLevel): number {
  return Math.round(CONFIG.catalystBaseCost * Math.pow(CONFIG.catalystCostGrowth, level));
}

export function getUnlockNextCellCost(): number | null {
  const current = state.get();
  const extraUnlocked = current.unlockedCells - CONFIG.startingUnlockedCells;
  return CONFIG.unlockCellCosts[extraUnlocked] ?? null;
}

export function canGatherIngredient(): boolean {
  const current = state.get();
  return findFirstEmptyUnlockedCellIndex(current.grid, current.unlockedCells) !== -1;
}

export function createNextOrder(maxDiscoveredTier: number, catalystLevel: number): Order {
  const maxTier = Math.max(1, Math.min(maxDiscoveredTier, ALCHEMY_ITEMS.length - 1));
  const minTier = 1;
  const tier = Math.floor(Math.random() * (maxTier - minTier + 1)) + minTier;
  const baseReward = ORDER_BASE_REWARDS[tier] || ORDER_BASE_REWARDS[1];
  const reward = Math.round(baseReward * (1 + catalystLevel * CONFIG.catalystRewardBonus));

  return {
    id: nextOrderId(),
    tier,
    reward,
  };
}

export function gatherIngredient(): boolean {
  const current = state.get();
  const emptyIndex = findFirstEmptyUnlockedCellIndex(current.grid, current.unlockedCells);
  if (emptyIndex === -1) {
    return false;
  }

  const nextGrid = [...current.grid];
  nextGrid[emptyIndex] = 0;
  state.set({
    grid: nextGrid,
    gatheredCount: current.gatheredCount + 1,
  });
  track.ingredientGathered();
  return true;
}

export function interactWithCell(index: number, selectedIndex: number | null): number | null {
  const current = state.get();
  const cellValue = current.grid[index];
  if (index >= current.unlockedCells) {
    return selectedIndex;
  }

  if (cellValue === null) {
    return null;
  }

  if (selectedIndex === null) {
    return index;
  }

  if (selectedIndex === index) {
    return null;
  }

  const selectedValue = current.grid[selectedIndex];
  if (selectedValue === null) {
    return index;
  }

  if (selectedValue !== cellValue) {
    return index;
  }

  if (cellValue >= ALCHEMY_ITEMS.length - 1) {
    return index;
  }

  const nextTier = cellValue + 1;
  const nextGrid = [...current.grid];
  nextGrid[selectedIndex] = null;
  nextGrid[index] = nextTier;

  const discoveries = current.discoveries.includes(nextTier)
    ? current.discoveries
    : [...current.discoveries, nextTier].sort((a, b) => a - b);

  state.set({
    grid: nextGrid,
    highestDiscoveredTier: Math.max(current.highestDiscoveredTier, nextTier),
    discoveries,
    mergesCompleted: current.mergesCompleted + 1,
  });

  track.mergeSuccess(nextTier);
  if (!current.discoveries.includes(nextTier)) {
    track.discoveryUnlocked(nextTier);
  }

  const after = state.get();
  if (after.currentOrder.tier > after.highestDiscoveredTier) {
    state.set({ currentOrder: createNextOrder(after.highestDiscoveredTier, after.catalystLevel) });
  }

  return null;
}

export function fulfillCurrentOrder(): boolean {
  const current = state.get();
  const index = current.grid.findIndex((tier, i) => i < current.unlockedCells && tier === current.currentOrder.tier);
  if (index === -1) {
    return false;
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
  return true;
}

export function unlockNextCell(): boolean {
  const current = state.get();
  const cost = getUnlockNextCellCost();
  if (cost === null) {
    return false;
  }
  if (!spendEssence(cost)) {
    return false;
  }

  const unlockedCells = Math.min(current.grid.length, current.unlockedCells + 1);
  state.set({ unlockedCells });
  track.cellUnlocked(unlockedCells);
  return true;
}

export function upgradeCatalyst(): boolean {
  const current = state.get();
  const cost = getCatalystUpgradeCost();
  if (!spendEssence(cost)) {
    return false;
  }

  const catalystLevel = current.catalystLevel + 1;
  state.set({
    catalystLevel,
    currentOrder: createNextOrder(Math.max(current.highestDiscoveredTier, 1), catalystLevel),
  });
  track.catalystUpgraded(catalystLevel);
  return true;
}

function findFirstEmptyUnlockedCellIndex(grid: Array<number | null>, unlockedCells: number): number {
  for (let i = 0; i < unlockedCells; i += 1) {
    if (grid[i] === null) {
      return i;
    }
  }
  return -1;
}
