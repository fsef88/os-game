# UPGRADE REPORT

**Дата:** 2026-07-14

## Что было сделано

### 1. Нормализован вход
- добавлен `START_HERE.md`
- пересобраны `README.md`, `INDEX.md`, `BOOTSTRAP_KIT.md`, `FIRST_DAY_CHECKLIST.md`
- обновлены `PROJECT_STATE.md`, `VERSION.md`, `NEXT_TASK.md`, `MISSING.md`

### 2. Закрыты структурные пробелы
- создан `05_PLAYBOOKS/`
- добавлены `BUILD_MERGE.md`, `BUILD_CLICKER.md`, `BUILD_IDLE.md`, `BUILD_TYCOON.md`, `BUILD_PUZZLE.md`
- добавлены `QA_PLAYBOOK.md`, `RELEASE_PLAYBOOK.md`
- добавлены `10_CHECKLISTS/MOBILE.md`, `DESKTOP.md`, `POST_RELEASE.md`
- добавлены `13_GENRES/CORE.md`, `14_MECHANICS/CORE.md`, `14_MECHANICS/CHESTS.md`, `15_SYSTEMS/CORE.md`

### 3. Нормализованы prompts
- созданы каноничные `*_PROMPT.md`
- legacy `PROMPT_EXTRA_*` и `REVIEWER.md` оставлены как алиасы
- обновлён `09_PROMPTS/README.md`

### 4. Усилен TEMPLATE
- исправлен `src/index.html`
- добавлены `typecheck` script и JSON-переводы
- улучшены `state.ts`, `save.ts`, `analytics.ts`, `hud.ts`, `core/init.ts`
- добавлены `src/core/README.md` и `src/ui/README.md`

### 5. Добавлена локальная проверка структуры
- создан `scripts/validate_docs.py`

## Что проверено

### Документация
```bash
python3 scripts/validate_docs.py
# No broken markdown links found.
```

### Шаблон проекта
```bash
cd 90_PROJECTS/TEMPLATE/src
npm run typecheck
npm run build
```

Обе проверки проходят успешно.

## Что осталось на следующий цикл
- сделать 1 реальный пилотный проект;
- добавить CI на link check и build;
- пополнить `98_EXAMPLES/` не заглушками, а реальными кейсами.

### 6. Добавлен первый пилотный проект
- создан `90_PROJECTS/SeedClickerMini/`
- реализован микро-clicker end-to-end
- добавлен пример в `98_EXAMPLES/SeedClickerMini/`
- добавлен `scripts/check_all.sh` для общей проверки
