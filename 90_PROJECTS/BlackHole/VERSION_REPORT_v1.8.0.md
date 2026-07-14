# Black Hole v1.8.0 Report

**Дата:** 2026-07-14

## Цель версии

Продолжить движение по приложенному референсу: сделать экран похожим на готовый mobile game screenshot, где основная информация, способности и навигация находятся прямо поверх игрового поля.

## Что изменено

### 1. Mobile combat HUD внутри арены
- добавлен вертикальный skill stack слева внутри сцены;
- `Сингулярный рывок` продублирован как интерактивная skill-orb кнопка;
- рядом отображаются shield и combo orb.

### 2. Minimap / radar
- добавлена мини-карта справа снизу;
- на ней видны игрок, автобус, полиция, машины, такси и бонусные звёзды;
- автобус выделен как boss-dot.

### 3. Objective rail
- добавлена верхняя внутриигровая objective-полоска;
- она показывает текущую цель роста, прогресс и район;
- это заменяет часть ощущения внешнего dashboard и приближает композицию к mobile screenshot.

### 4. Impact polish
- при тяжёлом столкновении теперь появляется красный burst-VFX вокруг чёрной дыры;
- danger feedback стал более игровым и менее текстовым.

## Реальные изменённые файлы
- `src/ui/blackhole.ts`
- `src/styles/main.css`
- `src/config.ts`
- `src/package.json`
- `src/package-lock.json`
- `README.md`
- `CHANGELOG.md`

## Проверки
- `npm run typecheck` ✅
- `npm run build` ✅
- `python3 scripts/validate_docs.py` ✅
- `bash scripts/check_all.sh` ✅
