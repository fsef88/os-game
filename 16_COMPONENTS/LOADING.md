**Tags:** loading

# Loading

Версия: 1.0

---

## Назначение

Экран загрузки. Показывается при старте, при смене сцены.

---

## API

```ts
interface LoadingConfig {
  text?: string;
  progress?: number;       // 0-1
  showProgress?: boolean;
  icon?: string;
  onReady?: () => void;
  minDuration?: number;    // минимальное время показа
}
```

## Реализация

```ts
// src/ui/components/loading.ts

export interface LoadingConfig {
  text?: string;
  progress?: number;
  showProgress?: boolean;
  icon?: string;
  onReady?: () => void;
  minDuration?: number;
}

export class Loading {
  private element: HTMLDivElement;
  private progressBar: HTMLDivElement | null = null;
  private progressText: HTMLElement | null = null;
  private startTime: number;
  private ready = false;

  constructor(public config: LoadingConfig) {
    this.config = { text: 'Загрузка...', showProgress: true, ...config };
    this.startTime = Date.now();
    this.element = document.createElement('div');
    this.element.className = 'loading-screen';
    this.render();
  }

  show() {
    document.body.appendChild(this.element);
  }

  updateProgress(progress: number) {
    this.config.progress = progress;
    if (this.progressBar) this.progressBar.style.width = `${progress * 100}%`;
    if (this.progressText) this.progressText.textContent = `${Math.round(progress * 100)}%`;
  }

  setText(text: string) {
    this.config.text = text;
    const el = this.element.querySelector('.loading-text');
    if (el) el.textContent = text;
  }

  ready() {
    if (this.ready) return;
    const elapsed = Date.now() - this.startTime;
    const minDur = this.config.minDuration || 500;
    const delay = Math.max(0, minDur - elapsed);
    setTimeout(() => {
      this.element.classList.add('hide');
      setTimeout(() => {
        this.element.remove();
        this.config.onReady?.();
      }, 500);
      this.ready = true;
    }, delay);
  }

  private render() {
    this.element.innerHTML = `
      <div class="loading-content">
        ${this.config.icon ? `<div class="loading-icon">${this.config.icon}</div>` : ''}
        <div class="loading-spinner"></div>
        <div class="loading-text">${this.config.text}</div>
        ${this.config.showProgress ? `
          <div class="loading-progress">
            <div class="loading-progress-bar" style="width: ${(this.config.progress || 0) * 100}%"></div>
          </div>
          <div class="loading-progress-text">${Math.round((this.config.progress || 0) * 100)}%</div>
        ` : ''}
      </div>
    `;
    this.progressBar = this.element.querySelector('.loading-progress-bar');
    this.progressText = this.element.querySelector('.loading-progress-text');
  }
}
```

## CSS

```css
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: linear-gradient(180deg, #0d122c, #1e2650);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.5s ease-out;
}
.loading-screen.hide { opacity: 0; pointer-events: none; }

.loading-content {
  text-align: center;
  color: white;
}

.loading-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top-color: var(--color-gold, #ffd54f);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  font-size: 16px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.loading-progress {
  width: 240px;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto 8px;
}

.loading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-gold, #ffd54f), #ff9800);
  transition: width 0.3s ease-out;
  border-radius: 4px;
}

.loading-progress-text {
  font-size: 12px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
```

## Использование

```ts
import { Loading } from './ui/components/loading';

const loading = new Loading({
  text: 'Загрузка игры...',
  icon: '🎮',
  minDuration: 1000,
});
loading.show();

// При загрузке ресурсов
loading.updateProgress(0.3);
await loadAssets();
loading.updateProgress(0.7);
await loadData();
loading.updateProgress(1);
loading.ready();
```

## Чек-лист

- [x] Spinner
- [x] Progress bar
- [x] Текст
- [x] Иконка
- [x] Min duration
- [x] Fade out
- [x] Safe area (через z-index, не блокирует)
