# TEMPLATE

**Жанр:** выбрать при создании проекта  
**Версия:** 0.1  
**Статус:** baseline template

## Что это

Эталонный шаблон нового проекта для Studio OS.

Использовать так:
1. скопировать папку `TEMPLATE/`;
2. переименовать её в название игры;
3. заполнить документы;
4. перейти в `src/` и запустить проект.

## Запуск

```bash
cd src
npm install
npm run typecheck
npm run build
npm run dev
```

## Что уже есть

- базовый HTML5 + TypeScript + Vite setup
- Mock + Yandex SDK wrapper
- Save / Load
- State manager с hydrate
- Аналитика
- Базовый HUD
- Локализация `ru/en`

## Что нужно заполнить

- [PROJECT.md](./PROJECT.md)
- [GAME_DESIGN.md](./GAME_DESIGN.md)
- [ECONOMY.md](./ECONOMY.md)
- [BALANCE.md](./BALANCE.md)
- [ART_DIRECTION.md](./ART_DIRECTION.md)
- [ANALYTICS.md](./ANALYTICS.md)
- [DECISIONS.md](./DECISIONS.md)
- [CHANGELOG.md](./CHANGELOG.md)

## Что менять можно

- `config.ts`
- `state.ts` (жанровые поля)
- `core/*`
- `ui/*`
- переводы, контент, баланс

## Что лучше не переписывать без причины

- `sdk.ts`
- `save.ts`
- базовый паттерн `state.ts`
- общий порядок инициализации в `core/init.ts`

## Код

См. [src/README.md](./src/README.md)
