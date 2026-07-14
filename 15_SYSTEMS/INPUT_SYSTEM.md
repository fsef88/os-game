**Tags:** input, systems

# INPUT SYSTEM

Версия: 1.0

---

## Назначение

Обработка ввода: тапы, свайпы, клавиатура, геймпад.

Используется: 100% игр.

---

## Абстракция

Не привязываемся к событиям DOM напрямую. Создаём обёртку.

```ts
class InputSystem {
  // Tap / Click
  onTap(callback: (pos: Point) => void): void;
  onDoubleTap(callback: (pos: Point) => void): void;

  // Swipe
  onSwipe(callback: (dir: 'up' | 'down' | 'left' | 'right') => void): void;
  onDrag(callback: (delta: Point) => void): void;

  // Hold
  onHold(callback: (pos: Point) => void): void;        // > 500ms
  onLongPress(callback: (pos: Point) => void): void;   // > 1500ms

  // Keyboard (desktop)
  onKey(callback: (key: string) => void): void;

  // Pinch (zoom)
  onPinch(callback: (scale: number) => void): void;
}
```

## Tap

```ts
canvas.addEventListener('pointerdown', e => {
  const t = Date.now();
  const pos = { x: e.clientX, y: e.clientY };

  if (t - lastTapTime < 300 && dist(pos, lastTapPos) < 20) {
    onDoubleTap(pos);
  } else {
    pendingTap = { pos, time: t };
  }
  lastTapTime = t;
  lastTapPos = pos;
});

canvas.addEventListener('pointerup', e => {
  if (pendingTap) {
    onTap(pendingTap.pos);
    pendingTap = null;
  }
});
```

## Swipe vs Drag

```ts
let startPos: Point | null = null;
let startTime = 0;

canvas.addEventListener('pointerdown', e => {
  startPos = { x: e.clientX, y: e.clientY };
  startTime = Date.now();
});

canvas.addEventListener('pointermove', e => {
  if (!startPos) return;
  const dx = e.clientX - startPos.x;
  const dy = e.clientY - startPos.y;
  // Если двигаемся — это drag, не tap
  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    onDrag({ x: dx, y: dy });
  }
});

canvas.addEventListener('pointerup', e => {
  if (!startPos) return;
  const dt = Date.now() - startTime;
  const dx = e.clientX - startPos.x;
  const dy = e.clientY - startPos.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < 20 && dt < 300) {
    // tap
  } else if (dist > 50 && dt < 500) {
    // swipe
    const dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');
    onSwipe(dir);
  }

  startPos = null;
});
```

## Hold / Long Press

```ts
let holdTimer: number | null = null;
let holdPos: Point | null = null;

canvas.addEventListener('pointerdown', e => {
  holdPos = { x: e.clientX, y: e.clientY };
  holdTimer = window.setTimeout(() => {
    onLongPress(holdPos);
    holdTimer = null;
  }, 1500);
});

canvas.addEventListener('pointerup', () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
});
```

## Multi-touch (Pinch)

```ts
const touches = new Map<number, Point>();

canvas.addEventListener('touchstart', e => {
  for (const t of e.touches) {
    touches.set(t.identifier, { x: t.clientX, y: t.clientY });
  }
  if (touches.size === 2) {
    initialDistance = calcDistance(Array.from(touches.values()));
  }
});

canvas.addEventListener('touchmove', e => {
  if (touches.size === 2) {
    const current = calcDistance(Array.from(touches.values()));
    const scale = current / initialDistance;
    onPinch(scale);
  }
});
```

## Keyboard (desktop)

```ts
window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  // WASD, стрелки, space, etc.
  if (['arrowup', 'w'].includes(key)) onKey('up');
  if (['arrowdown', 's'].includes(key)) onKey('down');
  if (['arrowleft', 'a'].includes(key)) onKey('left');
  if (['arrowright', 'd'].includes(key)) onKey('right');
  if (key === ' ') onKey('action');
  if (key === 'escape') onKey('cancel');
});
```

## Жесты для жанров

| Жанр | Жест | Действие |
|---|---|---|
| Merge | tap | select slot |
| Merge | drag | move vegetable |
| Clicker | tap | click |
| Clicker | hold | auto-click (if upgrade) |
| Idle | tap | buy building |
| Match-3 | tap | select candy |
| Match-3 | drag | swap |
| Match-3 | swipe | swap (mobile) |
| Puzzle | swipe | slide |
| Survivor | — | auto-attack |
| Tycoon | tap | place building |
| Tycoon | drag | move building |

## Антипаттерны

- ❌ Ждать double-tap (сложно для игрока)
- ❌ 4+ finger gestures
- ❌ Pinch только на части экрана
- ❌ Hold > 2 сек (надоедает)

## Touch-action CSS

```css
canvas, .game-area {
  touch-action: manipulation; /* отключить double-tap zoom */
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

## Чек-лист

- [ ] Tap работает везде
- [ ] Swipe различает tap и drag
- [ ] Hold не мешает обычному тапу
- [ ] Keyboard для desktop
- [ ] Touch-action настроен
- [ ] Multi-touch для zoom/scroll
