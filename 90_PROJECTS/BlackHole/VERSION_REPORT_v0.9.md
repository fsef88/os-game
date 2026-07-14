# Black Hole v0.9 Report

**Дата:** 2026-07-14

## Что изменено

### 1. Первый старт стал мягче
- добавлен onboarding overlay на первый запуск;
- игроку не нужно догадываться о loop в первые секунды.

### 2. Помощь не ломает экран
- кнопка `Как играть` вынесена отдельно;
- toy-first композиция остаётся главной, а объяснение доступно по запросу.

## Проверки
- `npm run typecheck` ✅
- `npm run build` ✅
- `python3 scripts/validate_docs.py` ✅
- `bash scripts/check_all.sh` ✅
