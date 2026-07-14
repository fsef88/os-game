**Tags:** battle-pass

# BATTLE PASS

Версия: 1.0

---

## Что это

Сезонная прогрессия с наградой. Стимулирует retention.

---

## Когда добавлять

Не в v1.0. В v2.0+ (когда есть контент и аудитория).

---

## Структура

```ts
interface BattlePass {
  seasonId: string;
  startDate: number;
  endDate: number;
  levels: PassLevel[];
  freeTrack: PassReward[];
  premiumTrack: PassReward[];
}

interface PassLevel {
  level: number;
  xpRequired: number;
  freeReward: PassReward;
  premiumReward: PassReward;
}
```

## XP источники

```ts
const XP_SOURCES = {
  daily_login: 50,
  quest_complete: 20,
  match_won: 30,
  level_up: 100,
  achievement: 50,
  chest_open: 10,
  ad_watched: 5,
};
```

## Логика

```ts
class BattlePassSystem {
  getCurrentLevel(): number {
    return Math.floor(state.get().battlePassXp / 100);
  }

  addXp(amount: number, source: string) {
    state.set(s => ({ battlePassXp: s.battlePassXp + amount }));
    this.checkLevelUp();
    analytics.track('battlepass_xp', { amount, source });
  }

  isPremiumActive(): boolean {
    return state.get().battlePassPremium || false;
  }

  buyPremium() {
    if (await iap.purchase('battle_pass_premium')) {
      state.set({ battlePassPremium: true });
    }
  }
}
```

## UI

```
Season 1
████████░░ 65/100 XP
Level 5 → Level 6
```

## Длительность сезона

- 30 дней — стандарт
- 60 дней — длинный
- 14 дней — короткий (event)

## Чек-лист

- [ ] 30+ уровней
- [ ] Free + Premium track
- [ ] XP источники
- [ ] Claim UI
- [ ] Модалка level up
- [ ] IAP для Premium
- [ ] Сезонный reset