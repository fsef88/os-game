**Tags:** leaderboard

# LEADERBOARD

Версия: 1.0

---

## Что это

Таблица лидеров. Социальная мотивация.

---

## Типы

```ts
{ name: 'richest',    metric: 'totalMoney',      scope: 'all_time' }
{ name: 'level',      metric: 'level',            scope: 'all_time' }
{ name: 'collection', metric: 'collectionCount',  scope: 'all_time' }
{ name: 'event',      metric: 'eventScore',       scope: 'season' }
```

## Интеграция (Yandex SDK)

```ts
class LeaderboardSystem {
  private cache: Map<string, LeaderboardEntry[]>;
  private cacheTime: Map<string, number>;
  private CACHE_TTL = 5 * 60 * 1000; // 5 минут

  async getEntries(boardName: string, count = 10): Promise<LeaderboardEntry[]> {
    if (this.isCacheValid(boardName)) {
      return this.cache.get(boardName) || [];
    }
    const entries = await sdk.getLeaderboardEntries(boardName, count);
    this.cache.set(boardName, entries);
    this.cacheTime.set(boardName, Date.now());
    return entries;
  }

  async submitScore(boardName: string, score: number): Promise<boolean> {
    const ok = await sdk.setLeaderboardScore(boardName, score);
    if (ok) this.cache.delete(boardName);
    return ok;
  }

  private isCacheValid(name: string): boolean {
    const t = this.cacheTime.get(name);
    return t && Date.now() - t < this.CACHE_TTL;
  }
}
```

## Структура

```ts
interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  score: number;
  isPlayer: boolean;
  avatarUrl?: string;
}
```

## Когда отправлять

- При level up
- При покупке значимой
- При завершении ивента
- При новом high score

Не при мелких действиях, не каждые 30 сек (спам).

## UI

```
🏆 Топ игроков
1. ОгуречныйБарон   1.2M
2. ЗеленыйПалец      980K
3. FarmMaster99      850K
4. ТЫ                720K
```

## Yandex SDK лимиты

- Max запросов в минуту: 60
- Max entries: 100 (можно запросить 20 за раз)

## Чек-лист

- [ ] SDK обёртка
- [ ] Submit при действии
- [ ] Fetch + cache
- [ ] UI с топ-10
- [ ] Подсветка игрока
- [ ] Не спамить