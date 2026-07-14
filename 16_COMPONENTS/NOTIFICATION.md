**Tags:** notification

# Notification (Web Push-like)

Версия: 1.0

---

## Назначение

In-app уведомление. Больше чем toast, меньше чем popup. Появляется сверху, заметное.

---

## API

```ts
interface NotificationConfig {
  title: string;
  body?: string;
  icon?: string;
  type?: 'info' | 'success' | 'reward' | 'event';
  duration?: number;
  onClick?: () => void;
}
```

## Реализация

```ts
// src/ui/components/notification.ts

export type NotificationType = 'info' | 'success' | 'reward' | 'event';

export interface NotificationConfig {
  title: string;
  body?: string;
  icon?: string;
  type?: NotificationType;
  duration?: number;
  onClick?: () => void;
}

class NotificationManager {
  private container: HTMLDivElement;
  private queue: NotificationConfig[] = [];
  private current: HTMLDivElement | null = null;
  private lastShow = 0;
  private readonly MIN_INTERVAL = 1000;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  show(config: NotificationConfig) {
    const merged: NotificationConfig = {
      type: 'info',
      duration: 5000,
      ...config,
    };
    if (Date.now() - this.lastShow < this.MIN_INTERVAL) {
      this.queue.push(merged);
      return;
    }
    this.lastShow = Date.now();
    this.render(merged);
  }

  private render(config: NotificationConfig) {
    if (this.current) {
      this.queue.push(config);
      return;
    }
    const el = document.createElement('div');
    el.className = `notification notification-${config.type}`;
    el.innerHTML = `
      ${config.icon ? `<div class="notification-icon">${config.icon}</div>` : ''}
      <div class="notification-content">
        <div class="notification-title">${config.title}</div>
        ${config.body ? `<div class="notification-body">${config.body}</div>` : ''}
      </div>
      <button class="notification-close">×</button>
    `;
    if (config.onClick) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('notification-close')) return;
        this.dismiss(el);
        config.onClick?.();
      });
    }
    el.querySelector('.notification-close')?.addEventListener('click', () => this.dismiss(el));
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
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        this.render(next);
      }
    }, 400);
  }
}

export const notification = new NotificationManager();
```

## CSS

```css
.notification-container {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  z-index: 950;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  gap: 8px;
}

.notification {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(40, 40, 60, 0.95), rgba(20, 20, 30, 0.95));
  border: 1px solid rgba(255, 213, 79, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 280px;
  max-width: 90vw;
  color: white;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  transform: translateY(-100px);
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out;
}
.notification.show {
  transform: translateY(0);
  opacity: 1;
}

.notification-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.notification-content { flex: 1; min-width: 0; }

.notification-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 2px;
}

.notification-body {
  font-size: 13px;
  opacity: 0.85;
}

.notification-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}
.notification-close:hover { opacity: 1; }

.notification-info    { border-color: rgba(33, 150, 243, 0.4); }
.notification-success { border-color: rgba(76, 175, 80, 0.4); }
.notification-reward  { border-color: rgba(255, 213, 79, 0.6); }
.notification-event   { border-color: rgba(156, 39, 176, 0.4); }
```

## Использование

```ts
import { notification } from './ui/components/notification';

notification.show({
  title: 'Новый уровень!',
  body: 'Ты достиг уровня 5',
  icon: '⭐',
  type: 'success',
  onClick: () => openLevelRewards(),
});
```

## Чек-лист

- [x] 4 типа
- [x] Иконка
- [x] Onclick
- [x] Throttling
- [x] Очередь
- [x] Safe area
- [x] Анимация spring
