**Tags:** quests

# QUESTS

Версия: 1.0

---

## Что это

Задания для игрока. Стимулируют играть определённым образом.

---

## Типы квестов

### 1. Tutorial (обучающие)

```ts
{
  id: 'tutorial_first_merge',
  type: 'tutorial',
  description: 'Сделай первый merge',
  goal: { action: 'merge', count: 1 },
  reward: { coins: 50 },
  order: 1,
  isRequired: true,
}
```

### 2. Daily (ежедневные)

```ts
{
  id: 'daily_merge_5',
  type: 'daily',
  description: 'Сделай 5 merge',
  goal: { action: 'merge', count: 5 },
  reward: { coins: 100, xp: 20 },
  refreshAt: '00:00',
}
```

### 3. Milestone (длинные)

```ts
{
  id: 'merge_100',
  type: 'milestone',
  description: 'Сделай 100 merge',
  goal: { action: 'merge', count: 100 },
  reward: { coins: 1000, crystals: 5, achievement: 'merge_master' },
  progress: true,
}
```

## Структура

```ts
interface Quest {
  id: string;
  type: 'tutorial' | 'daily' | 'milestone' | 'story';
  description: string;
  goal: QuestGoal;
  reward: QuestReward;
  progress?: number;
  target?: number;
  isCompleted?: boolean;
  isActive?: boolean;
  order?: number;
  unlocks?: string[];
}

type QuestGoal = {
  action?: 'merge' | 'sell' | 'buy' | 'tap' | 'level_up' | 'collect';
  count?: number;
  target?: number;
  itemId?: string;
  timeLimit?: number;
};

type QuestReward = {
  coins?: number;
  crystals?: number;
  xp?: number;
  items?: string[];
  unlocks?: string[];
  achievement?: string;
};
```

## Поток

### Инициализация

```ts
const QUESTS = [
  { id: 'q1', description: '...', goal: {...}, reward: {...} },
];

function initQuests() {
  state.set({ quests: QUESTS.map(q => ({ ...q, progress: 0, isActive: true, isCompleted: false })) });
}
```

### Обновление прогресса

```ts
function updateQuestProgress(action: string, data: any) {
  const quests = state.get().quests;
  const updated = quests.map(q => {
    if (q.isCompleted || !q.isActive) return q;
    if (q.goal.action !== action) return q;

    const newProgress = (q.progress || 0) + 1;
    const isCompleted = newProgress >= (q.goal.count || 1);

    if (isCompleted) {
      giveReward(q.reward);
      analytics.track('quest_complete', { id: q.id });
      toast.show('Квест закрыт!');
    }

    return { ...q, progress: newProgress, isCompleted };
  });
  state.set({ quests: updated });
}
```

### Подключение

```ts
events.on('merge:success', () => updateQuestProgress('merge'));
events.on('sell:success', () => updateQuestProgress('sell'));
events.on('level:up', (data) => updateQuestProgress('level_up', data));
```

## Daily Quests (отдельно)

```ts
function refreshDailyQuests() {
  const pool = [
    { description: 'Сделай 5 merge', goal: { action: 'merge', count: 5 }, reward: { coins: 100 } },
    { description: 'Заработай 500 монет', goal: { action: 'earn', count: 500 }, reward: { coins: 200 } },
    { description: 'Открой 2 новых клетки', goal: { action: 'buy', itemId: 'slot', count: 2 }, reward: { coins: 300 } },
  ];
  const selected = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  state.set({ dailyQuests: selected.map(q => ({ ...q, progress: 0, isCompleted: false })) });
}

function scheduleRefresh() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const ms = tomorrow.getTime() - now.getTime();
  setTimeout(() => {
    refreshDailyQuests();
    scheduleRefresh();
  }, ms);
}
```

## UI

```
[✓] Сделай 5 merge
    5/5

[ ] Заработай 500 монет
    230/500
```

## Баланс

| Сложность | Длительность | Награда |
|---|---|---|
| Tutorial | 10-30 сек | 50 coins |
| Daily (лёгкий) | 5-10 мин | 100 coins |
| Daily (средний) | 15-30 мин | 200 coins |
| Daily (сложный) | 30-60 мин | 500 coins |
| Milestone | 1-7 дней | 1000+ coins |

## Чек-лист

- [ ] Типы квестов определены
- [ ] Прогресс обновляется при действиях
- [ ] Награды выдаются
- [ ] Daily обновляется в 00:00
- [ ] UI показывает прогресс
- [ ] Не показывать выполненные
- [ ] Tutorial не блокирует игру
