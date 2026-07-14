import { t } from '../i18n';
import { state } from '../state';
import {
  buyAutoIncome,
  buyTapUpgrade,
  getAutoIncomeCost,
  getAutoIncomePerSecond,
  getTapUpgradeCost,
  tapSeed,
} from '../core/clicker';

let mounted = false;

export function initClicker(container: HTMLElement) {
  if (mounted) {
    return;
  }

  mounted = true;
  const screen = document.createElement('section');
  screen.className = 'clicker-screen';
  screen.innerHTML = `
    <div class="clicker-card clicker-hero">
      <h1>${t('screen.title', 'Seed Clicker Mini')}</h1>
      <p>${t('screen.subtitle', 'Tap and grow')}</p>
      <button id="seed-button" class="seed-button">${t('seed.button', 'Tap the seed')}</button>
      <div class="clicker-stats">
        <div><strong>${t('seed.power', 'Tap power')}:</strong> <span id="tap-power">1</span></div>
        <div><strong>${t('seed.total_taps', 'Total taps')}:</strong> <span id="total-taps">0</span></div>
      </div>
    </div>

    <div class="clicker-card clicker-upgrades">
      <p class="hint">${t('hint.start', 'Tap a few times first.')}</p>
      <div class="upgrade-row">
        <div>
          <strong>${t('upgrade.tap', 'Upgrade tap')}</strong>
          <div>${t('upgrade.level', 'Level')}: <span id="tap-level">0</span></div>
          <div>${t('upgrade.cost', 'Cost')}: <span id="tap-cost">25</span></div>
        </div>
        <button id="tap-upgrade-button">+</button>
      </div>
      <div class="upgrade-row">
        <div>
          <strong>${t('upgrade.auto', 'Buy auto growth')}</strong>
          <div>${t('upgrade.level', 'Level')}: <span id="auto-level">0</span></div>
          <div>${t('upgrade.cost', 'Cost')}: <span id="auto-cost">60</span></div>
          <div>${t('upgrade.income', 'Income per second')}: <span id="auto-income">0</span></div>
        </div>
        <button id="auto-upgrade-button">+</button>
      </div>
    </div>
  `;

  container.appendChild(screen);

  screen.querySelector<HTMLButtonElement>('#seed-button')?.addEventListener('click', () => {
    tapSeed();
  });
  screen.querySelector<HTMLButtonElement>('#tap-upgrade-button')?.addEventListener('click', () => {
    buyTapUpgrade();
  });
  screen.querySelector<HTMLButtonElement>('#auto-upgrade-button')?.addEventListener('click', () => {
    buyAutoIncome();
  });

  state.subscribe(updateClickerScreen);
  updateClickerScreen();
}

function updateClickerScreen() {
  const current = state.get();

  setText('tap-power', String(current.tapPower));
  setText('total-taps', String(current.totalTaps));
  setText('tap-level', String(current.tapUpgradeLevel));
  setText('tap-cost', String(getTapUpgradeCost()));
  setText('auto-level', String(current.autoIncomeLevel));
  setText('auto-cost', String(getAutoIncomeCost()));
  setText('auto-income', String(getAutoIncomePerSecond()));

  const tapButton = document.getElementById('tap-upgrade-button') as HTMLButtonElement | null;
  const autoButton = document.getElementById('auto-upgrade-button') as HTMLButtonElement | null;

  if (tapButton) {
    tapButton.disabled = current.money < getTapUpgradeCost();
  }

  if (autoButton) {
    autoButton.disabled = current.money < getAutoIncomeCost();
  }
}

function setText(id: string, value: string) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}
