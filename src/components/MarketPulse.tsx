/**
 * MarketPulse — live risk overview for all major OneDEX pairs.
 * Fetches from the market-pulse edge function and auto-refreshes every 30s.
 */
import { useState, useEffect, useCallback } from "react";
import { getMarketPulse, type PairSnapshot } from "@/services/riskOracle";

function TierBadge({ tier }: { tier: PairSnapshot["tier"] }) {
  const cls =
    tier === "safe"     ? "bg-risk-safe/15 text-risk-safe border-risk-safe/25" :
    tier === "moderate" ? "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/25" :
                          "bg-risk-danger/15 text-risk-danger border-risk-danger/25";
  const label = tier === "safe" ? "Safe" : tier === "moderate" ? "Caution" : "High Risk";
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function ScoreArc({ score }: { score: number }) {
  const color =
    score >= 70 ? "hsl(var(--risk-safe))" :
    score >= 40 ? "hsl(var(--risk-moderate))" :
                  "hsl(var(--risk-danger))";
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} fontFamily="monospace">
        {score}
      </text>
    </svg>
  );
}

function PairCard({ snap }: { snap: PairSnapshot }) {
  const changeColor = snap.price_change_24h >= 0 ? "text-risk-safe" : "text-risk-danger";
  const changeSign  = snap.price_change_24h >= 0 ? "+" : "";
  const tvl = snap.pool_tvl_usd >= 1_000_000
    ? `$${(snap.pool_tvl_usd / 1_000_000).toFixed(1)}M`
    : `$${(snap.pool_tvl_usd / 1000).toFixed(0)}K`;

  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all group">
      <ScoreArc score={snap.safety_score} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display font-semibold text-foreground text-sm">{snap.label}</span>
          <TierBadge tier={snap.tier} />
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-foreground-subtle flex-wrap">
          <span>TVL {tvl}</span>
          <span>·</span>
          <span>SW {snap.sandwich_risk}</span>
          <span>·</span>
          <span>LQ {snap.liquidity_health}</span>
          <span>·</span>
          <span className={changeColor}>{changeSign}{snap.price_change_24h}%</span>
        </div>
      </div>
    </div>
  );
}

function PulseSkeletons() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-4 h-16 animate-pulse bg-surface-raised" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </>
  );
}

export default function MarketPulse() {
  const [pairs, setPairs]           = useState<PairSnapshot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError]           = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await getMarketPulse();
      setPairs(res.pairs);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const safe     = pairs.filter((p) => p.tier === "safe").length;
  const moderate = pairs.filter((p) => p.tier === "moderate").length;
  const danger   = pairs.filter((p) => p.tier === "danger").length;

  return (
    <section className="py-20 bg-background" id="market">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="section-label mb-3">Live Data</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              Market <span className="text-gradient">Pulse</span>
            </h2>
            <p className="text-foreground-muted mt-2 text-sm">
              Real-time risk snapshots across all major OneDEX pairs. Refreshes every 30s.
            </p>
          </div>

          {/* Summary chips */}
          {!loading && pairs.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {safe     > 0 && <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-risk-safe/15 text-risk-safe border border-risk-safe/25">{safe} Safe</span>}
              {moderate > 0 && <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-risk-moderate/15 text-risk-moderate border border-risk-moderate/25">{moderate} Caution</span>}
              {danger   > 0 && <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-risk-danger/15 text-risk-danger border border-risk-danger/25">{danger} High Risk</span>}
            </div>
          )}
        </div>

        {/* Pair grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {loading ? <PulseSkeletons /> : error ? (
            <div className="col-span-2 glass-card rounded-2xl p-8 text-center">
              <p className="text-foreground-muted text-sm">Could not load market data.</p>
              <button onClick={refresh} className="mt-3 text-xs font-mono text-primary hover:underline">Retry</button>
            </div>
          ) : (
            pairs.map((snap) => <PairCard key={snap.pair} snap={snap} />)
          )}
        </div>

        {/* Footer */}
        {lastUpdated && (
          <div className="flex items-center gap-2 justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-safe animate-pulse" />
            <span className="text-[11px] font-mono text-foreground-subtle">
              Updated {lastUpdated.toLocaleTimeString()} · Powered by market-pulse edge function
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
