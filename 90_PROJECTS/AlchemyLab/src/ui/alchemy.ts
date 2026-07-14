import { ALCHEMY_ITEMS } from '../config';
import { t } from '../i18n';
import { state } from '../state';
import {
  canGatherIngredient,
  fulfillCurrentOrder,
  getCatalystUpgradeCost,
  getUnlockNextCellCost,
  gatherIngredient,
  interactWithCell,
  unlockNextCell,
  upgradeCatalyst,
} from '../core/alchemy';

let selectedIndex: number | null = null;
let mounted = false;

export function initAlchemyLab(container: HTMLElement) {
  if (mounted) {
    return;
  }

  mounted = true;
  const screen = document.createElement('section');
  screen.className = 'alchemy-screen';
  screen.innerHTML = `
    <div class="panel hero-panel">
      <div>
        <p class="eyebrow">Experimental Pilot</p>
        <h1>${t('screen.title', 'Alchemy Lab')}</h1>
        <p class="subtitle">${t('screen.subtitle', 'Gather, merge and fulfill orders.')}</p>
      </div>
      <div class="button-row hero-actions">
        <button id="gather-button">${t('button.gather', 'Gather ingredient')}</button>
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
    gatherIngredient();
  });
  screen.querySelector<HTMLButtonElement>('#fulfill-button')?.addEventListener('click', () => {
    fulfillCurrentOrder();
  });
  screen.querySelector<HTMLButtonElement>('#unlock-button')?.addEventListener('click', () => {
    unlockNextCell();
  });
  screen.querySelector<HTMLButtonElement>('#catalyst-button')?.addEventListener('click', () => {
    upgradeCatalyst();
  });

  state.subscribe(renderAlchemyLab);
  renderAlchemyLab();
}

function renderAlchemyLab() {
  renderOrder();
  renderBoard();
  renderJournal();
  renderButtons();
}

function renderOrder() {
  const current = state.get();
  const order = current.currentOrder;
  const item = ALCHEMY_ITEMS[order.tier];
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
    <p class="muted">Собери нужный ингредиент на столе и нажми “Выполнить заказ”.</p>
  `;
}

function renderBoard() {
  const current = state.get();
  const board = document.getElementById('alchemy-board');
  const hint = document.getElementById('board-hint');
  if (!board) {
    return;
  }

  board.innerHTML = '';
  current.grid.forEach((tier, index) => {
    const isUnlocked = index < current.unlockedCells;
    const cell = document.createElement('button');
    cell.className = 'alchemy-cell';
    cell.type = 'button';

    if (!isUnlocked) {
      cell.classList.add('locked');
      cell.innerHTML = '<span>🔒</span>';
      cell.disabled = true;
      board.appendChild(cell);
      return;
    }

    if (selectedIndex === index) {
      cell.classList.add('selected');
    }

    if (tier === null) {
      cell.classList.add('empty');
      cell.innerHTML = '<span class="cell-empty">+</span>';
    } else {
      const item = ALCHEMY_ITEMS[tier];
      cell.style.setProperty('--cell-accent', item.color);
      cell.innerHTML = `
        <span class="cell-emoji">${item.emoji}</span>
        <span class="cell-name">${item.name}</span>
      `;
    }

    cell.addEventListener('click', () => {
      selectedIndex = interactWithCell(index, selectedIndex);
      renderAlchemyLab();
    });
    board.appendChild(cell);
  });

  if (hint) {
    hint.textContent = selectedIndex === null
      ? 'Тапни по двум одинаковым ингредиентам, чтобы объединить их.'
      : 'Выбран ингредиент — тапни по такому же, чтобы сделать merge.';
  }
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
      ? `<span class="journal-emoji">${item.emoji}</span><span>${item.name}</span>`
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
    fulfillButton.disabled = !current.grid.some((tier, index) => index < current.unlockedCells && tier === current.currentOrder.tier);
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
