# Alchemy Lab

**Жанр:** merge + discovery + orders  
**Версия:** 1.0.0  
**Статус:** active thematic pilot

## Что это

`Alchemy Lab` — главный тематический пилот Studio OS. Внутри игры все названия и UI переведены на русский: игрок видит **Алхимическую мастерскую**, собирает искры, открывает формулы, выполняет заказы и закрывает особые контракты.

Это уже не технический smoke-test, а полноценный **vertical slice до версии 1.0** с:
- понятным first-time UX;
- merge-loop;
- обычными и особыми заказами;
- журналом открытий;
- поручениями алхимика;
- бонусом дня;
- мета-апгрейдами лаборатории.

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
- [x] Grid UI
- [x] Orders
- [x] Special contracts
- [x] Discoveries
- [x] Missions
- [x] Daily reward
- [x] Save
- [x] Core onboarding clarity
- [x] Russian naming in UI
- [ ] Audio
- [ ] Ads
- [ ] Further content depth
