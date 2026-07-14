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
  private readonly maxLocal = 250;

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
  }
}

export const analytics = new Analytics();

export const track = {
  gameStart: () => analytics.track('game_start'),
  gameReady: () => analytics.track('game_ready'),
  sessionStart: (sessionNumber: number) => analytics.track('session_start', { session_number: sessionNumber }),
  sessionEnd: (lengthMs: number) => analytics.track('session_end', { length_ms: lengthMs }),
  ingredientGathered: (tier: number, rare: boolean) => analytics.track('ingredient_gathered', { tier, rare }),
  mergeSuccess: (tier: number) => analytics.track('merge_success', { result_tier: tier }),
  orderCompleted: (tier: number, reward: number) => analytics.track('order_completed', { tier, reward }),
  specialContractCompleted: (tier: number, reward: number) => analytics.track('special_contract_completed', { tier, reward }),
  cellUnlocked: (count: number) => analytics.track('cell_unlocked', { unlocked_cells: count }),
  catalystUpgraded: (level: number) => analytics.track('catalyst_upgraded', { level }),
  discoveryUnlocked: (tier: number) => analytics.track('discovery_unlocked', { tier }),
  missionClaimed: (id: string, reward: number) => analytics.track('mission_claimed', { id, reward }),
  dailyClaimed: (day: number, reward: number) => analytics.track('daily_claimed', { day, reward }),
  saveFailed: (reason: string) => analytics.track('save_failed', { reason }),
  loadFailed: (reason: string) => analytics.track('load_failed', { reason }),
};
