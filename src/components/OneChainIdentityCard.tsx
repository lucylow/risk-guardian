/**
 * OneChainIdentityCard — displays OneID profile, wallet info, and gamification badges.
 */

import type { OneIdProfile, GamificationProfile } from "@/onechain/types";

interface Props {
  oneId: OneIdProfile | null;
  gamification: GamificationProfile | null;
  shortAddress: string | null;
  usdoBalance: string | null;
  octBalance: string | null;
  zeroGasEligible: boolean;
}

const TIER_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  veteran: { label: "Veteran Trader", color: "text-risk-safe", bg: "bg-risk-safe/10" },
  active:  { label: "Active Trader", color: "text-accent", bg: "bg-accent/10" },
  new:     { label: "New Wallet", color: "text-risk-moderate", bg: "bg-risk-moderate/10" },
  flagged: { label: "⚠ Flagged", color: "text-risk-danger", bg: "bg-risk-danger/10" },
};

export default function OneChainIdentityCard({
  oneId,
  gamification,
  shortAddress,
  usdoBalance,
  octBalance,
  zeroGasEligible,
}: Props) {
  if (!oneId) return null;

  const tier = TIER_STYLES[oneId.reputationTier] ?? TIER_STYLES.new;

  return (
    <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
      {/* Identity header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-lg">
            🪪
          </div>
          <div>
            <div className="font-display font-bold text-foreground text-sm">
              @{oneId.id}
            </div>
            <div className="text-xs text-foreground-muted">{shortAddress}</div>
          </div>
        </div>
        <span className={`text-xs font-mono px-2 py-1 rounded-lg ${tier.bg} ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-3 border border-border">
          <div className="text-xs text-foreground-muted mb-1">USDO Balance</div>
          <div className="font-display font-bold text-foreground text-sm">
            ${usdoBalance ?? "—"}
          </div>
        </div>
        <div className="glass-card rounded-xl p-3 border border-border">
          <div className="text-xs text-foreground-muted mb-1">OCT Balance</div>
          <div className="font-display font-bold text-foreground text-sm">
            {octBalance ?? "—"}
          </div>
        </div>
      </div>

      {/* Zero Gas badge */}
      {zeroGasEligible && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-risk-safe/10 border border-risk-safe/20">
          <span className="text-sm">⛽</span>
          <span className="text-xs font-mono text-risk-safe">Zero Gas Mode Eligible</span>
        </div>
      )}

      {/* Linked chains */}
      <div>
        <div className="text-xs text-foreground-muted mb-2">Linked Chains ({oneId.linkedWallets.length})</div>
        <div className="flex flex-wrap gap-1.5">
          {oneId.linkedWallets.map((w) => (
            <span
              key={`${w.chain}-${w.address}`}
              className="text-xs px-2 py-1 rounded-md bg-surface-highlight text-foreground-muted border border-border"
            >
              {w.chain}
            </span>
          ))}
        </div>
      </div>

      {/* Gamification */}
      {gamification && gamification.badges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-foreground-muted">
              Badges · Level {gamification.level}
            </div>
            <div className="text-xs font-mono text-accent">
              {gamification.xp.toLocaleString()} XP
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {gamification.badges.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-highlight border border-border text-xs"
                title={b.description}
              >
                <span>{b.icon}</span>
                <span className="text-foreground-muted">{b.name}</span>
              </div>
            ))}
          </div>
          {gamification.safeTradeStreak > 0 && (
            <div className="mt-2 text-xs text-risk-safe font-mono">
              🔥 {gamification.safeTradeStreak} safe trade streak
            </div>
          )}
        </div>
      )}

      {/* Risk flags */}
      {oneId.riskFlags.length > 0 && (
        <div className="px-3 py-2 rounded-lg bg-risk-danger/10 border border-risk-danger/20">
          <div className="text-xs font-mono text-risk-danger mb-1">⚠ Risk Flags</div>
          <div className="flex flex-wrap gap-1.5">
            {oneId.riskFlags.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded bg-risk-danger/20 text-risk-danger">
                {f.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
