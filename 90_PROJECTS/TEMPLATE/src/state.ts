import { CONFIG, VERSION } from './config';

type Listener = () => void;

export interface GridCell {
  index: number;
  isUnlocked: boolean;
  vegetableLevel: number;
  isGolden: boolean;
  isRainbow: boolean;
}

export interface ActiveBoost {
  type: string;
  endTime: number;
}

export interface GameState {
  version: string;
  money: number;
  crystals: number;
  level: number;
  xp: number;
  grid: GridCell[];
  activeBoosts: ActiveBoost[];
  currentQuest: unknown;
  questProgress: number;
  achievements: string[];
  dailyStreak: number;
  dailyLastClaim: number;
  pets: unknown[];
  sessionCount: number;
  totalPlayTime: number;
  firstSeen: number;
  lastSeen: number;
  offlineEarnings: number;
}

class StateManager<T> {
  private state: T;
  private listeners: Set<Listener> = new Set();

  constructor(initial: T) {
    this.state = initial;
  }

  get(): T {
    return this.state;
  }

  set(updater: Partial<T> | ((state: T) => Partial<T>)) {
    const patch = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  replace(nextState: T) {
    this.state = nextState;
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function createGrid(): GridCell[] {
  const cellCount = CONFIG.gridSize * CONFIG.gridSize;
  return Array.from({ length: cellCount }, (_, index) => ({
    index,
    isUnlocked: index < 4,
    vegetableLevel: 0,
    isGolden: false,
    isRainbow: false,
  }));
}

export function createInitialState(now = Date.now()): GameState {
  return {
    version: VERSION,
    money: CONFIG.startingMoney,
    crystals: 0,
    level: CONFIG.startingLevel,
    xp: 0,
    grid: createGrid(),
    activeBoosts: [],
    currentQuest: null,
    questProgress: 0,
    achievements: [],
    dailyStreak: 0,
    dailyLastClaim: 0,
    pets: [],
    sessionCount: 0,
    totalPlayTime: 0,
    firstSeen: now,
    lastSeen: now,
    offlineEarnings: 0,
  };
}

export const state = new StateManager<GameState>(createInitialState());

export function hydrateState(partial: Partial<GameState>) {
  state.replace({ ...createInitialState(), ...partial });
}

export function startSession(now = Date.now()) {
  const current = state.get();
  state.set({
    sessionCount: current.sessionCount + 1,
    lastSeen: now,
    firstSeen: current.firstSeen || now,
  });
}

export function addMoney(amount: number, reason = 'unknown') {
  state.set((current) => ({ money: current.money + amount }));
  console.log(`[Money] +${amount} (${reason})`);
}

export function spendMoney(amount: number): boolean {
  const current = state.get();
  if (current.money < amount) {
    return false;
  }
  state.set({ money: current.money - amount });
  return true;
}

export function finalizeSession(sessionLengthMs: number, now = Date.now()) {
  const current = state.get();
  state.set({
    totalPlayTime: current.totalPlayTime + Math.max(0, sessionLengthMs),
    lastSeen: now,
  });
}
