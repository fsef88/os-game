# NEXT_TASK

**Sprint:** 3 — Второй пилот  
**Task ID:** PT-002  
**Owner:** Producer + Architect + Programmer

## Задача

Проверить Studio OS на **втором пилоте с более сложным UI**.

## Что уже сделано

- создан `90_PROJECTS/SeedClickerMini/`;
- template проверен на простом clicker-проекте;
- есть первый case study в `98_EXAMPLES/SeedClickerMini/`.

## Следующий кандидат

### Merge Mini
Лучший следующий шаг, потому что он проверит:
- grid layout;
- drag/drop или tap-to-merge;
- большее число экранных состояний;
- механики ближе к целевому studio scope.

## План

1. Скопировать `90_PROJECTS/TEMPLATE/` в `90_PROJECTS/MergeMini/`
2. Заполнить проектные документы
3. Взять `05_PLAYBOOKS/BUILD_MERGE.md`
4. Реализовать core merge loop
5. Прогнать `typecheck`, `build`, QA baseline
6. Добавить второй case study

## Definition of Done

- [ ] есть второй пилот
- [ ] проверен сценарий grid + merge
- [ ] обновлены examples
- [ ] зафиксированы новые lessons learned
