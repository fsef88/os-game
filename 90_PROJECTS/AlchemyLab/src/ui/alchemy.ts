import { ALCHEMY_ITEMS } from '../config';
import { state } from '../state';
import {
  canClaimDailyReward,
  canGatherIngredient,
  claimDailyReward,
  claimMission,
  fulfillCurrentOrder,
  fulfillSpecialContract,
  gatherIngredient,
  getCatalystUpgradeCost,
  getCurrentDailyReward,
  getItemCountOnBoard,
  getLabLevel,
  getMissionViews,
  getOrderProgress,
  getRareSpawnChance,
  getSpecialContractProgress,
  getUnlockNextCellCost,
  interactWithCell,
  unlockNextCell,
  upgradeCatalyst,
} from '../core/alchemy';

let selectedIndex: number | null = null;
let flashCellIndex: number | null = null;
let mounted = false;
let toastTimeout: number | null = null;
let toastState: { tone: 'info' | 'success' | 'magic'; text: string } | null = null;
let overlayMode: 'none' | 'journal' | 'missions' | 'upgrades' = 'none';

export function initAlchemyLab(container: HTMLElement) {
  if (mounted) return;
  mounted = true;

  const screen = document.createElement('section');
  screen.className = 'alchemy-screen';
  screen.innerHTML = `
    <div class="lab-ambient" aria-hidden="true">
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
      <div class="orb orb-c"></div>
    </div>

    <div id="toast-layer" class="toast-layer"></div>

    <div class="hero-intro panel-soft">
      <div class="hero-copy">
        <div class="eyebrow">Alchemy Lab 1.1</div>
        <h1>Алхимическая мастерская</h1>
        <p class="subtitle">Собирай ингредиенты прямо на столе, соединяй одинаковые элементы и превращай открытия в заказы и редкие контракты.</p>
      </div>
      <div id="objective-banner" class="objective-banner"></div>
    </div>

    <div class="game-scene">
      <div class="floating-card left-card">
        <div class="card-title">Заказ мастерской</div>
        <div id="order-card" class="order-note"></div>
        <div id="daily-mini" class="mini-bonus"></div>
      </div>

      <div class="table-stage">
        <div class="table-stage-top">
          <div>
            <div class="stage-title">Стол алхимика</div>
            <div id="board-hint" class="stage-hint"></div>
          </div>
          <div class="stage-badges">
            <span class="badge">Уровень <strong id="lab-level-inline">1</strong></span>
            <span class="badge">Редкий шанс <strong id="rare-chance-inline">0%</strong></span>
          </div>
        </div>

        <div class="table-shell">
          <div class="table-light"></div>
          <div id="board-status" class="board-status"></div>
          <div id="alchemy-board" class="alchemy-board"></div>
        </div>

        <div id="recipe-strip" class="recipe-strip"></div>

        <div class="action-dock">
          <button id="gather-button" class="primary-action">Призвать искру</button>
          <button id="fulfill-button" class="secondary-action">Сдать заказ</button>
          <button id="special-button" class="secondary-action">Особый контракт</button>
          <button id="journal-button" class="secondary-action">Книга</button>
          <button id="missions-button" class="secondary-action">Цели</button>
          <button id="upgrades-button" class="secondary-action">Улучшения</button>
        </div>
      </div>

      <div class="floating-card right-card">
        <div class="card-title">Открытия</div>
        <div id="journal-preview" class="journal-preview"></div>
        <div id="special-preview" class="special-preview"></div>
      </div>
    </div>

    <div id="overlay-root" class="overlay-root hidden"></div>
  `;

  container.appendChild(screen);

  screen.querySelector<HTMLButtonElement>('#gather-button')?.addEventListener('click', () => {
    const result = gatherIngredient();
    if (!result.ok) return;

    if (result.rare && result.tier !== undefined) {
      showToast(`Редкая удача! Сразу создан: ${ALCHEMY_ITEMS[result.tier].name}`, 'magic');
      renderAlchemyLab();
      return;
    }

    const sparkCount = getItemCountOnBoard(0);
    showToast(sparkCount >= 2 ? 'Теперь соедини две искры.' : 'На столе появилась новая искра.', 'info');
  });

  screen.querySelector<HTMLButtonElement>('#fulfill-button')?.addEventListener('click', () => {
    const result = fulfillCurrentOrder();
    if (!result.ok) return;
    showToast(`Заказ выполнен: +${result.reward} эссенции`, 'success');
  });

  screen.querySelector<HTMLButtonElement>('#special-button')?.addEventListener('click', () => {
    const result = fulfillSpecialContract();
    if (!result.ok) return;
    showToast(`Особый контракт закрыт: +${result.reward} эссенции`, 'magic');
  });

  screen.querySelector<HTMLButtonElement>('#journal-button')?.addEventListener('click', () => {
    overlayMode = overlayMode === 'journal' ? 'none' : 'journal';
    renderAlchemyLab();
  });
  screen.querySelector<HTMLButtonElement>('#missions-button')?.addEventListener('click', () => {
    overlayMode = overlayMode === 'missions' ? 'none' : 'missions';
    renderAlchemyLab();
  });
  screen.querySelector<HTMLButtonElement>('#upgrades-button')?.addEventListener('click', () => {
    overlayMode = overlayMode === 'upgrades' ? 'none' : 'upgrades';
    renderAlchemyLab();
  });

  state.subscribe(renderAlchemyLab);
  renderAlchemyLab();
}

function renderAlchemyLab() {
  renderObjective();
  renderOrderCard();
  renderDailyMini();
  renderBoard();
  renderRecipeStrip();
  renderJournalPreview();
  renderSpecialPreview();
  renderInlineStats();
  renderDockButtons();
  renderOverlay();
  renderToast();
}

function renderObjective() {
  const current = state.get();
  const sparkCount = getItemCountOnBoard(0);
  const orderProgress = getOrderProgress();
  const specialProgress = getSpecialContractProgress();
  const target = document.getElementById('objective-banner');
  if (!target) return;

  let title = 'Сделай следующее действие';
  let body = 'Играй через стол: вызывай элементы, объединяй одинаковые и превращай открытия в награду.';

  if (current.ordersCompleted === 0 && current.mergesCompleted === 0 && sparkCount < 2) {
    title = 'Шаг 1 — призови вторую искру';
    body = 'На столе уже лежит 1 искра. Нажми большую кнопку снизу ещё раз и собери пару для первого слияния.';
  } else if (current.ordersCompleted === 0 && current.mergesCompleted === 0) {
    title = 'Шаг 2 — соедини две искры';
    body = selectedIndex === null
      ? 'Тапни по одной искре, потом по второй. Две одинаковые искры превращаются в Свет-траву.'
      : 'Одна искра уже выбрана. Тапни по второй такой же — получишь Свет-траву.';
  } else if (current.ordersCompleted === 0 && orderProgress.completed) {
    title = 'Шаг 3 — сдай первый заказ';
    body = 'Свет-трава уже готова. Нажми «Сдать заказ» и получи первую эссенцию.';
  } else if (specialProgress.active && specialProgress.completed) {
    title = 'Особый контракт готов';
    body = 'На столе уже есть нужный редкий ингредиент. Сдай его за крупную награду.';
  } else if (canClaimDailyReward()) {
    const daily = getCurrentDailyReward();
    title = `Бонус дня ${daily.day}`;
    body = `Сегодня можно забрать +${daily.reward} эссенции без лишних экранов и пауз.`;
  } else if (getMissionViews().some((mission) => mission.completed && !mission.claimed)) {
    title = 'Забери награду за цель';
    body = 'Одно из поручений алхимика уже выполнено. Открой панель «Цели» и забери бонус.';
  } else if (getUnlockNextCellCost() !== null && current.essence >= (getUnlockNextCellCost() || Infinity)) {
    title = 'Открой новую клетку';
    body = 'Чем больше места на столе, тем длиннее цепочки слияний и тем меньше тупиков.';
  } else if (current.essence >= getCatalystUpgradeCost()) {
    title = 'Усиль катализатор';
    body = `Катализатор повышает награды и шанс редкого появления. Сейчас редкий шанс: ${(getRareSpawnChance() * 100).toFixed(0)}%.`;
  } else {
    const item = ALCHEMY_ITEMS[current.currentOrder.tier];
    title = `Следующая цель — ${item.name}`;
    body = `Собери нужный tier для текущего заказа, а потом попробуй открыть ещё одну формулу.`;
  }

  target.innerHTML = `
    <div class="objective-title">${title}</div>
    <div class="objective-body">${body}</div>
  `;
}

function renderOrderCard() {
  const current = state.get();
  const order = current.currentOrder;
  const progress = getOrderProgress();
  const item = ALCHEMY_ITEMS[order.tier];
  const previous = ALCHEMY_ITEMS[Math.max(0, order.tier - 1)];
  const target = document.getElementById('order-card');
  if (!target) return;

  target.innerHTML = `
    <div class="order-head">
      <span class="order-item-emoji">${item.emoji}</span>
      <div>
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-meta">Tier ${item.tier} · обычный заказ</div>
      </div>
    </div>
    <div class="order-progress ${progress.completed ? 'ready' : ''}">На столе: ${progress.have}/${progress.need}</div>
    <div class="order-formula">2 ${previous.name} → ${item.name}</div>
    <div class="order-reward">Награда: +${order.reward} эссенции</div>
  `;
}

function renderDailyMini() {
  const target = document.getElementById('daily-mini');
  if (!target) return;

  const current = state.get();
  const daily = getCurrentDailyReward();
  const available = canClaimDailyReward();

  target.innerHTML = `
    <div class="mini-title">Бонус дня</div>
    <div class="mini-text">День ${daily.day} · серия ${current.dailyStreak} · +${daily.reward} эссенции</div>
    <button id="daily-claim-button" class="${available ? 'mini-claim ready' : 'mini-claim'}" ${available ? '' : 'disabled'}>
      ${available ? 'Забрать' : 'Получено'}
    </button>
  `;

  target.querySelector<HTMLButtonElement>('#daily-claim-button')?.addEventListener('click', () => {
    const result = claimDailyReward();
    if (!result.ok) return;
    showToast(`Бонус дня ${result.day}: +${result.reward} эссенции`, 'success');
  });
}

function renderBoard() {
  const current = state.get();
  const board = document.getElementById('alchemy-board');
  const hint = document.getElementById('board-hint');
  const status = document.getElementById('board-status');
  if (!board || !hint || !status) return;

  const selectedTier = selectedIndex !== null ? current.grid[selectedIndex] : null;
  status.innerHTML = createBoardSummary(current.grid.slice(0, current.unlockedCells));
  board.innerHTML = '';

  current.grid.forEach((tier, index) => {
    const cell = document.createElement('button');
    cell.className = 'alchemy-cell';
    cell.type = 'button';

    if (index >= current.unlockedCells) {
      cell.classList.add('locked');
      cell.innerHTML = '<span class="cell-lock">🔒</span>';
      cell.disabled = true;
      board.appendChild(cell);
      return;
    }

    if (selectedIndex === index) cell.classList.add('selected');
    if (flashCellIndex === index) cell.classList.add('merge-flash');

    if (tier === null) {
      cell.classList.add('empty');
      cell.innerHTML = '<span class="cell-empty">+</span>';
    } else {
      const item = ALCHEMY_ITEMS[tier];
      cell.style.setProperty('--cell-accent', item.color);
      cell.innerHTML = `
        <span class="cell-emoji">${item.emoji}</span>
        <span class="cell-label">${item.name}</span>
      `;

      if (current.ordersCompleted === 0 && current.mergesCompleted === 0 && tier === 0 && selectedIndex === null) {
        cell.classList.add('goal-cell');
      }
      if (selectedIndex !== null && selectedTier !== null && tier === selectedTier && index !== selectedIndex) {
        cell.classList.add('merge-match');
      }
    }

    cell.addEventListener('click', () => {
      const result = interactWithCell(index, selectedIndex);
      selectedIndex = result.selectedIndex;
      if (result.merge) {
        flashCellIndex = result.merge.targetIndex;
        showToast(
          result.merge.discovered
            ? `Новое открытие: ${result.merge.resultName}`
            : `Слияние → ${result.merge.resultName}`,
          result.merge.discovered ? 'magic' : 'success',
        );
        window.setTimeout(() => {
          flashCellIndex = null;
          renderAlchemyLab();
        }, 520);
      }
      renderAlchemyLab();
    });

    board.appendChild(cell);
  });

  hint.textContent = selectedIndex === null
    ? 'Тапни по двум одинаковым элементам, чтобы объединить их.'
    : 'Элемент выбран. Тапни по такому же, чтобы сделать merge.';
}

function renderRecipeStrip() {
  const target = document.getElementById('recipe-strip');
  if (!target) return;

  target.innerHTML = ALCHEMY_ITEMS.slice(0, -1).map((item) => {
    const next = ALCHEMY_ITEMS[item.tier + 1];
    return `
      <div class="recipe-token">
        <span>${item.emoji} ${item.name}</span>
        <span class="recipe-arrow">×2 →</span>
        <span class="recipe-target">${next.emoji} ${next.name}</span>
      </div>
    `;
  }).join('');
}

function renderJournalPreview() {
  const target = document.getElementById('journal-preview');
  if (!target) return;

  const discoveries = state.get().discoveries;
  target.innerHTML = ALCHEMY_ITEMS.map((item) => {
    const discovered = discoveries.includes(item.tier);
    return discovered
      ? `<div class="preview-entry"><span>${item.emoji}</span><span>${item.name}</span></div>`
      : `<div class="preview-entry hidden">❔ Неизвестная формула</div>`;
  }).join('');
}

function renderSpecialPreview() {
  const target = document.getElementById('special-preview');
  if (!target) return;
  const special = state.get().specialContract;

  target.innerHTML = special
    ? `<div class="mini-title">Особый контракт активен</div><div class="mini-text">Нужен ${ALCHEMY_ITEMS[special.tier].name} · награда +${special.reward}</div>`
    : `<div class="mini-title">Особый контракт</div><div class="mini-text">Появится позже, когда ты освоишь базовый цикл.</div>`;
}

function renderDockButtons() {
  const current = state.get();
  const gatherButton = document.getElementById('gather-button') as HTMLButtonElement | null;
  const fulfillButton = document.getElementById('fulfill-button') as HTMLButtonElement | null;
  const specialButton = document.getElementById('special-button') as HTMLButtonElement | null;
  const unlockButton = document.getElementById('unlock-button') as HTMLButtonElement | null;
  const catalystButton = document.getElementById('catalyst-button') as HTMLButtonElement | null;

  if (gatherButton) gatherButton.disabled = !canGatherIngredient();
  if (fulfillButton) fulfillButton.disabled = !getOrderProgress().completed;

  const specialProgress = getSpecialContractProgress();
  if (specialButton) specialButton.disabled = !specialProgress.active || !specialProgress.completed;

  const unlockCost = getUnlockNextCellCost();
  if (unlockButton) {
    unlockButton.disabled = unlockCost === null || current.essence < unlockCost;
    unlockButton.textContent = unlockCost === null ? 'Все клетки открыты' : `Клетка (${unlockCost})`;
  }

  const catalystCost = getCatalystUpgradeCost();
  if (catalystButton) {
    catalystButton.disabled = current.essence < catalystCost;
    catalystButton.textContent = `Катализатор (${catalystCost})`;
  }
}

function renderInlineStats() {
  const current = state.get();
  const level = document.getElementById('lab-level-inline');
  const rareChance = document.getElementById('rare-chance-inline');
  if (level) level.textContent = String(getLabLevel(current));
  if (rareChance) rareChance.textContent = `${Math.round(getRareSpawnChance() * 100)}%`;
}

function renderOverlay() {
  const root = document.getElementById('overlay-root');
  if (!root) return;

  if (overlayMode === 'none') {
    root.classList.add('hidden');
    root.innerHTML = '';
    return;
  }

  root.classList.remove('hidden');

  if (overlayMode === 'journal') {
    root.innerHTML = `
      <div class="overlay-backdrop"></div>
      <div class="overlay-card">
        <div class="overlay-head">
          <h3>Книга открытий</h3>
          <button id="overlay-close" class="secondary-action small">Закрыть</button>
        </div>
        <div class="overlay-list">
          ${ALCHEMY_ITEMS.map((item) => {
            const discovered = state.get().discoveries.includes(item.tier);
            return discovered
              ? `<div class="overlay-row"><span>${item.emoji}</span><div><strong>${item.name}</strong><div class="muted">${item.description}</div></div></div>`
              : `<div class="overlay-row hidden"><span>❔</span><div>Неизвестная формула</div></div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  if (overlayMode === 'missions') {
    root.innerHTML = `
      <div class="overlay-backdrop"></div>
      <div class="overlay-card">
        <div class="overlay-head">
          <h3>Поручения алхимика</h3>
          <button id="overlay-close" class="secondary-action small">Закрыть</button>
        </div>
        <div class="overlay-list mission-overlay-list">
          ${getMissionViews().map((mission) => `
            <div class="mission-card ${mission.completed ? 'mission-done' : ''}">
              <div class="mission-top">
                <div>
                  <div class="mission-title">${mission.title}</div>
                  <div class="muted">${mission.description}</div>
                </div>
                <div class="mission-reward">+${mission.reward}</div>
              </div>
              <div class="mission-progress">${mission.progress}/${mission.target}</div>
              <button data-mission-id="${mission.id}" class="mission-claim ${mission.completed && !mission.claimed ? 'gold-like' : 'secondary'}" ${mission.completed && !mission.claimed ? '' : 'disabled'}>
                ${mission.claimed ? 'Получено' : mission.completed ? 'Забрать' : 'Не готово'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    root.querySelectorAll<HTMLButtonElement>('[data-mission-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.missionId;
        if (!id) return;
        const result = claimMission(id);
        if (!result.ok) return;
        showToast(`Поручение закрыто: +${result.reward} эссенции`, 'success');
      });
    });
  }

  if (overlayMode === 'upgrades') {
    const unlockCost = getUnlockNextCellCost();
    const catalystCost = getCatalystUpgradeCost();
    root.innerHTML = `
      <div class="overlay-backdrop"></div>
      <div class="overlay-card">
        <div class="overlay-head">
          <h3>Алхимические улучшения</h3>
          <button id="overlay-close" class="secondary-action small">Закрыть</button>
        </div>
        <div class="overlay-list">
          <div class="upgrade-card">
            <strong>Открыть новую клетку</strong>
            <p class="muted">Даёт больше пространства для длинных цепочек merge.</p>
            <button id="overlay-unlock" class="gold-like" ${unlockCost !== null && state.get().essence >= unlockCost ? '' : 'disabled'}>
              ${unlockCost === null ? 'Все клетки открыты' : `Купить за ${unlockCost}`}
            </button>
          </div>
          <div class="upgrade-card">
            <strong>Усилить катализатор</strong>
            <p class="muted">Повышает награды и шанс редкого появления ингредиента.</p>
            <button id="overlay-catalyst" class="gold-like" ${state.get().essence >= catalystCost ? '' : 'disabled'}>
              Купить за ${catalystCost}
            </button>
          </div>
        </div>
      </div>
    `;

    root.querySelector<HTMLButtonElement>('#overlay-unlock')?.addEventListener('click', () => {
      const result = unlockNextCell();
      if (!result.ok) return;
      showToast(`Открыта новая клетка. Теперь доступно ${result.unlockedCells} мест.`, 'success');
    });

    root.querySelector<HTMLButtonElement>('#overlay-catalyst')?.addEventListener('click', () => {
      const result = upgradeCatalyst();
      if (!result.ok) return;
      showToast(`Катализатор усилен до уровня ${result.nextLevel}.`, 'magic');
    });
  }

  root.querySelector<HTMLButtonElement>('#overlay-close')?.addEventListener('click', () => {
    overlayMode = 'none';
    renderOverlay();
  });
  root.querySelector<HTMLDivElement>('.overlay-backdrop')?.addEventListener('click', () => {
    overlayMode = 'none';
    renderOverlay();
  });
}

function renderToast() {
  const toastLayer = document.getElementById('toast-layer');
  if (!toastLayer) return;
  toastLayer.innerHTML = toastState ? `<div class="toast toast-${toastState.tone}">${toastState.text}</div>` : '';
}

function showToast(text: string, tone: 'info' | 'success' | 'magic') {
  toastState = { text, tone };
  renderToast();
  if (toastTimeout !== null) window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toastState = null;
    renderToast();
  }, 1700);
}

function createBoardSummary(cells: Array<number | null>): string {
  const counts = new Map<number, number>();
  cells.forEach((tier) => {
    if (tier === null) return;
    counts.set(tier, (counts.get(tier) || 0) + 1);
  });

  if (counts.size === 0) {
    return '<span class="summary-chip muted">Стол пуст — призови искру.</span>';
  }

  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([tier, count]) => {
      const item = ALCHEMY_ITEMS[tier];
      return `<span class="summary-chip">${item.emoji} ${item.name} ×${count}</span>`;
    })
    .join('');
}
