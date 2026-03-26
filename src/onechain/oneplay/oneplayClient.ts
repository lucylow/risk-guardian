/**
 * OnePlay / OnePoker adapter — GameFi hooks for gamification UI surfaces.
 */

import type { GamificationProfile, GamificationBadge } from "../types";

const DEMO_BADGES: GamificationBadge[] = [
  { id: "safe_5", name: "Safety Streak ×5", icon: "🛡️", earnedAt: "2025-12-01T00:00:00Z", description: "5 consecutive safe trades" },
  { id: "explorer", name: "Chain Explorer", icon: "🌐", earnedAt: "2025-11-15T00:00:00Z", description: "Traded on 3+ chains via OneID" },
  { id: "whale", name: "Whale Watcher", icon: "🐋", earnedAt: "2026-01-10T00:00:00Z", description: "Assessed a trade over $50,000" },
  { id: "oracle_user", name: "Oracle Disciple", icon: "🔮", earnedAt: "2026-02-20T00:00:00Z", description: "Used Risk Oracle 50+ times" },
];

export async function getGamificationProfile(
  address: string
): Promise<GamificationProfile> {
  await new Promise((r) => setTimeout(r, 80));

  if (address.startsWith("0x1234")) {
    return {
      safeTradeStreak: 12,
      totalTrades: 87,
      badges: DEMO_BADGES,
      xp: 4_250,
      level: 7,
      activeQuests: ["Complete 3 risk assessments today", "Trade a new pair"],
    };
  }

  return {
    safeTradeStreak: 0,
    totalTrades: 0,
    badges: [],
    xp: 0,
    level: 1,
    activeQuests: ["Connect OneWallet to get started"],
  };
}
