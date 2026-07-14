import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  DISTRICTS,
  DISTRICT_POOLS,
  MAX_OBJECTS,
  OBJECT_TYPES,
  SIZE_LEVELS,
  TARGET_MASS_TO_WIN,
} from '../config';
import { track } from '../analytics';
import { createInitialState, state, type GameObject, type GameState } from '../state';

let nextObjectId = 1;

export interface AbsorbEvent {
  objectId: number;
  label: string;
  combo: number;
  mass: number;
  sizeUp?: number;
  districtUp?: string;
  victory?: boolean;
}

export interface HeavyHitEvent {
  label: string;
  remainingLives: number;
  gameOver: boolean;
}

export function resetRun() {
  const base = createInitialState();
  const objects = createInitialObjects(base);
  state.replace({ ...base, objects });
}

export function getHoleRadius(current = state.get()): number {
  let radius: number = SIZE_LEVELS[0].radius;
  for (const entry of SIZE_LEVELS) {
    if (current.mass >= entry.minMass) radius = entry.radius;
  }
  return radius;
}

export function getCurrentDistrict(current = state.get()): (typeof DISTRICTS)[number] {
  let district: (typeof DISTRICTS)[number] = DISTRICTS[0];
  for (const entry of DISTRICTS) {
    if (current.mass >= entry.minMass) district = entry;
  }
  return district;
}

export function getCurrentGoalText(current = state.get()): string {
  if (current.victory) return 'Автобус проглочен — район под контролем';
  if (current.sizeLevel < 2) return 'Ешь монеты и коробки, чтобы вырасти';
  if (current.sizeLevel < 3) return 'Теперь можно охотиться на конусы и скутеры';
  if (current.sizeLevel < 4) return 'Пора переходить на автомобили';
  if (current.sizeLevel < 5) return 'Ты уже опасен даже для крупных машин';
  return 'Финальная цель — съешь автобус';
}

export function getProgressToNextLevel(current = state.get()): { current: number; next: number | null; ratio: number } {
  const next = SIZE_LEVELS.find((entry) => entry.level === current.sizeLevel + 1);
  if (!next) return { current: current.mass, next: null, ratio: 1 };
  const currentLevel = SIZE_LEVELS.find((entry) => entry.level === current.sizeLevel) ?? SIZE_LEVELS[0];
  const range = next.minMass - currentLevel.minMass;
  const progress = current.mass - currentLevel.minMass;
  return { current: current.mass, next: next.minMass, ratio: Math.max(0, Math.min(1, progress / range)) };
}

export function stepSimulation(dtMs: number, movementX: number, movementY: number, boostActive = false): {
  absorbed: AbsorbEvent[];
  heavyHit?: HeavyHitEvent;
} {
  const current = state.get();
  if (current.gameOver || current.victory) {
    return { absorbed: [] };
  }

  const dt = dtMs / 1000;
  const holeRadius = getHoleRadius(current);
  const effectiveRadius = boostActive ? holeRadius * 1.28 : holeRadius;
  const speed = Math.max(120, 260 - holeRadius * 1.2) * (boostActive ? 1.22 : 1);
  let holeX = clamp(current.holeX + movementX * speed * dt, holeRadius, ARENA_WIDTH - holeRadius);
  let holeY = clamp(current.holeY + movementY * speed * dt, holeRadius, ARENA_HEIGHT - holeRadius);

  const objects = current.objects.map((object) => ({ ...object }));
  const absorbed: AbsorbEvent[] = [];
  let heavyHit: HeavyHitEvent | undefined;
  let combo = current.combo;
  let mass = current.mass;
  let sizeLevel = current.sizeLevel;
  let districtIndex = current.districtIndex;
  let lives = current.lives;
  let lastAbsorbAt = current.lastAbsorbAt;
  let bestCombo = current.bestCombo;
  let bestMass = current.bestMass;
  let victory: boolean = current.victory;
  let gameOver: boolean = current.gameOver;
  let lastHeavyHitAt = current.lastHeavyHitAt;
  let absorbedCount = current.absorbedCount;

  if (Date.now() - lastAbsorbAt > 1500) {
    combo = 0;
  }

  for (const object of objects) {
    const def = OBJECT_TYPES[object.typeId];
    object.x += object.vx * dt;
    object.y += object.vy * dt;

    if (object.x < def.radius || object.x > ARENA_WIDTH - def.radius) object.vx *= -1;
    if (object.y < def.radius || object.y > ARENA_HEIGHT - def.radius) object.vy *= -1;

    object.x = clamp(object.x, def.radius, ARENA_WIDTH - def.radius);
    object.y = clamp(object.y, def.radius, ARENA_HEIGHT - def.radius);

    const dx = holeX - object.x;
    const dy = holeY - object.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const absorbable = def.tier <= sizeLevel;

    if (absorbable && distance < effectiveRadius + 86) {
      const pull = (effectiveRadius + 86 - distance) * (boostActive ? 3 : 2.2) * dt;
      object.x += (dx / distance) * pull * 22;
      object.y += (dy / distance) * pull * 22;
    }

    if (absorbable && distance < effectiveRadius * 0.42 + def.radius * 0.52) {
      const now = Date.now();
      combo = now - lastAbsorbAt < 1500 ? combo + 1 : 1;
      lastAbsorbAt = now;
      bestCombo = Math.max(bestCombo, combo);
      const gainedMass = def.value + Math.max(0, combo - 1);
      mass += gainedMass;
      absorbedCount += 1;
      bestMass = Math.max(bestMass, mass);

      const previousLevel = sizeLevel;
      sizeLevel = getLevelByMass(mass);
      const previousDistrict = districtIndex;
      districtIndex = getDistrictIndexByMass(mass);
      if (sizeLevel > previousLevel) track.sizeUp(sizeLevel);
      if (districtIndex > previousDistrict) track.districtUp(DISTRICTS[districtIndex].name);

      if (def.id === 'bus' && mass >= TARGET_MASS_TO_WIN) {
        victory = true;
        track.win(mass);
      }

      track.objectAbsorbed(def.label, combo);

      absorbed.push({
        objectId: object.id,
        label: def.label,
        combo,
        mass,
        sizeUp: sizeLevel > previousLevel ? sizeLevel : undefined,
        districtUp: districtIndex > previousDistrict ? DISTRICTS[districtIndex].name : undefined,
        victory,
      });

      respawnObject(object, districtIndex, holeX, holeY);
      continue;
    }

    if (!absorbable && distance < holeRadius + def.radius * 0.55) {
      object.x -= (dx / distance) * 14 * dt;
      object.y -= (dy / distance) * 14 * dt;
      if (Date.now() - lastHeavyHitAt > 1000) {
        lives -= 1;
        combo = 0;
        lastHeavyHitAt = Date.now();
        gameOver = lives <= 0;
        heavyHit = { label: def.label, remainingLives: Math.max(0, lives), gameOver };
        track.heavyHit(def.label);
        if (gameOver) track.lose(mass);
      }
    }
  }

  state.replace({
    ...current,
    mass,
    bestMass,
    sizeLevel,
    districtIndex,
    combo,
    bestCombo,
    lastAbsorbAt,
    lives,
    gameOver,
    victory,
    lastHeavyHitAt,
    absorbedCount,
    holeX,
    holeY,
    objects,
  });

  return { absorbed, heavyHit };
}

export function restartRunPreservingMeta() {
  const current = state.get();
  const base = createInitialState();
  const nextState: GameState = {
    ...base,
    bestMass: Math.max(base.bestMass, current.bestMass, current.mass),
    bestCombo: Math.max(base.bestCombo || 0, current.bestCombo),
    sessionCount: current.sessionCount,
    totalPlayTime: current.totalPlayTime,
    firstSeen: current.firstSeen,
    lastSeen: current.lastSeen,
  } as GameState;
  nextState.objects = createInitialObjects(nextState);
  state.replace(nextState);
}

function createInitialObjects(current: GameState): GameObject[] {
  const district = current.districtIndex;
  const objects: GameObject[] = [];
  for (let i = 0; i < MAX_OBJECTS; i += 1) {
    const object = createObject(district, current.holeX, current.holeY);
    objects.push(object);
  }
  return objects;
}

function createObject(districtIndex: number, holeX: number, holeY: number): GameObject {
  const pool = DISTRICT_POOLS[districtIndex] || DISTRICT_POOLS[0];
  const typeId = pool[Math.floor(Math.random() * pool.length)];
  const def = OBJECT_TYPES[typeId];
  let x = randomRange(def.radius, ARENA_WIDTH - def.radius);
  let y = randomRange(def.radius, ARENA_HEIGHT - def.radius);
  while (distanceBetween(x, y, holeX, holeY) < 180) {
    x = randomRange(def.radius, ARENA_WIDTH - def.radius);
    y = randomRange(def.radius, ARENA_HEIGHT - def.radius);
  }
  return {
    id: nextObjectId++,
    typeId,
    x,
    y,
    vx: randomRange(-28, 28),
    vy: randomRange(-28, 28),
  };
}

function respawnObject(object: GameObject, districtIndex: number, holeX: number, holeY: number) {
  const replacement = createObject(districtIndex, holeX, holeY);
  object.id = replacement.id;
  object.typeId = replacement.typeId;
  object.x = replacement.x;
  object.y = replacement.y;
  object.vx = replacement.vx;
  object.vy = replacement.vy;
}

function getLevelByMass(mass: number): number {
  let level = 1;
  for (const entry of SIZE_LEVELS) {
    if (mass >= entry.minMass) level = entry.level;
  }
  return level;
}

function getDistrictIndexByMass(mass: number): number {
  let district = 0;
  for (const entry of DISTRICTS) {
    if (mass >= entry.minMass) district = entry.id;
  }
  return district;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function distanceBetween(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
