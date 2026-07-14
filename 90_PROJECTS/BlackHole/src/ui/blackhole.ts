import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BOOST_COOLDOWN_MS,
  BOOST_DURATION_MS,
  GRAVITY_STORM_DURATION_MS,
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
let boostActiveUntil = 0;
let boostCooldownUntil = 0;
let pulseSceneUntil = 0;
let hitSceneUntil = 0;
let districtBannerText = '';
let districtBannerUntil = 0;
let gravityStormUntil = 0;
let runStartedAt = Date.now();

export function initBlackHoleGame(container: HTMLElement) {
  if (mounted) return;
  mounted = true;

  const screen = document.createElement('section');
  screen.className = 'blackhole-screen';
  screen.innerHTML = `
    <div id="toast-layer" class="toast-layer"></div>

    <div class="blackhole-hero">
      <div class="hero-copy">
        <div class="eyebrow">concept-style arcade prototype</div>
        <h1>Чёрная дыра</h1>
        <p class="subtitle">Один сильный toy: веди дыру по городу, засасывай всё, что меньше тебя, лови комбо и вырасти настолько, чтобы поглотить автобус.</p>
      </div>
      <button id="restart-button" class="hero-button">Новый ран</button>
    </div>

    <div class="hud-row">
      <div class="hud-pill">⚫ Масса <strong id="hud-mass">0</strong></div>
      <div class="hud-pill">✦ Счёт <strong id="hud-score">0</strong></div>
      <div class="hud-pill">🔥 Комбо <strong id="hud-combo">0</strong></div>
      <div class="hud-pill">🗺 Район <strong id="hud-district">Двор</strong></div>
      <div class="hud-pill">❤ Жизни <strong id="hud-lives">3</strong></div>
      <div class="hud-pill">⏱ Время <strong id="hud-time">0:00</strong></div>
    </div>

    <div class="scene-card" id="scene-card">
      <div class="scene-background" aria-hidden="true">
        <div class="district-mark district-a"></div>
        <div class="district-mark district-b"></div>
        <div class="district-mark district-c"></div>
        <div class="lane lane-h"></div>
        <div class="lane lane-v"></div>
        <div class="light-pool light-a"></div>
        <div class="light-pool light-b"></div>
      </div>

      <div class="floating-panel left-panel" id="district-panel"></div>
      <div class="floating-panel right-panel" id="target-panel"></div>

      <div id="arena" class="arena" tabindex="0">
        <div id="district-banner" class="district-banner hidden"></div>
        <div id="boss-target" class="boss-target hidden"></div>
        <div id="hole-field" class="hole-field"></div>
        <div id="hole-core" class="hole-core"></div>
      </div>

      <div class="legend-row">
        <div class="legend-title">Сейчас ешь:</div>
        <div id="legend-track" class="legend-track"></div>
      </div>

      <div class="dock-panel">
        <button id="boost-button" class="boost-button">Сингулярный рывок</button>
        <div class="boost-status">
          <div class="boost-label">Перегрузка</div>
          <div class="boost-bar"><div id="boost-bar-fill" class="boost-bar-fill"></div></div>
        </div>
        <div id="combo-rush" class="tip-chip hidden">COMBO RUSH</div>
        <div id="storm-chip" class="tip-chip hidden">ГРАВИТАЦИОННЫЙ ШТОРМ</div>
        <div class="tip-chip">WASD / мышь / тач</div>
      </div>
    </div>

    <div class="bottom-strip">
      <div class="control-card">
        <div class="strip-title">Как работает toy</div>
        <p>Мелкие объекты сами тянутся в радиус всасывания. Крупные — опасны, пока ты не вырос.</p>
      </div>
      <div class="control-card">
        <div class="strip-title">Рекорд</div>
        <p>Лучшая масса: <strong id="best-mass">0</strong> · Лучшее комбо: <strong id="best-combo">0</strong> · Лучший счёт: <strong id="best-score">0</strong></p>
      </div>
      <div class="control-card">
        <div class="strip-title">Финал</div>
        <p>Финальная цель — дорасти до автобуса и проглотить его без потери всех жизней.</p>
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
    resetBoost();
    gravityStormUntil = 0;
    runStartedAt = Date.now();
    showToast('Новый ран начался.', 'info');
  });
  screen.querySelector<HTMLButtonElement>('#boost-button')?.addEventListener('click', () => {
    activateBoost();
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
  window.addEventListener('pointerup', () => { pointerActive = false; });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'ArrowUp') keyboard.up = true;
    if (event.key === 's' || event.key === 'ArrowDown') keyboard.down = true;
    if (event.key === 'a' || event.key === 'ArrowLeft') keyboard.left = true;
    if (event.key === 'd' || event.key === 'ArrowRight') keyboard.right = true;
    if (event.code === 'Space') {
      event.preventDefault();
      activateBoost();
    }
  });
  window.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'ArrowUp') keyboard.up = false;
    if (event.key === 's' || event.key === 'ArrowDown') keyboard.down = false;
    if (event.key === 'a' || event.key === 'ArrowLeft') keyboard.left = false;
    if (event.key === 'd' || event.key === 'ArrowRight') keyboard.right = false;
  });
}

function activateBoost() {
  const current = state.get();
  const now = Date.now();
  if (current.gameOver || current.victory) return;
  if (now < boostCooldownUntil) return;
  boostActiveUntil = now + BOOST_DURATION_MS;
  boostCooldownUntil = now + BOOST_COOLDOWN_MS;
  showToast('Сингулярный рывок!', 'info');
}

function resetBoost() {
  boostActiveUntil = 0;
  boostCooldownUntil = 0;
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
  const result = stepSimulation(dt, movement.x, movement.y, Date.now() < boostActiveUntil, Date.now() < gravityStormUntil);

  if (result.absorbed.length > 0) {
    const latest = result.absorbed[result.absorbed.length - 1];
    if (latest.victory) {
      pulseSceneUntil = Date.now() + 900;
      showToast('Победа! Автобус исчез в сингулярности.', 'success');
    } else if (latest.districtUp) {
      pulseSceneUntil = Date.now() + 700;
      districtBannerText = latest.districtUp;
      districtBannerUntil = Date.now() + 1400;
      showToast(`Новый район: ${latest.districtUp}`, 'success');
    } else if (latest.sizeUp) {
      pulseSceneUntil = Date.now() + 520;
      showToast(`Рост! Размер ${latest.sizeUp}`, 'success');
    } else if (latest.boostRefill) {
      boostCooldownUntil = 0;
      showToast('Ядро рывка! Перезарядка сброшена.', 'info');
    } else if (latest.combo >= 5) {
      gravityStormUntil = Date.now() + GRAVITY_STORM_DURATION_MS;
      pulseSceneUntil = Date.now() + 900;
      showToast('Гравитационный шторм!', 'success');
    } else if (latest.healed) {
      showToast('Сердце восстановило 1 жизнь.', 'success');
    } else if (latest.bonus) {
      showToast('Бонусная звезда! Дополнительные очки.', 'success');
    } else if (latest.combo >= 3) {
      showToast(`Комбо x${latest.combo}`, 'info');
    }
  }

  if (result.heavyHit) {
    hitSceneUntil = Date.now() + 420;
    showToast(
      result.heavyHit.gameOver
        ? 'Слишком тяжело. Ран окончен.'
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
  const now = Date.now();
  const boostActive = now < boostActiveUntil;
  const gravityStormActive = now < gravityStormUntil;
  const elapsedSec = Math.max(0, Math.floor((now - runStartedAt) / 1000));

  setText('hud-mass', String(Math.floor(current.mass)));
  setText('hud-score', String(Math.floor(current.score)));
  setText('hud-combo', String(current.combo));
  setText('hud-district', district.name);
  setText('hud-lives', String(current.lives));
  setText('hud-time', formatTime(elapsedSec));
  setText('best-mass', String(Math.floor(current.bestMass)));
  setText('best-combo', String(current.bestCombo));
  setText('best-score', String(Math.floor(current.bestScore)));

  const sceneCard = document.getElementById('scene-card');
  if (sceneCard) {
    sceneCard.className = `scene-card district-${district.id} ${boostActive ? 'boosting' : ''} ${gravityStormActive ? 'gravity-storm' : ''} ${Date.now() < pulseSceneUntil ? 'pulse-up' : ''} ${Date.now() < hitSceneUntil ? 'hit-flash' : ''} ${current.combo >= 4 ? 'combo-rush' : ''}`;
  }

  const districtPanel = document.getElementById('district-panel');
  if (districtPanel) {
    const dangerNearby = current.objects.some((object) => {
      const dx = current.holeX - object.x;
      const dy = current.holeY - object.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return OBJECT_TYPES[object.typeId].tier > current.sizeLevel && distance < 140;
    });
    districtPanel.innerHTML = `
      <div class="panel-label">Район</div>
      <div class="panel-title">${district.name}</div>
      <div class="panel-text">${district.goal}</div>
      <div class="panel-subtext">Сильный ход: сначала собирай безопасные объекты, потом переходи на более крупные цели.</div>
      <div class="status-line ${dangerNearby ? 'danger-line' : ''}">${dangerNearby ? 'Опасность рядом' : gravityStormActive ? 'Шторм притяжения активен' : 'Район под контролем'}</div>
    `;
  }

  const targetPanel = document.getElementById('target-panel');
  if (targetPanel) {
    targetPanel.innerHTML = `
      <div class="panel-label">Цель роста</div>
      <div class="panel-title">${getCurrentGoalText(current)}</div>
      <div class="target-progress">${progress.next ? `${Math.floor(progress.current)} / ${progress.next}` : 'цель достигнута'}</div>
      <div class="target-bar"><div class="target-bar-fill" style="width:${progress.ratio * 100}%"></div></div>
      <div class="target-foot">Финальный ориентир: автобус. Слишком крупные объекты опасны, пока уровень размера не позволяет их съесть.</div>
    `;
  }

  const legendTrack = document.getElementById('legend-track');
  if (legendTrack) {
    const edible = Object.values(OBJECT_TYPES).filter((item) => item.tier <= current.sizeLevel);
    legendTrack.innerHTML = edible.map((item) => `<div class="legend-chip"><span>${item.emoji}</span><span>${item.label}</span></div>`).join('');
  }

  const boostFill = document.getElementById('boost-bar-fill');
  const boostButton = document.getElementById('boost-button') as HTMLButtonElement | null;
  const comboRush = document.getElementById('combo-rush');
  const stormChip = document.getElementById('storm-chip');
  if (boostFill) {
    const ratio = now < boostCooldownUntil
      ? 1 - Math.max(0, (boostCooldownUntil - now) / BOOST_COOLDOWN_MS)
      : 1;
    boostFill.style.width = `${ratio * 100}%`;
  }
  if (boostButton) {
    const cooling = now < boostCooldownUntil;
    boostButton.disabled = current.gameOver || current.victory || cooling;
    boostButton.textContent = boostActive
      ? 'Рывок активен'
      : cooling
        ? `Перезарядка ${Math.ceil((boostCooldownUntil - now) / 1000)}с`
        : 'Сингулярный рывок';
  }
  if (comboRush) {
    comboRush.classList.toggle('hidden', current.combo < 4);
  }
  if (stormChip) {
    stormChip.classList.toggle('hidden', !gravityStormActive);
  }

  const arena = document.getElementById('arena');
  const field = document.getElementById('hole-field');
  const hole = document.getElementById('hole-core');
  if (!arena || !field || !hole) return;

  const visualRadius = boostActive ? holeRadius * 1.28 : holeRadius;
  field.style.width = `${visualRadius * 4.4}px`;
  field.style.height = `${visualRadius * 4.4}px`;
  field.style.left = `${current.holeX - visualRadius * 2.2}px`;
  field.style.top = `${current.holeY - visualRadius * 2.2}px`;

  hole.style.width = `${holeRadius * 2}px`;
  hole.style.height = `${holeRadius * 2}px`;
  hole.style.left = `${current.holeX - holeRadius}px`;
  hole.style.top = `${current.holeY - holeRadius}px`;

  const objectMap = new Map<string, number>();
  current.objects.forEach((object) => {
    objectMap.set(object.typeId, (objectMap.get(object.typeId) || 0) + 1);
  });
  const boardStatus = document.getElementById('board-status');
  if (boardStatus) {
    boardStatus.innerHTML = Array.from(objectMap.entries())
      .map(([typeId, count]) => {
        const def = OBJECT_TYPES[typeId as keyof typeof OBJECT_TYPES];
        return `<span class="summary-chip ${def.tier <= current.sizeLevel ? 'edible' : 'danger'}">${def.emoji} ×${count}</span>`;
      })
      .join('');
  }

  const hint = document.getElementById('board-hint');
  if (hint) {
    hint.textContent = boostActive
      ? 'Рывок активен — тяни объекты быстрее.'
      : 'Двигайся к мелким объектам и избегай слишком крупных.';
  }

  const banner = document.getElementById('district-banner');
  if (banner) {
    const visible = Date.now() < districtBannerUntil;
    banner.classList.toggle('hidden', !visible);
    banner.textContent = districtBannerText ? `РАЙОН: ${districtBannerText}` : '';
  }

  const bossTarget = document.getElementById('boss-target');
  if (bossTarget) {
    const busObject = current.objects.find((object) => object.typeId === 'bus');
    const showBoss = Boolean(busObject);
    bossTarget.classList.toggle('hidden', !showBoss);
    if (busObject) {
      bossTarget.style.left = `${busObject.x - 48}px`;
      bossTarget.style.top = `${Math.max(12, busObject.y - 74)}px`;
      bossTarget.textContent = current.sizeLevel >= 5 ? 'Цель: автобус' : 'Пока слишком большой';
      bossTarget.classList.toggle('ready', current.sizeLevel >= 5);
    }
  }

  arena.querySelectorAll('.object-node').forEach((node) => node.remove());
  current.objects.forEach((object) => {
    const def = OBJECT_TYPES[object.typeId];
    const node = document.createElement('div');
    node.className = `object-node ${def.tier > current.sizeLevel ? 'danger' : 'safe'} ${def.effect !== 'none' ? 'pickup' : ''} ${def.id === 'bus' ? 'boss' : ''}`;
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
      <div class="overlay-title">${current.victory ? 'Район поглощён' : 'Сингулярность схлопнулась'}</div>
      <p>${current.victory ? 'Ты вырос до размеров автобуса и подчинил себе весь район.' : 'Ты столкнулся с объектами, которые были слишком велики для текущего размера.'}</p>
      <div class="overlay-stats">
        <span>Масса: <strong>${Math.floor(current.mass)}</strong></span>
        <span>Счёт: <strong>${Math.floor(current.score)}</strong></span>
        <span>Лучшее комбо: <strong>${current.bestCombo}</strong></span>
        <span>Ранг: <strong>${getRank(current.score, current.victory)}</strong></span>
      </div>
      <button id="overlay-restart" class="hero-button big">Играть ещё</button>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#overlay-restart')?.addEventListener('click', () => {
    restartRunPreservingMeta();
    resetBoost();
    gravityStormUntil = 0;
    runStartedAt = Date.now();
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

function formatTime(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getRank(score: number, victory: boolean): string {
  if (victory && score >= 2500) return 'S';
  if (score >= 1600) return 'A';
  if (score >= 900) return 'B';
  if (score >= 400) return 'C';
  return 'D';
}
