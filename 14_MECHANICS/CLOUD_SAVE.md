**Tags:** cloud-save, save

# CLOUD SAVE

Версия: 1.0

---

## Что это

Сохранение в облако. Защита от потери прогресса.

См. `../15_SYSTEMS/SAVE_SYSTEM.md` для архитектуры.

Здесь — только облачная часть.

---

## Когда использовать

- После важных действий
- При выходе
- Раз в 30 сек

Не при мелких действиях, не каждые 5 сек (спам).

---

## Yandex SDK

```ts
async function saveToCloud(data: any): Promise<boolean> {
  try {
    await player.setData(data, true);
    return true;
  } catch (e) {
    return false;
  }
}

async function loadFromCloud(): Promise<any | null> {
  try {
    return await player.getData() || null;
  } catch (e) {
    return null;
  }
}
```

## Conflict resolution

```ts
async function loadGame(): Promise<SaveData | null> {
  const cloud = await loadFromCloud();
  const local = loadFromLocal();

  if (!cloud) return local;
  if (!local) return cloud;
  return (cloud.timestamp || 0) > (local.timestamp || 0) ? cloud : local;
}
```

## Auto-save

```ts
let lastSave = 0;
const SAVE_INTERVAL = 30 * 1000;

function maybeSave() {
  if (Date.now() - lastSave < SAVE_INTERVAL) return;
  saveGame(state.get());
  lastSave = Date.now();
}
```

## Throttling

Лимит Yandex: 60 запросов в минуту. Throttle до 30 сек.

```ts
const cloudSaveQueue = [];
let isProcessing = false;

function queueCloudSave(data: any) {
  cloudSaveQueue.push(data);
  processCloudSaveQueue();
}

async function processCloudSaveQueue() {
  if (isProcessing || cloudSaveQueue.length === 0) return;
  isProcessing = true;

  while (cloudSaveQueue.length > 0) {
    const data = cloudSaveQueue.shift();
    await saveToCloud(data);
    await new Promise(r => setTimeout(r, 500));
  }

  isProcessing = false;
}
```

## Error handling

```ts
async function saveWithRetry(data: any, maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await saveToCloud(data);
      return true;
    } catch (e) {
      if (i === maxRetries - 1) return false;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return false;
}
```

## Чек-лист

- [ ] Throttle (не чаще 30 сек)
- [ ] Retry при ошибке
- [ ] Conflict resolution по timestamp
- [ ] Force save при важных действиях
- [ ] Аналитика