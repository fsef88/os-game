import {
  ALCHEMY_ITEMS,
  CONFIG,
  DAILY_REWARDS,
  MISSION_DEFINITIONS,
  ORDER_BASE_REWARDS,
} from '../config';
import { track } from '../analytics';
import { addEssence, spendEssence, state, type Order } from '../state';

export interface GatherResult {
  ok: boolean;
  index?: number;
  tier?: number;
  rare?: boolean;
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

export interface MissionView {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyResult {
  ok: boolean;
  reward?: number;
  day?: number;
}

function nextOrderId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function getCatalystMultiplier(level = state.get().catalystLevel): number {
  return 1 + level * CONFIG.catalystRewardBonus;
}

export function getLabLevel(current = state.get()): number {
  return 1 + current.ordersCompleted + current.specialOrdersCompleted + Math.max(0, current.discoveries.length - 1);
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
  return { have, need: 1, completed: have >= 1 };
}

export function getSpecialContractProgress(): { active: boolean; have: number; need: number; completed: boolean } {
  const current = state.get();
  if (!current.specialContract) {
    return { active: false, have: 0, need: 0, completed: false };
  }

  const have = getItemCountOnBoard(current.specialContract.tier);
  return { active: true, have, need: 1, completed: have >= 1 };
}

export function canGatherIngredient(): boolean {
  const current = state.get();
  return findFirstEmptyUnlockedCellIndex(current.grid, current.unlockedCells) !== -1;
}

export function createNextOrder(maxDiscoveredTier: number, catalystLevel: number, kind: 'regular' | 'special' = 'regular'): Order {
  const maxTier = Math.max(1, Math.min(maxDiscoveredTier, ALCHEMY_ITEMS.length - 1));
  const minTier = kind === 'special'
    ? Math.max(2, maxTier - 1)
    : Math.max(1, maxTier - 1);
  const tier = maxTier <= minTier
    ? minTier
    : Math.floor(Math.random() * (maxTier - minTier + 1)) + minTier;
  const baseReward = ORDER_BASE_REWARDS[tier] || ORDER_BASE_REWARDS[1];
  const kindMultiplier = kind === 'special' ? 2.4 : 1;
  const reward = Math.round(baseReward * getCatalystMultiplier(catalystLevel) * kindMultiplier);

  return {
    id: nextOrderId(),
    tier,
    reward,
    kind,
  };
}

export function ensureSpecialContract() {
  const current = state.get();
  if (current.specialContract) {
    return;
  }

  if (current.ordersCompleted < 2 || current.highestDiscoveredTier < 2) {
    return;
  }

  state.set({
    specialContract: createNextOrder(current.highestDiscoveredTier, current.catalystLevel, 'special'),
  });
}

export function getRareSpawnChance(current = state.get()): number {
  if (current.catalystLevel <= 0 || current.ordersCompleted <= 0) {
    return 0;
  }
  return Math.min(0.12 + current.catalystLevel * 0.04, 0.28);
}

export function gatherIngredient(): GatherResult {
  const current = state.get();
  const emptyIndex = findFirstEmptyUnlockedCellIndex(current.grid, current.unlockedCells);
  if (emptyIndex === -1) {
    return { ok: false };
  }

  const rareChance = getRareSpawnChance(current);
  const rare = rareChance > 0 && Math.random() < rareChance;
  const tier = rare ? Math.min(1, Math.max(1, current.highestDiscoveredTier)) : 0;

  const nextGrid = [...current.grid];
  nextGrid[emptyIndex] = tier;
  state.set({
    grid: nextGrid,
    gatheredCount: current.gatheredCount + 1,
  });
  track.ingredientGathered(tier, rare);
  return { ok: true, index: emptyIndex, tier, rare };
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
  ensureSpecialContract();

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
  ensureSpecialContract();

  return { ok: true, reward: current.currentOrder.reward, tier: current.currentOrder.tier };
}

export function fulfillSpecialContract(): OrderActionResult {
  const current = state.get();
  if (!current.specialContract) {
    return { ok: false };
  }

  const index = current.grid.findIndex((tier, i) => i < current.unlockedCells && tier === current.specialContract?.tier);
  if (index === -1) {
    return { ok: false };
  }

  const nextGrid = [...current.grid];
  nextGrid[index] = null;
  addEssence(current.specialContract.reward, 'special_contract_completed');
  state.set({
    grid: nextGrid,
    specialOrdersCompleted: current.specialOrdersCompleted + 1,
  });
  track.specialContractCompleted(current.specialContract.tier, current.specialContract.reward);

  const after = state.get();
  state.set({
    specialContract: createNextOrder(Math.max(after.highestDiscoveredTier, 2), after.catalystLevel, 'special'),
  });
  return { ok: true, reward: current.specialContract.reward, tier: current.specialContract.tier };
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
    specialContract: current.specialContract
      ? createNextOrder(Math.max(current.highestDiscoveredTier, 2), catalystLevel, 'special')
      : current.specialContract,
  });
  track.catalystUpgraded(catalystLevel);
  return { ok: true, cost, nextLevel: catalystLevel };
}

export function getMissionViews(current = state.get()): MissionView[] {
  const metrics = {
    mission_first_merge: { progress: current.mergesCompleted, target: 1 },
    mission_two_orders: { progress: current.ordersCompleted, target: 2 },
    mission_three_discoveries: { progress: Math.max(0, current.discoveries.length - 1), target: 3 },
    mission_special_contract: { progress: current.specialOrdersCompleted, target: 1 },
  } as const;

  return MISSION_DEFINITIONS.map((mission) => {
    const info = metrics[mission.id];
    const completed = info.progress >= info.target;
    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      reward: mission.reward,
      progress: Math.min(info.progress, info.target),
      target: info.target,
      completed,
      claimed: current.claimedMissionIds.includes(mission.id),
    };
  });
}

export function claimMission(id: string): { ok: boolean; reward?: number } {
  const current = state.get();
  const mission = getMissionViews(current).find((item) => item.id === id);
  if (!mission || !mission.completed || mission.claimed) {
    return { ok: false };
  }

  addEssence(mission.reward, id);
  state.set({ claimedMissionIds: [...current.claimedMissionIds, id] });
  track.missionClaimed(id, mission.reward);
  return { ok: true, reward: mission.reward };
}

export function canClaimDailyReward(now = Date.now()): boolean {
  const current = state.get();
  if (current.dailyLastClaim === 0) {
    return true;
  }

  const elapsedHours = (now - current.dailyLastClaim) / 1000 / 3600;
  return elapsedHours >= CONFIG.dailyClaimWindowHours;
}

export function getCurrentDailyReward(): { day: number; reward: number } {
  const current = state.get();
  const dayIndex = (current.dailyDay - 1) % DAILY_REWARDS.length;
  return {
    day: current.dailyDay,
    reward: DAILY_REWARDS[dayIndex],
  };
}

export function claimDailyReward(now = Date.now()): DailyResult {
  if (!canClaimDailyReward(now)) {
    return { ok: false };
  }

  const current = state.get();
  const { day, reward } = getCurrentDailyReward();
  addEssence(reward, 'daily_reward');
  state.set({
    dailyLastClaim: now,
    dailyDay: current.dailyDay + 1,
    dailyStreak: current.dailyStreak + 1,
  });
  track.dailyClaimed(day, reward);
  return { ok: true, reward, day };
}

function findFirstEmptyUnlockedCellIndex(grid: Array<number | null>, unlockedCells: number): number {
  for (let i = 0; i < unlockedCells; i += 1) {
    if (grid[i] === null) {
      return i;
    }
  }
  return -1;
}
