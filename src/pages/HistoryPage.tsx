/**
 * HistoryPage — displays past risk assessments with full breakdown details and a trend chart.
 */
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useWallet";
import { isMockModeEnabled } from "@/lib/mockMode";
import { mockHistory } from "@/services/mockApi";
import {
  getSafetyBgClass,
  getSafetyLabel,
  formatDate,
  formatTime,
  formatRelative,
} from "@/lib/riskUtils";

interface HistoryEntry {
  id: string | number;
  token_in: string;
  token_out: string;
  amount_in: number;
  safety_score: number;
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
  created_at: string;
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${getSafetyBgClass(score)}`}
    >
      <span className="tabular-nums">{score}</span>
      <span className="opacity-70">·</span>
      <span>{getSafetyLabel(score)}</span>
    </span>
  );
}

function MiniBar({ value, colorFn }: { value: number; colorFn: (v: number) => string }) {
  return (
    <div className="w-full bg-surface-highlight rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${colorFn(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const sw = (v: number) => (v > 40 ? "bg-risk-danger" : v > 20 ? "bg-risk-moderate" : "bg-risk-safe");
const lq = (v: number) => (v < 50 ? "bg-risk-danger" : v < 70 ? "bg-risk-moderate" : "bg-risk-safe");
const wl = (v: number) => (v > 60 ? "bg-risk-danger" : v > 30 ? "bg-risk-moderate" : "bg-risk-safe");

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-2xl p-5 h-24 animate-pulse bg-surface-raised"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

// Custom tooltip for the chart
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const color =
    score >= 70
      ? "hsl(var(--risk-safe))"
      : score >= 40
      ? "hsl(var(--risk-moderate))"
      : "hsl(var(--risk-danger))";
  const label2 = score >= 70 ? "Safe" : score >= 40 ? "Moderate" : "High Risk";

  return (
    <div className="rounded-xl border border-border bg-surface-raised px-4 py-3 shadow-card text-sm">
      <p className="font-mono text-xs text-foreground-subtle mb-1">{label}</p>
      <p className="font-display font-bold" style={{ color }}>
        {score} <span className="text-xs font-mono font-normal">— {label2}</span>
      </p>
    </div>
  );
}

export default function HistoryPage() {
  const { address } = useWallet();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | number | null>(null);

  useEffect(() => {
    if (!address) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      if (isMockModeEnabled()) {
        await new Promise((r) => setTimeout(r, 400));
        setHistory(mockHistory as HistoryEntry[]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setHistory(data as HistoryEntry[]);
      setLoading(false);
    })();
  }, [address]);

  const safe = history.filter((h) => h.safety_score >= 70).length;
  const moderate = history.filter((h) => h.safety_score >= 40 && h.safety_score < 70).length;
  const danger = history.filter((h) => h.safety_score < 40).length;

  // Chart data — oldest first, abbreviated label
  const chartData = [...history]
    .reverse()
    .map((entry, i) => ({
      index: i + 1,
      label: `${entry.token_in}→${entry.token_out}`,
      time: formatDate(entry.created_at),
      score: entry.safety_score,
      sandwich: entry.sandwich_risk,
      liquidity: entry.liquidity_health,
      wallet: entry.wallet_risk,
    }));

  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.safety_score, 0) / history.length)
      : null;

  // Determine gradient stop color based on average
  const gradientId = "scoreGradient";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="section-label mb-4">On-Chain Records</div>
          <div className="section-label mb-4">On-Chain Records</div>
          <h1 className="font-display font-bold text-4xl mb-2">
            Assessment <span className="text-gradient">History</span>
          </h1>
          <p className="text-foreground-muted">All risk assessments logged from your swap sessions.</p>
        </div>

        {/* Stats row */}
        {!loading && history.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: "Avg Score", count: avgScore ?? "—", cls: "text-foreground", bg: "bg-surface-raised border-border" },
              { label: "Safe Swaps", count: safe, cls: "text-risk-safe", bg: "bg-risk-safe/10 border-risk-safe/20" },
              { label: "Moderate", count: moderate, cls: "text-risk-moderate", bg: "bg-risk-moderate/10 border-risk-moderate/20" },
              { label: "High Risk", count: danger, cls: "text-risk-danger", bg: "bg-risk-danger/10 border-risk-danger/20" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 border text-center ${s.bg}`}>
                <p className={`font-display font-bold text-2xl tabular-nums ${s.cls}`}>{s.count}</p>
                <p className="text-xs font-mono text-foreground-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Trend Chart ── */}
        {!loading && chartData.length >= 2 && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-mono text-foreground-subtle mb-1">RISK TREND</p>
                <h2 className="font-display font-semibold text-lg text-foreground">Safety Score Over Time</h2>
              </div>
              {avgScore !== null && (
                <div className="text-right">
                  <p className="text-xs font-mono text-foreground-subtle">AVERAGE</p>
                  <p
                    className="font-display font-bold text-2xl tabular-nums"
                    style={{
                      color:
                        avgScore >= 70
                          ? "hsl(var(--risk-safe))"
                          : avgScore >= 40
                          ? "hsl(var(--risk-moderate))"
                          : "hsl(var(--risk-danger))",
                    }}
                  >
                    {avgScore}
                  </p>
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--foreground-subtle))", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--foreground-subtle))", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 40, 70, 100]}
                />
                {/* Zone reference lines */}
                <ReferenceLine
                  y={70}
                  stroke="hsl(var(--risk-safe))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: "SAFE",
                    position: "right",
                    fill: "hsl(var(--risk-safe))",
                    fontSize: 9,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                <ReferenceLine
                  y={40}
                  stroke="hsl(var(--risk-danger))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: "DANGER",
                    position: "right",
                    fill: "hsl(var(--risk-danger))",
                    fontSize: 9,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                {avgScore !== null && (
                  <ReferenceLine
                    y={avgScore}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="6 3"
                    strokeOpacity={0.6}
                  />
                )}
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border-bright))", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const s = payload.score as number;
                    const c =
                      s >= 70
                        ? "hsl(var(--risk-safe))"
                        : s >= 40
                        ? "hsl(var(--risk-moderate))"
                        : "hsl(var(--risk-danger))";
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={c}
                        stroke="hsl(var(--surface-raised))"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--surface-raised))" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 justify-center">
              {[
                { color: "bg-risk-safe", label: "Safe (≥70)" },
                { color: "bg-risk-moderate", label: "Moderate (40–69)" },
                { color: "bg-risk-danger", label: "High Risk (<40)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-xs font-mono text-foreground-subtle">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <div className="glass-card rounded-2xl p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mx-auto mb-5">
              📜
            </div>
            <p className="font-display font-semibold text-lg text-foreground mb-2">No assessments yet</p>
            <p className="text-foreground-muted text-sm mb-6">
              Head to the demo and run your first risk assessment.
            </p>
            <a
              href="/#demo"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Try the Demo
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => {
              const isOpen = expanded === entry.id;
              return (
                <div
                  key={entry.id}
                  className="glass-card rounded-2xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                >
                  {/* Main row */}
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    {/* Swap */}
                    <div>
                      <p className="text-xs font-mono text-foreground-subtle mb-1">SWAP</p>
                      <p className="font-display font-semibold text-foreground">
                        {entry.token_in} → {entry.token_out}
                      </p>
                      <p className="text-xs font-mono text-foreground-muted mt-0.5">
                        {entry.amount_in.toLocaleString()} tokens
                      </p>
                    </div>

                    {/* Breakdown mini-bars */}
                    <div className="hidden md:block">
                      <p className="text-xs font-mono text-foreground-subtle mb-2">RISK BREAKDOWN</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-foreground-subtle w-6">SW</span>
                          <MiniBar value={entry.sandwich_risk} colorFn={sw} />
                          <span className="text-xs font-mono text-foreground-muted tabular-nums w-6 text-right">{entry.sandwich_risk}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-foreground-subtle w-6">LQ</span>
                          <MiniBar value={entry.liquidity_health} colorFn={lq} />
                          <span className="text-xs font-mono text-foreground-muted tabular-nums w-6 text-right">{entry.liquidity_health}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-foreground-subtle w-6">WL</span>
                          <MiniBar value={entry.wallet_risk} colorFn={wl} />
                          <span className="text-xs font-mono text-foreground-muted tabular-nums w-6 text-right">{entry.wallet_risk}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div>
                      <p className="text-xs font-mono text-foreground-subtle mb-2">SAFETY SCORE</p>
                      <ScoreBadge score={entry.safety_score} />
                    </div>

                    {/* Date + expand caret */}
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-foreground-muted font-mono">{formatRelative(entry.created_at)}</p>
                        <p className="text-xs text-foreground-subtle">{formatDate(entry.created_at)} · {formatTime(entry.created_at)}</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-foreground-subtle transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-border bg-surface px-5 py-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-mono text-foreground-subtle mb-1">🥪 SANDWICH RISK</p>
                        <p className={`font-mono font-bold text-lg tabular-nums ${sw(entry.sandwich_risk).replace("bg-", "text-")}`}>
                          {entry.sandwich_risk}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-foreground-subtle mb-1">💧 LIQUIDITY HEALTH</p>
                        <p className={`font-mono font-bold text-lg tabular-nums ${lq(entry.liquidity_health).replace("bg-", "text-")}`}>
                          {entry.liquidity_health}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-foreground-subtle mb-1">👛 WALLET RISK</p>
                        <p className={`font-mono font-bold text-lg tabular-nums ${wl(entry.wallet_risk).replace("bg-", "text-")}`}>
                          {entry.wallet_risk}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
