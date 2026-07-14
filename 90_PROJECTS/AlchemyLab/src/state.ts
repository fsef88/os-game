import { CONFIG, VERSION } from './config';

type Listener = () => void;

export interface Order {
  id: number;
  tier: number;
  reward: number;
}

export interface GameState {
  version: string;
  essence: number;
  catalystLevel: number;
  unlockedCells: number;
  grid: Array<number | null>;
  currentOrder: Order;
  highestDiscoveredTier: number;
  discoveries: number[];
  ordersCompleted: number;
  mergesCompleted: number;
  gatheredCount: number;
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

function createGrid(): Array<number | null> {
  const cellCount = CONFIG.gridColumns * CONFIG.gridRows;
  return Array.from({ length: cellCount }, () => null);
}

export function createInitialState(now = Date.now()): GameState {
  return {
    version: VERSION,
    essence: 0,
    catalystLevel: 0,
    unlockedCells: CONFIG.startingUnlockedCells,
    grid: createGrid(),
    currentOrder: {
      id: 1,
      tier: 1,
      reward: 12,
    },
    highestDiscoveredTier: 0,
    discoveries: [0],
    ordersCompleted: 0,
    mergesCompleted: 0,
    gatheredCount: 0,
    sessionCount: 0,
    totalPlayTime: 0,
    firstSeen: now,
    lastSeen: now,
    offlineEarnings: 0,
  };
}

export const state = new StateManager<GameState>(createInitialState());

export function hydrateState(partial: Partial<GameState>) {
  const base = createInitialState();
  state.replace({ ...base, ...partial });
}

export function startSession(now = Date.now()) {
  const current = state.get();
  state.set({
    sessionCount: current.sessionCount + 1,
    lastSeen: now,
    firstSeen: current.firstSeen || now,
  });
}

export function addEssence(amount: number, reason = 'unknown') {
  state.set((current) => ({ essence: current.essence + amount }));
  console.log(`[Essence] +${amount} (${reason})`);
}

export function spendEssence(amount: number): boolean {
  const current = state.get();
  if (current.essence < amount) {
    return false;
  }
  state.set({ essence: current.essence - amount });
  return true;
}

export function finalizeSession(sessionLengthMs: number, now = Date.now()) {
  const current = state.get();
  state.set({
    totalPlayTime: current.totalPlayTime + Math.max(0, sessionLengthMs),
    lastSeen: now,
  });
}
