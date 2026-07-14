import { track } from '../analytics';
import { initI18n } from '../i18n';
import { loadGame, saveGame } from '../save';
import { sdk } from '../sdk';
import { finalizeSession, hydrateState, startSession, state } from '../state';
import { initBlackHoleGame } from '../ui/blackhole';
import { resetRun } from './blackhole';

let saveDebounce: number | null = null;
let sessionStartedAt = Date.now();

function flushSessionProgress(now = Date.now()) {
  const sessionLength = now - sessionStartedAt;
  if (sessionLength <= 0) return 0;
  finalizeSession(sessionLength, now);
  sessionStartedAt = now;
  return sessionLength;
}

function scheduleAutoSave() {
  if (saveDebounce !== null) window.clearTimeout(saveDebounce);
  saveDebounce = window.setTimeout(async () => {
    const ok = await saveGame(state.get());
    if (!ok) track.saveFailed('cloud_save_failed');
  }, 700);
}

async function restoreState() {
  const save = await loadGame();
  if (!save?.state) {
    resetRun();
    return;
  }
  hydrateState(save.state);
  if (state.get().objects.length === 0) {
    resetRun();
  }
}

export async function initGame() {
  sessionStartedAt = Date.now();
  try {
    await restoreState();
  } catch (error) {
    console.error('[Game] Load failed', error);
    track.saveFailed('restore_state_failed');
    resetRun();
  }

  startSession(sessionStartedAt);
  sdk.notifyGameReady();
  initI18n();

  const app = document.getElementById('app');
  if (!app) throw new Error('App root #app not found');

  initBlackHoleGame(app);
  track.gameStart();
  track.sessionStart(state.get().sessionCount);

  state.subscribe(() => { scheduleAutoSave(); });

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'hidden') return;
    flushSessionProgress();
    await saveGame(state.get(), true);
  });

  window.addEventListener('beforeunload', () => {
    const sessionLength = flushSessionProgress();
    track.sessionEnd(sessionLength);
    void saveGame(state.get(), true);
  });
}
