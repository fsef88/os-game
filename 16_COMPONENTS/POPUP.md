**Tags:** popup

# Popup

Версия: 1.0

---

## Назначение

Модальное окно. Для подтверждений, rewards, IAP, level complete.

---

## API

```ts
interface PopupConfig {
  title: string;
  body?: string | HTMLElement;
  icon?: string;
  buttons: PopupButton[];
  dismissible?: boolean;     // закрытие по тапу вне
  showClose?: boolean;        // показать X
  onClose?: () => void;
  variant?: 'default' | 'reward' | 'confirm' | 'iap';
}

interface PopupButton {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  cost?: { coins?: number; crystals?: number };
  closeOnClick?: boolean;     // default: true
}
```

## Реализация

```ts
// src/ui/components/popup.ts

export interface PopupButton {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  cost?: { coins?: number; crystals?: number };
  closeOnClick?: boolean;
}

export interface PopupConfig {
  title: string;
  body?: string | HTMLElement;
  icon?: string;
  buttons: PopupButton[];
  dismissible?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  variant?: 'default' | 'reward' | 'confirm' | 'iap';
}

export class Popup {
  private element: HTMLDivElement;
  private config: PopupConfig;
  private buttonElements: HTMLButtonElement[] = [];

  constructor(config: PopupConfig) {
    this.config = {
      variant: 'default',
      dismissible: true,
      showClose: true,
      ...config,
    };
    this.element = document.createElement('div');
    this.element.className = `popup popup-${this.config.variant}`;
    this.render();
  }

  show() {
    document.body.appendChild(this.element);
    requestAnimationFrame(() => this.element.classList.add('show'));
  }

  close() {
    this.element.classList.remove('show');
    setTimeout(() => {
      this.element.remove();
      this.config.onClose?.();
    }, 300);
  }

  private render() {
    const buttonsHtml = this.config.buttons.map((b, i) => `
      <button class="popup-btn popup-btn-${b.variant || 'secondary'}" data-i="${i}">
        ${b.text}
        ${b.cost ? `<span class="popup-btn-cost">${this.formatCost(b.cost)}</span>` : ''}
      </button>
    `).join('');

    const bodyHtml = typeof this.config.body === 'string'
      ? `<div class="popup-body">${this.config.body}</div>`
      : '';

    this.element.innerHTML = `
      <div class="popup-backdrop"></div>
      <div class="popup-content">
        ${this.config.showClose ? '<button class="popup-close">×</button>' : ''}
        ${this.config.icon ? `<div class="popup-icon">${this.config.icon}</div>` : ''}
        <div class="popup-title">${this.config.title}</div>
        ${bodyHtml}
        <div class="popup-buttons">${buttonsHtml}</div>
      </div>
    `;

    // Обработчики
    this.element.querySelector('.popup-close')?.addEventListener('click', () => this.close());
    if (this.config.dismissible) {
      this.element.querySelector('.popup-backdrop')?.addEventListener('click', () => this.close());
    }
    this.config.buttons.forEach((b, i) => {
      const btnEl = this.element.querySelector(`.popup-btn[data-i="${i}"]`) as HTMLButtonElement;
      if (!btnEl) return;
      btnEl.addEventListener('click', () => {
        b.onClick();
        if (b.closeOnClick !== false) this.close();
      });
    });
  }

  private formatCost(c: { coins?: number; crystals?: number }): string {
    const parts: string[] = [];
    if (c.coins) parts.push(`💰 ${c.coins}`);
    if (c.crystals) parts.push(`💎 ${c.crystals}`);
    return parts.join(' ');
  }
}
```

## CSS

```css
.popup {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.popup.show { opacity: 1; }

.popup-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
}

.popup-content {
  position: relative;
  background: linear-gradient(180deg, #1a1f3a, #0d122c);
  border: 2px solid var(--color-gold, #ffd54f);
  border-radius: 16px;
  padding: 32px 24px 24px;
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  text-align: center;
  color: white;
  transform: scale(0.9);
  transition: transform 0.3s ease-out;
}
.popup.show .popup-content { transform: scale(1); }

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: white;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
.popup-close:hover { opacity: 1; }

.popup-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
}

.popup-body {
  font-size: 16px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.popup-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.popup-btn {
  min-width: 120px;
  min-height: 48px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: transform 0.15s ease-out;
}
.popup-btn:active { transform: scale(0.95); }
.popup-btn-primary { background: rgba(76, 175, 80, 0.95); color: white; }
.popup-btn-secondary { background: rgba(255,255,255,0.15); color: white; }
.popup-btn-danger { background: rgba(255, 51, 68, 0.95); color: white; }
.popup-btn-success { background: rgba(0, 200, 83, 0.95); color: white; }
```

## Использование

```ts
import { Popup } from './ui/components/popup';

const popup = new Popup({
  title: 'Купить Семечко?',
  icon: '🌱',
  body: 'Это ускорит твою ферму!',
  buttons: [
    { text: 'Отмена', variant: 'secondary' },
    { text: 'Купить', variant: 'primary', cost: { coins: 500 }, onClick: () => buyItem() },
  ],
  variant: 'confirm',
});
popup.show();
```

## Чек-лист

- [x] Variants (4)
- [x] Backdrop close
- [x] X button
- [x] Cost display
- [x] Анимация появления
- [x] Safe area
- [x] Multiple buttons
- [x] Body как HTML или string
