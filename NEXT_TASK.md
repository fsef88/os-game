# NEXT_TASK

**Sprint:** 4 — Выбор сильного тематического пилота  
**Task ID:** PT-003  
**Owner:** Producer + Architect + Game Designer

## Задача

Выбрать **следующий перспективный пилот**, который будет сильнее обычного clicker по интересу, фантазии и долгосрочному потенциалу.

## Что уже сделано

- Studio OS стабилизирована и разложена по файлам;
- template проверен build/typecheck;
- создан технический пилот `90_PROJECTS/SeedClickerMini/`;
- подтверждено, что template можно быстро адаптировать под простую игру.

## Важно

`SeedClickerMini` теперь рассматривается как **технический smoke-test**, а не как главный продуктовый вектор.

## Новые кандидаты

См. `PILOT_CANDIDATES.md`.

### Приоритетный shortlist

1. **Alchemy Lab** — merge + discovery + orders
2. **Archaeology Camp** — merge + collector + zone unlock
3. **Artifact Suitcase** — inventory puzzle + merge

## Рекомендация

Лучший следующий шаг сейчас — **Alchemy Lab**.

Почему:
- выглядит интереснее базового merge;
- даёт чувство открытия;
- реалистичен для MVP;
- хорошо подходит под solo + AI pipeline;
- достаточно отличается от примитивного clicker.

## План после выбора

1. Создать новый пилот в `90_PROJECTS/<project>/`
2. Заполнить `PROJECT.md`, `GAME_DESIGN.md`, `ECONOMY.md`
3. Поднять первый HTML-прототип
4. Прогнать `typecheck`, `build`, QA baseline
5. Добавить новый example / case study

## Definition of Done

- [ ] выбран новый жанрово-тематический пилот
- [ ] создан новый проект в `90_PROJECTS/`
- [ ] сделан первый playable prototype
- [ ] зафиксированы причины выбора и риски
