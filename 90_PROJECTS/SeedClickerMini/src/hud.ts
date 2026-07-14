import { t } from './i18n';
import { state } from './state';

export function initHUD(container: HTMLElement) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top">
      <div class="hud-money" id="hud-money">
        <span class="hud-label">${t('hud.money', 'Coins')}</span>
        <span class="hud-value" id="hud-money-value">0</span>
      </div>
    </div>
  `;
  container.appendChild(hud);

  state.subscribe(updateHUD);
  updateHUD();
}

function updateHUD() {
  const current = state.get();
  const moneyEl = document.getElementById('hud-money-value');
  if (moneyEl) {
    moneyEl.textContent = formatNumber(current.money);
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
