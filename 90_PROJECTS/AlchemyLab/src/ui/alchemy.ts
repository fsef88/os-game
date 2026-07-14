import { ALCHEMY_ITEMS } from '../config';
import { t } from '../i18n';
import { state } from '../state';
import {
  canGatherIngredient,
  fulfillCurrentOrder,
  gatherIngredient,
  getCatalystMultiplier,
  getCatalystUpgradeCost,
  getItemCountOnBoard,
  getOrderProgress,
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

export function initAlchemyLab(container: HTMLElement) {
  if (mounted) {
    return;
  }

  mounted = true;
  const screen = document.createElement('section');
  screen.className = 'alchemy-screen';
  screen.innerHTML = `
    <div id="toast-layer" class="toast-layer"></div>

    <div class="panel hero-panel">
      <div>
        <p class="eyebrow">Thematic Pilot</p>
        <h1>${t('screen.title', 'Alchemy Lab')}</h1>
        <p class="subtitle">${t('screen.subtitle', 'Gather, merge and fulfill orders.')}</p>
      </div>

      <div class="objective-layout">
        <div id="objective-card" class="objective-card"></div>
        <div class="recipes-card">
          <div class="recipes-header">${t('label.recipes', 'Quick recipes')}</div>
          <div id="recipe-rail" class="recipe-rail"></div>
        </div>
      </div>

      <div class="button-row hero-actions">
        <button id="gather-button">${t('button.gather', 'Create Spark')}</button>
        <button id="fulfill-button" class="secondary">${t('button.fulfill', 'Fulfill order')}</button>
      </div>
    </div>

    <div class="alchemy-grid-layout">
      <div class="panel order-panel">
        <h2>${t('label.order', 'Current order')}</h2>
        <div id="order-card" class="order-card"></div>
        <div class="button-row compact-actions">
          <button id="unlock-button" class="secondary">${t('button.unlock', 'Unlock cell')}</button>
          <button id="catalyst-button" class="secondary">${t('button.catalyst', 'Upgrade catalyst')}</button>
        </div>
      </div>

      <div class="panel board-panel">
        <div class="panel-header">
          <h2>${t('label.board', 'Alchemy table')}</h2>
          <span id="board-hint" class="hint"></span>
        </div>
        <div id="board-status" class="board-status"></div>
        <div id="alchemy-board" class="alchemy-board"></div>
      </div>

      <div class="panel journal-panel">
        <h2>${t('label.journal', 'Discovery journal')}</h2>
        <div id="journal-list" class="journal-list"></div>
      </div>
    </div>
  `;

  container.appendChild(screen);

  screen.querySelector<HTMLButtonElement>('#gather-button')?.addEventListener('click', () => {
    const result = gatherIngredient();
    if (!result.ok) {
      return;
    }

    const sparkCount = getItemCountOnBoard(0);
    showToast(sparkCount >= 2 ? 'Теперь соедини два Spark.' : 'Новая Spark появилась на столе.', 'info');
  });
  screen.querySelector<HTMLButtonElement>('#fulfill-button')?.addEventListener('click', () => {
    const result = fulfillCurrentOrder();
    if (!result.ok) {
      return;
    }

    showToast(`Заказ выполнен: +${result.reward} essence`, 'success');
  });
  screen.querySelector<HTMLButtonElement>('#unlock-button')?.addEventListener('click', () => {
    const result = unlockNextCell();
    if (!result.ok) {
      return;
    }

    showToast(`Открыта новая клетка. Теперь доступно ${result.unlockedCells} мест.`, 'success');
  });
  screen.querySelector<HTMLButtonElement>('#catalyst-button')?.addEventListener('click', () => {
    const result = upgradeCatalyst();
    if (!result.ok) {
      return;
    }

    showToast(`Катализатор усилен до уровня ${result.nextLevel}.`, 'magic');
  });

  state.subscribe(renderAlchemyLab);
  renderAlchemyLab();
}

function renderAlchemyLab() {
  renderObjective();
  renderRecipes();
  renderOrder();
  renderBoard();
  renderJournal();
  renderButtons();
  renderToast();
}

function renderObjective() {
  const current = state.get();
  const sparkCount = getItemCountOnBoard(0);
  const orderProgress = getOrderProgress();
  const objective = document.getElementById('objective-card');
  if (!objective) {
    return;
  }

  let title = 'Твоя цель';
  let body = 'Собирай ингредиенты, объединяй одинаковые и закрывай заказы.';
  let bullets: string[] = [];
  let focus: Array<'gather' | 'fulfill' | 'unlock' | 'catalyst' | 'spark-cells' | 'merge-match'> = [];

  if (current.ordersCompleted === 0 && current.mergesCompleted === 0 && sparkCount < 2) {
    title = 'Шаг 1 — создай второй Spark';
    body = 'На столе уже лежит 1 Spark. Нажми большую кнопку сверху ещё 1 раз — получишь второй такой же элемент.';
    bullets = ['Главное действие в первые секунды должно быть очевидным.', 'Сейчас тебе нужен только второй Spark.'];
    focus = ['gather'];
  } else if (current.ordersCompleted === 0 && current.mergesCompleted === 0) {
    title = 'Шаг 2 — сделай первый merge';
    body = selectedIndex === null
      ? 'Тапни по одному Spark, потом по второму Spark. Два одинаковых элемента превращаются в Glow Herb.'
      : 'Один Spark уже выбран. Теперь тапни по другому Spark — они сольются в Glow Herb.';
    bullets = ['Правило игры: 2 одинаковых элемента = 1 новый tier.', 'Игрок играет ради открытия нового объекта, а не ради самого merge.'];
    focus = selectedIndex === null ? ['spark-cells'] : ['merge-match'];
  } else if (current.ordersCompleted === 0 && orderProgress.completed) {
    title = 'Шаг 3 — сдай первый заказ';
    body = 'Glow Herb уже лежит на столе. Нажми «Сдать заказ» и получи первую essence.';
    bullets = ['Заказ превращает открытие в валюту.', 'После первой награды появится выбор: новая клетка или усиление катализатора.'];
    focus = ['fulfill'];
  } else if (current.ordersCompleted === 0) {
    title = 'Собери Glow Herb для заказа';
    body = 'Если Glow Herb ещё нет на столе, просто повтори цикл: создай Spark → создай Spark → объедини их.';
    bullets = ['Формула прямо над столом.', 'Когда нужный tier собран, кнопка заказа станет активной.'];
    focus = ['gather'];
  } else if (getUnlockNextCellCost() !== null && current.essence >= (getUnlockNextCellCost() || Infinity)) {
    title = 'Первая мета-награда';
    body = 'Теперь ты можешь открыть новую клетку. Это снижает давление на стол и позволяет собирать длинные цепочки.';
    bullets = ['Расширение пространства — важная часть merge-игр.', 'Новый контент должен появляться в первые 1–2 минуты.'];
    focus = ['unlock'];
  } else if (current.essence >= getCatalystUpgradeCost()) {
    title = 'Усиль катализатор';
    body = 'Катализатор увеличивает награду за будущие заказы. Это усиливает экономику без усложнения базового merge-loop.';
    bullets = ['Катализатор = multiplier к reward.', `Текущий множитель наград: x${getCatalystMultiplier().toFixed(2)}.`];
    focus = ['catalyst'];
  } else {
    const orderItem = ALCHEMY_ITEMS[current.currentOrder.tier];
    title = `Следующая цель — ${orderItem.name}`;
    body = `Сейчас у тебя активен заказ на ${orderItem.name}. Создай нужный tier и сдай его ради essence и новых апгрейдов.`;
    bullets = ['Смотри на быстрые рецепты над столом.', 'Новые открытия сразу попадают в журнал.'];
    focus = ['gather'];
  }

  objective.innerHTML = `
    <div class="objective-eyebrow">${t('label.objective', 'What to do now')}</div>
    <h3>${title}</h3>
    <p>${body}</p>
    <ul>
      ${bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
    </ul>
  `;

  applyFocusHints(focus);
}

function renderRecipes() {
  const rail = document.getElementById('recipe-rail');
  if (!rail) {
    return;
  }

  rail.innerHTML = ALCHEMY_ITEMS.slice(0, -1).map((item) => {
    const next = ALCHEMY_ITEMS[item.tier + 1];
    return `
      <div class="recipe-chip ${state.get().highestDiscoveredTier >= item.tier ? 'seen' : ''}">
        <span class="recipe-part">${item.emoji} ${item.name}</span>
        <span class="recipe-arrow">×2 →</span>
        <span class="recipe-part target">${next.emoji} ${next.name}</span>
      </div>
    `;
  }).join('');
}

function renderOrder() {
  const current = state.get();
  const order = current.currentOrder;
  const progress = getOrderProgress();
  const item = ALCHEMY_ITEMS[order.tier];
  const previousItem = ALCHEMY_ITEMS[Math.max(0, order.tier - 1)];
  const orderCard = document.getElementById('order-card');
  if (!orderCard) {
    return;
  }

  orderCard.innerHTML = `
    <div class="order-main">
      <div class="order-item">
        <span class="order-emoji">${item.emoji}</span>
        <div>
          <strong>${item.name}</strong>
          <div class="muted">Tier ${item.tier}</div>
        </div>
      </div>
      <div class="order-reward">+${order.reward} essence</div>
    </div>
    <div class="order-progress ${progress.completed ? 'ready' : ''}">
      На столе: ${progress.have}/${progress.need}
    </div>
    <div class="formula-line">Формула: 2 ${previousItem.name} → ${item.name}</div>
    <p class="muted">Катализатор: ур. ${current.catalystLevel} · множитель наград x${getCatalystMultiplier().toFixed(2)}</p>
  `;
}

function renderBoard() {
  const current = state.get();
  const board = document.getElementById('alchemy-board');
  const hint = document.getElementById('board-hint');
  const status = document.getElementById('board-status');
  if (!board || !hint || !status) {
    return;
  }

  const selectedTier = selectedIndex !== null ? current.grid[selectedIndex] : null;

  status.innerHTML = createBoardSummary(current.grid.slice(0, current.unlockedCells));
  board.innerHTML = '';

  current.grid.forEach((tier, index) => {
    const isUnlocked = index < current.unlockedCells;
    const cell = document.createElement('button');
    cell.className = 'alchemy-cell';
    cell.type = 'button';

    if (!isUnlocked) {
      cell.classList.add('locked');
      cell.innerHTML = '<span class="cell-lock">🔒</span><span class="cell-lock-text">Locked</span>';
      cell.disabled = true;
      board.appendChild(cell);
      return;
    }

    if (selectedIndex === index) {
      cell.classList.add('selected');
    }

    if (flashCellIndex === index) {
      cell.classList.add('merge-flash');
    }

    if (tier === null) {
      cell.classList.add('empty');
      cell.innerHTML = '<span class="cell-empty">+</span><span class="cell-name">Empty slot</span>';
    } else {
      const item = ALCHEMY_ITEMS[tier];
      cell.style.setProperty('--cell-accent', item.color);
      cell.innerHTML = `
        <span class="cell-emoji">${item.emoji}</span>
        <span class="cell-name">${item.name}</span>
      `;

      if (selectedIndex === null && current.ordersCompleted === 0 && current.mergesCompleted === 0 && tier === 0) {
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
            : `Merge → ${result.merge.resultName}`,
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

function renderJournal() {
  const current = state.get();
  const list = document.getElementById('journal-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  ALCHEMY_ITEMS.forEach((item) => {
    const discovered = current.discoveries.includes(item.tier);
    const entry = document.createElement('div');
    entry.className = `journal-entry ${discovered ? 'discovered' : 'hidden-entry'}`;
    entry.innerHTML = discovered
      ? `
        <span class="journal-emoji">${item.emoji}</span>
        <div>
          <div class="journal-name">${item.name}</div>
          <div class="muted">${item.description}</div>
        </div>
      `
      : `<span class="journal-emoji">❔</span><span>Unknown Formula</span>`;
    list.appendChild(entry);
  });
}

function renderButtons() {
  const current = state.get();
  const gatherButton = document.getElementById('gather-button') as HTMLButtonElement | null;
  const fulfillButton = document.getElementById('fulfill-button') as HTMLButtonElement | null;
  const unlockButton = document.getElementById('unlock-button') as HTMLButtonElement | null;
  const catalystButton = document.getElementById('catalyst-button') as HTMLButtonElement | null;

  if (gatherButton) {
    gatherButton.disabled = !canGatherIngredient();
  }

  if (fulfillButton) {
    fulfillButton.disabled = !getOrderProgress().completed;
  }

  const unlockCost = getUnlockNextCellCost();
  if (unlockButton) {
    unlockButton.disabled = unlockCost === null || current.essence < unlockCost;
    unlockButton.textContent = unlockCost === null
      ? 'Все клетки открыты'
      : `${t('button.unlock', 'Unlock cell')} (${unlockCost})`;
  }

  const catalystCost = getCatalystUpgradeCost();
  if (catalystButton) {
    catalystButton.disabled = current.essence < catalystCost;
    catalystButton.textContent = `${t('button.catalyst', 'Upgrade catalyst')} (${catalystCost})`;
  }
}

function renderToast() {
  const toastLayer = document.getElementById('toast-layer');
  if (!toastLayer) {
    return;
  }

  toastLayer.innerHTML = toastState
    ? `<div class="toast toast-${toastState.tone}">${toastState.text}</div>`
    : '';
}

function showToast(text: string, tone: 'info' | 'success' | 'magic') {
  toastState = { text, tone };
  renderToast();

  if (toastTimeout !== null) {
    window.clearTimeout(toastTimeout);
  }

  toastTimeout = window.setTimeout(() => {
    toastState = null;
    renderToast();
  }, 1700);
}

function applyFocusHints(focus: Array<'gather' | 'fulfill' | 'unlock' | 'catalyst' | 'spark-cells' | 'merge-match'>) {
  const gatherButton = document.getElementById('gather-button');
  const fulfillButton = document.getElementById('fulfill-button');
  const unlockButton = document.getElementById('unlock-button');
  const catalystButton = document.getElementById('catalyst-button');

  [gatherButton, fulfillButton, unlockButton, catalystButton].forEach((element) => {
    element?.classList.remove('tutorial-focus');
  });

  if (focus.includes('gather')) {
    gatherButton?.classList.add('tutorial-focus');
  }
  if (focus.includes('fulfill')) {
    fulfillButton?.classList.add('tutorial-focus');
  }
  if (focus.includes('unlock')) {
    unlockButton?.classList.add('tutorial-focus');
  }
  if (focus.includes('catalyst')) {
    catalystButton?.classList.add('tutorial-focus');
  }
}

function createBoardSummary(cells: Array<number | null>): string {
  const counts = new Map<number, number>();
  cells.forEach((tier) => {
    if (tier === null) {
      return;
    }
    counts.set(tier, (counts.get(tier) || 0) + 1);
  });

  if (counts.size === 0) {
    return '<span class="summary-chip muted">Стол пуст — создай Spark.</span>';
  }

  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([tier, count]) => {
      const item = ALCHEMY_ITEMS[tier];
      return `<span class="summary-chip">${item.emoji} ${item.name} ×${count}</span>`;
    })
    .join('');
}
