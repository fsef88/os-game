# Black Hole

**Жанр:** arcade growth / black hole toy  
**Версия:** 0.4.0  
**Статус:** active toy-first pilot

## Что это

`Black Hole` — новый активный прототип Studio OS. Игрок управляет чёрной дырой, засасывает всё, что меньше неё, растёт, переходит в новые районы и старается не врезаться в слишком крупные объекты.

Это намеренно **не интерфейсная игра**. В центре один сильный toy:
- движение;
- всасывание;
- рост;
- комбо;
- риск от тяжёлых объектов.

## Запуск

### Прямо в браузере, без npm
Открой:
- [OPEN_THIS_IN_BROWSER.html](./OPEN_THIS_IN_BROWSER.html)

### Как проект разработчика
```bash
cd src
npm install
npm run typecheck
npm run build
npm run dev
```

## Что уже есть

- one-screen arcade loop;
- управление мышью / пальцем / WASD;
- радиус всасывания;
- `Сингулярный рывок` с cooldown;
- комбо;
- отдельный счёт поверх массы;
- бонусные pickup-объекты;
- прогрессия размера;
- смена района;
- более читаемый traffic feel;
- marker финальной цели;
- локальный save текущего раннего прогресса.

## Документация

- [PROJECT.md](./PROJECT.md)
- [GAME_DESIGN.md](./GAME_DESIGN.md)
- [ECONOMY.md](./ECONOMY.md)
- [BALANCE.md](./BALANCE.md)
- [ART_DIRECTION.md](./ART_DIRECTION.md)
- [ANALYTICS.md](./ANALYTICS.md)
- [DECISIONS.md](./DECISIONS.md)
- [CHANGELOG.md](./CHANGELOG.md)
