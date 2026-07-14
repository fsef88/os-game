**Tags:** achievements

# ACHIEVEMENTS

Версия: 1.0

---

## Что это

Долгосрочные цели. Награда за мастерство.

---

## Отличие от QUESTS

| Квесты | Достижения |
|---|---|
| Короткие (дни) | Длинные (недели) |
| Можно пропустить | Постоянные |
| Награда за выполнение | Награда за факт |
| Daily обновляются | Один раз |

---

## Структура

```ts
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  goal: AchievementGoal;
  reward?: {
    coins?: number;
    crystals?: number;
    badge?: string;
  };
  isHidden?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

type AchievementGoal = {
  type: 'count' | 'reach' | 'collect' | 'special';
  count?: number;
  target?: number;
  itemIds?: string[];
  condition?: (state: State) => boolean;
};
```

## Типы

### 1. Count (количество)

```ts
{ id: 'merge_100', name: 'Merge-мастер', description: '100 merge',
  goal: { type: 'count', action: 'merge', count: 100 } }
```

### 2. Reach (уровень)

```ts
{ id: 'level_10', name: 'Опытный', description: 'Достигни уровня 10',
  goal: { type: 'reach', target: 10 } }
```

### 3. Collect (коллекция)

```ts
{ id: 'collect_all_vegetables', name: 'Коллекционер', description: 'Собери все овощи',
  goal: { type: 'collect', itemIds: VEGETABLES.map(v => v.id) } }
```

### 4. Special

```ts
{ id: 'first_purchase', name: 'Первый покупатель',
  goal: { type: 'special', condition: (s) => s.totalSpent > 0 } }
```

## Примеры для жанров

### Merge
- first_merge, merge_10, merge_100
- max_tier, collect_all
- golden_5, rainbow_1
- cell_max, offline_24h

### Clicker
- tap_100, tap_1000, tap_10000
- first_upgrade
- max_tap, max_auto
- prestige_first

### Idle
- building_first, building_all
- tier_max
- income_1k, income_1m
- prestige_5

## Реализация

```ts
class AchievementSystem {
  private achievements: Achievement[];
  private unlocked: Set<string>;

  check(state: State) {
    for (const ach of this.achievements) {
      if (this.unlocked.has(ach.id)) continue;
      if (this.checkGoal(ach.goal, state)) {
        this.unlock(ach);
      }
    }
  }

  private checkGoal(goal: AchievementGoal, state: State): boolean {
    switch (goal.type) {
      case 'count': return state.stats[goal.action] >= goal.count;
      case 'reach': return state.level >= goal.target;
      case 'collect': return goal.itemIds.every(id => state.collection.includes(id));
      case 'special': return goal.condition?.(state) || false;
    }
  }

  private unlock(ach: Achievement) {
    this.unlocked.add(ach.id);
    if (ach.reward) giveReward(ach.reward);
    analytics.track('achievement', { id: ach.id });
    modal.show({
      title: 'Достижение!',
      body: `${ach.name} — ${ach.description}`,
      icon: ach.icon,
    });
  }
}
```

## UI

```
🏆 Достижения (12/50)

[✓] Merge-мастер        [ ] 10K монет
[✓] Коллекционер        [ ] Первый prestige
[ ] Золотой фермер      [ ] 1000 тапов
```

## Чек-лист

- [ ] 20+ достижений
- [ ] Разные типы
- [ ] Скрытые достижения
- [ ] Награды за важные
- [ ] UI с прогрессом
- [ ] Модалка при unlock
- [ ] Сохранение unlocked
