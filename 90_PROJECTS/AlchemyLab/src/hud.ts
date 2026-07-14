import { state } from './state';
import { getLabLevel } from './core/alchemy';

export function initHUD(container: HTMLElement) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top">
      <div class="hud-chip"><span class="hud-label">Эссенция</span><span id="hud-essence-value">0</span></div>
      <div class="hud-chip"><span class="hud-label">Открытия</span><span id="hud-discoveries-value">0</span></div>
      <div class="hud-chip"><span class="hud-label">Заказы</span><span id="hud-orders-value">0</span></div>
      <div class="hud-chip"><span class="hud-label">Уровень лаборатории</span><span id="hud-level-value">1</span></div>
    </div>
  `;
  container.appendChild(hud);

  state.subscribe(updateHUD);
  updateHUD();
}

function updateHUD() {
  const current = state.get();
  setText('hud-essence-value', formatNumber(current.essence));
  setText('hud-discoveries-value', String(current.discoveries.length - 1));
  setText('hud-orders-value', String(current.ordersCompleted + current.specialOrdersCompleted));
  setText('hud-level-value', String(getLabLevel(current)));
}

function setText(id: string, value: string) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.floor(value));
}
