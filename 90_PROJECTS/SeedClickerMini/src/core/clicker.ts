import { CLICKER_CONFIG } from '../config';
import { track } from '../analytics';
import { addMoney, spendMoney, state } from '../state';

let incomeIntervalId: number | null = null;

export function getTapUpgradeCost(level = state.get().tapUpgradeLevel): number {
  return Math.round(CLICKER_CONFIG.tapUpgradeBaseCost * Math.pow(CLICKER_CONFIG.tapUpgradeGrowth, level));
}

export function getAutoIncomeCost(level = state.get().autoIncomeLevel): number {
  return Math.round(CLICKER_CONFIG.autoIncomeBaseCost * Math.pow(CLICKER_CONFIG.autoIncomeGrowth, level));
}

export function getAutoIncomePerSecond(level = state.get().autoIncomeLevel): number {
  return level * CLICKER_CONFIG.autoIncomePerLevel;
}

export function tapSeed() {
  const current = state.get();
  addMoney(current.tapPower, 'seed_tap');
  state.set({ totalTaps: current.totalTaps + 1 });
  track.tapSeed(current.tapPower, current.totalTaps + 1);
}

export function buyTapUpgrade(): boolean {
  const current = state.get();
  const cost = getTapUpgradeCost(current.tapUpgradeLevel);
  if (!spendMoney(cost)) {
    return false;
  }

  const nextLevel = current.tapUpgradeLevel + 1;
  state.set({
    tapUpgradeLevel: nextLevel,
    tapPower: CLICKER_CONFIG.tapBase + nextLevel,
  });
  track.buyTapUpgrade(nextLevel, cost);
  return true;
}

export function buyAutoIncome(): boolean {
  const current = state.get();
  const cost = getAutoIncomeCost(current.autoIncomeLevel);
  if (!spendMoney(cost)) {
    return false;
  }

  const nextLevel = current.autoIncomeLevel + 1;
  state.set({ autoIncomeLevel: nextLevel });
  track.buyAutoIncome(nextLevel, cost);
  return true;
}

export function startAutoIncomeLoop() {
  if (incomeIntervalId !== null) {
    return;
  }

  incomeIntervalId = window.setInterval(() => {
    const incomePerSecond = getAutoIncomePerSecond();
    if (incomePerSecond <= 0) {
      return;
    }

    addMoney(incomePerSecond / 5, 'auto_income');
  }, 200);
}
