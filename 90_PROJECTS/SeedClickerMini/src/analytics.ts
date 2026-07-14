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
  private counters: Record<string, number> = {};
  private readonly maxLocal = 200;

  constructor() {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sdk.getOwnUniqueId().then((id) => {
      this.userId = id;
    }).catch(() => {
      this.userId = 'anonymous';
    });
  }

  track(name: string, props: Record<string, unknown> = {}) {
    const event: AnalyticsEvent = {
      name,
      props,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    if (this.events.length > this.maxLocal) {
      this.events.shift();
    }

    this.counters[name] = (this.counters[name] || 0) + 1;
  }
}

export const analytics = new Analytics();

export const track = {
  gameStart: () => analytics.track('game_start'),
  gameReady: () => analytics.track('game_ready'),
  sessionStart: (sessionNumber: number) => analytics.track('session_start', { session_number: sessionNumber }),
  sessionEnd: (lengthMs: number) => analytics.track('session_end', { length_ms: lengthMs }),
  tapSeed: (tapPower: number, totalTaps: number) => analytics.track('tap_seed', { tap_power: tapPower, total_taps: totalTaps }),
  buyTapUpgrade: (level: number, cost: number) => analytics.track('buy_tap_upgrade', { level, cost }),
  buyAutoIncome: (level: number, cost: number) => analytics.track('buy_auto_income', { level, cost }),
  saveFailed: (reason: string) => analytics.track('save_failed', { reason }),
  loadFailed: (reason: string) => analytics.track('load_failed', { reason }),
};
