**Tags:** audio, systems

# AUDIO SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/AUDIO_BIBLE.md

---


## Назначение

Управление звуком: SFX, музыка, громкость, отключение.

Используется: 100% игр.

Подробности по звуку — см. `06_BIBLES/AUDIO_BIBLE.md`. Здесь только программная архитектура.

---

## Архитектура

```ts
class AudioSystem {
  private sfx: Map<string, Howl | HTMLAudioElement>;
  private music: Howl | null;
  private masterVolume: number;
  private sfxVolume: number;
  private musicVolume: number;
  private muted: boolean;

  // Управление
  preload(): Promise<void>;
  playSFX(name: string, volume?: number): void;
  playMusic(name: string, loop?: boolean): void;
  stopMusic(): void;
  setMasterVolume(v: number): void;
  setSFXVolume(v: number): void;
  setMusicVolume(v: number): void;
  mute(): void;
  unmute(): void;
}
```

## Прелоад

```ts
async preload() {
  const soundFiles = [
    'sfx/click', 'sfx/coin', 'sfx/merge', 'sfx/error',
    'sfx/levelup', 'sfx/reward', 'sfx/success',
    'music/main',
  ];
  for (const name of soundFiles) {
    const audio = new Audio(`/audio/${name}.mp3`);
    audio.preload = 'auto';
    await new Promise(r => audio.addEventListener('canplaythrough', r));
    this.sfx.set(name, audio);
  }
}
```

## Воспроизведение SFX

```ts
playSFX(name: string, volumeMultiplier = 1) {
  if (this.muted || this.sfxVolume === 0) return;
  const audio = this.sfx.get(name);
  if (!audio) return;

  // Клонируем для overlap
  const clone = audio.cloneNode(true) as HTMLAudioElement;
  clone.volume = this.masterVolume * this.sfxVolume * volumeMultiplier;
  clone.play().catch(() => {}); // ignore autoplay errors
}
```

## Музыка

```ts
playMusic(name: string, loop = true) {
  if (this.music) this.stopMusic();
  const audio = new Audio(`/audio/${name}.mp3`);
  audio.loop = loop;
  audio.volume = this.masterVolume * this.musicVolume;
  this.music = audio;
  audio.play().catch(() => {}); // нужно взаимодействие
}

stopMusic() {
  if (this.music) {
    this.music.pause();
    this.music = null;
  }
}
```

## Громкость

```ts
setMasterVolume(v: number) {
  this.masterVolume = v;
  this.save();
  // SFX воспроизводятся с текущей громкостью
  // Музыка — обновить
  if (this.music) this.music.volume = v * this.musicVolume;
}
```

## Ограничения

### iOS

- Звук нельзя играть до первого взаимодействия (autoplay policy)
- Решение: первый звук — на первый тап игрока

### Android

- Можно autoplay, но с user gesture
- Решение: то же, что iOS

### Yandex Games

- Обычно autoplay OK, но `ya-cxt-volume` может быть снижен
- Решение: проверять `window.YaGames?.environment?.i18n?.lang`

## Save состояния

```ts
// Сохранять в state
state.audio = {
  master: 0.7,
  sfx: 0.7,
  music: 0.3,
  muted: false,
};
```

## Когда играть

| Событие | Звук |
|---|---|
| Click | click |
| Coin | coin |
| Merge | merge |
| Sell | coin (тише) |
| Level up | levelup |
| Achievement | reward |
| Error | error |
| New slot | success |

## Чек-лист

- [ ] Прелоад при старте
- [ ] Master / SFX / Music — раздельные тумблеры
- [ ] Mute в настройках
- [ ] Не играть в первые 3 сек
- [ ] Сохранение настроек в save
- [ ] Autoplay policy соблюдён
