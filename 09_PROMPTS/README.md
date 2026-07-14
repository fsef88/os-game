# 09_PROMPTS

**Версия:** 1.6  
**Дата:** 2026-07-14

---

## Иерархия промптов

```
MASTER_PROMPT
    ↓
ROLE_PROMPT
    ↓
TASK_PROMPT
```

## Каноничные файлы

### Master
- `MASTER_PROMPT.md`

### Role prompts
- `PRODUCER_PROMPT.md`
- `ARCHITECT_PROMPT.md`
- `PROGRAMMER_PROMPT.md`
- `QA_PROMPT.md`
- `GAME_DESIGNER_PROMPT.md`
- `ART_DIRECTOR_PROMPT.md`
- `REVIEWER_PROMPT.md`

### Task prompts
- `AI_TASK_TEMPLATE.md`
- `AI_COMMUNICATION.md`
- `AI_LIMITATIONS.md`
- `PROMPT_RULES.md`
- `ARENA.md`

## Legacy aliases

Старые файлы `PROMPT_EXTRA_1.md ... PROMPT_EXTRA_7.md` и `REVIEWER.md` сохранены только для обратной совместимости.
Использовать в работе нужно **каноничные** `*_PROMPT.md`.

## Рекомендуемый порядок для ИИ

1. `PROJECT_STATE.md`
2. `MASTER_PROMPT.md`
3. свой role prompt
4. `AI_TASK_TEMPLATE.md`
5. задача
6. `01_BEHAVIOR/SELF_REVIEW.md`
