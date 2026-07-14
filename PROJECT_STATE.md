# PROJECT_STATE

**Версия:** v1.7  
**Дата:** 2026-07-14  
**Статус:** Система стабилизирована; идёт выбор сильного тематического пилота

---

## Что уже сделано

### Структура и вход
- добавлены `START_HERE.md`, новый `README.md`, новый `INDEX.md`;
- нормализованы пути `90_PROJECTS/TEMPLATE`;
- собраны playbook'и, чек-листы и role prompts.

### Техническая база
- template проходит `typecheck` и `build`;
- markdown-ссылки валидируются через `scripts/validate_docs.py`;
- есть общий локальный quality gate через `scripts/check_all.sh`.

### Подтверждённый минимум
- создан технический пилот `90_PROJECTS/SeedClickerMini/`;
- подтверждено, что template можно быстро адаптировать в playable прототип;
- есть первый технический example в `98_EXAMPLES/SeedClickerMini/`.

## Что изменилось в стратегическом фокусе

Studio OS больше не смотрит на `SeedClickerMini` как на главный продуктовый ориентир.

Теперь он считается:
- **техническим smoke-test**;
- способом проверить сборку, структуру и базовый loop;
- нецелевым жанровым направлением.

Новый стратегический фокус:
- более интересные thematic-casual пилоты;
- merge / collector / discovery / restore fantasy;
- меньше абстрактных clicker'ов, больше world-feel и collection feel.

## Новый shortlist

См.:
- `GENRE_STRATEGY.md`
- `PILOT_CANDIDATES.md`

Приоритетные кандидаты:
1. **Alchemy Lab**
2. **Archaeology Camp**
3. **Artifact Suitcase**

## Текущая готовность

| Область | Статус | Комментарий |
|---|---|---|
| CORE / RULES / BEHAVIOR | ✅ | Стабильно |
| PIPELINE / PLAYBOOKS | ✅ | Есть рабочий стартовый набор |
| TEMPLATE | ✅ | Готов к новому пилоту |
| AUTOMATION | ✅ | Есть локальная проверка |
| TECH PILOT | ✅ | Smoke-test создан |
| PRODUCT DIRECTION | 🟡 | Идёт выбор сильного тематического пилота |
| SHIPPED EXAMPLE | ❌ | Нет реально опубликованной игры |

## Что осталось слабым местом

1. Нет одного реально опубликованного shipped example
2. Нет CI вне локальных скриптов
3. Не все большие BIBLE/REFERENCE документы унифицированы по статус-блоку
4. Ещё не выбран сильный тематический пилот как основной продуктовый тест системы

## Следующий логичный шаг

Выбрать один из `PILOT_CANDIDATES.md` и начать новый пилот не вокруг clicker, а вокруг более сильной fantasy и жанровой дифференциации.
