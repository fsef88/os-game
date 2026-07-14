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
    <div class="lab-ambient" aria-hidden="true">
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
      <div class="orb orb-c"></div>
    </div>

    <div id="toast-layer" class="toast-layer"></div>

    <div class="panel hero-panel game-hero">
      <div class="hero-copy">
        <p class="eyebrow">vertical slice 1.1</p>
        <h1>Алхимическая мастерская</h1>
        <p class="subtitle">
          Не таблица и не дашборд: это маленькая магическая игра про открытия.
          Призывай искры, соединяй одинаковые элементы, закрывай заказы и охоться за редкими контрактами.
        </p>
      </div>
      <div class="hero-badges">
        <div class="hero-badge">✨ merge</div>
        <div class="hero-badge">📜 заказы</div>
        <div class="hero-badge">📘 открытия</div>
        <div class="hero-badge">🌙 особые контракты</div>
      </div>
    </div>

    <div class="game-layout">
      <aside class="panel parchment-panel">
        <div id="objective-card" class="objective-ribbon"></div>

        <div class="side-section">
          <div class="section-title">Обычный заказ</div>
          <div id="order-card" class="order-card quest-card"></div>
        </div>

        <div class="side-section">
          <div class="section-title">Особый контракт</div>
          <div id="special-card" class="special-card quest-card"></div>
        </div>

        <div id="daily-card" class="daily-card"></div>
      </aside>

      <main class="table-stage">
        <div class="stage-topline">
          <div class="stage-title-wrap">
            <div class="stage-title">Стол слияния</div>
            <div id="board-hint" class="stage-hint"></div>
          </div>
          <div class="stage-stats">
            <span class="stat-pill">Уровень лаборатории: <strong id="lab-level-inline">1</strong></span>
            <span class="stat-pill">Редкий шанс: <strong id="rare-chance-inline">0%</strong></span>
          </div>
        </div>

        <div class="recipe-strip-wrap">
          <div class="section-title small">Книга рецептов</div>
          <div id="recipe-rail" class="recipe-rail"></div>
        </div>

        <div id="board-status" class="board-status"></div>

        <div class="alchemy-table-shell">
          <div class="table-glow"></div>
          <div id="alchemy-board" class="alchemy-board"></div>
        </div>

        <div class="action-dock">
          <button id="gather-button" class="primary-cta">Призвать искру</button>
          <button id="fulfill-button" class="secondary">Сдать заказ</button>
          <button id="special-button" class="secondary">Сдать особый контракт</button>
          <button id="unlock-button" class="secondary">Открыть клетку</button>
          <button id="catalyst-button" class="secondary">Усилить катализатор</button>
        </div>
      </main>

      <aside class="panel codex-panel">
        <div class="codex-section">
          <div class="section-title">Журнал открытий</div>
          <div id="journal-list" class="journal-list"></div>
        </div>

        <div class="codex-section">
          <div class="section-title">Поручения алхимика</div>
          <div id="missions-list" class="missions-list"></div>
        </div>
      </aside>
    </div>
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
    showToast(
      sparkCount >= 2 ? 'Теперь соедини две искры.' : 'На столе появилась новая искра.',
      'info',
    );
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
  renderInlineStats();
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
  let body = 'Собирай ингредиенты, делай merge и превращай открытия в награду.';
  let bullets: string[] = [];
  let focus: Array<'gather' | 'fulfill' | 'special' | 'unlock' | 'catalyst' | 'spark-cells' | 'merge-match'> = [];

  if (current.ordersCompleted === 0 && current.mergesCompleted === 0 && sparkCount < 2) {
    title = 'Шаг 1 — призови вторую искру';
    body = 'На столе уже лежит 1 искра. Нажми большую кнопку ещё раз, чтобы получить пару для первого слияния.';
    bullets = [
      'Первое действие должно быть очевидным без чтения длинных правил.',
      'Сейчас тебе нужен только второй базовый элемент.',
    ];
    focus = ['gather'];
  } else if (current.ordersCompleted === 0 && current.mergesCompleted === 0) {
    title = 'Шаг 2 — сделай первое слияние';
    body = selectedIndex === null
      ? 'Тапни по одной искре, потом по второй. Две одинаковые искры превращаются в Свет-траву.'
      : 'Одна искра уже выбрана. Тапни по второй такой же — получишь Свет-траву.';
    bullets = [
      'Игрок играет ради открытия нового объекта, а не ради самого merge.',
      'Один шаг = одно действие.',
    ];
    focus = selectedIndex === null ? ['spark-cells'] : ['merge-match'];
  } else if (current.ordersCompleted === 0 && orderProgress.completed) {
    title = 'Шаг 3 — сдай первый заказ';
    body = 'Свет-трава уже лежит на столе. Нажми «Сдать заказ» и получи первую эссенцию.';
    bullets = [
      'Первая награда должна прийти быстро и заметно.',
      'После этого у тебя появится первый мета-выбор.',
    ];
    focus = ['fulfill'];
  } else if (canClaimDailyReward()) {
    const daily = getCurrentDailyReward();
    title = 'Забери бонус дня';
    body = `Сегодня доступен бонус: +${daily.reward} эссенции.`;
    bullets = [
      'Retention-слой встроен прямо в игру и не уводит в отдельный экран.',
      'Забери награду и сразу вернись к основному loop.',
    ];
  } else if (specialProgress.active && specialProgress.completed) {
    title = 'Особый контракт готов';
    body = 'На столе уже есть нужный редкий ингредиент. Сдай его за крупную награду.';
    bullets = [
      'Это сильный reward spike поверх обычного цикла.',
      'Редкие события должны ощущаться ценнее повседневных действий.',
    ];
    focus = ['special'];
  } else if (getMissionViews().some((mission) => mission.completed && !mission.claimed)) {
    title = 'Поручение уже выполнено';
    body = 'Одна из задач алхимика закрыта. Забери бонусную эссенцию и ускорь следующий цикл.';
    bullets = [
      'Микро-цели удерживают темп первой сессии.',
      'Поручения усиливают core loop, а не отвлекают от него.',
    ];
  } else if (getUnlockNextCellCost() !== null && current.essence >= (getUnlockNextCellCost() || Infinity)) {
    title = 'Открой новую клетку';
    body = 'Больше места на столе = меньше тупиков и длиннее цепочки слияний.';
    bullets = [
      'Расширение пространства — главный ранний мета-апгрейд.',
      'Игрок замечает новую клетку сразу, без объяснений.',
    ];
    focus = ['unlock'];
  } else if (current.essence >= getCatalystUpgradeCost()) {
    title = 'Усиль катализатор';
    body = `Катализатор повышает награды и даёт шанс редкого появления. Сейчас редкий шанс: ${(getRareSpawnChance() * 100).toFixed(0)}%.`;
    bullets = [
      `Следующий множитель наград: x${(getCatalystMultiplier() + 0.25).toFixed(2)}.`,
      'Это усиливает reward loop без лишнего friction.',
    ];
    focus = ['catalyst'];
  } else {
    const orderItem = ALCHEMY_ITEMS[current.currentOrder.tier];
    title = `Следующая цель — ${orderItem.name}`;
    body = `Собери нужный tier для текущего заказа, а затем постарайся открыть ещё одну формулу для журнала.`;
    bullets = [
      'Смотри на книгу рецептов рядом со столом.',
      `Уровень лаборатории сейчас: ${getLabLevel(current)}.`,
    ];
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
    <div class="section-title small">Бонус дня</div>
    <div class="daily-title">День ${daily.day}</div>
    <p class="muted">Серия входов: ${current.dailyStreak} · награда: +${daily.reward} эссенции</p>
    <div class="daily-track">${Array.from({ length: 7 }).map((_, index) => {
      const dayNumber = index + 1;
      const active = ((current.dailyDay - 1) % 7) + 1 === dayNumber;
      return `<span class="daily-dot ${active ? 'active' : ''}">${dayNumber}</span>`;
    }).join('')}</div>
    <button id="daily-claim-button" class="${available ? 'gold-like' : 'secondary'}" ${available ? '' : 'disabled'}>
      ${available ? 'Забрать бонус' : 'Уже получено'}
    </button>
  `;

  card.querySelector<HTMLButtonElement>('#daily-claim-button')?.addEventListener('click', () => {
    const result = claimDailyReward();
    if (!result.ok) return;
    showToast(`Бонус дня ${result.day}: +${result.reward} эссенции`, 'success');
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
    <p class="muted">Катализатор: ур. ${current.catalystLevel} · множитель x${getCatalystMultiplier().toFixed(2)}</p>
  `;
}

function renderSpecialContract() {
  const current = state.get();
  const card = document.getElementById('special-card');
  if (!card) return;

  if (!current.specialContract) {
    card.innerHTML = `<div class="muted">Особые контракты откроются после 2 обычных заказов и 3+ открытий.</div>`;
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
    <p class="muted">Особый контракт нужен для сильной эмоции достижения, а не для частого фарма.</p>
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

    if (selectedIndex === index) cell.classList.add('selected');
    if (flashCellIndex === index) cell.classList.add('merge-flash');

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
    : 'Элемент выбран. Тапни по такому же для merge.';
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
      <button class="mission-claim ${mission.completed && !mission.claimed ? 'gold-like' : 'secondary'}" ${mission.completed && !mission.claimed ? '' : 'disabled'}>
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
  if (specialButton) specialButton.disabled = !specialProgress.active || !specialProgress.completed;

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

function renderInlineStats() {
  const level = document.getElementById('lab-level-inline');
  const rareChance = document.getElementById('rare-chance-inline');
  if (level) level.textContent = String(getLabLevel(state.get()));
  if (rareChance) rareChance.textContent = `${Math.round(getRareSpawnChance() * 100)}%`;
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
    if (key in map) map[key as keyof typeof map]?.classList.add('tutorial-focus');
  });
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
