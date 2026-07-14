import { t } from './i18n';
import { state } from './state';

export function initHUD(container: HTMLElement) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top">
      <div class="hud-chip"><span class="hud-label">${t('hud.essence', 'Essence')}</span><span id="hud-essence-value">0</span></div>
      <div class="hud-chip"><span class="hud-label">${t('hud.discoveries', 'Discoveries')}</span><span id="hud-discoveries-value">0</span></div>
      <div class="hud-chip"><span class="hud-label">${t('hud.orders', 'Orders')}</span><span id="hud-orders-value">0</span></div>
    </div>
  `;
  container.appendChild(hud);

  state.subscribe(updateHUD);
  updateHUD();
}

function updateHUD() {
  const current = state.get();
  setText('hud-essence-value', formatNumber(current.essence));
  setText('hud-discoveries-value', String(current.discoveries.length));
  setText('hud-orders-value', String(current.ordersCompleted));
}

function setText(id: string, value: string) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
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
