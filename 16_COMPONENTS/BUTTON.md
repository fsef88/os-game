**Tags:** button

# Button

Версия: 1.0
Дата: 2026-07-14

---

## Назначение

Универсальная кнопка. Используется везде.

---

## API

```ts
interface ButtonConfig {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
  cost?: { coins?: number; crystals?: number };
  badge?: string | number;
}
```

## Реализация

```ts
// src/ui/components/button.ts

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonConfig {
  text: string;
  onClick: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: string;
  cost?: { coins?: number; crystals?: number };
  badge?: string | number;
}

export class Button {
  public element: HTMLButtonElement;
  private config: ButtonConfig;

  constructor(config: ButtonConfig) {
    this.config = { variant: 'primary', size: 'md', disabled: false, ...config };
    this.element = document.createElement('button');
    this.element.className = `btn btn-${this.config.variant} btn-${this.config.size}`;
    this.render();
    this.element.addEventListener('click', this.onClick);
  }

  private onClick = () => {
    if (this.config.disabled) return;
    this.config.onClick();
  };

  private render() {
    const parts: string[] = [];
    if (this.config.icon) parts.push(`<span class="btn-icon">${this.config.icon}</span>`);
    parts.push(`<span class="btn-text">${this.config.text}</span>`);
    if (this.config.cost) {
      const costText = this.formatCost();
      if (costText) parts.push(`<span class="btn-cost">${costText}</span>`);
    }
    if (this.config.badge != null) {
      parts.push(`<span class="btn-badge">${this.config.badge}</span>`);
    }
    this.element.innerHTML = parts.join('');
    this.element.disabled = !!this.config.disabled;
  }

  private formatCost(): string {
    const c = this.config.cost!;
    const parts: string[] = [];
    if (c.coins) parts.push(`💰 ${formatNumber(c.coins)}`);
    if (c.crystals) parts.push(`💎 ${c.crystals}`);
    return parts.join(' ');
  }

  setDisabled(disabled: boolean) {
    this.config.disabled = disabled;
    this.element.disabled = disabled;
  }

  setBadge(value: string | number | null) {
    this.config.badge = value ?? undefined;
    this.render();
  }

  destroy() {
    this.element.remove();
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(Math.floor(n));
}
```

## CSS

```css
.btn {
  pointer-events: auto;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  min-width: 88px;
  min-height: 44px;
  padding: 12px 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  touch-action: manipulation;
  transition: transform 0.15s ease-out, filter 0.15s ease-out;
  user-select: none;
}

.btn:active:not(:disabled) {
  transform: scale(0.95);
}

.btn:disabled {
  filter: grayscale(0.5) opacity(0.5);
  cursor: not-allowed;
}

.btn-primary { background: rgba(76, 175, 80, 0.95); color: white; }
.btn-secondary { background: rgba(255,255,255,0.15); color: white; }
.btn-danger { background: rgba(255, 51, 68, 0.95); color: white; }
.btn-success { background: rgba(0, 200, 83, 0.95); color: white; }

.btn-sm { min-width: 60px; min-height: 36px; padding: 8px 12px; font-size: 14px; }
.btn-md { min-width: 88px; min-height: 44px; }
.btn-lg { min-width: 120px; min-height: 56px; padding: 16px 24px; font-size: 18px; }

.btn-icon { font-size: 1.2em; }
.btn-cost { font-size: 0.9em; opacity: 0.9; }
.btn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff3344;
  color: white;
  font-size: 12px;
  border-radius: 12px;
  padding: 2px 6px;
  min-width: 20px;
  text-align: center;
}
```

## Использование

```ts
import { Button } from './ui/components/button';

const buyBtn = new Button({
  text: 'Купить',
  icon: '💰',
  cost: { coins: 500 },
  variant: 'primary',
  size: 'lg',
  onClick: () => buyItem(),
});
container.appendChild(buyBtn.element);

// Позже — обновить badge
buyBtn.setBadge('NEW');
```

## Чек-лист

- [x] Variants (4 шт)
- [x] Sizes (3 шт)
- [x] Disabled state
- [x] Icon support
- [x] Cost display
- [x] Badge
- [x] Touch-friendly (44px)
- [x] Анимация нажатия
