**Tags:** event, systems

# EVENT SYSTEM (in-game)

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 14_MECHANICS/ (для примеров механик)

---


## Назначение

Игровые события: spawn, merge, purchase, level-up. **Не** маркетинговые события (это LiveOps).

Используется: 100% игр.

---

## Архитектура

```ts
type EventHandler = (data: any) => void;

class EventSystem {
  private listeners: Map<string, EventHandler[]>;

  on(event: string, handler: EventHandler): () => void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data?: any): void;
}
```

## События

### Core

```ts
// Merge
'merge:success' — { from, to, slot }
'merge:fail' — { reason }

// Spawn
'spawn:auto' — { object }
'spawn:manual' — { object, slot }

// Sell / Buy
'sell:success' — { object, money }
'buy:success' — { item, cost }
'buy:fail' — { reason: 'no_money' | 'locked' }

// Progression
'level:up' — { level, rewards }
'xp:gain' — { amount, source }
```

### Monetization

```ts
'rewarded:shown' — { type }
'rewarded:complete' — { type, reward }
'rewarded:closed' — { reason: 'closed' | 'error' }
'interstitial:shown' — { reason }
'iap:purchased' — { productId, revenue }
```

### UI

```ts
'modal:open' — { id }
'modal:close' — { id }
'screen:change' — { from, to }
```

## Использование

### Подписка

```ts
const unsubscribe = events.on('merge:success', (data) => {
  console.log('Merged!', data);
  analytics.track('merge', data);
  audio.playSFX('merge');
  particles.emit({ type: 'sparkle', x: data.to.slot.x, y: data.to.slot.y });
});
// ...
unsubscribe();
```

### Emit

```ts
events.emit('merge:success', { from, to, slot });
```

## Anti-patterns

- ❌ Один обработчик делает слишком много (SRP нарушение)
- ❌ События зависят друг от друга (порядок не гарантирован)
- ❌ Много emit'ов в одной операции (спам)

## Порядок обработки

События обрабатываются **синхронно** в порядке подписки. Если нужно async — внутри обработчика.

## Связь с Analytics

В централизованном обработчике можно логировать все события:

```ts
// Подписать один раз на все события
Object.keys(EVENT_NAMES).forEach(name => {
  events.on(name, (data) => analytics.track(name, data));
});
```

## Чек-лист

- [ ] Event system инициализирована
- [ ] Core события emit'ятся
- [ ] Подписки работают
- [ ] Unsubscribe возможен
- [ ] Не больше 1 emit на операцию
