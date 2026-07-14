**Tags:** survivor

# SURVIVOR

Версия: 1.0

---

## Что это

Игрок один против тысяч врагов. Авто-атака + сбор лута + выбор upgrade'ов. Bullet hell lite.

**Примеры:** Vampire Survivors, Brotato, Halls of Torment.

---

## Core Loop

```
Персонаж в центре
  ↓
Враги спавнятся со всех сторон
  ↓
Авто-атака
  ↓
Игрок собирает XP / loot
  ↓
Каждые 30 сек — выбор upgrade
  ↓
Растёт сила
  ↓
10-30 мин run → death
  ↓
Meta currency за kill
```

## Meta Loop

```
Run 1
  ↓
Unlock нового персонажа
  ↓
Run 2 (мета валюта)
  ↓
Unlock нового оружия
  ↓
Длиннее runs
  ↓
Endgame boss
```

## Ключевые механики (MECHANICS)

✅ Upgrades (выбор каждый 30 сек)
✅ Skills
✅ Achievements
✅ Loot

Опционально:
- Daily Challenge
- Leaderboard (по времени выживания)

## Уникальные формулы

### Персонаж

```ts
interface Character {
  id: string;
  name: string;
  baseHp: number;
  baseSpeed: number;
  baseDamage: number;
  weapons: string[]; // id оружий
  passive: string;     // id пассивки
}
```

### Оружие

```ts
interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;     // ms
  range: number;
  pierce: number;       // сколько врагов пробивает
  area: number;          // радиус AoE
  knockback?: number;
}
```

### XP за kill

```ts
const xpForKill = (enemyLevel: number) => 5 + enemyLevel * 2;
```

### Magic Numbers

```
runDuration: 10-30 мин
weaponSlots: 6
passiveSlots: 6
levelUpEvery: 30 sec
startingWeapons: 1-2
```

## UI-особенности

- Персонаж в центре
- HP bar внизу
- XP bar
- Timer (run time)
- Kill counter
- Кнопка паузы
- Upgrade selection (модалка каждые 30 сек)

## Антипаттерны

- Слишком много оружий на экране (хаос)
- Длинные runs (30+ мин) без прогрессии
- Нет визуального feedback при атаке
- Pay-to-skip cooldown
- Boss каждые 5 мин (надоедает)

## Когда НЕ делать survivor

- Не любишь bullet hell
- Нет идей для 20+ оружий
- Не любишь death = end run

## Связь с другими жанрами

Survivor + Clicker = Vampire Survivors (каждый уровень = +1 damage).
Survivor + Idle = офлайн прогресс (но run-based).
Survivor + TD = overlap.