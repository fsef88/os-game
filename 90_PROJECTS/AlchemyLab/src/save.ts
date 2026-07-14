import { sdk } from './sdk';
import type { GameState } from './state';

const LOCAL_KEY = 'alchemy_lab_save';
const SAVE_THROTTLE_MS = 5_000;

let lastCloudSaveTime = 0;
let pendingSave: SaveData | null = null;
let saveTimeout: number | null = null;

export interface SaveData {
  version: string;
  timestamp: number;
  state: GameState;
}

function buildSaveData(state: GameState): SaveData {
  return {
    version: state.version,
    timestamp: Date.now(),
    state,
  };
}

function readLocalSave(): SaveData | null {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SaveData;
  } catch (error) {
    console.error('[Save] Failed to parse local save', error);
    return null;
  }
}

async function flushPendingSave() {
  if (!pendingSave) {
    return;
  }

  const data = pendingSave;
  pendingSave = null;
  lastCloudSaveTime = Date.now();
  await sdk.saveData(data);
}

function scheduleCloudFlush() {
  if (saveTimeout !== null) {
    return;
  }

  saveTimeout = window.setTimeout(async () => {
    saveTimeout = null;
    await flushPendingSave();
  }, SAVE_THROTTLE_MS);
}

export async function saveGame(state: GameState, force = false): Promise<boolean> {
  const data = buildSaveData(state);

  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[Save] localStorage failed', error);
  }

  const now = Date.now();
  if (!force && now - lastCloudSaveTime < SAVE_THROTTLE_MS) {
    pendingSave = data;
    scheduleCloudFlush();
    return true;
  }

  lastCloudSaveTime = now;
  return sdk.saveData(data);
}

export async function loadGame(): Promise<SaveData | null> {
  const [cloud, local] = await Promise.all([
    sdk.getData().catch(() => null),
    Promise.resolve(readLocalSave()),
  ]);

  const normalizedCloud = cloud && typeof cloud === 'object' && 'state' in cloud
    ? (cloud as SaveData)
    : null;

  if (!normalizedCloud) {
    return local;
  }

  if (!local) {
    return normalizedCloud;
  }

  return (normalizedCloud.timestamp || 0) > (local.timestamp || 0)
    ? normalizedCloud
    : local;
}
