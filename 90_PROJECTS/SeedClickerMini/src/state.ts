import { CLICKER_CONFIG, CONFIG, VERSION } from './config';

type Listener = () => void;

export interface GameState {
  version: string;
  money: number;
  crystals: number;
  level: number;
  xp: number;
  tapPower: number;
  tapUpgradeLevel: number;
  autoIncomeLevel: number;
  totalTaps: number;
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

export function createInitialState(now = Date.now()): GameState {
  return {
    version: VERSION,
    money: CONFIG.startingMoney,
    crystals: 0,
    level: CONFIG.startingLevel,
    xp: 0,
    tapPower: CLICKER_CONFIG.tapBase,
    tapUpgradeLevel: 0,
    autoIncomeLevel: 0,
    totalTaps: 0,
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
