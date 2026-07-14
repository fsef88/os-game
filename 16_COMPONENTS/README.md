# 16_COMPONENTS

Версия: 1.0
Дата: 2026-07-14

---

## Назначение

Готовые UI-компоненты. Используются в любом жанре.

Каждый компонент — TypeScript класс с готовым API.

## Список

| Компонент | Файл | Где используется |
|---|---|---|
| Button | BUTTON.md | 100% игр |
| Popup | POPUP.md | Подтверждения, rewards, IAP |
| Toast | TOAST.md | Уведомления |
| HUD | HUD.md | 100% игр |
| CurrencyPanel | CURRENCY_PANEL.md | 100% игр |
| Loading | LOADING.md | Загрузка ресурсов |
| TutorialArrow | TUTORIAL_ARROW.md | Tutorial |
| Notification | NOTIFICATION.md | Push-like |
| ConfirmDialog | CONFIRM_DIALOG.md | Выход, сброс, IAP |
| Window | WINDOW.md | Большие модалки |
| RewardScreen | REWARD_SCREEN.md | Награды, кейсы |

## Принципы

1. **Компонент = TypeScript класс.** Готов к использованию.
2. **Компонент = state + render.** Подписывается на изменения.
3. **Компонент = конфигурируемый.** props при создании.
4. **Компонент = переиспользуемый.** Один Button для всех случаев.
5. **Компонент = тестируемый.** Можно запустить отдельно.

## Связь

```
GENRE (что)
  ↓
MECHANICS (какая логика)
  ↓
SYSTEMS (как работает)
  ↓
COMPONENTS (как выглядит)
  ↓
PROJECT (конкретная сборка)
```

## Использование

```ts
import { Button } from './ui/components/button';
import { Popup } from './ui/components/popup';

const button = new Button({
  text: 'Купить',
  onClick: () => buyItem(),
  variant: 'primary',
});
container.appendChild(button.element);

const popup = new Popup({
  title: 'Подтверждение',
  body: 'Купить за 100 монет?',
  buttons: [
    { text: 'Отмена', onClick: () => popup.close() },
    { text: 'Купить', onClick: () => { buyItem(); popup.close(); }, variant: 'primary' },
  ],
});
popup.show();
```

## Чек-лист

- [ ] 11 компонентов с кодом
- [ ] Каждый имеет props interface
- [ ] Каждый имеет события (onClick, onClose)
- [ ] Каждый тестируется
- [ ] Стили в CSS variables
