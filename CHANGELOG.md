# CHANGELOG

## v1.6 — 2026-07-14 (stabilization pass)

### Добавлено
- `START_HERE.md` как единая точка входа
- `05_PLAYBOOKS/` с базовыми playbook'ами
- `10_CHECKLISTS/MOBILE.md`, `DESKTOP.md`, `POST_RELEASE.md`
- `13_GENRES/CORE.md`
- `14_MECHANICS/CORE.md`
- `14_MECHANICS/CHESTS.md`
- `15_SYSTEMS/CORE.md`
- каноничные role prompts в `09_PROMPTS/*_PROMPT.md`
- `scripts/validate_docs.py`

### Исправлено
- нормализованы пути `90_PROJECTS/TEMPLATE`
- пересобран root onboarding (`README`, `INDEX`, `BOOTSTRAP_KIT`, `FIRST_DAY_CHECKLIST`)
- исправлен template `index.html`
- template получил рабочую связку init → load → hydrate → autosave
- добавлены JSON-переводы шаблона

### Результат
- система доведена до состояния "готово к первому пилотному проекту"

## v1.5 — 2026-07-14 (текущая, FROZEN)

### Добавлено
- **00_CORE/README.md** — точка входа для нового ИИ
- **Статус-блок в каждом документе** (Status, Owner, Version, Last Reviewed)
- **See also секция** в каждой BIBLE со ссылками на релевантные SYSTEM/MECHANIC/GENRE

### Унифицированный формат

Каждый документ теперь имеет:

```md
# Название

**Status:** Stable
**Owner:** Studio
**Version:** 1.5
**Last Reviewed:** 2026-07-14
**Tags:** ...

---

Содержимое...

## See also (для BIBLES)

- `15_SYSTEMS/ECONOMY_SYSTEM.md`
- `14_MECHANICS/SHOP.md`
- `13_GENRES/TYCOON.md`
```

### Граница BIBLE vs SYSTEM (закреплена в GLOSSARY)

- **BIBLE** — почему и какие принципы
- **SYSTEM** — как реализовано в коде

## v1.4 — 2026-07-14

### Добавлено
- 00_CORE/ARCHITECTURE.md, GLOSSARY.md
- 09_PROMPTS/README.md (иерархия)
- 20_DECISIONS/README.md (унифицированный формат)

### Переименовано
- CORE.md → README.md в подпапках

## v1.3 — 2026-07-14

- 00_CORE/STUDIO_SCOPE.md, NON_GOALS.md
- 11_KNOWLEDGE → 11_REFERENCE
- 09_PROJECTS → 90_PROJECTS
- 12_EXAMPLES → 98_EXAMPLES

## v1.2 — 2026-07-14

- INDEX.md, DEPENDENCY_MAP.md
- Tags в 131 файле

## v1.1 — 2026-07-14

- 16_COMPONENTS, 20_DECISIONS
- MECHANICS → 14_, SYSTEMS → 15_

## v1.0 — 2026-07-14

- CORE → RULES → ROLES → SYSTEMS → MECHANICS → GENRES → PROJECT
- Структура FROZEN

## v0.x
- v0.7: Шаблон проекта + код-база
- v0.6: 5 критичных библий расширены
- v0.5: Аудит
- v0.4: Структура по папкам
- v0.1: Извлечение из чата
