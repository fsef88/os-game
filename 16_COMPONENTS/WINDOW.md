**Tags:** window

# Window

Версия: 1.0

---

## Назначение

Большое модальное окно с прокруткой. Для экранов: Achievements, Settings, Statistics, Leaderboard.

---

## API

```ts
interface WindowConfig {
  title: string;
  content: HTMLElement | string;
  width?: number;            // px, default 480
  height?: number;           // px, default 80vh
  showClose?: boolean;
  onClose?: () => void;
  tabs?: WindowTab[];        // опциональные вкладки
}
```

## Реализация

```ts
// src/ui/components/window.ts

export interface WindowTab {
  id: string;
  label: string;
  content: HTMLElement | string;
  badge?: string | number;
}

export interface WindowConfig {
  title: string;
  content?: HTMLElement | string;
  width?: number;
  height?: number;
  showClose?: boolean;
  onClose?: () => void;
  tabs?: WindowTab[];
}

export class Window {
  public element: HTMLDivElement;
  private config: WindowConfig;
  private contentContainer: HTMLDivElement;
  private activeTab: string | null = null;

  constructor(config: WindowConfig) {
    this.config = {
      width: 480,
      height: Math.min(640, window.innerHeight * 0.85),
      showClose: true,
      ...config,
    };
    this.element = document.createElement('div');
    this.element.className = 'window-overlay';
    this.contentContainer = document.createElement('div');
    this.render();
  }

  show() {
    document.body.appendChild(this.element);
    requestAnimationFrame(() => this.element.classList.add('show'));
  }

  close() {
    this.element.classList.remove('show');
    setTimeout(() => {
      this.element.remove();
      this.config.onClose?.();
    }, 300);
  }

  private render() {
    const tabsHtml = this.config.tabs ? `
      <div class="window-tabs">
        ${this.config.tabs.map((t, i) => `
          <button class="window-tab ${i === 0 ? 'active' : ''}" data-tab="${t.id}">
            ${t.label}
            ${t.badge != null ? `<span class="window-tab-badge">${t.badge}</span>` : ''}
          </button>
        `).join('')}
      </div>
    ` : '';

    this.element.innerHTML = `
      <div class="window-backdrop"></div>
      <div class="window-content" style="width: ${this.config.width}px; max-width: 92vw; height: ${this.config.height}px; max-height: 85vh;">
        <div class="window-header">
          <div class="window-title">${this.config.title}</div>
          ${this.config.showClose !== false ? '<button class="window-close">×</button>' : ''}
        </div>
        ${tabsHtml}
        <div class="window-body"></div>
      </div>
    `;

    this.contentContainer = this.element.querySelector('.window-body')!;

    // Закрытие
    this.element.querySelector('.window-close')?.addEventListener('click', () => this.close());
    this.element.querySelector('.window-backdrop')?.addEventListener('click', () => this.close());

    // Tabs
    if (this.config.tabs && this.config.tabs.length > 0) {
      this.activeTab = this.config.tabs[0].id;
      this.setTabContent(this.config.tabs[0].content);
      this.element.querySelectorAll('.window-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tabId = (btn as HTMLElement).dataset.tab!;
          this.element.querySelectorAll('.window-tab').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = this.config.tabs!.find(t => t.id === tabId);
          if (tab) {
            this.activeTab = tabId;
            this.setTabContent(tab.content);
          }
        });
      });
    } else if (this.config.content) {
      this.setTabContent(this.config.content);
    }
  }

  private setTabContent(content: HTMLElement | string) {
    this.contentContainer.innerHTML = '';
    if (typeof content === 'string') {
      this.contentContainer.innerHTML = content;
    } else {
      this.contentContainer.appendChild(content);
    }
    this.contentContainer.scrollTop = 0;
  }
}
```

## CSS

```css
.window-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.window-overlay.show { opacity: 1; }

.window-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
}

.window-content {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1f3a, #0d122c);
  border: 2px solid var(--color-gold, #ffd54f);
  border-radius: 16px;
  overflow: hidden;
  color: white;
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.window-title {
  font-size: 20px;
  font-weight: bold;
}

.window-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  width: 36px;
  height: 36px;
  opacity: 0.7;
}
.window-close:hover { opacity: 1; }

.window-tabs {
  display: flex;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.window-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  transition: color 0.2s;
}
.window-tab.active {
  color: var(--color-gold, #ffd54f);
}
.window-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--color-gold, #ffd54f);
}
.window-tab-badge {
  display: inline-block;
  background: #ff3344;
  color: white;
  font-size: 11px;
  border-radius: 10px;
  padding: 1px 6px;
  margin-left: 4px;
}

.window-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  -webkit-overflow-scrolling: touch;
}
```

## Использование

```ts
import { Window } from './ui/components/window';

const win = new Window({
  title: 'Достижения',
  width: 480,
  tabs: [
    { id: 'unlocked', label: 'Полученные', content: '<div>...12...</div>', badge: 12 },
    { id: 'locked',   label: 'Заблокированы', content: '<div>...38...</div>' },
  ],
  onClose: () => console.log('closed'),
});
win.show();
```

## Чек-лист

- [x] Tabs
- [x] Tab badge
- [x] Scroll
- [x] Backdrop close
- [x] X button
- [x] Adaptive size
- [x] Safe area
