# MERGE_CANDIDATES

**Версия:** 1.6  
**Дата:** 2026-07-14

---

Остаточные кандидаты на объединение. Это уже не критичные поломки, а редакторская полировка.

## 1. Минимальные изменения

Пересекаются:
- `01_BEHAVIOR/MINIMAL_CHANGE.md`
- `02_RULES/AI_RULES.md`
- `06_BIBLES/AI_DEVELOPER_BIBLE.md`

**Рекомендация:** держать эталон в `01_BEHAVIOR/MINIMAL_CHANGE.md`, в остальных местах — короткая ссылка.

## 2. Запрет лишнего рефакторинга

Пересекаются:
- `01_BEHAVIOR/WHEN_TO_REFACTOR.md`
- `01_BEHAVIOR/DO_NOT_OVERENGINEER.md`
- `02_RULES/AI_RULES.md`

**Рекомендация:** разделить роли этих файлов ещё жёстче:
- WHEN_TO_REFACTOR → когда можно
- DO_NOT_OVERENGINEER → когда нельзя усложнять
- AI_RULES → короткая директива

## 3. Studio principles vs reference

Пересекаются:
- `00_CORE/VALUES.md`
- `00_CORE/PHILOSOPHY.md`
- `11_REFERENCE/STUDIO_PRINCIPLES.md`

**Рекомендация:** values = короткий манифест, philosophy = объяснение, reference = прикладной каталог.

## 4. Legacy prompt aliases

Файлы:
- `09_PROMPTS/PROMPT_EXTRA_1.md` ... `PROMPT_EXTRA_7.md`
- `09_PROMPTS/REVIEWER.md`

**Статус:** оставлены как legacy aliases. Каноничные файлы — `*_PROMPT.md`.
