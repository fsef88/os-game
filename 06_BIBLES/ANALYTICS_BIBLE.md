**Tags:** analytics, bible

# ANALYTICS BIBLE
**Status:** Stable
**Owner:** Studio
**Version:** 1.4
**Last Reviewed:** 2026-07-14

---



Версия: 1.0  
Дата: 2026-07-14

---

## 1. ПРИНЦИПЫ

### Главное

> Если изменение невозможно измерить — оно считается непроверенным.

### Минимум событий

Не спамить аналитику. Только то, что влияет на решения.

### Структура события

```ts
analytics.track(eventName, {
  // свойства
  property1: value1,
  property2: value2,
});
```

---

## 2. ОБЯЗАТЕЛЬНЫЕ СОБЫТИЯ (из Merge Farm)

### Жизненный цикл

```
game_start              — приложение запущено
game_ready              — игра готова к показу
session_start           — игровая сессия начата
session_end             — сессия закончилась (с длительностью)
```

### Core loop

```
first_merge             — первый merge в игре
merge                   — каждый merge (с level, is_rare)
spawn                   — новый объект появился (с level, is_rare)
sell                    — продажа
cell_unlock             — новая клетка открыта
slot_unlock             — новый слот (в инвентаре)
```

### Progression

```
level_up                — повышение уровня
achievement             — достижение
quest_start             — квест начат
quest_complete          — квест закрыт
collection_complete     — коллекция закрыта
```

### Монетизация

```
rewarded_shown          — rewarded показан (с типом)
rewarded_completed      — игрок досмотрел
rewarded_closed_early   — закрыл раньше
rewarded_error          — ошибка показа
interstitial_shown      — interstitial показан (с reason)
interstitial_clicked    — кликнул по рекламе
iap_initiated           — начал покупку
iap_completed           — купил (с revenue!)
iap_failed              — отменил
```

### Retention

```
daily_reward_claimed    — забрал daily
offline_claim           — забрал offline
return_from_offline     — вернулся из offline
streak_extended         — продолжил streak
```

### Технические

```
sdk_init_failed         — SDK не инициализировался
save_success            — сохранено
save_failed             — ошибка сохранения
load_success            — загружено
load_failed             — ошибка загрузки
error                   — любая ошибка (с stack)
```

---

## 3. СВОЙСТВА СОБЫТИЙ

### Всегда

```ts
{
  // user
  user_id: string,        // yandex player ID
  // session
  session_id: string,
  session_number: number, // 1, 2, 3...
  // time
  timestamp: number,
  // app
  app_version: string,
  // device
  platform: 'yandex',
  language: string,       // 'ru', 'en', ...
}
```

### Специфичные

```ts
// merge
{
  level: 1,              // tier объекта
  is_rare: false,        // золотой / радужный
  is_first_of_tier: false, // первый раз на этом уровне
}

// rewarded
{
  type: 'boost_2x_30min', // что предлагали
  placement: 'hud_button', // где показали
}

// iap
{
  product_id: 'premium_pack',
  price: 4.99,
  currency: 'USD',
  revenue: 4.99,
}
```

---

## 4. KPI

### Engagement

```
Session Length          — среднее время сессии
Sessions per Day        — сессий в день на пользователя
DAU                     — daily active users
WAU                     — weekly active users
MAU                     — monthly active users
```

### Retention

```
D1 Retention            — вернулся на следующий день
D7 Retention            — вернулся через неделю
D30 Retention           — вернулся через месяц
Stickiness (DAU/MAU)    — как часто возвращается
```

### Monetization

```
ARPDAU                  — средний доход на DAU
ARPU                    — средний доход на пользователя
LTV                     — lifetime value
Rewarded CTR            — процент досмотров
IAP Conversion          — процент платящих
Average Revenue per Paying User
```

### Core Loop

```
Merges per Session
First Merge Time        — от старта до первого merge
Time to First Reward
Time to Level 2
```

---

## 5. ВНУТРЕННЯЯ АНАЛИТИКА (без внешних сервисов)

### Локальные счётчики

```ts
const analytics = {
  // события (последние 100)
  events: [],
  
  // счётчики
  counters: {
    merges: 0,
    spawns: 0,
    rewarded: 0,
    // ...
  },
  
  // сессия
  session: {
    startTime: Date.now(),
    length: 0,
    merges: 0,
  },
  
  // retention
  streak: 0,
  totalDays: 0,
};

function track(name, props = {}) {
  analytics.events.push({ name, props, timestamp: Date.now() });
  // также отправляем во внешний сервис (Yandex, AppMetrica)
}

function saveAnalytics() {
  localStorage.setItem('analytics', JSON.stringify(analytics));
}
```

### Использование

- На пресс-конференции
- Для принятия решений
- Для отчёта Product Owner
- Для поиска проблем

---

## 6. ВНЕШНЯЯ АНАЛИТИКА

### Yandex.AppMetrica (рекомендуется)

```ts
// init
const metrica = new Ya.Metrika({
  id: YOUR_COUNTER_ID,
});

// track
metrica.reachGoal('merge', { level: 1, is_rare: false });
```

### Свой сервер (если нужен)

Отправлять на свой backend:
```ts
fetch('/analytics', {
  method: 'POST',
  body: JSON.stringify({ name, props, userId, timestamp }),
});
```

Плюсы: полный контроль, свои метрики.  
Минусы: нужно поддерживать сервер.

---

## 7. DASHBOARD

### Что смотреть ежедневно

```
DAU                     — растёт / падает?
D1 Retention            — стабильно?
Rewarded CTR            — игроки смотрят?
Interstitial Close      — не раздражает?
Crashes                 — нет ли багов?
```

### Что смотреть еженедельно

```
Sessions per User       — растёт?
D7 Retention            — стабильно?
Revenue                 — ARPDAU растёт?
Funnel                  — где теряем?
```

### Что смотреть ежемесячно

```
LTV                     — растёт?
Cohort Retention        — когорты по датам
Paying Users            — % растёт?
Top Events              — что делают игроки?
```

---

## 8. A/B ТЕСТЫ

### Когда запускать

❌ НЕ при < 1000 DAU (нет данных)  
✅ При > 10 000 DAU  
✅ Когда нужно проверить гипотезу

### Что тестировать

- Цена на буст
- Cooldown на rewarded
- Дневной лимит rewarded
- Цвет кнопки "Играть"
- Длительность onboarding
- Текст на splash screen

### Как

- 50/50 split
- Минимум 7 дней
- Минимум 1000 игроков в каждой группе
- Сравнить по retention и revenue

---

## 9. ПРИВАТНОСТЬ

### Что можно

✅ Собирать анонимные события  
✅ Использовать user_id (Yandex)  
✅ Сохранять локально (state, settings)  
✅ Собирать device info (модель, OS)

### Что НЕЛЬЗЯ

❌ Собирать персональные данные (ФИО, email, телефон)  
❌ Передавать данные третьим лицам  
❌ Использовать без согласия  
❌ Хранить дольше, чем нужно

### Согласие

Первый запуск — короткое уведомление:  
"Мы собираем анонимную статистику для улучшения игры."  
+ ссылка на политику конфиденциальности  
+ кнопка "Принять"

---

## 10. ЧАСТЫЕ ОШИБКИ

❌ Слишком много событий (спам)  
❌ Персональные данные в свойствах  
❌ Нет user_id (нельзя связать сессии)  
❌ Нет timestamp (нельзя анализировать время)  
❌ Не используются данные (собираем, но не смотрим)  
❌ Нет версионирования событий (breaking changes)

## See also

- `03_ROLES/ANALYTICS.md`
- `14_MECHANICS/ACHIEVEMENTS.md`
- `14_MECHANICS/QUESTS.md`
