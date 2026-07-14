**Tags:** notification, systems

# NOTIFICATION SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/UI_UX_BIBLE.md (раздел "Обратная связь")

---


## Назначение

Внутриигровые уведомления: тосты, баннеры, push-подобные (web).

Используется: 100% игр.

---

## Типы

### Toast (не блокирует)

```ts
toast.show('Новый уровень!', { type: 'success', duration: 3000 });
```

### Banner (вверху экрана, заметный)

```ts
banner.show('Доступен новый контент!', { onClick: () => openChest() });
```

### Modal (полноэкранный, блокирует)

```ts
modal.show({
  title: 'Подтверждение',
  body: 'Вы уверены?',
  buttons: [
    { text: 'Отмена', onClick: () => modal.close() },
    { text: 'OK', onClick: () => confirm() },
  ],
});
```

### Native (Web Notifications API)

```ts
// Требует разрешения
if (Notification.permission === 'granted') {
  new Notification('Твои овощи выросли!', {
    body: 'Зайди собрать урожай',
    icon: '/icon.png',
  });
}
```

## Toast (основной)

### Архитектура

```ts
class ToastSystem {
  private queue: Toast[];
  private current: Toast | null;
  private container: HTMLElement;

  show(text: string, options?: ToastOptions) {
    const toast: Toast = {
      text,
      type: options?.type || 'info',
      duration: options?.duration || 3000,
      onClick: options?.onClick,
    };
    this.queue.push(toast);
    this.process();
  }

  private process() {
    if (this.current) return;
    const next = this.queue.shift();
    if (!next) return;
    this.render(next);
    setTimeout(() => this.dismiss(), next.duration);
  }

  private render(toast: Toast) {
    const el = document.createElement('div');
    el.className = `toast toast-${toast.type}`;
    el.textContent = toast.text;
    if (toast.onClick) el.addEventListener('click', toast.onClick);
    this.container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    this.current = { ...toast, element: el };
  }

  private dismiss() {
    if (!this.current) return;
    const el = this.current.element;
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
    this.current = null;
    this.process();
  }
}
```

### CSS

```css
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  transition: transform 0.3s ease-out;
  z-index: 1000;
}
.toast.show {
  transform: translateX(-50%) translateY(0);
}
.toast-success { background: rgba(76, 175, 80, 0.95); }
.toast-error { background: rgba(255, 51, 68, 0.95); }
.toast-info { background: rgba(33, 150, 243, 0.95); }
```

## Когда показывать

✅ Квест закрыт  
✅ Достижение получено  
✅ Уровень повышен  
✅ Оффлайн earnings  
✅ Daily reward забрана  
✅ Rewarded завершён  

❌ Rate us  
❌ Каждый клик (спам)  
❌ Ошибки сети (только если критично)  
❌ Generic "Добро пожаловать" (на каждый запуск)  

## Throttling

```ts
class ToastSystem {
  private lastToastTime: number = 0;
  private MIN_INTERVAL = 500; // мс между тостами

  show(...) {
    if (Date.now() - this.lastToastTime < this.MIN_INTERVAL) {
      // поставить в очередь
      return;
    }
    this.lastToastTime = Date.now();
    this.process(...);
  }
}
```

## Push Notifications (Web)

### Запрос разрешения

```ts
async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}
```

### Когда запрашивать

✅ После 3+ сессий  
✅ После закрытия онбординга  
✅ В контексте (когда есть польза)  

❌ На первом экране  
❌ Принудительно  
❌ Без объяснения зачем  

## Чек-лист

- [ ] Toast работает
- [ ] Не больше 1 одновременно
- [ ] Throttling между тостами
- [ ] Web Notifications (опционально)
- [ ] Запрос разрешения в правильном месте
- [ ] Не злоупотреблять
