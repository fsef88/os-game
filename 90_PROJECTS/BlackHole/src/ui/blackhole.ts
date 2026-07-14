import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BOOST_COOLDOWN_MS,
  BOOST_DURATION_MS,
  GRAVITY_STORM_DURATION_MS,
  STAR_SHOWER_DURATION_SEC,
  STAR_SHOWER_INTERVAL_SEC,
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
let convoyUntil = 0;
let runStartedAt = Date.now();
let sceneShakeUntil = 0;
let popupId = 1;
let floatingPopups: Array<{ id: number; x: number; y: number; text: string; tone: 'mass' | 'score' | 'warn'; expiresAt: number }> = [];
let vfxId = 1;
let vfxParticles: Array<{ id: number; x: number; y: number; dx: number; dy: number; size: number; tone: 'cyan' | 'gold' | 'red'; expiresAt: number }> = [];


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
      <div class="hero-actions"><button id="help-button" class="hero-button">Как играть</button><button id="restart-button" class="hero-button">Новый ран</button></div>
    </div>

    <div class="hud-row">
      <div class="hud-pill">⚫ Масса <strong id="hud-mass">0</strong></div>
      <div class="hud-pill">✦ Счёт <strong id="hud-score">0</strong></div>
      <div class="hud-pill">🔥 Комбо <strong id="hud-combo">0</strong></div>
      <div class="hud-pill">🗺 Район <strong id="hud-district">Двор</strong></div>
      <div class="hud-pill">❤ Жизни <strong id="hud-lives">3</strong></div>
      <div class="hud-pill">🛡️ Щит <strong id="hud-shield">0</strong></div>
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
        <div id="suction-layer" class="suction-layer"></div>
        <div id="popup-layer" class="popup-layer"></div>
        <div id="vfx-layer" class="vfx-layer"></div>
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
        <div id="star-chip" class="tip-chip hidden">ЗВЁЗДНЫЙ ДОЖДЬ</div>
        <div id="convoy-chip" class="tip-chip hidden">КОНВОЙ</div>
        <div class="combo-meter"><div class="boost-label">окно комбо</div><div class="boost-bar"><div id="combo-bar-fill" class="combo-bar-fill"></div></div></div>
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
  screen.querySelector<HTMLButtonElement>('#help-button')?.addEventListener('click', () => {
    showFirstRunOverlay(true);
  });
  screen.querySelector<HTMLButtonElement>('#restart-button')?.addEventListener('click', () => {
    restartRunPreservingMeta();
    resetBoost();
    gravityStormUntil = 0;
    convoyUntil = 0;
    runStartedAt = Date.now();
    showToast('Новый ран начался.', 'info');
  });
  screen.querySelector<HTMLButtonElement>('#boost-button')?.addEventListener('click', () => {
    activateBoost();
  });

  state.subscribe(renderScene);
  renderScene();
  requestAnimationFrame(loop);
  if (!state.get().firstRunSeen) {
    showFirstRunOverlay(false);
  }
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
  const elapsedSec = Math.max(0, Math.floor((Date.now() - runStartedAt) / 1000));
  const starShowerActive = elapsedSec > 0 && elapsedSec % STAR_SHOWER_INTERVAL_SEC >= STAR_SHOWER_INTERVAL_SEC - STAR_SHOWER_DURATION_SEC;
  const convoyActive = Date.now() < convoyUntil;
  const result = stepSimulation(dt, movement.x, movement.y, Date.now() < boostActiveUntil, Date.now() < gravityStormUntil, starShowerActive || convoyActive);

  if (result.absorbed.length > 0) {
    const latest = result.absorbed[result.absorbed.length - 1];
    for (const event of result.absorbed) {
      spawnSuctionBurst(event.x, event.y, event.bonus ? 'gold' : event.victory ? 'cyan' : 'cyan', Math.min(10, 4 + event.combo));
    }
    if (latest.victory) {
      pulseSceneUntil = Date.now() + 900;
      spawnPopup(latest.x, latest.y, '+ФИНИШ', 'score');
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
    } else if (latest.shieldGained) {
      showToast('Щит заряжен.', 'success');
    } else if (latest.bonus) {
      showToast('Бонусная звезда! Дополнительные очки.', 'success');
    } else if (latest.combo >= 3) {
      showToast(`Комбо x${latest.combo}`, 'info');
    }
    spawnPopup(latest.x, latest.y, `+${latest.massGain} масса`, 'mass');
    if (latest.scoreGain > 0) spawnPopup(latest.x + 18, latest.y - 16, `+${latest.scoreGain}`, 'score');
  }

  if (result.heavyHit) {
    hitSceneUntil = Date.now() + 420;
    sceneShakeUntil = Date.now() + 260;
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
  const starShowerActive = elapsedSec > 0 && elapsedSec % STAR_SHOWER_INTERVAL_SEC >= STAR_SHOWER_INTERVAL_SEC - STAR_SHOWER_DURATION_SEC;
  const convoyActive = state.get().districtIndex === 2 && state.get().sizeLevel >= 5 && now < convoyUntil;

  setText('hud-mass', String(Math.floor(current.mass)));
  setText('hud-score', String(Math.floor(current.score)));
  setText('hud-combo', String(current.combo));
  setText('hud-district', district.name);
  setText('hud-lives', String(current.lives));
  setText('hud-shield', String(current.shieldCharges));
  setText('hud-time', formatTime(elapsedSec));
  setText('best-mass', String(Math.floor(current.bestMass)));
  setText('best-combo', String(current.bestCombo));
  setText('best-score', String(Math.floor(current.bestScore)));

  const sceneCard = document.getElementById('scene-card');
  if (sceneCard) {
    sceneCard.className = `scene-card district-${district.id} ${boostActive ? 'boosting' : ''} ${gravityStormActive ? 'gravity-storm' : ''} ${starShowerActive ? 'star-shower' : ''} ${convoyActive ? 'convoy-mode' : ''} ${Date.now() < pulseSceneUntil ? 'pulse-up' : ''} ${Date.now() < hitSceneUntil ? 'hit-flash' : ''} ${Date.now() < sceneShakeUntil ? 'screen-shake' : ''} ${current.combo >= 4 ? 'combo-rush' : ''}`;
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
      <div class="panel-subtext">Сильный ход: сначала собирай безопасные объекты, потом переходи на более крупные цели. Во время звёздного дождя охоться на бонусные звёзды.</div>
      <div class="status-line ${dangerNearby ? 'danger-line' : ''}">${dangerNearby ? 'Опасность рядом' : convoyActive ? 'Конвой начался' : gravityStormActive ? 'Шторм притяжения активен' : starShowerActive ? 'Звёздный дождь идёт' : 'Район под контролем'}</div>
    `;
  }

  const targetPanel = document.getElementById('target-panel');
  if (targetPanel) {
    targetPanel.innerHTML = `
      <div class="panel-label">Цель роста</div>
      <div class="panel-title">${getCurrentGoalText(current)}</div>
      <div class="target-progress">${progress.next ? `${Math.floor(progress.current)} / ${progress.next}` : 'цель достигнута'}</div>
      <div class="target-bar"><div class="target-bar-fill" style="width:${progress.ratio * 100}%"></div></div>
      <div class="target-foot">${current.sizeLevel >= 5 && district.id === 2 ? 'Финальная стадия: в любой момент может начаться конвой из такси, автобусов и полиции.' : 'Финальный ориентир: автобус. Слишком крупные объекты опасны, пока уровень размера не позволяет их съесть.'}</div>
    `;
  }

  const legendTrack = document.getElementById('legend-track');
  if (legendTrack) {
    const edible = Object.values(OBJECT_TYPES).filter((item) => item.tier <= current.sizeLevel);
    legendTrack.innerHTML = edible.map((item) => `
      <div class="legend-chip">
        <span class="legend-icon">${getObjectSpriteMarkup(item.id as keyof typeof OBJECT_TYPES)}</span>
        <span>${item.label}</span>
      </div>
    `).join('');
  }

  const boostFill = document.getElementById('boost-bar-fill');
  const boostButton = document.getElementById('boost-button') as HTMLButtonElement | null;
  const comboRush = document.getElementById('combo-rush');
  const stormChip = document.getElementById('storm-chip');
  const starChip = document.getElementById('star-chip');
  const convoyChip = document.getElementById('convoy-chip');
  const comboBar = document.getElementById('combo-bar-fill');
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
  if (starChip) {
    starChip.classList.toggle('hidden', !starShowerActive);
  }
  if (convoyChip) {
    convoyChip.classList.toggle('hidden', !convoyActive);
  }
  if (comboBar) {
    const comboRatio = current.combo > 0 ? Math.max(0, 1 - (now - current.lastAbsorbAt) / 1500) : 0;
    comboBar.style.width = `${comboRatio * 100}%`;
  }

  const arena = document.getElementById('arena');
  const popupLayer = document.getElementById('popup-layer');
  const vfxLayer = document.getElementById('vfx-layer');
  const suctionLayer = document.getElementById('suction-layer');
  const field = document.getElementById('hole-field');
  const hole = document.getElementById('hole-core');
  if (!arena || !field || !hole || !popupLayer || !vfxLayer || !suctionLayer) return;

  const visualRadius = boostActive ? holeRadius * 1.28 : holeRadius;
  field.style.width = `${visualRadius * 4.4}px`;
  field.style.height = `${visualRadius * 4.4}px`;
  field.style.left = `${current.holeX - visualRadius * 2.2}px`;
  field.style.top = `${current.holeY - visualRadius * 2.2}px`;

  hole.style.width = `${holeRadius * 2}px`;
  hole.style.height = `${holeRadius * 2}px`;
  hole.style.left = `${current.holeX - holeRadius}px`;
  hole.style.top = `${current.holeY - holeRadius}px`;
  hole.classList.toggle('shielded', current.shieldCharges > 0);
  hole.classList.toggle('storm-core', gravityStormActive);

  const suctionReach = visualRadius + (boostActive || gravityStormActive ? 170 : 132);
  const suctionLines = current.objects
    .filter((object) => {
      const def = OBJECT_TYPES[object.typeId];
      const distance = Math.hypot(current.holeX - object.x, current.holeY - object.y);
      return def.tier <= current.sizeLevel && distance < suctionReach && distance > holeRadius * 0.65;
    })
    .slice(0, 14)
    .map((object) => {
      const def = OBJECT_TYPES[object.typeId];
      const dx = current.holeX - object.x;
      const dy = current.holeY - object.y;
      const length = Math.max(12, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const opacity = Math.max(0.18, Math.min(0.72, 1 - length / suctionReach));
      return `<div class="suction-line type-${def.effect === 'bonus' ? 'gold' : 'cyan'}" style="left:${object.x}px; top:${object.y}px; width:${length}px; transform: rotate(${angle}deg); opacity:${opacity};"></div>`;
    })
    .join('');
  suctionLayer.innerHTML = suctionLines;

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
    if (state.get().districtIndex === 2 && state.get().sizeLevel >= 5 && now >= convoyUntil) {
      convoyUntil = now + 6000;
      districtBannerText = 'КОНВОЙ';
      districtBannerUntil = now + 1200;
      showToast('На проспекте начался конвой!', 'danger');
    }
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
  floatingPopups = floatingPopups.filter((popup) => popup.expiresAt > now);
  vfxParticles = vfxParticles.filter((particle) => particle.expiresAt > now);
  popupLayer.innerHTML = floatingPopups.map((popup) => `<div class="float-popup ${popup.tone}" style="left:${popup.x}px; top:${popup.y}px">${popup.text}</div>`).join('');
  vfxLayer.innerHTML = vfxParticles.map((particle) => `<div class="vfx-particle ${particle.tone}" style="left:${particle.x}px; top:${particle.y}px; width:${particle.size}px; height:${particle.size}px; --dx:${particle.dx}px; --dy:${particle.dy}px;"></div>`).join('');
  current.objects.forEach((object) => {
    const def = OBJECT_TYPES[object.typeId];
    const node = document.createElement('div');
    node.className = `object-node type-${def.id} ${def.tier > current.sizeLevel ? 'danger' : 'safe'} ${def.effect !== 'none' ? 'pickup' : ''} ${def.id === 'bus' ? 'boss' : ''}`;
    node.style.width = `${def.radius * 2}px`;
    node.style.height = `${def.radius * 2}px`;
    node.style.left = `${object.x - def.radius}px`;
    node.style.top = `${object.y - def.radius}px`;
    node.style.setProperty('--accent', def.color);
    node.innerHTML = getObjectSpriteMarkup(object.typeId);
    arena.appendChild(node);
  });

  renderOverlay();
  renderToast();
}

function renderOverlay() {
  const current = state.get();
  const root = document.getElementById('overlay-root');
  if (!root) return;

  if (root.dataset.mode === 'tutorial') {
    return;
  }

  if (!current.gameOver && !current.victory) {
    root.classList.add('hidden');
    root.innerHTML = '';
    root.dataset.mode = 'none';
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
        <span>Медаль: <strong>${getMedal(current)}</strong></span>
      </div>
      <button id="overlay-restart" class="hero-button big">Играть ещё</button>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#overlay-restart')?.addEventListener('click', () => {
    restartRunPreservingMeta();
    resetBoost();
    gravityStormUntil = 0;
    convoyUntil = 0;
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

function showFirstRunOverlay(force = false) {
  const root = document.getElementById('overlay-root');
  if (!root) return;
  const current = state.get();
  if (current.firstRunSeen && !force) return;

  root.classList.remove('hidden');
  root.dataset.mode = 'tutorial';
  root.innerHTML = `
    <div class="overlay-backdrop"></div>
    <div class="overlay-card tutorial-card">
      <div class="overlay-title">Как играть за 10 секунд</div>
      <div class="overlay-stats">
        <span><strong>1.</strong> Веди дыру к мелким объектам</span>
        <span><strong>2.</strong> Всё меньше тебя засасывается автоматически</span>
        <span><strong>3.</strong> Расти, лови комбо и избегай слишком больших объектов</span>
      </div>
      <button id="tutorial-start" class="hero-button big">Поехали</button>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#tutorial-start')?.addEventListener('click', () => {
    root.classList.add('hidden');
    root.innerHTML = '';
    root.dataset.mode = 'none';
    if (!current.firstRunSeen) state.set({ firstRunSeen: true });
  });
}

function setText(id: string, value: string) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function getObjectSpriteMarkup(typeId: keyof typeof OBJECT_TYPES): string {
  switch (typeId) {
    case 'coin':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="#f7c84b"/><circle cx="32" cy="32" r="16" fill="#ffdf76"/><circle cx="32" cy="32" r="7" fill="#f3b73a"/></svg>`;
    case 'crate':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="14" width="36" height="36" rx="8" fill="#b88345"/><path d="M14 24h36M14 38h36M32 14v36" stroke="#8a5d2d" stroke-width="4"/></svg>`;
    case 'star':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 9l6 13 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z" fill="#ffe66d"/><circle cx="32" cy="32" r="6" fill="#fff6b8"/></svg>`;
    case 'heart':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 52c-2-2-17-11-17-24 0-7 5-12 11-12 3 0 5 1 6 4 1-3 3-4 6-4 6 0 11 5 11 12 0 13-15 22-17 24z" fill="#ff7187"/></svg>`;
    case 'shield':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10l16 6v12c0 11-7 19-16 26-9-7-16-15-16-26V16z" fill="#6fb7ff"/><path d="M32 18v26" stroke="#d8f0ff" stroke-width="4"/><path d="M21 28h22" stroke="#d8f0ff" stroke-width="4"/></svg>`;
    case 'cone':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><rect x="18" y="20" width="28" height="24" rx="6" fill="#ffb14a"/><path d="M18 28h28M18 36h28" stroke="#fff4d6" stroke-width="4"/><path d="M22 44h4v10M38 44h4v10" stroke="#666f91" stroke-width="4" stroke-linecap="round"/></svg>`;
    case 'scooter':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="44" r="7" fill="#7fd6ff"/><circle cx="44" cy="44" r="7" fill="#7fd6ff"/><path d="M18 38h14l7-14h4" stroke="#9ce7ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 24v-8" stroke="#9ce7ff" stroke-width="4" stroke-linecap="round"/></svg>`;
    case 'core':
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="18" fill="#627cff" opacity="0.35"/><path d="M32 14c6 8 6 28 0 36-6-8-6-28 0-36zm-18 18c8-6 28-6 36 0-8 6-28 6-36 0z" fill="#8ab0ff"/></svg>`;
    case 'car':
      return `<svg class="obj-svg vehicle-svg" viewBox="0 0 96 64" aria-hidden="true"><ellipse cx="48" cy="52" rx="33" ry="6" fill="#060913" opacity=".36"/><path d="M16 30c4-9 12-14 23-14h18c9 0 17 5 23 14l6 4v12c0 5-4 9-9 9H19c-5 0-9-4-9-9V34z" fill="#f15f67"/><path d="M34 20h20c6 0 11 3 16 10H24c3-6 6-10 10-10z" fill="#ff8a8f"/><path d="M35 22h12v10H27c2-5 5-8 8-10zm15 0h5c5 0 9 3 13 10H50z" fill="#dff8ff" opacity=".86"/><circle cx="25" cy="51" r="7" fill="#151a35"/><circle cx="71" cy="51" r="7" fill="#151a35"/><circle cx="25" cy="51" r="3" fill="#8fa1c8"/><circle cx="71" cy="51" r="3" fill="#8fa1c8"/><path d="M12 39h10M74 39h10" stroke="#ffe9a6" stroke-width="4" stroke-linecap="round"/></svg>`;
    case 'taxi':
      return `<svg class="obj-svg vehicle-svg" viewBox="0 0 96 64" aria-hidden="true"><ellipse cx="48" cy="52" rx="34" ry="6" fill="#060913" opacity=".34"/><path d="M14 31c5-10 13-15 25-15h18c10 0 18 5 25 15l5 4v11c0 5-4 9-9 9H18c-5 0-9-4-9-9V35z" fill="#ffd84d"/><rect x="40" y="9" width="16" height="8" rx="3" fill="#20243d"/><path d="M28 33h40" stroke="#1d2138" stroke-width="4" stroke-dasharray="5 4"/><path d="M34 21h31c4 2 7 5 10 10H22c3-5 7-8 12-10z" fill="#fff4b4"/><circle cx="25" cy="51" r="7" fill="#14172d"/><circle cx="72" cy="51" r="7" fill="#14172d"/></svg>`;
    case 'bus':
      return `<svg class="obj-svg vehicle-svg" viewBox="0 0 112 64" aria-hidden="true"><ellipse cx="56" cy="55" rx="43" ry="6" fill="#050814" opacity=".38"/><rect x="10" y="14" width="92" height="38" rx="12" fill="#419ff2"/><path d="M18 20h58c9 0 16 7 16 16H18z" fill="#61b9ff"/><rect x="18" y="22" width="16" height="12" rx="3" fill="#d9f3ff"/><rect x="38" y="22" width="16" height="12" rx="3" fill="#d9f3ff"/><rect x="58" y="22" width="16" height="12" rx="3" fill="#d9f3ff"/><rect x="79" y="22" width="14" height="12" rx="3" fill="#d9f3ff"/><path d="M18 41h76" stroke="#2079c9" stroke-width="4"/><circle cx="28" cy="53" r="7" fill="#101735"/><circle cx="84" cy="53" r="7" fill="#101735"/></svg>`;
    case 'police':
      return `<svg class="obj-svg vehicle-svg" viewBox="0 0 96 64" aria-hidden="true"><ellipse cx="48" cy="52" rx="34" ry="6" fill="#060913" opacity=".34"/><path d="M14 31c5-10 13-15 25-15h18c10 0 18 5 25 15l5 4v11c0 5-4 9-9 9H18c-5 0-9-4-9-9V35z" fill="#76b8ff"/><path d="M18 41h60" stroke="#f5f8ff" stroke-width="7"/><path d="M35 21h31c4 2 7 5 10 10H22c3-5 7-8 13-10z" fill="#eef8ff"/><rect x="40" y="10" width="8" height="7" rx="2" fill="#ff6276"/><rect x="49" y="10" width="8" height="7" rx="2" fill="#7fd6ff"/><circle cx="25" cy="51" r="7" fill="#14172d"/><circle cx="72" cy="51" r="7" fill="#14172d"/></svg>`;
    default:
      return `<svg class="obj-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="18" fill="#ffffff" opacity="0.6"/></svg>`;
  }
}

function spawnPopup(x: number, y: number, text: string, tone: 'mass' | 'score' | 'warn') {
  floatingPopups.push({ id: popupId++, x, y, text, tone, expiresAt: Date.now() + 900 });
}

function spawnSuctionBurst(x: number, y: number, tone: 'cyan' | 'gold' | 'red', count: number) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 44;
    vfxParticles.push({
      id: vfxId++,
      x,
      y,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 4 + Math.random() * 7,
      tone,
      expiresAt: Date.now() + 640,
    });
  }
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

function getMedal(current: ReturnType<typeof state.get>): string {
  if (current.victory && current.lives === 3) return 'Безупречно';
  if (current.victory) return 'Победа';
  if (current.bestCombo >= 8) return 'Комбо-мастер';
  if (current.score >= 1200) return 'Охотник';
  return 'Новичок';
}
