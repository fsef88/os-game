# Seed Clicker Mini

**Жанр:** clicker  
**Версия:** 0.1.0  
**Статус:** pilot project

## Что это

Минимальный пилотный проект Studio OS. Игрок тапает по семечку, получает монеты, усиливает тап и покупает авто-доход.

## Зачем проект существует

Это не попытка сделать большую игру. Это **контрольный end-to-end проект**, который проверяет:
- запускается ли template без боли;
- хватает ли Studio OS для маленького production-like цикла;
- понятен ли путь от документации к коду.

## Запуск

```bash
cd src
npm install
npm run typecheck
npm run build
npm run dev
```

## Документация

- [PROJECT.md](./PROJECT.md)
- [GAME_DESIGN.md](./GAME_DESIGN.md)
- [ECONOMY.md](./ECONOMY.md)
- [BALANCE.md](./BALANCE.md)
- [ART_DIRECTION.md](./ART_DIRECTION.md)
- [ANALYTICS.md](./ANALYTICS.md)
- [DECISIONS.md](./DECISIONS.md)
- [CHANGELOG.md](./CHANGELOG.md)

## Код

См. [src/README.md](./src/README.md)

## Статус

- [x] Setup
- [x] Core loop
- [x] UI
- [x] Save
- [x] SDK fallback
- [ ] Ads
- [ ] Audio
- [ ] LiveOps
- [ ] Publish
