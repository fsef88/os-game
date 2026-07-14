**Tags:** toast

# Toast

Версия: 1.0

---

## Назначение

Короткое уведомление. Не блокирует игру.

Используется: квест закрыт, достижение, оффлайн earnings, level up.

---

## API

```ts
interface ToastConfig {
  text: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;          // ms, default 3000
  position?: 'top' | 'bottom';
  icon?: string;
  onClick?: () => void;
}
```

## Реализация

```ts
// src/ui/components/toast.ts

export type ToastType = 'info' | 'success' | 'error' | 'warning';
export type ToastPosition = 'top' | 'bottom';

export interface ToastConfig {
  text: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  icon?: string;
  onClick?: () => void;
}

class ToastManager {
  private container: HTMLDivElement;
  private current: HTMLDivElement | null = null;
  private queue: ToastConfig[] = [];
  private lastShowTime = 0;
  private readonly MIN_INTERVAL = 500;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(config: ToastConfig) {
    const merged: ToastConfig = {
      type: 'info',
      duration: 3000,
      position: 'top',
      ...config,
    };

    // Throttle
    if (Date.now() - this.lastShowTime < this.MIN_INTERVAL) {
      this.queue.push(merged);
      return;
    }

    this.lastShowTime = Date.now();
    this.render(merged);
  }

  private render(config: ToastConfig) {
    if (this.current) return;
    const el = document.createElement('div');
    el.className = `toast toast-${config.type} toast-${config.position}`;
    el.innerHTML = `
      ${config.icon ? `<span class="toast-icon">${config.icon}</span>` : ''}
      <span class="toast-text">${config.text}</span>
    `;
    if (config.onClick) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        config.onClick?.();
        this.dismiss(el);
      });
    }
    this.container.appendChild(el);
    this.current = el;
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => this.dismiss(el), config.duration);
  }

  private dismiss(el: HTMLDivElement) {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      this.current = null;
      this.processQueue();
    }, 300);
  }

  private processQueue() {
    if (this.queue.length === 0) return;
    const next = this.queue.shift()!;
    setTimeout(() => this.render(next), this.MIN_INTERVAL);
  }
}

export const toast = new ToastManager();
```

## CSS

```css
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: calc(env(safe-area-inset-top, 0) + 80px);
  gap: 8px;
}

.toast {
  background: rgba(0,0,0,0.92);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
  max-width: 90vw;
  opacity: 0;
  transform: translateY(-30px);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  backdrop-filter: blur(8px);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-success { background: rgba(76, 175, 80, 0.95); }
.toast-error   { background: rgba(255, 51, 68, 0.95); }
.toast-warning { background: rgba(255, 152, 0, 0.95); }
.toast-info    { background: rgba(33, 150, 243, 0.95); }

.toast-bottom {
  /* Альтернативное позиционирование */
  position: fixed;
  top: auto;
  bottom: calc(env(safe-area-inset-bottom, 0) + 100px);
}

.toast-icon { font-size: 20px; }
```

## Использование

```ts
import { toast } from './ui/components/toast';

// Просто
toast.show({ text: 'Новый уровень!' });

// С типом и иконкой
toast.show({ text: 'Квест закрыт!', type: 'success', icon: '🎉' });

// С действием
toast.show({
  text: 'Доступен сундук',
  icon: '📦',
  onClick: () => openChest(),
});
```

## Чек-лист

- [x] Types (4)
- [x] Позиции (top, bottom)
- [x] Throttling
- [x] Очередь
- [x] Иконка
- [x] Onclick
- [x] Safe area
- [x] Анимация
