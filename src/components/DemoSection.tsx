import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

interface RiskData {
  safety_score: number;
  risk_breakdown: {
    sandwich_risk: number;
    liquidity_health: number;
    wallet_risk: number;
  };
  explanation: string;
  recommendation: string;
  recommendation_type: "safe" | "moderate" | "danger";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RiskBar({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between text-sm font-medium text-foreground-muted mb-2">
        <span className="font-mono">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="w-full bg-surface-highlight rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
}

function GaugeCircle({ score }: { score: number | null }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score ?? 0), 150);
    return () => clearTimeout(t);
  }, [score]);

  const circumference = 283;
  const offset = circumference - (animated / 100) * circumference;
  const color =
    animated >= 70
      ? "hsl(var(--risk-safe))"
      : animated >= 40
      ? "hsl(var(--risk-moderate))"
      : "hsl(var(--risk-danger))";
  const label =
    score === null
      ? "---"
      : animated >= 70
      ? "Low Risk"
      : animated >= 40
      ? "Moderate Risk"
      : "High Risk";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--surface-highlight))" strokeWidth="9" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s ease",
              filter: score !== null ? `drop-shadow(0 0 8px ${color})` : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold text-5xl"
            style={{ color: score !== null ? color : "hsl(var(--foreground-subtle))" }}
          >
            {score !== null ? animated : "–"}
          </span>
          <span className="font-mono text-xs text-foreground-subtle mt-0.5">SAFETY</span>
        </div>
      </div>
      {score !== null && (
        <div
          className={`mt-2 font-mono text-sm font-bold px-3 py-1 rounded-full border ${
            animated >= 70
              ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe"
              : animated >= 40
              ? "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate"
              : "border-risk-danger/30 bg-risk-danger/10 text-risk-danger"
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DemoSection() {
  const [pair, setPair]     = useState("ONE_USDC");
  const [amount, setAmount] = useState(1000);
  const [wallet, setWallet] = useState("normal");
  const [result, setResult] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<"live" | "offline" | "checking">("checking");

  const handleAssess = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("risk-assess", {
        body: { pair, amount, wallet, user_address: "0xdemo_user" },
      });
      if (error) throw error;
      setResult(data as RiskData);
      setApiStatus("live");
    } catch (err) {
      console.error("Edge function error:", err);
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { handleAssess(); }, []);

  const d = result;
  const sandwichColor =
    d && d.risk_breakdown.sandwich_risk > 40  ? "bg-risk-danger"   :
    d && d.risk_breakdown.sandwich_risk > 20  ? "bg-risk-moderate" : "bg-risk-safe";
  const liquidityColor =
    d && d.risk_breakdown.liquidity_health < 50 ? "bg-risk-danger"   :
    d && d.risk_breakdown.liquidity_health < 70 ? "bg-risk-moderate" : "bg-risk-safe";
  const walletColor =
    d && d.risk_breakdown.wallet_risk > 60 ? "bg-risk-danger"   :
    d && d.risk_breakdown.wallet_risk > 30 ? "bg-risk-moderate" : "bg-risk-safe";

  return (
    <section id="demo" className="py-24 relative hex-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="section-label mb-4">Interactive Demo</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            See The Oracle{" "}
            <span className="text-gradient">in Action</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Simulate a swap and get a real-time Safety Score — exactly like the live product experience inside OneDEX.
          </p>
          {/* Live API badge */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-2 h-2 rounded-full ${apiStatus === "live" ? "bg-risk-safe animate-pulse" : apiStatus === "offline" ? "bg-risk-danger" : "bg-foreground-subtle animate-pulse"}`} />
            <span className="font-mono text-xs text-foreground-subtle">
              {apiStatus === "live" ? "LIVE API — powered by Lovable Cloud Edge Functions" : apiStatus === "offline" ? "API OFFLINE" : "CONNECTING…"}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto glass-card rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left — inputs */}
            <div className="p-8 border-r border-border">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-display font-bold text-xl text-foreground">Swap Parameters</h3>
              </div>

              {/* Token pair */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground-muted mb-2">Token Pair</label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full p-3 bg-surface border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="ONE_USDC">ONE → USDC (Stable)</option>
                  <option value="ONE_BTC">ONE → BTC</option>
                  <option value="USDC_ONE">USDC → ONE</option>
                  <option value="ONE_ETH">ONE → ETH</option>
                  <option value="HIGH_RISK_PAIR">⚠ SHIT → USDC (High Risk)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Swap Amount — <span className="font-mono text-primary">{amount.toLocaleString()} ONE</span>
                </label>
                <input
                  type="range" min={0} max={10000} step={100} value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full mb-2"
                  style={{ accentColor: "hsl(var(--primary))" }}
                />
                <div className="flex justify-between text-xs font-mono text-foreground-subtle">
                  <span>0 ONE</span>
                  <span>10,000 ONE</span>
                </div>
                <p className="text-xs text-foreground-subtle mt-2">Larger amounts increase price impact and sandwich risk.</p>
              </div>

              {/* Wallet */}
              <div className="mb-7">
                <label className="block text-sm font-medium text-foreground-muted mb-2">Wallet Profile</label>
                <select
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="w-full p-3 bg-surface border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="normal">✅ Normal Trader (0x123…abc)</option>
                  <option value="new">🟡 New Wallet — First Trade</option>
                  <option value="suspicious">🔴 Suspicious History (OneID Flagged)</option>
                </select>
              </div>

              <button
                onClick={handleAssess}
                disabled={loading}
                className="w-full btn-primary py-3.5 rounded-xl text-base font-display font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing Mempool…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Assess Risk
                  </>
                )}
              </button>

              {/* Quick presets */}
              <div className="mt-5">
                <p className="text-xs text-foreground-subtle mb-2 font-mono">QUICK SCENARIOS</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Safe Swap",     pair: "ONE_USDC",       amount: 500,  wallet: "normal"     },
                    { label: "Large Trade",   pair: "ONE_USDC",       amount: 9000, wallet: "normal"     },
                    { label: "Risky Pair",    pair: "HIGH_RISK_PAIR", amount: 2000, wallet: "normal"     },
                    { label: "Flagged Wallet",pair: "ONE_USDC",       amount: 1000, wallet: "suspicious" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => { setPair(preset.pair); setAmount(preset.amount); setWallet(preset.wallet); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors font-mono"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — results */}
            <div className="p-8 bg-surface">
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${loading ? "bg-risk-moderate animate-pulse" : d ? "bg-risk-safe" : "bg-foreground-subtle"}`} />
                <h3 className="font-display font-bold text-xl text-foreground">Safety Score</h3>
              </div>

              {/* Gauge */}
              <div className="flex justify-center mb-6">
                <GaugeCircle score={loading ? null : d?.safety_score ?? null} />
              </div>

              {/* Bars */}
              <div className="space-y-4 mb-6">
                <RiskBar label="Sandwich Attack Risk"  value={loading ? 0 : d?.risk_breakdown.sandwich_risk   ?? 0} colorClass={sandwichColor} />
                <RiskBar label="Liquidity Pool Health" value={loading ? 0 : d?.risk_breakdown.liquidity_health ?? 0} colorClass={liquidityColor} />
                <RiskBar label="Wallet Risk Score"     value={loading ? 0 : d?.risk_breakdown.wallet_risk      ?? 0} colorClass={walletColor} />
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-surface-raised border border-border mb-3">
                <p className="text-xs font-mono text-foreground-muted mb-2">💡 AI EXPLANATION</p>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {loading ? "Scanning mempool and analyzing pool data…" : d?.explanation ?? "Select parameters and click Assess Risk."}
                </p>
              </div>

              {/* Recommendation */}
              {d && !loading && (
                <div
                  className={`p-4 rounded-xl border text-sm font-medium ${
                    d.recommendation_type === "safe"
                      ? "bg-risk-safe/10 border-risk-safe/25 text-risk-safe"
                      : d.recommendation_type === "moderate"
                      ? "bg-risk-moderate/10 border-risk-moderate/25 text-risk-moderate"
                      : "bg-risk-danger/10 border-risk-danger/25 text-risk-danger"
                  }`}
                >
                  <p className="font-mono text-xs mb-1 opacity-70">RECOMMENDATION</p>
                  {d.recommendation}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-foreground-subtle text-xs font-mono mt-6">
          ⚠ This demo calls a live edge function. The production version uses real-time mempool data and OnePredict AI models.
        </p>
      </div>
    </section>
  );
}
