# src/

## Структура

```
src/
├── index.html
├── main.ts
├── config.ts
├── state.ts
├── sdk.ts
├── save.ts
├── analytics.ts
├── i18n.ts
├── i18n/
│   ├── ru.json
│   └── en.json
├── hud.ts
├── core/
│   ├── README.md
│   └── init.ts
├── ui/
│   └── README.md
└── styles/
    └── main.css
```

## Что работает из коробки

- Yandex SDK + Mock fallback
- локальный и облачный save
- state manager с hydrate
- базовая аналитика
- базовый HUD
- ru / en локализация
- safe area friendly layout

## Что адаптировать под жанр

- `config.ts`
- `state.ts` (только жанровые поля)
- `core/*`
- `ui/*`
- переводы и контент
