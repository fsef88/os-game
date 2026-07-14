export const VERSION = '0.1.0';
export const BUILD = '2026-07-14-template';

export const CONFIG = {
  startingMoney: 100,
  startingLevel: 1,
  gridSize: 4,
  costGrowth: 1.5,
  slotUnlockCosts: [0, 0, 0, 0, 500, 800, 1500, 2500, 5000, 8000, 25000],
  offlineEarningPercentage: 0.5,
  maxOfflineTimeSeconds: 14_400,
  minOfflineTimeSeconds: 300,
  offlineEarnCapVsEarned: 3,
  goldenChance: 0.02,
  rainbowChance: 0.005,
  interstitialCooldownSec: 90,
  rewardedCooldownSec: 30,
  maxRewardedPerDay: 10,
  maxInterstitialPerDay: 8,
  boost2xDurationMin: 30,
  boost2xMultiplier: 2,
  dailyRewards: [100, 200, 500, 800, 1500, 2500, 5000],
};

export const VEGETABLES = [
  { id: 0, name: 'Семечко', cost: 0, reward: 1 },
  { id: 1, name: 'Росток', cost: 2, reward: 3 },
  { id: 2, name: 'Редис', cost: 5, reward: 10 },
  { id: 3, name: 'Морковь', cost: 15, reward: 30 },
  { id: 4, name: 'Томат', cost: 40, reward: 80 },
  { id: 5, name: 'Картофель', cost: 100, reward: 200 },
  { id: 6, name: 'Огурец', cost: 250, reward: 500 },
  { id: 7, name: 'Баклажан', cost: 600, reward: 1200 },
  { id: 8, name: 'Перец', cost: 1500, reward: 3000 },
  { id: 9, name: 'Кабачок', cost: 3500, reward: 7000 },
  { id: 10, name: 'Тыква', cost: 8000, reward: 16000 }
];
