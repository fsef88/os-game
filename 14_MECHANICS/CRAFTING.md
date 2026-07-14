**Tags:** crafting

# CRAFTING

Версия: 1.0

---

## Что это

Создание предметов из материалов. Добавляет глубину.

---

## Структура

```ts
interface Recipe {
  id: string;
  name: string;
  result: { itemId: string; count: number };
  ingredients: { itemId: string; count: number }[];
  craftTime: number;
  requiredLevel?: number;
}
```

## Пример

```ts
const RECIPES = [
  {
    id: 'sword_iron',
    name: 'Железный меч',
    result: { itemId: 'sword_iron', count: 1 },
    ingredients: [
      { itemId: 'iron', count: 5 },
      { itemId: 'wood', count: 2 },
    ],
    craftTime: 30,
  },
];
```

## Логика

```ts
function canCraft(recipe: Recipe, inventory: Inventory, state: State): boolean {
  if (recipe.requiredLevel && state.level < recipe.requiredLevel) return false;
  for (const ing of recipe.ingredients) {
    if (!inventory.has(ing.itemId, ing.count)) return false;
  }
  return true;
}

function startCraft(recipe: Recipe): boolean {
  if (!canCraft(recipe, inventory, state.get())) return false;
  if (!inventory.removeMany(recipe.ingredients)) return false;

  const job = {
    recipeId: recipe.id,
    startedAt: Date.now(),
    completesAt: Date.now() + recipe.craftTime * 1000,
  };
  state.set(s => ({
    crafting: { ...s.crafting, queue: [...s.crafting.queue, job] },
  }));
  return true;
}
```

## UI

```
⚒️ Создание

[Железный меч]
5 Iron + 2 Wood
Время: 30 сек
[Создать]
```

## Skip timer

```ts
function skipCrafting(job: CraftingJob) {
  showRewardedAd(() => {
    const recipe = RECIPES.find(r => r.id === job.recipeId);
    if (recipe) {
      inventory.add(recipe.result);
      state.set(s => ({
        crafting: { ...s.crafting, queue: s.crafting.queue.filter(j => j !== job) },
      }));
    }
  });
}
```

## Чек-лист

- [ ] Recipes определены
- [ ] Проверка ingredients
- [ ] Таймер крафта
- [ ] Skip за рекламу
- [ ] UI с прогрессом
- [ ] Несколько в очереди