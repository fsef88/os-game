**Tags:** analytics

# ANALYTICS

**Версия:** 0.1

## Обязательные события

### Lifecycle
- game_start
- game_ready
- session_start
- session_end

### Core loop
- first_action
- <genre_specific>

### Monetization
- rewarded_shown
- rewarded_completed
- interstitial_shown
- iap_initiated
- iap_completed

### Retention
- daily_reward_claimed
- offline_claim

### Errors
- save_failed
- load_failed
- error

## Свойства событий

```ts
{
  user_id: string,
  session_id: string,
  timestamp: number,
  app_version: string,
  platform: 'yandex',
  language: string,
}
```

## KPI

| Метрика | Цель |
|---|---|
| D1 retention | > 30% |
| D7 retention | > 10% |
| Session length | 3-10 мин |
| Rewarded CTR | > 80% |
| ARPDAU | > $0.01 |

## Использование

См. [06_BIBLES/ANALYTICS_BIBLE.md](../../06_BIBLES/ANALYTICS_BIBLE.md)
