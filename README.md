# AI CASUAL STUDIO OS

**Версия:** 1.6  
**Дата:** 2026-07-14

---

## Что это

**AI Casual Studio OS** — система документации, шаблонов и правил для solo-developer + AI, чтобы выпускать HTML5 casual games для **Yandex Games** короткими итерациями.

Это не энциклопедия "про всё".
Это **операционная система студии**:
- как выбрать жанр;
- как не уйти в overengineering;
- как собрать игру из повторно используемых частей;
- как стартовать новый проект за 1 день.

## Для кого

- solo developer
- AI-assisted workflow
- браузерные HTML5 игры
- mobile-first
- короткий цикл 7–10 дней на MVP

## Быстрый старт

### Новый ИИ
- `START_HERE.md`
- `00_CORE/README.md`
- `PROJECT_STATE.md`
- `INDEX.md`

### Новый проект
- `BOOTSTRAP_KIT.md`
- `FIRST_DAY_CHECKLIST.md`
- `05_PLAYBOOKS/BUILD_<genre>.md`
- `90_PROJECTS/TEMPLATE/`

### Нужен только шаблон кода
- `90_PROJECTS/TEMPLATE/README.md`
- `90_PROJECTS/TEMPLATE/src/README.md`

## Как устроена система

```
00_CORE         — миссия, границы, философия
01_BEHAVIOR     — как ИИ думает
02_RULES        — обязательные правила
03_ROLES        — роли виртуальной команды
04_PIPELINE     — путь от идеи до релиза
05_PLAYBOOKS    — пошаговые планы по жанрам и процессам
06_BIBLES       — глубокие справочники
07_PATTERNS     — паттерны и антипаттерны
08_PROJECT_TEMPLATE — служебные шаблоны ведения проекта
09_PROMPTS      — готовые промпты и роли
10_CHECKLISTS   — pre-release, mobile, desktop, post-release
11_REFERENCE    — базовые знания и принципы
13_GENRES       — жанровые спецификации
14_MECHANICS    — переиспользуемая игровая логика
15_SYSTEMS      — технические системы
16_COMPONENTS   — UI-компоненты
20_DECISIONS    — архитектурные решения (ADR)
90_PROJECTS     — эталонный шаблон реального проекта
98_EXAMPLES     — примеры и кейсы
```

## Модель сборки игры

```
Жанр + Механики + Системы + Компоненты = Проект
```

Примеры:
- Merge = `MERGE` + `Offline + Quests + Chests + Daily` + `Save/UI/Audio` + `HUD/Popup/Button`
- Clicker = `CLICKER` + `Upgrades + Prestige + Ads` + `Save/UI/Analytics` + `HUD/Button`

## Что уже стабилизировано

- единый стек: HTML5 + TypeScript + Vite + DOM/SVG
- шаблон проекта в `90_PROJECTS/TEMPLATE`
- playbook'и и чек-листы для первого запуска
- нормализованные role prompts
- базовая валидация структуры через `scripts/validate_docs.py`

## Где смотреть текущее состояние

- `PROJECT_STATE.md` — статус системы
- `CHANGELOG.md` — история изменений
- `NEXT_TASK.md` — следующий рабочий шаг
- `MISSING.md` — реальные пробелы
- `90_PROJECTS/SeedClickerMini/` — первый пилотный проект

## Главный принцип

> Лучше один честный рабочий путь, чем десять незавершённых маршрутов.
