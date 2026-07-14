**Tags:** confirm

# Confirm Dialog

Версия: 1.0

---

## Назначение

Специализированный popup для подтверждений. Синтаксический сахар над Popup.

---

## API

```ts
interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  requireHold?: boolean;   // нужно зажать кнопку 2 сек
  onConfirm: () => void;
  onCancel?: () => void;
}
```

## Реализация

```ts
// src/ui/components/confirm-dialog.ts

import { Popup } from './popup';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  requireHold?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function showConfirm(config: ConfirmConfig): Popup {
  const variant = config.variant || 'info';
  const icon = variant === 'danger' ? '⚠️' : variant === 'warning' ? '❓' : 'ℹ️';

  const popup = new Popup({
    title: config.title,
    body: config.message,
    icon,
    buttons: [
      {
        text: config.cancelText || 'Отмена',
        variant: 'secondary',
        onClick: () => config.onCancel?.(),
      },
      {
        text: config.confirmText || 'OK',
        variant: variant === 'danger' ? 'danger' : 'primary',
        onClick: () => config.onConfirm(),
      },
    ],
    variant: 'confirm',
  });

  if (config.requireHold) {
    setupHoldToConfirm(popup, config);
  }

  popup.show();
  return popup;
}

function setupHoldToConfirm(popup: Popup, config: ConfirmConfig) {
  const buttons = popup.element.querySelectorAll('.popup-btn');
  const confirmBtn = buttons[buttons.length - 1] as HTMLButtonElement;
  if (!confirmBtn) return;

  const originalText = confirmBtn.textContent || '';
  let holdTimer: number | null = null;
  let progress = 0;

  const startHold = (e: Event) => {
    e.preventDefault();
    progress = 0;
    holdTimer = window.setInterval(() => {
      progress += 50;
      confirmBtn.textContent = `... ${Math.min(100, Math.round((progress / 2000) * 100))}%`;
      if (progress >= 2000) {
        clearInterval(holdTimer!);
        holdTimer = null;
        config.onConfirm();
        popup.close();
      }
    }, 50);
  };

  const cancelHold = () => {
    if (holdTimer) {
      clearInterval(holdTimer);
      holdTimer = null;
    }
    progress = 0;
    confirmBtn.textContent = originalText;
  };

  confirmBtn.addEventListener('mousedown', startHold);
  confirmBtn.addEventListener('touchstart', startHold);
  confirmBtn.addEventListener('mouseup', cancelHold);
  confirmBtn.addEventListener('mouseleave', cancelHold);
  confirmBtn.addEventListener('touchend', cancelHold);
  confirmBtn.addEventListener('touchcancel', cancelHold);
}
```

## CSS

Дополнительно к Popup (если нужно):

```css
.popup-confirm .popup-content {
  border-color: var(--color-red, #ff3344);
}

.popup-btn-danger {
  position: relative;
  overflow: hidden;
  user-select: none;
}
```

## Использование

```ts
import { showConfirm } from './ui/components/confirm-dialog';

// Простое подтверждение
showConfirm({
  title: 'Сбросить прогресс?',
  message: 'Это действие нельзя отменить.',
  confirmText: 'Сбросить',
  variant: 'danger',
  onConfirm: () => resetGame(),
});

// С удержанием (для опасных действий)
showConfirm({
  title: 'Удалить аккаунт?',
  message: 'Зажмите кнопку на 2 секунды для подтверждения.',
  variant: 'danger',
  requireHold: true,
  onConfirm: () => deleteAccount(),
});
```

## Чек-лист

- [x] 3 варианта
- [x] Кастомные тексты
- [x] Cancel callback
- [x] Require hold (для danger)
- [x] Возврат popup для кастомизации
