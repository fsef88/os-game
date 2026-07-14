**Tags:** ads, hud

# HUD (Heads-Up Display)

Версия: 1.0

---

## Назначение

Постоянный интерфейс: монеты, кристаллы, доход, кнопки boost'ов.

Используется: 100% игр.

---

## API

```ts
interface HUDConfig {
  position: 'top' | 'bottom' | 'both';
  showMoney?: boolean;
  showCrystals?: boolean;
  showIncome?: boolean;
  showLevel?: boolean;
  bottomActions?: string[];  // id кнопок
}
```

## Реализация

```ts
// src/ui/components/hud.ts

import { state } from '../../state';

export interface HUDConfig {
  position: 'top' | 'bottom' | 'both';
  showMoney?: boolean;
  showCrystals?: boolean;
  showIncome?: boolean;
  showLevel?: boolean;
}

export class HUD {
  private element: HTMLDivElement;
  private moneyEl: HTMLElement | null = null;
  private crystalsEl: HTMLElement | null = null;
  private incomeEl: HTMLElement | null = null;
  private levelEl: HTMLElement | null = null;
  private bottomEl: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(public config: HUDConfig) {
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.render();
    this.unsubscribe = state.subscribe(() => this.update());
    this.update();
  }

  public get bottomContainer(): HTMLElement | null {
    return this.bottomEl;
  }

  private render() {
    const topHtml = (this.config.position === 'top' || this.config.position === 'both') ? `
      <div class="hud-top">
        ${this.config.showMoney !== false ? '<div class="hud-money">💰 <span></span></div>' : ''}
        ${this.config.showCrystals ? '<div class="hud-crystals">💎 <span></span></div>' : ''}
        ${this.config.showIncome ? '<div class="hud-income">+0/с</div>' : ''}
        ${this.config.showLevel ? '<div class="hud-level">⭐ 1</div>' : ''}
      </div>
    ` : '';

    const bottomHtml = (this.config.position === 'bottom' || this.config.position === 'both') ?
      '<div class="hud-bottom"></div>' : '';

    this.element.innerHTML = topHtml + bottomHtml;

    this.moneyEl = this.element.querySelector('.hud-money span');
    this.crystalsEl = this.element.querySelector('.hud-crystals span');
    this.incomeEl = this.element.querySelector('.hud-income');
    this.levelEl = this.element.querySelector('.hud-level');
    this.bottomEl = this.element.querySelector('.hud-bottom');
  }

  private update() {
    const s = state.get();
    if (this.moneyEl) this.moneyEl.textContent = formatNumber(s.money);
    if (this.crystalsEl) this.crystalsEl.textContent = String(s.crystals || 0);
    if (this.incomeEl) {
      const income = calculateIncome(s);
      this.incomeEl.textContent = `+${formatNumber(income)}/с`;
    }
    if (this.levelEl) this.levelEl.textContent = `⭐ ${s.level || 1}`;
  }

  destroy() {
    this.unsubscribe?.();
    this.element.remove();
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(Math.floor(n));
}

function calculateIncome(s: any): number {
  return s.incomePerSec || 0;
}
```

## CSS

```css
.hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
  padding: env(safe-area-inset-top, 0) 12px env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hud-top {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 40, 0.65);
  padding: 8px 16px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  pointer-events: auto;
  align-self: center;
  margin-top: 4px;
}

.hud-money, .hud-crystals, .hud-income, .hud-level {
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hud-bottom {
  display: flex;
  gap: 8px;
  justify-content: center;
  pointer-events: auto;
}
```

## Использование

```ts
import { HUD } from './ui/components/hud';

const hud = new HUD({
  position: 'both',
  showMoney: true,
  showCrystals: true,
  showIncome: true,
});
document.body.appendChild(hud.element);

// Добавить кнопку в bottom
const boostBtn = new Button({...});
hud.bottomContainer?.appendChild(boostBtn.element);
```

## Чек-лист

- [x] Money display
- [x] Crystals display
- [x] Income display
- [x] Level display
- [x] Top/Bottom/Both
- [x] Auto-update on state change
- [x] Safe area
- [x] Glassmorphism
