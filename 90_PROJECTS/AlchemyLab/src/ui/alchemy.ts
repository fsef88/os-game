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
  getCatalystMultiplier,
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

export function initAlchemyLab(container: HTMLElement) {
  if (mounted) return;
  mounted = true;

  const screen = document.createElement('section');
  screen.className = 'alchemy-screen';
  screen.innerHTML = `
    <div id="toast-layer" class="toast-layer"></div>

    <div class="panel hero-panel">
      <div>
        <p class="eyebrow">Основной тематический пилот</p>
        <h1>Алхимическая мастерская</h1>
        <p class="subtitle">Собирай искры, объединяй одинаковые ингредиенты, закрывай обычные и особые заказы, открывай формулы и развивай лабораторию.</p>
      </div>

      <div class="objective-layout">
        <div id="objective-card" class="objective-card"></div>
        <div class="recipes-card">
          <div class="recipes-header">Быстрые рецепты</div>
          <div id="recipe-rail" class="recipe-rail"></div>
        </div>
        <div id="daily-card" class="daily-card"></div>
      </div>

      <div class="button-row hero-actions">
        <button id="gather-button">Создать искру</button>
        <button id="fulfill-button" class="secondary">Сдать заказ</button>
        <button id="special-button" class="secondary">Сдать особый контракт</button>
      </div>
    </div>

    <div class="alchemy-grid-layout">
      <div class="panel side-panel">
        <div class="side-stack">
          <div>
            <h2>Текущий заказ</h2>
            <div id="order-card" class="order-card"></div>
          </div>

          <div>
            <h2>Особый контракт</h2>
            <div id="special-card" class="special-card"></div>
          </div>

          <div>
            <h2>Улучшения</h2>
            <div class="button-column compact-actions">
              <button id="unlock-button" class="secondary">Открыть клетку</button>
              <button id="catalyst-button" class="secondary">Усилить катализатор</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel board-panel">
        <div class="panel-header">
          <h2>Алхимический стол</h2>
          <span id="board-hint" class="hint"></span>
        </div>
        <div id="board-status" class="board-status"></div>
        <div id="alchemy-board" class="alchemy-board"></div>
      </div>

      <div class="panel right-panel">
        <div class="right-stack">
          <div>
            <h2>Журнал открытий</h2>
            <div id="journal-list" class="journal-list"></div>
          </div>

          <div>
            <h2>Поручения алхимика</h2>
            <div id="missions-list" class="missions-list"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(screen);

  screen.querySelector<HTMLButtonElement>('#gather-button')?.addEventListener('click', () => {
    const result = gatherIngredient();
    if (!result.ok) return;

    if (result.rare && result.tier !== undefined) {
      showToast(`Редкая удача! Сразу создан ${ALCHEMY_ITEMS[result.tier].name}.`, 'magic');
      renderAlchemyLab();
      return;
    }

    const sparkCount = getItemCountOnBoard(0);
    showToast(sparkCount >= 2 ? 'Теперь объедини две искры.' : 'Новая искра появилась на столе.', 'info');
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

  screen.querySelector<HTMLButtonElement>('#unlock-button')?.addEventListener('click', () => {
    const result = unlockNextCell();
    if (!result.ok) return;
    showToast(`Открыта новая клетка. Теперь доступно ${result.unlockedCells} мест.`, 'success');
  });

  screen.querySelector<HTMLButtonElement>('#catalyst-button')?.addEventListener('click', () => {
    const result = upgradeCatalyst();
    if (!result.ok) return;
    showToast(`Катализатор усилен до уровня ${result.nextLevel}.`, 'magic');
  });

  state.subscribe(renderAlchemyLab);
  renderAlchemyLab();
}

function renderAlchemyLab() {
  renderObjective();
  renderRecipes();
  renderDailyCard();
  renderOrder();
  renderSpecialContract();
  renderBoard();
  renderJournal();
  renderMissions();
  renderButtons();
  renderToast();
}

function renderObjective() {
  const current = state.get();
  const sparkCount = getItemCountOnBoard(0);
  const orderProgress = getOrderProgress();
  const specialProgress = getSpecialContractProgress();
  const objective = document.getElementById('objective-card');
  if (!objective) return;

  let title = 'Что делать сейчас';
  let body = 'Собирай ингредиенты, объединяй одинаковые элементы и превращай открытия в награду через заказы.';
  let bullets: string[] = [];
  let focus: Array<'gather' | 'fulfill' | 'special' | 'unlock' | 'catalyst' | 'spark-cells' | 'merge-match'> = [];

  if (current.ordersCompleted === 0 && current.mergesCompleted === 0 && sparkCount < 2) {
    title = 'Шаг 1 — создай вторую искру';
    body = 'На столе уже лежит 1 искра. Нажми главную кнопку ещё один раз, чтобы получить пару для первого merge.';
    bullets = ['Первые 10 секунд должны вести к одному очевидному действию.', 'Сейчас тебе нужен только второй базовый элемент.'];
    focus = ['gather'];
  } else if (current.ordersCompleted === 0 && current.mergesCompleted === 0) {
    title = 'Шаг 2 — сделай первое слияние';
    body = selectedIndex === null
      ? 'Тапни по одной искре, потом по второй. Две одинаковые искры превращаются в Свет-траву.'
      : 'Одна искра уже выбрана. Тапни по второй такой же — получишь Свет-траву.';
    bullets = ['Игрок играет ради открытия нового объекта, а не ради самого merge.', 'Один шаг = одно действие.'];
    focus = selectedIndex === null ? ['spark-cells'] : ['merge-match'];
  } else if (current.ordersCompleted === 0 && orderProgress.completed) {
    title = 'Шаг 3 — сдай первый заказ';
    body = 'Свет-трава уже лежит на столе. Нажми «Сдать заказ» и получи первую эссенцию.';
    bullets = ['Награда должна прийти сразу после первого понятного действия.', 'Первая эссенция открывает мета-выбор: место или усиление.'];
    focus = ['fulfill'];
  } else if (canClaimDailyReward()) {
    const daily = getCurrentDailyReward();
    title = 'Забери бонус дня';
    body = `Сегодня доступен дневной бонус: +${daily.reward} эссенции. Это мягкий retention-слой без лишнего friction.`;
    bullets = ['Награда за вход не мешает core loop, а усиливает его.', 'Лучше показать бонус в игре, а не уводить в отдельный экран.'];
  } else if (specialProgress.active && specialProgress.completed) {
    title = 'Особый контракт готов';
    body = 'На столе уже есть нужный редкий ингредиент. Сдай особый контракт, чтобы получить большую награду.';
    bullets = ['Особый контракт — макро-награда поверх обычных заказов.', 'Это первый эмоциональный spike после базового loop.'];
    focus = ['special'];
  } else if (getMissionViews().some((mission) => mission.completed && !mission.claimed)) {
    title = 'Забери награду за поручение';
    body = 'Одно из поручений алхимика уже выполнено. Получи бонусную эссенцию и ускорь следующую цель.';
    bullets = ['Микро-цели удерживают темп первой сессии.', 'Поручения не должны блокировать игру.'];
  } else if (getUnlockNextCellCost() !== null && current.essence >= (getUnlockNextCellCost() || Infinity)) {
    title = 'Открой новую клетку';
    body = 'Свободное место на столе — главный ранний мета-апгрейд. Больше клеток = меньше тупиков и длиннее цепочки.';
    bullets = ['Расширение пространства игрок замечает сразу.', 'Новый контент должен приходить в первые 1–2 минуты.'];
    focus = ['unlock'];
  } else if (current.essence >= getCatalystUpgradeCost()) {
    title = 'Усиль катализатор';
    body = `Катализатор повышает награды за заказы. Текущий множитель после апгрейда станет x${(getCatalystMultiplier() + 0.25).toFixed(2)}.`;
    bullets = ['Апгрейд должен заметно усиливать reward loop.', `Редкий шанс при сборе сейчас: ${(getRareSpawnChance() * 100).toFixed(0)}%.`];
    focus = ['catalyst'];
  } else {
    const orderItem = ALCHEMY_ITEMS[current.currentOrder.tier];
    title = `Следующая цель — ${orderItem.name}`;
    body = `Собери нужный tier для текущего заказа, а затем постарайся открыть ещё одну формулу для журнала.`;
    bullets = ['Смотри на быстрые рецепты справа.', `Уровень лаборатории сейчас: ${getLabLevel(current)}.`];
    focus = ['gather'];
  }

  objective.innerHTML = `
    <div class="objective-eyebrow">Сейчас важно</div>
    <h3>${title}</h3>
    <p>${body}</p>
    <ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join('')}</ul>
  `;

  applyFocusHints(focus);
}

function renderRecipes() {
  const rail = document.getElementById('recipe-rail');
  if (!rail) return;

  rail.innerHTML = ALCHEMY_ITEMS.slice(0, -1).map((item) => {
    const next = ALCHEMY_ITEMS[item.tier + 1];
    const unlocked = state.get().highestDiscoveredTier >= item.tier;
    return `
      <div class="recipe-chip ${unlocked ? 'seen' : ''}">
        <span class="recipe-part">${item.emoji} ${item.name}</span>
        <span class="recipe-arrow">×2 →</span>
        <span class="recipe-part target">${next.emoji} ${next.name}</span>
      </div>
    `;
  }).join('');
}

function renderDailyCard() {
  const card = document.getElementById('daily-card');
  if (!card) return;
  const current = state.get();
  const daily = getCurrentDailyReward();
  const available = canClaimDailyReward();

  card.innerHTML = `
    <div class="recipes-header">Бонус дня</div>
    <div class="daily-main">
      <div>
        <div class="daily-title">День ${daily.day}</div>
        <div class="muted">Серия входов: ${current.dailyStreak} · награда: +${daily.reward} эссенции</div>
      </div>
      <button id="daily-claim-button" class="${available ? '' : 'secondary'}" ${available ? '' : 'disabled'}>
        ${available ? 'Забрать бонус' : 'Уже получено'}
      </button>
    </div>
  `;

  card.querySelector<HTMLButtonElement>('#daily-claim-button')?.addEventListener('click', () => {
    const result = claimDailyReward();
    if (!result.ok) return;
    showToast(`Дневной бонус: +${result.reward} эссенции`, 'success');
  });
}

function renderOrder() {
  const current = state.get();
  const order = current.currentOrder;
  const progress = getOrderProgress();
  const item = ALCHEMY_ITEMS[order.tier];
  const previousItem = ALCHEMY_ITEMS[Math.max(0, order.tier - 1)];
  const orderCard = document.getElementById('order-card');
  if (!orderCard) return;

  orderCard.innerHTML = `
    <div class="order-main">
      <div class="order-item">
        <span class="order-emoji">${item.emoji}</span>
        <div>
          <strong>${item.name}</strong>
          <div class="muted">Обычный заказ · tier ${item.tier}</div>
        </div>
      </div>
      <div class="order-reward">+${order.reward} эссенции</div>
    </div>
    <div class="order-progress ${progress.completed ? 'ready' : ''}">На столе: ${progress.have}/${progress.need}</div>
    <div class="formula-line">Формула: 2 ${previousItem.name} → ${item.name}</div>
    <p class="muted">Катализатор: ур. ${current.catalystLevel} · множитель наград x${getCatalystMultiplier().toFixed(2)}</p>
  `;
}

function renderSpecialContract() {
  const current = state.get();
  const card = document.getElementById('special-card');
  if (!card) return;

  if (!current.specialContract) {
    card.innerHTML = `
      <div class="muted">Особые контракты откроются после 2 обычных заказов и 3+ открытий.</div>
    `;
    return;
  }

  const item = ALCHEMY_ITEMS[current.specialContract.tier];
  const previousItem = ALCHEMY_ITEMS[Math.max(0, current.specialContract.tier - 1)];
  const progress = getSpecialContractProgress();

  card.innerHTML = `
    <div class="order-main">
      <div class="order-item">
        <span class="order-emoji">${item.emoji}</span>
        <div>
          <strong>${item.name}</strong>
          <div class="muted">Особый контракт · tier ${item.tier}</div>
        </div>
      </div>
      <div class="order-reward special">+${current.specialContract.reward} эссенции</div>
    </div>
    <div class="order-progress ${progress.completed ? 'ready' : ''}">На столе: ${progress.have}/${progress.need}</div>
    <div class="formula-line">Формула: 2 ${previousItem.name} → ${item.name}</div>
    <p class="muted">Особые контракты дают крупный reward spike и усиливают чувство достижения.</p>
  `;
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
    const isUnlocked = index < current.unlockedCells;
    const cell = document.createElement('button');
    cell.className = 'alchemy-cell';
    cell.type = 'button';

    if (!isUnlocked) {
      cell.classList.add('locked');
      cell.innerHTML = '<span class="cell-lock">🔒</span><span class="cell-lock-text">Закрыто</span>';
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
      cell.innerHTML = '<span class="cell-empty">+</span><span class="cell-name">Пустая клетка</span>';
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

function renderJournal() {
  const current = state.get();
  const list = document.getElementById('journal-list');
  if (!list) return;

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
      : `<span class="journal-emoji">❔</span><span>Неизвестная формула</span>`;
    list.appendChild(entry);
  });
}

function renderMissions() {
  const container = document.getElementById('missions-list');
  if (!container) return;

  container.innerHTML = '';
  const missions = getMissionViews();
  missions.forEach((mission) => {
    const el = document.createElement('div');
    el.className = `mission-card ${mission.completed ? 'mission-done' : ''}`;
    el.innerHTML = `
      <div class="mission-top">
        <div>
          <div class="mission-title">${mission.title}</div>
          <div class="muted">${mission.description}</div>
        </div>
        <div class="mission-reward">+${mission.reward}</div>
      </div>
      <div class="mission-progress">${mission.progress}/${mission.target}</div>
      <button class="mission-claim ${mission.completed && !mission.claimed ? '' : 'secondary'}" ${mission.completed && !mission.claimed ? '' : 'disabled'}>
        ${mission.claimed ? 'Получено' : mission.completed ? 'Забрать' : 'Не готово'}
      </button>
    `;
    el.querySelector<HTMLButtonElement>('.mission-claim')?.addEventListener('click', () => {
      const result = claimMission(mission.id);
      if (!result.ok) return;
      showToast(`Поручение закрыто: +${result.reward} эссенции`, 'success');
    });
    container.appendChild(el);
  });
}

function renderButtons() {
  const current = state.get();
  const gatherButton = document.getElementById('gather-button') as HTMLButtonElement | null;
  const fulfillButton = document.getElementById('fulfill-button') as HTMLButtonElement | null;
  const specialButton = document.getElementById('special-button') as HTMLButtonElement | null;
  const unlockButton = document.getElementById('unlock-button') as HTMLButtonElement | null;
  const catalystButton = document.getElementById('catalyst-button') as HTMLButtonElement | null;

  if (gatherButton) gatherButton.disabled = !canGatherIngredient();
  if (fulfillButton) fulfillButton.disabled = !getOrderProgress().completed;

  const specialProgress = getSpecialContractProgress();
  if (specialButton) {
    specialButton.disabled = !specialProgress.active || !specialProgress.completed;
  }

  const unlockCost = getUnlockNextCellCost();
  if (unlockButton) {
    unlockButton.disabled = unlockCost === null || current.essence < unlockCost;
    unlockButton.textContent = unlockCost === null ? 'Все клетки открыты' : `Открыть клетку (${unlockCost})`;
  }

  const catalystCost = getCatalystUpgradeCost();
  if (catalystButton) {
    catalystButton.disabled = current.essence < catalystCost;
    catalystButton.textContent = `Усилить катализатор (${catalystCost})`;
  }
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

function applyFocusHints(focus: Array<'gather' | 'fulfill' | 'special' | 'unlock' | 'catalyst' | 'spark-cells' | 'merge-match'>) {
  const map = {
    gather: document.getElementById('gather-button'),
    fulfill: document.getElementById('fulfill-button'),
    special: document.getElementById('special-button'),
    unlock: document.getElementById('unlock-button'),
    catalyst: document.getElementById('catalyst-button'),
  } as const;

  Object.values(map).forEach((element) => element?.classList.remove('tutorial-focus'));
  focus.forEach((key) => {
    if (key in map) {
      map[key as keyof typeof map]?.classList.add('tutorial-focus');
    }
  });
}

function createBoardSummary(cells: Array<number | null>): string {
  const counts = new Map<number, number>();
  cells.forEach((tier) => {
    if (tier === null) return;
    counts.set(tier, (counts.get(tier) || 0) + 1);
  });

  if (counts.size === 0) {
    return '<span class="summary-chip muted">Стол пуст — создай искру.</span>';
  }

  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([tier, count]) => {
      const item = ALCHEMY_ITEMS[tier];
      return `<span class="summary-chip">${item.emoji} ${item.name} ×${count}</span>`;
    })
    .join('');
}
