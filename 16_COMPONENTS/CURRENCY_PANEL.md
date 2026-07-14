**Tags:** currency

# Currency Panel

Версия: 1.0

---

## Назначение

Панель всех валют игрока. Используется в popup'ах, магазине, top-bar'е.

---

## API

```ts
interface CurrencyPanelConfig {
  coins?: number;
  crystals?: number;
  energy?: number;
  maxEnergy?: number;
  tickets?: number;
  showChange?: boolean;        // показывать +N / -N
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}
```

## Реализация

```ts
// src/ui/components/currency-panel.ts

export interface CurrencyPanelConfig {
  coins?: number;
  crystals?: number;
  energy?: number;
  maxEnergy?: number;
  tickets?: number;
  showChange?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export class CurrencyPanel {
  public element: HTMLDivElement;
  private config: CurrencyPanelConfig;

  constructor(config: CurrencyPanelConfig) {
    this.config = { layout: 'horizontal', size: 'md', showChange: false, ...config };
    this.element = document.createElement('div');
    this.element.className = `currency-panel ${this.config.layout} size-${this.config.size}`;
    this.render();
  }

  update(config: Partial<CurrencyPanelConfig>) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  private render() {
    const items: string[] = [];
    if (this.config.coins != null) {
      items.push(this.makeItem('💰', formatNumber(this.config.coins)));
    }
    if (this.config.crystals != null) {
      items.push(this.makeItem('💎', String(this.config.crystals)));
    }
    if (this.config.energy != null) {
      const max = this.config.maxEnergy || this.config.energy;
      items.push(this.makeItem('⚡', `${this.config.energy}/${max}`));
    }
    if (this.config.tickets != null) {
      items.push(this.makeItem('🎟️', String(this.config.tickets)));
    }
    this.element.innerHTML = items.join('');
  }

  private makeItem(icon: string, value: string): string {
    return `
      <div class="currency-item">
        <span class="currency-icon">${icon}</span>
        <span class="currency-value">${value}</span>
      </div>
    `;
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
.currency-panel {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: rgba(30, 30, 40, 0.65);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}
.currency-panel.vertical {
  flex-direction: column;
  align-items: stretch;
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
}

.currency-icon { font-size: 1.2em; }
.currency-value {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.currency-panel.size-sm .currency-item { font-size: 12px; }
.currency-panel.size-md .currency-item { font-size: 16px; }
.currency-panel.size-lg .currency-item { font-size: 20px; }
```

## Использование

```ts
import { CurrencyPanel } from './ui/components/currency-panel';

const panel = new CurrencyPanel({
  coins: 1500,
  crystals: 25,
  layout: 'horizontal',
  size: 'md',
});
shopContent.appendChild(panel.element);

// Позже обновить
panel.update({ coins: 2000 });
```

## Чек-лист

- [x] Все валюты (4)
- [x] Горизонтальный/вертикальный layout
- [x] Размеры
- [x] Update без пересоздания
- [x] Tabular nums
- [x] Glassmorphism
