**Tags:** reward

# Reward Screen

Версия: 1.0

---

## Назначение

Экран награды. С анимацией и звуком. Используется: chest opened, level up, daily reward, quest complete.

---

## API

```ts
interface RewardItem {
  type: 'coins' | 'crystals' | 'item' | 'boost' | 'cosmetic';
  amount?: number;
  itemId?: string;
  name?: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface RewardScreenConfig {
  title?: string;
  items: RewardItem[];
  onClaim: () => void;
  autoClaim?: boolean;
  animationDelay?: number;     // ms между items
}
```

## Реализация

```ts
// src/ui/components/reward-screen.ts

import { Popup } from './popup';
import { audio } from '../../systems/audio';

export interface RewardItem {
  type: 'coins' | 'crystals' | 'item' | 'boost' | 'cosmetic';
  amount?: number;
  itemId?: string;
  name?: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface RewardScreenConfig {
  title?: string;
  items: RewardItem[];
  onClaim: () => void;
  autoClaim?: boolean;
  animationDelay?: number;
}

export function showRewardScreen(config: RewardScreenConfig): Popup {
  const delay = config.animationDelay || 400;
  const rewards = config.items;
  let revealed = 0;
  let claimed = false;

  const body = document.createElement('div');
  body.className = 'reward-list';

  const popup = new Popup({
    title: config.title || 'Награда!',
    icon: '🎁',
    body,
    buttons: [],
    variant: 'reward',
    showClose: false,
    dismissible: false,
  });

  // Создаём hidden items, открываем по очереди
  rewards.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = `reward-item rarity-${item.rarity || 'common'}`;
    el.style.opacity = '0';
    el.innerHTML = `
      <div class="reward-item-icon">${getIcon(item)}</div>
      <div class="reward-item-text">${getText(item)}</div>
    `;
    body.appendChild(el);
    setTimeout(() => {
      el.classList.add('reveal');
      audio.playSFX('reward');
    }, delay * (i + 1));
  });

  // Кнопка "Забрать" появляется после всех
  setTimeout(() => {
    const claimBtn = document.createElement('button');
    claimBtn.className = 'popup-btn popup-btn-success reward-claim-btn';
    claimBtn.textContent = 'Забрать всё';
    claimBtn.onclick = () => {
      if (claimed) return;
      claimed = true;
      config.onClaim();
      popup.close();
    };
    body.appendChild(claimBtn);
    if (config.autoClaim) {
      setTimeout(() => claimBtn.click(), 1500);
    }
  }, delay * (rewards.length + 1));

  popup.show();
  return popup;
}

function getIcon(item: RewardItem): string {
  if (item.icon) return item.icon;
  switch (item.type) {
    case 'coins': return '💰';
    case 'crystals': return '💎';
    case 'item': return '🎁';
    case 'boost': return '⚡';
    case 'cosmetic': return '✨';
    default: return '🎁';
  }
}

function getText(item: RewardItem): string {
  switch (item.type) {
    case 'coins': return `${formatNumber(item.amount!)} монет`;
    case 'crystals': return `${item.amount} кристаллов`;
    case 'item': return item.name || 'Предмет';
    case 'boost': return item.name || 'Буст';
    case 'cosmetic': return item.name || 'Косметика';
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(Math.floor(n));
}
```

## CSS

```css
.reward-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  transform: scale(0.8);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.reward-item.reveal {
  opacity: 1 !important;
  transform: scale(1);
}

.reward-item.rarity-common    { border-color: rgba(150,150,150,0.5); }
.reward-item.rarity-rare      { border-color: rgba(33,150,243,0.6); background: rgba(33,150,243,0.1); }
.reward-item.rarity-epic      { border-color: rgba(156,39,176,0.6); background: rgba(156,39,176,0.1); }
.reward-item.rarity-legendary { border-color: rgba(255,213,79,0.8); background: rgba(255,213,79,0.15); box-shadow: 0 0 24px rgba(255,213,79,0.4); }

.reward-item-icon { font-size: 32px; }
.reward-item-text {
  font-weight: bold;
  font-size: 15px;
  flex: 1;
  text-align: left;
}

.reward-claim-btn {
  width: 100%;
  margin-top: 8px;
}
```

## Использование

```ts
import { showRewardScreen } from './ui/components/reward-screen';

showRewardScreen({
  title: 'Квест закрыт!',
  items: [
    { type: 'coins', amount: 500, rarity: 'common' },
    { type: 'crystals', amount: 5, rarity: 'rare' },
    { type: 'boost', itemId: 'boost_2x', name: 'x2 income 30 мин', rarity: 'epic' },
  ],
  onClaim: () => {
    addMoney(500);
    addCrystals(5);
    activateBoost({ type: '2x', duration: 1800000 });
  },
});
```

## Чек-лист

- [x] Multiple items
- [x] Sequential reveal
- [x] Rarity colors
- [x] Spring animation
- [x] Звук на каждом
- [x] Кнопка "Забрать всё"
- [x] Auto claim (опционально)
- [x] Legendary glow
