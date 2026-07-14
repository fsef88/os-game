**Tags:** bible, monetization

# MONETIZATION BIBLE
**Status:** Stable
**Owner:** Studio
**Version:** 1.4
**Last Reviewed:** 2026-07-14

---



Версия: 1.0  
Дата: 2026-07-14  
Источник: реальный код Merge Farm, требования Яндекс Игр

---

## 1. ПРИНЦИПЫ

### Главный закон

> Монетизация не должна раздражать. Она должна помогать.

### Два типа игроков

- **F2P (free-to-play)** — 95-98% игроков. Никогда не платят деньгами, но смотрят рекламу.
- **Payers** — 2-5% игроков. Покупают IAP.

Монетизация в первую очередь ориентирована на F2P через rewarded ads.  
IAP — дополнительный, не основной.

### LTV (Lifetime Value)

```
LTV = ARPDAU × Avg Session Length × Sessions per Day × Avg Lifetime (days)
```

Для Яндекс Игр:
- ARPDAU: $0.005-0.02 (хорошо), $0.02-0.05 (отлично)
- Session Length: 3-10 минут
- Sessions per Day: 1-3
- Avg Lifetime: 3-30 дней

Реалистичный LTV casual-merge: $0.05-0.50 за всю жизнь игрока.

### D1, D7, D30

```
D1 retention:  > 30%  (хорошо), > 50% (отлично)
D7 retention:  > 10%  (хорошо), > 20% (отлично)
D30 retention: > 3%   (нормально)
```

Без retention монетизация не работает.

---

## 2. REWARDED ADS (вознаграждаемая реклама)

### Главный принцип

Игрок ДОБРОВОЛЬНО смотрит рекламу за награду. Никакого принуждения.

### Когда показывать

✅ **Ускорение** — x2 income на 30 минут  
✅ **Пропуск таймера** — мгновенное завершение  
✅ **Удвоение оффлайн-дохода** — при входе в игру  
✅ **Бесплатный буст** — раз в день  
✅ **Открытие премиум-кейса** — раз в день  
✅ **Revive** — после критической ошибки (если есть)

### Когда НЕ показывать

❌ Первые 60 секунд игры  
❌ Во время обучения  
❌ Подряд больше 2 раз за сессию  
❌ Во время merge-цепочки  
❌ При активном таймере, который игрок ждёт

### Паттерн (из Merge Farm)

```ts
// Один универсальный вызов
function offerRewardedAd(reward: () => void) {
  if (canShowRewardedAd()) {
    sdk.showRewarded(
      () => { reward(); playRewardSound(); showSuccess(); },
      () => { playCancelSound(); },  // закрыл без награды
      () => { playErrorSound(); showError('Реклама недоступна'); }
    );
  }
}
```

### Cooldown

```ts
const REWARDED_COOLDOWN = 30; // секунд
let lastRewardedTime = 0;
function canShowRewardedAd() {
  return Date.now() - lastRewardedTime > REWARDED_COOLDOWN * 1000;
}
```

### Дневной лимит

```ts
const MAX_REWARDED_PER_DAY = 10;
function getRewardedToday() { return state.analytics.rewardedToday; }
function canShowRewardedAd() {
  return getRewardedToday() < MAX_REWARDED_PER_DAY;
}
```

После лимита — кнопка rewarded отключается до следующего дня.

---

## 3. INTERSTITIAL (полноэкранная реклама)

### Главный принцип

НЕ раздражать. Только в "естественных" паузах.

### Когда показывать

✅ **Между сессиями** (после возврата из offline)  
✅ **При выходе из меню** (НЕ при входе)  
✅ **После "Game Over"-подобного события** (нет проигрыша в merge)  
✅ **Раз в 3-5 действий** (не чаще)

### Когда НЕ показывать

❌ Первые 30 секунд игры  
❌ Во время merge-цепочки  
❌ Сразу после rewarded  
❌ При активном таймере  
❌ Подряд чаще 1 раза в 60 секунд  
❌ После достижения (анти-паттерн)  
❌ Во время обучения

### Cooldown (ОБЯЗАТЕЛЬНО)

```ts
const INTERSTITIAL_COOLDOWN = 90; // секунд
let lastInterstitialTime = 0;
function canShowInterstitial() {
  return Date.now() - lastInterstitialTime > INTERSTITIAL_COOLDOWN * 1000;
}
```

### Дневной лимит

```ts
const MAX_INTERSTITIAL_PER_DAY = 8;
```

### Паттерн

```ts
function tryShowInterstitial(reason: string) {
  if (canShowInterstitial() && getInterstitialToday() < MAX_INTERSTITIAL_PER_DAY) {
    sdk.showInterstitial(
      (wasShown) => {
        lastInterstitialTime = Date.now();
        state.analytics.interstitialCount++;
      },
      (err) => { console.warn('Interstitial failed', err); }
    );
  }
}
```

---

## 4. IAP (In-App Purchases)

### Когда добавлять

- ❌ НЕ в v1.0
- ✅ В v1.1+, если retention > 20% на D7
- ✅ Если есть payer-сегмент (> 0.5% конверсии)
- ✅ Если нужны деньги на развитие (зарплата, серверы)

### Типы IAP

#### A. Remove Ads (ОБЯЗАТЕЛЬНО, если есть реклама)

- Цена: $0.99-2.99
- Должен быть реализован, иначе нарушение правил
- На Yandex: "No Ads" за кристаллы или прямую покупку

#### B. Premium Currency Pack

- Маленький: $0.99 (100 кристаллов)
- Средний: $4.99 (600 кристаллов, +20% бонус)
- Большой: $9.99 (1500 кристаллов, +50% бонус)
- Огромный: $49.99 (10 000 кристаллов, +100% бонус)

#### C. Battle Pass / Subscription

- Не рекомендуется для одиночных casual
- Только если есть регулярный контент (раз в 2-4 недели)

#### D. Special Offers

- Ограниченные по времени
- Со скидкой 50-70%
- Привязаны к событиям

### Интеграция с Yandex

```ts
// Yandex SDK
const payments = sdk.getPayments();
const product = await payments.purchase({ id: 'premium_pack' });
if (product.purchaseToken) {
  state.noAds = true;
  state.crystals += 600;
  saveGame();
}
```

### Каталог продуктов

Должен быть настроен в Yandex Developer Console + iOS App Store / Google Play.

### Ценообразование

- Привязка к локали
- A/B тесты (позже)
- Несколько ценовых точек

---

## 5. ОГРАНИЧЕНИЯ ЯНДЕКС ИГР

### Запрещено

- ❌ Покупка IAP без публикации в каталоге
- ❌ Использование платёжных систем вне Yandex SDK
- ❌ Реалити-валюта (только виртуальная)
- ❌ Принудительная реклама
- ❌ Скрытые платежи

### Требования

- ✅ Rewarded и Interstitial только через Yandex SDK
- ✅ Все IAP — через Yandex SDK
- ✅ Цены соответствуют локали
- ✅ Возможность "Удалить аккаунт" если есть регистрация

### Модерация IAP

- Проверяется фактическая реализация
- Должна работать кнопка "Купить"
- Должна выдавать награду после оплаты
- Должен быть No Ads (если есть реклама)

---

## 6. ВАЛЮТА ДЛЯ РЕКЛАМЫ

### В Merge Farm

```
1 rewarded = 30 минут x2 income
Это эквивалент ~600 монет в час экономии времени
```

### Стоимость одной rewarded для игрока

Зависит от того, что он получает:
- 5-10 минут ускорения = низкая ценность
- 30 минут ускорения = средняя
- Пропуск 4-часового таймера = высокая

### Баланс

```
Ценность награды для игрока ≈ 1.5x от органического earning rate
```

Пример: если игрок зарабатывает 100 монет/мин органически, rewarded должен дать эквивалент 150 монет (или 1.5 мин экономии).

---

## 7. TELEMETRY И ОПТИМИЗАЦИЯ

### События для аналитики

```ts
// обязательные
analytics.track('rewarded_shown', { type: 'boost_2x_30min' });
analytics.track('rewarded_completed', { type: 'boost_2x_30min' });
analytics.track('rewarded_closed_early');
analytics.track('rewarded_error');
analytics.track('interstitial_shown', { reason: 'between_sessions' });
analytics.track('interstitial_clicked');
analytics.track('iap_initiated', { productId: 'premium_pack' });
analytics.track('iap_completed', { productId: 'premium_pack', revenue: 4.99 });
analytics.track('iap_failed', { productId: 'premium_pack', reason: 'cancelled' });
```

### Метрики

| Метрика | Цель |
|---|---|
| Rewarded CTR (show → complete) | > 80% |
| Interstitial close rate | > 95% |
| Rewarded per DAU | 1-3 |
| Interstitial per DAU | 2-5 |
| ARPDAU | > $0.01 |
| IAP conversion | > 0.5% |
| IAP average revenue | > $3 |

### A/B тесты

- Цена на буст (100 vs 200 монет)
- Cooldown на rewarded (30 vs 60 сек)
- Дневной лимит (5 vs 10)
- Расположение кнопки rewarded

(Делать после 10K+ DAU, иначе нет данных.)

---

## 8. ЭТИКА

### Что НЕ делать

- ❌ Заставлять смотреть рекламу (только rewarded добровольно)
- ❌ Прерывать игру interstitial без причины
- ❌ Использовать dark patterns ("только 1 реклама!")
- ❌ Обманывать игрока о награде
- ❌ Скрывать стоимость IAP
- ❌ Делать loot boxes без раскрытия шансов

### Что делать

- ✅ Показывать кнопку "No Ads" если есть IAP
- ✅ Заранее объяснять, что даст rewarded
- ✅ Сообщать о cooldown'ах ("Реклама будет доступна через 30 сек")
- ✅ Давать возможность пропустить рекламу (pre-roll skip после 5 сек)
- ✅ Уважать время игрока

---

## 9. ПЛАН МОНЕТИЗАЦИИ v1.0

### v1.0 (текущая)

- ✅ Rewarded Ads: буст x2 income
- ✅ Interstitial: между сессиями
- ❌ IAP: нет
- ❌ Подписки: нет

### v1.1 (через 2-4 недели)

- 🟡 Rewarded: кейсы, удвоение offline
- 🟡 Interstitial: улучшить таргетинг
- 🟡 IAP: Remove Ads за $0.99
- 🟡 IAP: Premium Currency Pack

### v1.2 (через 1-2 месяца)

- 🟡 Battle Pass
- 🟡 Special Offers
- 🟡 События с эксклюзивными наградами

### v2.0+ (если успех)

- Подписка
- Косметика
- Премиум-уровни

## See also

- `15_SYSTEMS/README.md`
- `14_MECHANICS/ADS.md`
