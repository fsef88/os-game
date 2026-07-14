# BOOTSTRAP KIT

**Версия:** 1.6  
**Дата:** 2026-07-14

---

## Цель

Запустить новый проект **за 1 час** без спора о стеке и структуре.

Не сделать всю игру.
Только подготовить: документацию, шаблон, dev-server и baseline.

## Шаг 0 — ответить на 7 вопросов

| # | Вопрос | Где искать ответ |
|---|---|---|
| 1 | Какой жанр? | `13_GENRES/` и `05_PLAYBOOKS/` |
| 2 | Какой core loop? | `13_GENRES/<genre>.md` |
| 3 | Какая retention-механика? | `06_BIBLES/RETENTION_PSYCHOLOGY.md` |
| 4 | Какая монетизация? | `06_BIBLES/MONETIZATION_BIBLE.md` |
| 5 | Какой стек? | `20_DECISIONS/` и `06_BIBLES/AI_DEVELOPER_BIBLE.md` |
| 6 | Для кого игра? | `06_BIBLES/PLAYER_PSYCHOLOGY.md` |
| 7 | Помещается ли MVP в 7–10 дней? | `02_RULES/DECISION_RULES.md` |

Если хотя бы на 1 вопрос нет ответа — сначала уточнить его в документации.

## Шаг 1 — скопировать шаблон

Создать новый проект на базе `90_PROJECTS/TEMPLATE/`.

Пример:

```bash
cp -R 90_PROJECTS/TEMPLATE 90_PROJECTS/MyGame
```

После копирования:
- переименовать проект в `README.md` и `PROJECT.md`;
- заполнить `GAME_DESIGN.md`, `ECONOMY.md`, `BALANCE.md`;
- перейти в `90_PROJECTS/MyGame/src`.

## Шаг 2 — запустить baseline

```bash
cd 90_PROJECTS/MyGame/src
npm install
npm run dev
```

Ожидание:
- открывается страница;
- виден базовый HUD;
- работает Mock SDK, если нет YaGames;
- нет критических ошибок в console.

## Шаг 3 — проверить содержимое шаблона

### Из коробки уже есть
- `sdk.ts` — Yandex SDK + Mock
- `save.ts` — local + cloud save
- `state.ts` — state manager + hydrate
- `analytics.ts` — базовые события
- `hud.ts` — базовый HUD
- `i18n.ts` — локализация ru/en
- `config.ts` — константы и баланс
- `core/init.ts` — последовательность загрузки

### Нужно адаптировать под жанр
- `config.ts`
- `state.ts` (только жанровые поля)
- `core/*`
- `ui/*`
- контент в переводах

## Шаг 4 — выбрать playbook

- Merge → `05_PLAYBOOKS/BUILD_MERGE.md`
- Clicker → `05_PLAYBOOKS/BUILD_CLICKER.md`
- Idle → `05_PLAYBOOKS/BUILD_IDLE.md`
- Tycoon → `05_PLAYBOOKS/BUILD_TYCOON.md`
- Puzzle / Match-like → `05_PLAYBOOKS/BUILD_PUZZLE.md`

## Шаг 5 — пройти baseline-check

- [ ] `index.html` открывается
- [ ] `npm run build` проходит
- [ ] HUD рендерится
- [ ] Save/Load не падают
- [ ] Язык определяется
- [ ] Mock SDK работает локально
- [ ] Есть заполненный `PROJECT.md`

## Что НЕ делать в первый час

- ❌ спорить о стеке;
- ❌ переписывать шаблон целиком;
- ❌ делать финальный арт;
- ❌ пытаться сразу закрыть все механики;
- ❌ добавлять библиотеку без реальной необходимости.

## Результат хорошего bootstrap

Через 1 час должно быть:
- создана папка проекта;
- dev-server запускается;
- проектные документы заполнены на базовом уровне;
- выбран playbook на следующие 7 дней.
