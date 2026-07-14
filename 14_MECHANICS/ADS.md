**Tags:** ads

# ADS INTEGRATION

Версия: 1.0

---

## Что это

Интеграция рекламы в игру. Подробнее — `06_BIBLES/MONETIZATION_BIBLE.md`.

Здесь — программная часть.

---

## Типы

### Rewarded (вознаграждаемая)

Игрок **добровольно** смотрит за награду.

### Interstitial (полноэкранная)

Между сессиями, с cooldown.

---

## Интеграция (Yandex SDK)

```ts
class AdsSystem {
  private lastRewardedTime = 0;
  private lastInterstitialTime = 0;
  private rewardedToday = 0;
  private interstitialToday = 0;

  private REWARDED_COOLDOWN = 30; // сек
  private INTERSTITIAL_COOLDOWN = 90; // сек
  private MAX_REWARDED_PER_DAY = 10;
  private MAX_INTERSTITIAL_PER_DAY = 8;

  canShowRewarded(): boolean {
    if (this.rewardedToday >= this.MAX_REWARDED_PER_DAY) return false;
    if (Date.now() - this.lastRewardedTime < this.REWARDED_COOLDOWN * 1000) return false;
    return true;
  }

  canShowInterstitial(): boolean {
    if (this.interstitialToday >= this.MAX_INTERSTITIAL_PER_DAY) return false;
    if (Date.now() - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN * 1000) return false;
    return true;
  }

  showRewarded(onReward: () => void, onClose?: () => void, onError?: () => void) {
    if (!this.canShowRewarded()) {
      onError?.();
      return;
    }
    sdk.showRewarded(
      () => {
        this.lastRewardedTime = Date.now();
        this.rewardedToday++;
        analytics.track('rewarded_completed');
        onReward();
      },
      () => { analytics.track('rewarded_closed_early'); onClose?.(); },
      () => { analytics.track('rewarded_error'); onError?.(); }
    );
  }

  showInterstitial(reason: string, onClose?: () => void) {
    if (!this.canShowInterstitial()) {
      onClose?.();
      return;
    }
    sdk.showInterstitial(
      (wasShown) => {
        if (wasShown) {
          this.lastInterstitialTime = Date.now();
          this.interstitialToday++;
          analytics.track('interstitial_shown', { reason });
        }
        onClose?.();
      }
    );
  }

  resetDaily() {
    this.rewardedToday = 0;
    this.interstitialToday = 0;
  }
}
```

## Паттерны использования

### Boost (x2 income за рекламу)

```ts
function offerBoost() {
  ads.showRewarded(
    () => {
      activateBoost({ type: 'income_2x', duration: 30 * 60 * 1000 });
      toast.show('Доход x2 на 30 минут!');
    }
  );
}
```

### Refill (energy)

```ts
function offerEnergyRefill() {
  ads.showRewarded(() => {
    energy.refill();
  });
}
```

### Double offline earnings

```ts
function offerDoubleOffline(amount: number) {
  ads.showRewarded(
    () => { addMoney(amount * 2, 'offline_2x'); },
    () => { addMoney(amount, 'offline'); },
  );
}
```

## UI

### Кнопка Rewarded

```html
<button class="rewarded-btn" onclick="offerBoost()">
  ⚡ x2 income (30 мин)
  <span class="rewarded-icon">▶</span>
</button>
```

### Disabled state

```ts
if (!ads.canShowRewarded()) {
  button.disabled = true;
  button.textContent = `Доступно через ${getRewardedCooldown()} сек`;
}
```

## Аналитика

```ts
'rewarded_shown' — { type }
'rewarded_completed' — { type }
'rewarded_closed_early' — { type }
'rewarded_error' — { type, error }
'interstitial_shown' — { reason }
```

## Чек-лист

- [ ] SDK обёртка
- [ ] Cooldown (30 сек rewarded, 90 сек interstitial)
- [ ] Daily limits
- [ ] Disabled UI
- [ ] Аналитика
- [ ] Mock SDK
- [ ] Save daily counters
