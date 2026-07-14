// Yandex SDK + Mock для локальной разработки.
// Адаптировано из merge-farm.

declare global {
  interface Window {
    YaGames?: any;
  }
}

export interface ISDK {
  isMock(): boolean;
  getLanguage(): string;
  notifyGameReady(): void;
  saveData(data: any): Promise<boolean>;
  getData(): Promise<any>;
  showRewarded(onReward: () => void, onClose?: () => void, onError?: (e: any) => void): void;
  showInterstitial(onClose: (wasShown: boolean) => void, onError?: (e: any) => void): void;
  setLeaderboardScore(name: string, score: number): Promise<boolean>;
  getLeaderboardEntries(name: string, count?: number): Promise<any[]>;
  getOwnUniqueId(): Promise<string>;
}

// ===== Real Yandex SDK =====
class YandexSDK implements ISDK {
  private sdk: any = null;
  private player: any = null;
  private adv: any = null;
  private lb: any = null;

  async init() {
    if (!window.YaGames) {
      console.warn('[SDK] YaGames not loaded, falling back to mock');
      throw new Error('YaGames not loaded');
    }
    this.sdk = await window.YaGames.init();
    this.player = this.sdk.getPlayer({ scopes: false });
    this.adv = this.sdk.getAdv();
    this.lb = await this.sdk.getLeaderboards();
    console.log('[SDK] Yandex initialized');
  }

  isMock() { return false; }
  getLanguage() { return this.sdk?.environment?.i18n?.lang || 'ru'; }
  notifyGameReady() { try { this.sdk?.features?.LoadingAPI?.ready(); } catch(e) {} }

  async saveData(data: any): Promise<boolean> {
    try {
      await this.player.setData(data, true);
      console.log('[SDK] Saved to cloud');
      return true;
    } catch (e) {
      console.error('[SDK] Save failed', e);
      return false;
    }
  }

  async getData(): Promise<any> {
    try {
      return await this.player.getData() || {};
    } catch (e) {
      console.error('[SDK] Load failed', e);
      return {};
    }
  }

  showRewarded(onReward: () => void, onClose?: () => void, onError?: (e: any) => void) {
    this.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => {},
        onRewarded: () => onReward?.(),
        onClose: () => onClose?.(),
        onError: (e: any) => onError?.(e),
      },
    });
  }

  showInterstitial(onClose: (wasShown: boolean) => void, onError?: (e: any) => void) {
    this.adv.showFullscreenAdv({
      callbacks: {
        onClose: (wasShown: boolean) => onClose?.(wasShown),
        onError: (e: any) => onError?.(e),
      },
    });
  }

  async setLeaderboardScore(name: string, score: number): Promise<boolean> {
    try {
      const lb = await this.lb.getLeaderboard(name);
      await lb.setScore(score);
      return true;
    } catch (e) { return false; }
  }

  async getLeaderboardEntries(name: string, count = 10) {
    try {
      const lb = await this.lb.getLeaderboard(name);
      const entries = await lb.getEntries({ quantityTop: count });
      return entries;
    } catch (e) { return []; }
  }

  async getOwnUniqueId(): Promise<string> {
    try { return (await this.player.getUniqueID()) || 'anonymous'; }
    catch (e) { return 'anonymous'; }
  }
}

// ===== Mock SDK для локальной разработки =====
class MockSDK implements ISDK {
  isMock() { return true; }
  getLanguage() { return 'ru'; }
  notifyGameReady() { console.log('[MockSDK] Game ready'); }

  async saveData(data: any): Promise<boolean> {
    try {
      localStorage.setItem('yandex_cloud_mock', JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  }

  async getData(): Promise<any> {
    try { return JSON.parse(localStorage.getItem('yandex_cloud_mock') || '{}'); }
    catch (e) { return {}; }
  }

  showRewarded(onReward: () => void, onClose?: () => void, _onError?: (e: any) => void) {
    console.log('[MockSDK] Rewarded ad shown');
    setTimeout(() => {
      if (confirm('[Mock] Смотреть рекламу до конца?')) {
        onReward?.();
      } else {
        onClose?.();
      }
    }, 100);
  }

  showInterstitial(onClose: (wasShown: boolean) => void, _onError?: (e: any) => void) {
    console.log('[MockSDK] Interstitial shown');
    setTimeout(() => onClose?.(true), 100);
  }

  async setLeaderboardScore(name: string, score: number): Promise<boolean> {
    const key = `lb_${name}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as Array<{
      name: string;
      score: number;
      isPlayer: boolean;
    }>;
    const entries = existing.length > 0 ? existing : [
      { name: 'ОгуречныйБарон', score: 100, isPlayer: false },
      { name: 'ЗеленыйПалец', score: 80, isPlayer: false },
      { name: 'FarmMaster99', score: 60, isPlayer: false },
    ];
    entries.push({ name: 'Ты', score, isPlayer: true });
    entries.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(entries.slice(0, 10)));
    return true;
  }

  async getLeaderboardEntries(name: string, count = 10) {
    const entries = JSON.parse(localStorage.getItem(`lb_${name}`) || '[]') as any[];
    return entries.slice(0, count);
  }

  async getOwnUniqueId(): Promise<string> {
    let id = localStorage.getItem('mock_user_id');
    if (!id) {
      id = 'mock_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mock_user_id', id);
    }
    return id;
  }
}

// ===== Wrapper: автоматический выбор =====
class SDKWrapper implements ISDK {
  private active: ISDK;
  private real: YandexSDK | null = null;

  constructor() {
    this.active = new MockSDK();
    if (window.YaGames) {
      this.real = new YandexSDK();
      this.real.init().then(() => {
        console.log('[SDK] Switched to real Yandex');
        this.active = this.real!;
        this.notifyGameReady();
      }).catch(() => {
        console.log('[SDK] Using mock');
      });
    } else {
      console.log('[SDK] YaGames not available, using mock');
    }
  }

  isMock() { return this.active.isMock(); }
  getLanguage() { return this.active.getLanguage(); }
  notifyGameReady() { this.active.notifyGameReady(); }
  async saveData(d: any) { return this.active.saveData(d); }
  async getData() { return this.active.getData(); }
  showRewarded(r: any, c: any, e: any) { this.active.showRewarded(r, c, e); }
  showInterstitial(c: any, e: any) { this.active.showInterstitial(c, e); }
  async setLeaderboardScore(n: string, s: number) { return this.active.setLeaderboardScore(n, s); }
  async getLeaderboardEntries(n: string, c?: number) { return this.active.getLeaderboardEntries(n, c); }
  async getOwnUniqueId() { return this.active.getOwnUniqueId(); }
}

export const sdk = new SDKWrapper();
