import { t } from './i18n';
import { state } from './state';

export function initHUD(container: HTMLElement) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top">
      <div class="hud-money" id="hud-money">
        <span class="hud-label">${t('hud.money', 'Money')}</span>
        <span class="hud-value" id="hud-money-value">0</span>
      </div>
      <div class="hud-crystals" id="hud-crystals" style="display:none">
        <span class="hud-label">${t('hud.crystals', 'Crystals')}</span>
        <span class="hud-value" id="hud-crystals-value">0</span>
      </div>
      <div class="hud-income" id="hud-income" style="display:none">
        ${t('hud.income', 'Income')}: <span id="hud-income-value">0</span>/s
      </div>
    </div>
    <div class="hud-bottom" id="hud-bottom"></div>
  `;
  container.appendChild(hud);

  state.subscribe(updateHUD);
  updateHUD();
}

function updateHUD() {
  const current = state.get();
  const moneyEl = document.getElementById('hud-money-value');
  const crystalsEl = document.getElementById('hud-crystals-value');
  const crystalsWrap = document.getElementById('hud-crystals');
  const incomeWrap = document.getElementById('hud-income');
  const incomeValue = document.getElementById('hud-income-value');

  if (moneyEl) {
    moneyEl.textContent = formatNumber(current.money);
  }

  if (crystalsEl) {
    crystalsEl.textContent = String(current.crystals);
  }

  if (crystalsWrap) {
    crystalsWrap.style.display = current.crystals > 0 ? 'flex' : 'none';
  }

  if (incomeWrap && incomeValue) {
    incomeValue.textContent = '0';
    incomeWrap.style.display = 'none';
  }
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(Math.floor(value));
}
