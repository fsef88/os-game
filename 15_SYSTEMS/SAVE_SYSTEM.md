**Tags:** save, systems

# SAVE SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/YANDEX_GAMES_BIBLE.md (раздел "Сохранения")

---


## Назначение

Сохранение и загрузка состояния игры. Локально + облако.

Используется: 100% игр.

---

## Архитектура

```
SaveService
├── LocalStorage   — всегда, быстро
├── CloudStorage   — Yandex Player Data / Firebase
└── MemoryCache    — текущее состояние
```

## Приоритеты загрузки

```
1. MemoryCache    — мгновенно (если есть)
2. LocalStorage   — быстро (5-50мс)
3. CloudStorage   — медленно (100-500мс, но надёжно)
```

## Формат данных

```ts
interface SaveData {
  version: string;          // semver игры
  build: string;            // build hash
  timestamp: number;        // последнее сохранение
  playerId: string;         // уникальный ID
  state: any;               // полный state игры
  analytics: {              // счётчики для retention
    sessionCount: number;
    totalPlayTime: number;
    firstSeen: number;
    lastSeen: number;
  };
  checksum?: string;        // для anti-tamper (опционально)
}
```

## Стратегия

### При сохранении

```ts
async function save(state: any, force = false) {
  // 1. Всегда локально (быстро, надёжно)
  localStorage.setItem(KEY, JSON.stringify(state));

  // 2. В облако (throttle)
  if (force || Date.now() - lastCloudSave > CLOUD_THROTTLE_MS) {
    await cloud.save(state);
  }
}
```

### При загрузке

```ts
async function load(): Promise<SaveData | null> {
  // 1. Пробуем облако
  const cloud = await cloud.load();

  // 2. Локальный fallback
  const local = localStorage.getItem(KEY);

  // 3. Мерджим по timestamp
  if (!cloud) return local;
  if (!local) return cloud;
  return (cloud.timestamp > local.timestamp) ? cloud : local;
}
```

## Throttle

```
Local save:    каждый action (или каждые 5 сек)
Cloud save:    каждые 30 сек ИЛИ при важном событии
               (покупка, достижение, level up)
```

## Версионирование

При изменении формата state:

```ts
function migrate(save: SaveData): SaveData {
  const migrations = {
    '0.1.0': (s) => s,
    '0.2.0': (s) => ({ ...s, newField: defaultValue }),
    '0.3.0': (s) => ({ ...s, renamedField: s.oldField, oldField: undefined }),
  };
  let current = save;
  while (current.version !== CURRENT_VERSION) {
    current = migrations[current.version](current);
  }
  return current;
}
```

## Анти-чит (опционально)

```ts
function checksum(state: any): string {
  return sha256(JSON.stringify(state)).slice(0, 8);
}
// Проверять при загрузке. Если не совпадает — load из облака.
```

## Когда НЕ сохранять

❌ Каждый кадр (60 раз в секунду)  
❌ При свопе вкладок (можно, но throttle)  
❌ При выходе без подтверждения (уже в beforeunload)  

## Когда обязательно сохранять

✅ При level up  
✅ При покупке  
✅ При достижении  
✅ Каждые 30 сек  
✅ При закрытии (beforeunload)  
✅ При prestige (важно!)

## Примеры

См. `../90_PROJECTS/TEMPLATE/src/save.ts` — готовая реализация.

## Чек-лист

- [ ] Save при любом изменении state
- [ ] Load при старте
- [ ] Cloud sync работает
- [ ] Migrate для старых версий
- [ ] Throttle (не спамить облако)
- [ ] Fallback при ошибке облака
