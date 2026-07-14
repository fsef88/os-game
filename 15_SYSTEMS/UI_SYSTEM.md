**Tags:** systems, ui

# UI SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/UI_UX_BIBLE.md

---


## Назначение

Управление интерфейсом: HUD, модалки, кнопки, обратная связь.

Используется: 100% игр.

---

## Архитектура

```
UI
├── Layout        — позиционирование, safe area
├── HUD           — постоянный (top/bottom)
├── Modal         — прерывает игру
├── Toast         — не прерывает
├── Button        — обёртка над <button>
├── Effects       — частицы, floating text
└── Style         — общие стили, переменные
```

## Layout

### Safe area

```css
padding-top: env(safe-area-inset-top, 0);
padding-bottom: env(safe-area-inset-bottom, 0);
padding-left: env(safe-area-inset-left, 0);
padding-right: env(safe-area-inset-right, 0);
```

### Структура экрана

```
┌─────────────────────────┐
│  HUD top (money, etc)   │  ← safe area top
├─────────────────────────┤
│                         │
│                         │
│     Game area           │  ← основной контент
│                         │
│                         │
├─────────────────────────┤
│  HUD bottom (buttons)   │  ← safe area bottom
└─────────────────────────┘
```

## HUD

```ts
class HUD {
  top: {
    money: MoneyDisplay;
    crystals: CrystalDisplay;
    income: IncomeDisplay;     // idle/clicker
    level: LevelDisplay;
  };
  bottom: {
    boost: BoostButton;
    menu: MenuButton;
    shop: ShopButton;          // tycoon
  };
}
```

## Modal (модалки)

### Когда показывать

✅ Подтверждение сброса  
✅ Покупка IAP  
✅ Награда за квест  
✅ Offline earnings  
✅ Game over (если есть)

### Когда НЕ показывать

❌ Rate us  
❌ "Новый контент!" (каждый день)  
❌ Туториал (3+ окна подряд)  
❌ Технические сообщения

### Структура

```html
<div class="modal-backdrop">
  <div class="modal">
    <div class="modal-header">Заголовок</div>
    <div class="modal-body">Контент / награда</div>
    <div class="modal-footer">
      <button>Отмена</button>
      <button class="primary">OK</button>
    </div>
  </div>
</div>
```

## Toast (тосты)

Короткие уведомления, не блокируют игру.

```ts
class Toast {
  show(text: string, type: 'info' | 'success' | 'error' = 'info');
  // Авто-исчезает через 3 сек
  // Не больше 1 одновременно
}
```

## Button

```ts
interface ButtonConfig {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
  cost?: number; // показывает цену
}
```

## Effects (обратная связь)

### Floating text

```ts
showFloatingText({
  text: '+50',
  color: '#4caf50',
  position: { x, y },
  duration: 1000,
});
```

### Particle

```ts
emitParticles({
  type: 'sparkle' | 'confetti' | 'coin',
  count: 10,
  position: { x, y },
});
```

### Screen shake

```ts
shakeScreen({ intensity: 'light' | 'medium' | 'heavy' });
```

## Style

### CSS Variables

```css
:root {
  --bg-primary: #0d122c;
  --bg-panel: rgba(30, 30, 40, 0.65);
  --color-gold: #ffd54f;
  --color-green: #4caf50;
  --color-red: #ff3344;
  --color-blue: #2196f3;
  --color-purple: #9c27b0;
  --border-color: #2a2a3d;
  --safe-top: env(safe-area-inset-top, 0);
  --safe-bottom: env(safe-area-inset-bottom, 0);
  --tap-target: 44px; /* минимум для iOS */
}
```

## Принципы

1. **Один экран = одна задача**
2. **Главная кнопка = большая, по центру**
3. **Каждое действие = визуальный feedback**
4. **Звук опционален** (нельзя требовать)
5. **Текст минимум** (иконки > слова)

## Чек-лист

- [ ] Safe area учтена
- [ ] HUD не перекрывает геймплей
- [ ] Модалки закрываются (X, тап вне, Escape)
- [ ] Кнопки ≥ 44x44px
- [ ] Тапы не "проваливаются" под HUD
- [ ] Цветовая схема единая
- [ ] Loading state для всех async операций
