**Tags:** animation, systems

# ANIMATION SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/UI_UX_BIBLE.md (раздел "Анимации")

---


## Назначение

Анимации: UI feedback, переходы, частицы.

Используется: 100% игр.

---

## Архитектура

```ts
class AnimationSystem {
  // CSS-based
  css(element: HTMLElement, keyframes: Keyframe[], duration: number): void;
  fadeIn(element: HTMLElement, duration: number): void;
  fadeOut(element: HTMLElement, duration: number): void;
  slideIn(element: HTMLElement, from: Direction, duration: number): void;

  // Web Animations API
  bounce(element: HTMLElement, scale: number): void;
  shake(element: HTMLElement, intensity: number): void;
  pulse(element: HTMLElement, color: string): void;

  // Particles
  emit(config: ParticleConfig): void;
  floatingText(text: string, options: FloatingTextOptions): void;

  // Screen
  flash(color: string, duration: number): void;
  shakeScreen(intensity: number): void;
}
```

## CSS vs WAAPI

### CSS (простые, повторяющиеся)

```ts
element.style.transition = 'transform 0.3s ease-out';
element.style.transform = 'scale(1.2)';
```

### WAAPI (сложные, программируемые)

```ts
element.animate([
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.3)', opacity: 0.5 },
  { transform: 'scale(1)', opacity: 1 },
], {
  duration: 500,
  easing: 'ease-out',
});
```

## Базовые анимации

### Bounce (scale up + down)

```ts
function bounce(element: HTMLElement) {
  element.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    { transform: 'scale(1)' },
  ], { duration: 300, easing: 'ease-out' });
}
```

### Shake (для ошибки)

```ts
function shake(element: HTMLElement) {
  element.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' },
  ], { duration: 400 });
}
```

### Pulse (для важного)

```ts
function pulse(element: HTMLElement, color = '#ffd54f') {
  element.animate([
    { boxShadow: `0 0 0 0 ${color}` },
    { boxShadow: `0 0 0 20px transparent` },
  ], { duration: 800, easing: 'ease-out' });
}
```

## Floating Text (летящий текст)

```ts
function floatingText(text: string, options: {
  x: number; y: number;
  color?: string;
  duration?: number;
}) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position: absolute;
    left: ${options.x}px;
    top: ${options.y}px;
    color: ${options.color || '#4caf50'};
    font-weight: bold;
    font-size: 24px;
    pointer-events: none;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(el);

  el.animate([
    { opacity: 1, transform: 'translate(-50%, -50%) translateY(0)' },
    { opacity: 0, transform: 'translate(-50%, -50%) translateY(-80px)' },
  ], { duration: options.duration || 1000, easing: 'ease-out' });

  setTimeout(() => el.remove(), options.duration || 1000);
}
```

## Particles (частицы)

```ts
function emitParticles(config: {
  count: number;
  type: 'sparkle' | 'confetti' | 'coin' | 'star';
  x: number; y: number;
  spread?: number; // радиус разлёта
}) {
  for (let i = 0; i < config.count; i++) {
    const particle = document.createElement('div');
    particle.className = `particle particle-${config.type}`;
    particle.style.left = (config.x + (Math.random() - 0.5) * (config.spread || 50)) + 'px';
    particle.style.top = (config.y + (Math.random() - 0.5) * (config.spread || 50)) + 'px';
    document.body.appendChild(particle);

    particle.animate([
      { opacity: 1, transform: 'translate(0, 0) scale(1)' },
      {
        opacity: 0,
        transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0)`
      },
    ], { duration: 1000, easing: 'ease-out' });

    setTimeout(() => particle.remove(), 1000);
  }
}
```

## Длительности

| Тип | Длительность | Easing |
|---|---|---|
| Hover/press | 0.15 сек | ease-out |
| Fade | 0.3 сек | ease-in-out |
| Slide | 0.3-0.5 сек | ease-out |
| Merge (мезо) | 0.5-0.7 сек | ease-in-out |
| Level up (макро) | 0.7-1.5 сек | ease-out |
| Modal | 0.3 сек | ease-out |
| Particles | 0.5-1 сек | linear / ease-out |

## Антипаттерны

- ❌ Анимация > 2 сек (надоедает)
- ❌ Linear easing (выглядит дёшево)
- ❌ 5+ анимаций одновременно (хаос)
- ❌ Анимация без обратной связи
- ❌ Парликлы при каждом тапе (спам)

## prefers-reduced-motion

```ts
const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = motion ? 0 : 300;
```

## Чек-лист

- [ ] Базовые анимации (fade, slide, bounce, shake)
- [ ] Floating text работает
- [ ] Particles эмитятся
- [ ] Длительности соответствуют UI_UX_BIBLE
- [ ] prefers-reduced-motion учитывается
- [ ] Нет больше 2-3 одновременно
