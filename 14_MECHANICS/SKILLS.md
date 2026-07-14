**Tags:** skills

# SKILLS

Версия: 1.0

---

## Что это

Способности игрока с кулдауном. Активные и пассивные.

Используется: Survivor, RPG-lite, Clicker.

---

## Структура

```ts
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'active' | 'passive';
  cooldownMs: number;
  durationMs?: number;
  effect: SkillEffect;
  unlockLevel?: number;
  cost?: number;
}

type SkillEffect = {
  type: 'damage' | 'heal' | 'buff' | 'summon';
  value: number;
  target?: 'self' | 'enemies' | 'allies';
  duration?: number;
};
```

## Примеры (survivor)

```ts
const SKILLS = [
  { id: 'fireball', name: 'Огненный шар', description: 'Наносит 100 урона',
    icon: '🔥', type: 'active', cooldownMs: 5000,
    effect: { type: 'damage', value: 100, target: 'enemies' } },
  { id: 'heal', name: 'Лечение', description: 'Восстанавливает 30 HP',
    icon: '💚', type: 'active', cooldownMs: 15000,
    effect: { type: 'heal', value: 30, target: 'self' } },
];
```

## Логика

### Active skill

```ts
function useSkill(skillId: string): boolean {
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return false;

  const now = Date.now();
  const lastUsed = state.get().skillCooldowns[skillId] || 0;

  if (now - lastUsed < skill.cooldownMs) {
    toast.show('На кулдауне!');
    return false;
  }

  applySkillEffect(skill);
  state.set(s => ({ skillCooldowns: { ...s.skillCooldowns, [skillId]: now } }));
  return true;
}
```

## UI

### Action bar (survivor)

```
[🔥] [💚] [⚔️] [❄️]
 5s   15s  30s  60s
```

## Баланс

| Skill | Cooldown | Value |
|---|---|---|
| Базовый (damage) | 5 сек | 100 |
| Средний (heal) | 15 сек | 30 |
| Сильный (buff) | 30 сек | 1.5x |
| Ульта | 60 сек | 5x |

## Чек-лист

- [ ] Список skills (3-6)
- [ ] Кулдаун работает
- [ ] UI с прогрессом
- [ ] Анимация использования
- [ ] Звук