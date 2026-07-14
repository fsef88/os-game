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

    if ((window as unknown as { yaCounter?: { reachGoal: (name: string, props: Record<string, unknown>) => void } }).yaCounter) {
      (window as unknown as { yaCounter: { reachGoal: (name: string, props: Record<string, unknown>) => void } }).yaCounter.reachGoal(name, props);
    }

    this.increment(name);
  }

  increment(name: string, delta = 1) {
    this.counters[name] = (this.counters[name] || 0) + delta;
  }

  getCounters() {
    return { ...this.counters };
  }

  getEvents() {
    return [...this.events];
  }

  getSessionId() {
    return this.sessionId;
  }
}

export const analytics = new Analytics();

export const track = {
  gameStart: () => analytics.track('game_start'),
  gameReady: () => analytics.track('game_ready'),
  sessionStart: (sessionNumber: number) => analytics.track('session_start', { session_number: sessionNumber }),
  sessionEnd: (lengthMs: number) => analytics.track('session_end', { length_ms: lengthMs }),
  merge: (level: number, isRare: boolean) => analytics.track('merge', { level, is_rare: isRare }),
  sell: (level: number, money: number) => analytics.track('sell', { level, money }),
  cellUnlock: (index: number, cost: number) => analytics.track('cell_unlock', { index, cost }),
  rewardedShown: (type: string) => analytics.track('rewarded_shown', { type }),
  rewardedCompleted: (type: string) => analytics.track('rewarded_completed', { type }),
  rewardedClosed: () => analytics.track('rewarded_closed_early'),
  interstitialShown: (reason: string) => analytics.track('interstitial_shown', { reason }),
  dailyClaim: (day: number) => analytics.track('daily_claimed', { day }),
  offlineClaim: (amount: number) => analytics.track('offline_claimed', { amount }),
  levelUp: (level: number) => analytics.track('level_up', { level }),
  achievement: (id: string) => analytics.track('achievement', { id }),
  saveFailed: (reason: string) => analytics.track('save_failed', { reason }),
  loadFailed: (reason: string) => analytics.track('load_failed', { reason }),
  error: (message: string) => analytics.track('error', { message }),
};
