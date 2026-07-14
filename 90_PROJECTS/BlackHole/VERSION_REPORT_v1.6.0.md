# Black Hole v1.6.0 Report

**Дата:** 2026-07-14

## Что изменено

### 1. VFX suction pass
- добавлены динамические линии притяжения от съедобных объектов к чёрной дыре;
- при поглощении появляются короткие burst-партиклы;
- boost, storm и bonus-моменты теперь визуально сильнее читаются прямо на сцене.

### 2. Object-art polish
- транспортные объекты получили более иллюстративные SVG-силуэты;
- автобус стал визуально заметнее как финальная цель;
- полиция, такси и машины меньше похожи на emoji/prototype-заглушки.

### 3. Scene screenshot polish
- добавлен cinematic overlay/vignette поверх сцены;
- поле сингулярности получило орбитальные кольца и breathing-анимацию;
- добавлен видимый meter окна комбо в dock-панель;
- convoy/storm/shower состояния лучше подсвечивают арену.

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
