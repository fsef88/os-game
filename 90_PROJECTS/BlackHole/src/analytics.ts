import { sdk } from './sdk';

interface AnalyticsEvent {
  name: string;
  props: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId = 'anonymous';
  private readonly maxLocal = 200;

  constructor() {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sdk.getOwnUniqueId().then((id) => { this.userId = id; }).catch(() => { this.userId = 'anonymous'; });
  }

  track(name: string, props: Record<string, unknown> = {}) {
    const event: AnalyticsEvent = { name, props, timestamp: Date.now(), userId: this.userId, sessionId: this.sessionId };
    this.events.push(event);
    if (this.events.length > this.maxLocal) this.events.shift();
  }
}

export const analytics = new Analytics();
export const track = {
  gameStart: () => analytics.track('game_start'),
  sessionStart: (n: number) => analytics.track('session_start', { session_number: n }),
  sessionEnd: (ms: number) => analytics.track('session_end', { length_ms: ms }),
  objectAbsorbed: (label: string, combo: number) => analytics.track('object_absorbed', { label, combo }),
  sizeUp: (level: number) => analytics.track('size_up', { level }),
  districtUp: (district: string) => analytics.track('district_up', { district }),
  heavyHit: (label: string) => analytics.track('heavy_hit', { label }),
  win: (mass: number) => analytics.track('win', { mass }),
  lose: (mass: number) => analytics.track('lose', { mass }),
  saveFailed: (reason: string) => analytics.track('save_failed', { reason }),
  loadFailed: (reason: string) => analytics.track('load_failed', { reason }),
};
