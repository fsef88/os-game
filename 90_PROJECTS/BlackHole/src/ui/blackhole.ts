import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  OBJECT_TYPES,
} from '../config';
import {
  getCurrentDistrict,
  getCurrentGoalText,
  getHoleRadius,
  getProgressToNextLevel,
  restartRunPreservingMeta,
  stepSimulation,
} from '../core/blackhole';
import { state } from '../state';

let mounted = false;
let toastTimeout: number | null = null;
let toastState: { tone: 'info' | 'success' | 'danger'; text: string } | null = null;
let pointerActive = false;
let pointerTarget = { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 };
let keyboard = { up: false, down: false, left: false, right: false };
let lastFrame = performance.now();

export function initBlackHoleGame(container: HTMLElement) {
  if (mounted) return;
  mounted = true;

  const screen = document.createElement('section');
  screen.className = 'blackhole-screen';
  screen.innerHTML = `
    <div id="toast-layer" class="toast-layer"></div>

    <div class="blackhole-hero">
      <div class="hero-copy">
        <div class="eyebrow">toy-first arcade prototype</div>
        <h1>Чёрная дыра</h1>
        <p class="subtitle">Веди дыру по району, засасывай всё, что меньше тебя, раскручивай комбо и дорасти до автобуса.</p>
      </div>
      <button id="restart-button" class="restart-button">Новый ран</button>
    </div>

    <div class="hud-row">
      <div class="hud-pill">⚫ Масса: <strong id="hud-mass">0</strong></div>
      <div class="hud-pill">🔥 Комбо: <strong id="hud-combo">0</strong></div>
      <div class="hud-pill">🗺 Район: <strong id="hud-district">Двор</strong></div>
      <div class="hud-pill">❤ Жизни: <strong id="hud-lives">3</strong></div>
    </div>

    <div class="goal-card">
      <div class="goal-topline">
        <span class="goal-tag">Текущая цель</span>
        <span id="goal-progress-text" class="goal-progress-text"></span>
      </div>
      <div id="goal-main" class="goal-main"></div>
      <div class="goal-bar">
        <div id="goal-bar-fill" class="goal-bar-fill"></div>
      </div>
    </div>

    <div class="arena-shell">
      <div class="arena-backdrop" aria-hidden="true">
        <div class="city-block block-a"></div>
        <div class="city-block block-b"></div>
        <div class="city-block block-c"></div>
        <div class="road road-h"></div>
        <div class="road road-v"></div>
      </div>
      <div id="arena" class="arena" tabindex="0">
        <div id="hole-field" class="hole-field"></div>
        <div id="hole-core" class="hole-core"></div>
      </div>
    </div>

    <div class="bottom-strip">
      <div class="control-card">
        <div class="strip-title">Как играть</div>
        <p>Води мышью, пальцем или WASD. Всасывай всё, что меньше тебя. Слишком крупные объекты отнимают жизнь.</p>
      </div>
      <div class="control-card">
        <div class="strip-title">Рекорд</div>
        <p>Лучшая масса: <strong id="best-mass">0</strong> · Лучшее комбо: <strong id="best-combo">0</strong></p>
      </div>
      <div class="control-card">
        <div class="strip-title">Финал</div>
        <p>Когда станешь достаточно большим — проглоти автобус и закрой ран победой.</p>
      </div>
    </div>

    <div id="overlay-root" class="overlay-root hidden"></div>
  `;

  container.appendChild(screen);

  const arena = screen.querySelector<HTMLDivElement>('#arena');
  if (!arena) throw new Error('Arena not found');

  bindControls(arena);
  screen.querySelector<HTMLButtonElement>('#restart-button')?.addEventListener('click', () => {
    restartRunPreservingMeta();
    showToast('Новый ран начался.', 'info');
  });

  state.subscribe(renderScene);
  renderScene();
  requestAnimationFrame(loop);
}

function bindControls(arena: HTMLDivElement) {
  arena.addEventListener('pointerdown', (event) => {
    pointerActive = true;
    updatePointerTarget(arena, event.clientX, event.clientY);
  });
  arena.addEventListener('pointermove', (event) => {
    if (!pointerActive && event.pointerType === 'mouse') {
      updatePointerTarget(arena, event.clientX, event.clientY);
      return;
    }
    if (pointerActive) updatePointerTarget(arena, event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', () => {
    pointerActive = false;
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'ArrowUp') keyboard.up = true;
    if (event.key === 's' || event.key === 'ArrowDown') keyboard.down = true;
    if (event.key === 'a' || event.key === 'ArrowLeft') keyboard.left = true;
    if (event.key === 'd' || event.key === 'ArrowRight') keyboard.right = true;
  });
  window.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'ArrowUp') keyboard.up = false;
    if (event.key === 's' || event.key === 'ArrowDown') keyboard.down = false;
    if (event.key === 'a' || event.key === 'ArrowLeft') keyboard.left = false;
    if (event.key === 'd' || event.key === 'ArrowRight') keyboard.right = false;
  });
}

function updatePointerTarget(arena: HTMLDivElement, clientX: number, clientY: number) {
  const rect = arena.getBoundingClientRect();
  pointerTarget.x = ((clientX - rect.left) / rect.width) * ARENA_WIDTH;
  pointerTarget.y = ((clientY - rect.top) / rect.height) * ARENA_HEIGHT;
}

function loop(now: number) {
  const dt = Math.min(40, now - lastFrame);
  lastFrame = now;

  const current = state.get();
  const movement = getMovementVector(current.holeX, current.holeY);
  const result = stepSimulation(dt, movement.x, movement.y);

  if (result.absorbed.length > 0) {
    const latest = result.absorbed[result.absorbed.length - 1];
    if (latest.victory) {
      showToast('Победа! Автобус исчез в сингулярности.', 'success');
    } else if (latest.districtUp) {
      showToast(`Новый район: ${latest.districtUp}`, 'success');
    } else if (latest.sizeUp) {
      showToast(`Рост! Размер ${latest.sizeUp}`, 'success');
    } else if (latest.combo >= 3) {
      showToast(`Комбо x${latest.combo}`, 'info');
    }
  }

  if (result.heavyHit) {
    showToast(
      result.heavyHit.gameOver
        ? `Слишком тяжело. Ран окончен.`
        : `Слишком тяжело: ${result.heavyHit.label}`,
      'danger',
    );
  }

  requestAnimationFrame(loop);
}

function getMovementVector(holeX: number, holeY: number) {
  let moveX = 0;
  let moveY = 0;

  if (pointerActive) {
    const dx = pointerTarget.x - holeX;
    const dy = pointerTarget.y - holeY;
    const length = Math.hypot(dx, dy);
    if (length > 4) {
      moveX += dx / length;
      moveY += dy / length;
    }
  }

  if (keyboard.left) moveX -= 1;
  if (keyboard.right) moveX += 1;
  if (keyboard.up) moveY -= 1;
  if (keyboard.down) moveY += 1;

  const length = Math.hypot(moveX, moveY);
  if (length > 0) {
    moveX /= length;
    moveY /= length;
  }

  return { x: moveX, y: moveY };
}

function renderScene() {
  const current = state.get();
  const holeRadius = getHoleRadius(current);
  const district = getCurrentDistrict(current);
  const progress = getProgressToNextLevel(current);

  setText('hud-mass', String(Math.floor(current.mass)));
  setText('hud-combo', String(current.combo));
  setText('hud-district', district.name);
  setText('hud-lives', String(current.lives));
  setText('best-mass', String(Math.floor(current.bestMass)));
  setText('best-combo', String(current.bestCombo));
  setText('goal-main', getCurrentGoalText(current));
  setText('goal-progress-text', progress.next ? `${progress.current}/${progress.next}` : `цель достигнута`);

  const goalBar = document.getElementById('goal-bar-fill');
  if (goalBar) {
    goalBar.style.width = `${progress.ratio * 100}%`;
  }

  const arena = document.getElementById('arena');
  const field = document.getElementById('hole-field');
  const hole = document.getElementById('hole-core');
  if (!arena || !field || !hole) return;

  field.style.width = `${holeRadius * 4.2}px`;
  field.style.height = `${holeRadius * 4.2}px`;
  field.style.left = `${current.holeX - holeRadius * 2.1}px`;
  field.style.top = `${current.holeY - holeRadius * 2.1}px`;

  hole.style.width = `${holeRadius * 2}px`;
  hole.style.height = `${holeRadius * 2}px`;
  hole.style.left = `${current.holeX - holeRadius}px`;
  hole.style.top = `${current.holeY - holeRadius}px`;

  arena.querySelectorAll('.object-node').forEach((node) => node.remove());
  current.objects.forEach((object) => {
    const def = OBJECT_TYPES[object.typeId];
    const node = document.createElement('div');
    node.className = `object-node ${def.tier > current.sizeLevel ? 'danger' : 'safe'}`;
    node.style.width = `${def.radius * 2}px`;
    node.style.height = `${def.radius * 2}px`;
    node.style.left = `${object.x - def.radius}px`;
    node.style.top = `${object.y - def.radius}px`;
    node.style.setProperty('--accent', def.color);
    node.innerHTML = `<span class="object-emoji">${def.emoji}</span>`;
    arena.appendChild(node);
  });

  renderOverlay();
  renderToast();
}

function renderOverlay() {
  const current = state.get();
  const root = document.getElementById('overlay-root');
  if (!root) return;

  if (!current.gameOver && !current.victory) {
    root.classList.add('hidden');
    root.innerHTML = '';
    return;
  }

  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="overlay-backdrop"></div>
    <div class="overlay-card">
      <div class="overlay-title">${current.victory ? 'Район поглощён' : 'Чёрная дыра схлопнулась'}</div>
      <p>${current.victory ? 'Ты вырос до размеров автобуса и поглотил главную цель.' : 'Слишком тяжёлые объекты трижды пробили твою стабильность.'}</p>
      <div class="overlay-stats">
        <span>Масса: <strong>${Math.floor(current.mass)}</strong></span>
        <span>Лучшее комбо: <strong>${current.bestCombo}</strong></span>
        <span>Поглощено: <strong>${current.absorbedCount}</strong></span>
      </div>
      <button id="overlay-restart" class="restart-button large">Играть ещё</button>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#overlay-restart')?.addEventListener('click', () => {
    restartRunPreservingMeta();
    showToast('Новый ран начался.', 'info');
  });
}

function showToast(text: string, tone: 'info' | 'success' | 'danger') {
  toastState = { text, tone };
  renderToast();
  if (toastTimeout !== null) window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toastState = null;
    renderToast();
  }, 1400);
}

function renderToast() {
  const layer = document.getElementById('toast-layer');
  if (!layer) return;
  layer.innerHTML = toastState ? `<div class="toast ${toastState.tone}">${toastState.text}</div>` : '';
}

function setText(id: string, value: string) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
