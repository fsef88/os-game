**Tags:** tutorial

# Tutorial Arrow

Версия: 1.0

---

## Назначение

Подсвечивает UI-элемент во время обучения. Стрелка + подсветка + текст.

---

## API

```ts
interface TutorialArrowConfig {
  target: HTMLElement | string;   // элемент или селектор
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  arrow?: boolean;                // показать стрелку
  pulse?: boolean;                // пульсация цели
  onNext?: () => void;            // клик "Далее"
  onSkip?: () => void;            // клик "Пропустить"
}
```

## Реализация

```ts
// src/ui/components/tutorial-arrow.ts

export type ArrowPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TutorialArrowConfig {
  target: HTMLElement | string;
  text: string;
  position?: ArrowPosition;
  arrow?: boolean;
  pulse?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
}

export class TutorialArrow {
  private overlay: HTMLDivElement;
  private highlight: HTMLDivElement;
  private tooltip: HTMLDivElement;
  private config: TutorialArrowConfig;
  private targetEl: HTMLElement;

  constructor(config: TutorialArrowConfig) {
    this.config = { position: 'auto', arrow: true, pulse: true, ...config };
    this.targetEl = typeof config.target === 'string'
      ? document.querySelector(config.target) as HTMLElement
      : config.target;
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.highlight = document.createElement('div');
    this.highlight.className = 'tutorial-highlight';
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    this.render();
  }

  show() {
    document.body.appendChild(this.overlay);
    if (this.config.pulse) this.targetEl.classList.add('tutorial-target-pulse');
    this.updatePosition();
    window.addEventListener('resize', this.updatePosition);
    window.addEventListener('scroll', this.updatePosition);
  }

  hide() {
    this.overlay.remove();
    this.targetEl.classList.remove('tutorial-target-pulse');
    window.removeEventListener('resize', this.updatePosition);
    window.removeEventListener('scroll', this.updatePosition);
  }

  private updatePosition = () => {
    const rect = this.targetEl.getBoundingClientRect();
    const pad = 8;

    this.highlight.style.top = `${rect.top - pad}px`;
    this.highlight.style.left = `${rect.left - pad}px`;
    this.highlight.style.width = `${rect.width + pad * 2}px`;
    this.highlight.style.height = `${rect.height + pad * 2}px`;

    // Tooltip позиционирование
    const tipPos = this.computeTooltipPosition(rect);
    this.tooltip.style.top = `${tipPos.top}px`;
    this.tooltip.style.left = `${tipPos.left}px`;
  };

  private computeTooltipPosition(targetRect: DOMRect): { top: number; left: number } {
    const tooltipW = 240;
    const tooltipH = 120;
    const margin = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let pos = this.config.position;
    if (pos === 'auto') {
      pos = targetRect.top > vh / 2 ? 'top' : 'bottom';
    }

    let top = 0, left = 0;
    if (pos === 'top') {
      top = targetRect.top - tooltipH - margin;
      left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
    } else if (pos === 'bottom') {
      top = targetRect.bottom + margin;
      left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
    } else if (pos === 'left') {
      top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
      left = targetRect.left - tooltipW - margin;
    } else {
      top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
      left = targetRect.right + margin;
    }

    // Clamp
    left = Math.max(8, Math.min(left, vw - tooltipW - 8));
    top = Math.max(8, Math.min(top, vh - tooltipH - 8));
    return { top, left };
  }

  private render() {
    this.overlay.appendChild(this.highlight);
    this.overlay.appendChild(this.tooltip);
    this.tooltip.innerHTML = `
      <div class="tutorial-text">${this.config.text}</div>
      <div class="tutorial-actions">
        ${this.config.onSkip ? '<button class="tutorial-btn tutorial-btn-skip">Пропустить</button>' : ''}
        ${this.config.onNext ? '<button class="tutorial-btn tutorial-btn-next">Далее</button>' : ''}
      </div>
    `;
    this.tooltip.querySelector('.tutorial-btn-next')?.addEventListener('click', () => {
      this.hide();
      this.config.onNext?.();
    });
    this.tooltip.querySelector('.tutorial-btn-skip')?.addEventListener('click', () => {
      this.hide();
      this.config.onSkip?.();
    });
  }
}
```

## CSS

```css
.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  pointer-events: none;
}

.tutorial-highlight {
  position: fixed;
  border: 3px solid var(--color-gold, #ffd54f);
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.6);
  pointer-events: auto;
  animation: tutorialGlow 1.5s ease-in-out infinite;
}

@keyframes tutorialGlow {
  0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.6), 0 0 16px var(--color-gold); }
  50% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.6), 0 0 32px var(--color-gold); }
}

.tutorial-target-pulse {
  animation: targetPulse 1.5s ease-in-out infinite;
}
@keyframes targetPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.tutorial-tooltip {
  position: fixed;
  width: 240px;
  background: rgba(0,0,0,0.95);
  color: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-gold, #ffd54f);
  pointer-events: auto;
  z-index: 1501;
}

.tutorial-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.tutorial-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.tutorial-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  min-width: 60px;
  min-height: 32px;
}
.tutorial-btn-next { background: var(--color-gold, #ffd54f); color: black; border-color: var(--color-gold); }
```

## Использование

```ts
import { TutorialArrow } from './ui/components/tutorial-arrow';

const tutorial = new TutorialArrow({
  target: '.merge-button',
  text: 'Соедини два одинаковых овоща!',
  onNext: () => showNextStep(),
  onSkip: () => skipTutorial(),
});
tutorial.show();
```

## Чек-лист

- [x] Target highlight
- [x] Tooltip с текстом
- [x] Auto-position
- [x] Pulse анимация
- [x] Кнопки Skip/Next
- [x] Backdrop затемнение
- [x] Resize handling
