import { track } from '../analytics';
import { initHUD } from '../hud';
import { initI18n } from '../i18n';
import { loadGame, saveGame } from '../save';
import { sdk } from '../sdk';
import { finalizeSession, hydrateState, startSession, state } from '../state';

let saveDebounce: number | null = null;
let sessionStartedAt = Date.now();

function flushSessionProgress(now = Date.now()) {
  const sessionLength = now - sessionStartedAt;
  if (sessionLength <= 0) {
    return 0;
  }

  finalizeSession(sessionLength, now);
  sessionStartedAt = now;
  return sessionLength;
}

function scheduleAutoSave() {
  if (saveDebounce !== null) {
    window.clearTimeout(saveDebounce);
  }

  saveDebounce = window.setTimeout(async () => {
    const ok = await saveGame(state.get());
    if (!ok) {
      track.saveFailed('cloud_save_failed');
    }
  }, 700);
}

async function restoreState() {
  const save = await loadGame();
  if (!save?.state) {
    return;
  }

  hydrateState(save.state);
}

export async function initGame() {
  sessionStartedAt = Date.now();

  try {
    await restoreState();
  } catch (error) {
    console.error('[Game] Load failed', error);
    track.loadFailed('restore_state_failed');
  }

  startSession(sessionStartedAt);
  sdk.notifyGameReady();
  initI18n();

  const app = document.getElementById('app');
  if (!app) {
    throw new Error('App root #app not found');
  }

  initHUD(app);

  track.gameStart();
  track.sessionStart(state.get().sessionCount);
  track.gameReady();

  state.subscribe(() => {
    scheduleAutoSave();
  });

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'hidden') {
      return;
    }

    flushSessionProgress();
    await saveGame(state.get(), true);
  });

  window.addEventListener('beforeunload', () => {
    const sessionLength = flushSessionProgress();
    track.sessionEnd(sessionLength);
    void saveGame(state.get(), true);
  });
}
