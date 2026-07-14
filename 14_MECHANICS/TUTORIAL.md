**Tags:** tutorial

# TUTORIAL

Версия: 1.0

---

## Что это

Обучающие подсказки. Первые 30 секунд.

---

## Принципы

1. Минимум текста. Игрок не читает.
2. Показывать через действие. Не "нажми X" а "сделай X".
3. Можно скипнуть. Игрок имеет право пропустить.
4. Не блокировать. Игрок должен иметь возможность играть.
5. Один шаг = одно действие.

---

## Типы

### 1. Highlight (подсветка элемента)

```ts
function highlight(element: HTMLElement, text: string) {
  const overlay = createOverlay();
  const box = element.getBoundingClientRect();
  overlay.show();
  element.classList.add('pulse');
}
```

### 2. Tooltip

```ts
function tooltip(element: HTMLElement, text: string, position: 'top' | 'bottom' | 'left' | 'right') {
  // Показать box с text рядом с element
}
```

### 3. Modal

```ts
function tutorialModal(title: string, body: string, action: string) {
  modal.show({
    title,
    body,
    buttons: [
      { text: 'Пропустить', variant: 'secondary' },
      { text: action, primary: true },
    ],
  });
}
```

### 4. Auto-play

```ts
function autoPlay(action: () => void, delay: number) {
  setTimeout(() => {
    action();
    nextTutorialStep();
  }, delay);
}
```

---

## Поток

### Конфигурация

```ts
const TUTORIAL_STEPS = [
  { id: 'merge_intro', type: 'highlight', target: '.cell-0',
    text: 'Попробуй свайпнуть два одинаковых овоща',
    waitFor: 'merge:success' },
  { id: 'earn_intro', type: 'tooltip', target: '.hud-money',
    text: 'Это твои монеты', waitFor: 'click' },
];
```

### Состояние

```ts
interface TutorialState {
  currentStep: number;
  isActive: boolean;
  isSkipped: boolean;
  completedSteps: string[];
}
```

### Инициализация

```ts
function initTutorial() {
  state.set({ tutorial: { currentStep: 0, isActive: true, isSkipped: false, completedSteps: [] } });
  showTutorialStep(0);
}
```

### Следующий шаг

```ts
function nextTutorialStep() {
  const t = state.get().tutorial;
  state.set({
    tutorial: { ...t, currentStep: t.currentStep + 1, completedSteps: [...t.completedSteps, TUTORIAL_STEPS[t.currentStep].id] },
  });
  showTutorialStep(t.currentStep + 1);
}
```

### Подписка

```ts
events.on('merge:success', () => {
  if (state.get().tutorial.isActive) nextTutorialStep();
});
```

### Skip

```ts
function skipTutorial() {
  state.set({ tutorial: { currentStep: 0, isActive: false, isSkipped: true, completedSteps: [] } });
  document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
}
```

## Антипаттерны

- На каждом запуске
- После reset/skip
- Если игрок уже знает (по уровню)

## Чек-лист

- [ ] Шаги определены
- [ ] Highlight работает
- [ ] Tooltip работает
- [ ] Skip возможен
- [ ] Не блокирует игру
- [ ] Сохраняется в state
- [ ] Аналитика (skip rate)