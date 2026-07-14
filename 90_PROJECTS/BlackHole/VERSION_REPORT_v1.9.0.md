# Black Hole v1.9.0 Report

**Дата:** 2026-07-14

## Что изменено

### 1. Full mobile-game visual rework
- убран web/dashboard layout;
- игровое поле занимает почти весь экран;
- HUD сведён к минимуму: жизни, счёт, размер, комбо.

### 2. City-map сцена
- добавлены CSS-слои дорог, зданий, парков, деревьев и городских огней;
- добавлены parallax/dust, bloom/glow и cinematic vignette.

### 3. Чёрная дыра как фокус
- усилены blue glow, vortex, орбитальные кольца и particles;
- suction lines и burst VFX сохранены как игровой feedback.

### 4. Juicy object icons
- монеты сверкают;
- коробки выглядят объёмнее;
- core переработан в glowing magnet;
- heart переработан в аптечку-бонус.

## Проверки
- `npm run typecheck` ✅
- `npm run build` ✅
- `python3 scripts/validate_docs.py` ✅
- `bash scripts/check_all.sh` ✅
