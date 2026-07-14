# PROJECT_STATE

**Версия:** v1.8  
**Дата:** 2026-07-14  
**Статус:** Система стабилизирована; выбран и поднят сильный тематический пилот `Alchemy Lab`

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
- есть технический example в `98_EXAMPLES/SeedClickerMini/`.

### Новый продуктовый шаг
- выбран и создан `90_PROJECTS/AlchemyLab/`;
- реализован thematic pilot: merge + discovery + orders;
- добавлена standalone playable версия;
- создан пример в `98_EXAMPLES/AlchemyLab/`.

## Текущий стратегический фокус

Studio OS теперь проверяется не только на технической собираемости, но и на **product-fantasy strength**.

Основной активный пилот:
- **Alchemy Lab**

Его задача — показать, что система умеет рождать не просто рабочий UI, а более интересный casual product с:
- темой;
- открытием;
- журналом;
- order-loop;
- визуальным потенциалом для развития.

## Текущая готовность

| Область | Статус | Комментарий |
|---|---|---|
| CORE / RULES / BEHAVIOR | ✅ | Стабильно |
| PIPELINE / PLAYBOOKS | ✅ | Есть рабочий стартовый набор |
| TEMPLATE | ✅ | Готов к новым пилотам |
| AUTOMATION | ✅ | Есть локальная проверка |
| TECH PILOT | ✅ | Smoke-test создан |
| THEMATIC PILOT | ✅ | `Alchemy Lab` поднят |
| SHIPPED EXAMPLE | ❌ | Нет реально опубликованной игры |

## Что осталось слабым местом

1. Нет одного реально опубликованного shipped example
2. Нет CI вне локальных скриптов
3. Не все большие BIBLE/REFERENCE документы унифицированы по статус-блоку
4. `Alchemy Lab` пока в MVP-форме и требует product polish

## Следующий логичный шаг

Развивать `Alchemy Lab` как основной демонстрационный пилот и уже по его результатам решать, нужен ли второй сильный тематический проект (`Archaeology Camp` или `Artifact Suitcase`).
