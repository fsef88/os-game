import { ARENA_HEIGHT, ARENA_WIDTH, START_LIVES, VERSION, type ObjectTypeId } from './config';

export interface GameObject {
  id: number;
  typeId: ObjectTypeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GameState {
  version: string;
  mass: number;
  score: number;
  bestMass: number;
  bestScore: number;
  sizeLevel: number;
  holeX: number;
  holeY: number;
  objects: GameObject[];
  combo: number;
  bestCombo: number;
  lastAbsorbAt: number;
  districtIndex: number;
  absorbedCount: number;
  lives: number;
  gameOver: boolean;
  victory: boolean;
  lastHeavyHitAt: number;
  sessionCount: number;
  totalPlayTime: number;
  firstSeen: number;
  lastSeen: number;
}

type Listener = () => void;

class StateManager<T> {
  private state: T;
  private listeners: Set<Listener> = new Set();
  constructor(initial: T) { this.state = initial; }
  get(): T { return this.state; }
  set(updater: Partial<T> | ((state: T) => Partial<T>)) {
    const patch = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...patch };
    this.notify();
  }
  replace(nextState: T) { this.state = nextState; this.notify(); }
  subscribe(listener: Listener): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private notify() { for (const listener of this.listeners) listener(); }
}

export function createInitialState(now = Date.now()): GameState {
  return {
    version: VERSION,
    mass: 0,
    score: 0,
    bestMass: 0,
    bestScore: 0,
    sizeLevel: 1,
    holeX: ARENA_WIDTH / 2,
    holeY: ARENA_HEIGHT / 2,
    objects: [],
    combo: 0,
    bestCombo: 0,
    lastAbsorbAt: 0,
    districtIndex: 0,
    absorbedCount: 0,
    lives: START_LIVES,
    gameOver: false,
    victory: false,
    lastHeavyHitAt: 0,
    sessionCount: 0,
    totalPlayTime: 0,
    firstSeen: now,
    lastSeen: now,
  };
}

export const state = new StateManager<GameState>(createInitialState());

export function hydrateState(partial: Partial<GameState>) {
  const base = createInitialState();
  state.replace({ ...base, ...partial, objects: partial.objects || [] });
}

export function startSession(now = Date.now()) {
  const current = state.get();
  state.set({ sessionCount: current.sessionCount + 1, lastSeen: now, firstSeen: current.firstSeen || now });
}

export function finalizeSession(sessionLengthMs: number, now = Date.now()) {
  const current = state.get();
  state.set({ totalPlayTime: current.totalPlayTime + Math.max(0, sessionLengthMs), lastSeen: now });
}
