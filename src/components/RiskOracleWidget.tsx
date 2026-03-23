import { useState, useEffect } from "react";
import RiskGauge from "./RiskGauge";
import RiskBreakdown, { BreakdownData } from "./RiskBreakdown";
import AlternativeSuggestions from "./AlternativeSuggestions";
import { assessRisk, type RiskRequest } from "@/services/riskOracle";
import { useRiskWebSocket } from "@/hooks/useRiskWebSocket";
import { isMockModeEnabled } from "@/lib/mockMode";

export interface RiskData {
  safety_score: number;
  risk_breakdown: BreakdownData;
  explanation: string;
  recommendation: string;
  recommendation_type: "safe" | "moderate" | "danger";
}

export interface RiskOracleWidgetProps {
  pair: string;
  amount: number;
  wallet: string;
  /** Called after a successful assessment */
  onResult?: (data: RiskData) => void;
  /** Show compact layout (no section label / description) */
  compact?: boolean;
}

const PAIRS = [
  { value: "ONE_USDC", label: "ONE → USDC (Stable)" },
  { value: "ONE_BTC",  label: "ONE → BTC" },
  { value: "USDC_ONE", label: "USDC → ONE" },
  { value: "ONE_ETH",  label: "ONE → ETH" },
  { value: "HIGH_RISK_PAIR", label: "⚠ SHIT → USDC (High Risk)" },
];

const WALLETS = [
  { value: "normal",     label: "✅ Normal Trader (0x123…abc)" },
  { value: "new",        label: "🟡 New Wallet — First Trade" },
  { value: "suspicious", label: "🔴 Suspicious History (OneID Flagged)" },
];

const PRESETS = [
  { label: "Safe Swap",      pair: "ONE_USDC",       amount: 500,  wallet: "normal"     },
  { label: "Large Trade",    pair: "ONE_USDC",       amount: 9000, wallet: "normal"     },
  { label: "Risky Pair",     pair: "HIGH_RISK_PAIR", amount: 2000, wallet: "normal"     },
  { label: "Flagged Wallet", pair: "ONE_USDC",       amount: 1000, wallet: "suspicious" },
];

export default function RiskOracleWidget({
  pair: initialPair,
  amount: initialAmount,
  wallet: initialWallet,
  onResult,
  compact = false,
}: RiskOracleWidgetProps) {
  const [pair,   setPair]   = useState(initialPair);
  const [amount, setAmount] = useState(initialAmount);
  const [wallet, setWallet] = useState(initialWallet);

  const [result,    setResult]    = useState<RiskData | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [apiStatus, setApiStatus] = useState<"live" | "offline" | "checking">("checking");
  const [whatIfAmount, setWhatIfAmount] = useState(initialAmount);
  const [whatIfRisk, setWhatIfRisk] = useState<RiskData | null>(null);
  const [simulating, setSimulating] = useState(false);
  const wsUpdate = useRiskWebSocket("0xdemo_user");

  useEffect(() => {
    setWhatIfAmount(amount);
    setWhatIfRisk(null);
  }, [amount]);

  const assess = async () => {
    setLoading(true);
    setResult(null);
    try {
      const [tokenIn = "ONE", tokenOut = "USDC"] = pair.split("_");
      const data = await assessRisk({
        user_address: "0xdemo_user",
        token_in: tokenIn,
        token_out: tokenOut,
        amount_in: amount,
        signature: "demo_signature",
        nonce: String(Date.now()),
      });
      const d = data as RiskData;
      setResult(d);
      setApiStatus(isMockModeEnabled() ? "offline" : "live");
      onResult?.(d);
    } catch (err) {
      console.error("Edge function error:", err);
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on initial mount
  useEffect(() => { assess(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (whatIfAmount === amount) return;
    const timer = setTimeout(async () => {
      setSimulating(true);
      try {
        const [tokenIn = "ONE", tokenOut = "USDC"] = pair.split("_");
        const data = await assessRisk({
          user_address: "0xdemo_user",
          token_in: tokenIn,
          token_out: tokenOut,
          amount_in: whatIfAmount,
          signature: "demo_signature",
          nonce: String(Date.now()),
        });
        setWhatIfRisk(data);
      } catch (err) {
        console.error("What-if simulation failed", err);
      } finally {
        setSimulating(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [whatIfAmount, amount, pair]);

  const recTypeCls = result
    ? result.recommendation_type === "safe"
      ? "bg-risk-safe/10 border-risk-safe/25 text-risk-safe"
      : result.recommendation_type === "moderate"
      ? "bg-risk-moderate/10 border-risk-moderate/25 text-risk-moderate"
      : "bg-risk-danger/10 border-risk-danger/25 text-risk-danger"
    : "";

  const inputCls =
    "w-full p-3 bg-surface border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* ── Left: inputs ── */}
        <div className="p-7 border-r border-border flex flex-col gap-5">
          {!compact && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h3 className="font-display font-bold text-xl text-foreground">Swap Parameters</h3>
            </div>
          )}

          {/* Token pair */}
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">Token Pair</label>
            <select value={pair} onChange={(e) => setPair(e.target.value)} className={inputCls}>
              {PAIRS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Amount slider */}
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">
              Swap Amount —{" "}
              <span className="font-mono text-primary">{amount.toLocaleString()} ONE</span>
            </label>
            <input
              type="range" min={0} max={10000} step={100} value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mb-1"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <div className="flex justify-between text-xs font-mono text-foreground-subtle">
              <span>0 ONE</span><span>10,000 ONE</span>
            </div>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">Wallet Profile</label>
            <select value={wallet} onChange={(e) => setWallet(e.target.value)} className={inputCls}>
              {WALLETS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>

          {/* Assess button */}
          <button
            onClick={assess}
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded-xl font-display font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analyzing Mempool…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Assess Risk
              </>
            )}
          </button>

          {/* Quick presets */}
          <div>
            <p className="text-xs text-foreground-subtle mb-2 font-mono">QUICK SCENARIOS</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setPair(p.pair); setAmount(p.amount); setWallet(p.wallet); }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors font-mono"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* API status pill */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              apiStatus === "live"    ? "bg-risk-safe animate-pulse" :
              apiStatus === "offline" ? "bg-risk-danger" :
              "bg-foreground-subtle animate-pulse"
            }`} />
            <span className="font-mono text-[10px] text-foreground-subtle">
              {apiStatus === "live"    ? "LIVE API — Lovable Cloud Edge Functions" :
               apiStatus === "offline" ? "DEMO MODE — Mock Data Active" :
               "CONNECTING…"}
            </span>
          </div>
        </div>

        {/* ── Right: results ── */}
        <div className="p-7 bg-surface flex flex-col gap-5">
          {!compact && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                loading ? "bg-risk-moderate animate-pulse" :
                result  ? "bg-risk-safe" :
                "bg-foreground-subtle"
              }`} />
              <h3 className="font-display font-bold text-xl text-foreground">Safety Score</h3>
            </div>
          )}

          {/* Gauge */}
          <div className="flex justify-center">
            <RiskGauge score={result?.safety_score ?? null} loading={loading} size="lg" />
          </div>

          {/* Breakdown bars */}
          <RiskBreakdown data={result?.risk_breakdown ?? null} loading={loading} />

          {wsUpdate && (
            <div className="p-3 rounded-xl border border-risk-moderate/30 bg-risk-moderate/10">
              <p className="text-xs font-mono text-risk-moderate mb-1">LIVE UPDATE</p>
              <p className="text-sm text-foreground-muted">
                New risk signal detected.
                {typeof wsUpdate.safety_score === "number" ? ` Safety now ${wsUpdate.safety_score}.` : ""}
              </p>
            </div>
          )}

          {/* AI Explanation */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <p className="text-xs font-mono text-foreground-muted mb-1.5">💡 AI EXPLANATION</p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              {loading
                ? "Scanning mempool and analyzing pool data…"
                : result?.explanation ?? "Select parameters and click Assess Risk."}
            </p>
            {result && !loading && (
              <p className="text-xs text-foreground-subtle mt-2">
                Decision assistant:{" "}
                {result.safety_score >= 70
                  ? "Proceed; current setup appears stable."
                  : result.safety_score >= 40
                    ? "Caution: reduce size or wait for lower congestion."
                    : "High risk: use alternatives before submitting this swap."}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <p className="text-xs font-mono text-foreground-muted mb-1.5">WHAT-IF SIMULATOR</p>
            <label className="block text-sm text-foreground-muted">
              Try different amount: <span className="font-mono text-primary">{whatIfAmount.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={Math.max(100, amount * 2)}
              step={Math.max(1, amount / 20)}
              value={whatIfAmount}
              onChange={(e) => setWhatIfAmount(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <div className="flex justify-between text-xs text-foreground-subtle mt-1">
              <span>0</span>
              <span>{whatIfAmount.toFixed(2)}</span>
              <span>{(amount * 2).toFixed(2)}</span>
            </div>
            {simulating && <p className="text-xs text-foreground-subtle mt-2">Recalculating...</p>}
            {whatIfRisk && !simulating && (
              <p className="text-xs text-foreground-muted mt-2">
                Simulated safety: <span className="font-mono text-primary">{whatIfRisk.safety_score}</span> —{" "}
                {whatIfRisk.recommendation}
              </p>
            )}
          </div>

          <AlternativeSuggestions
            request={{
              user_address: "0xdemo_user",
              token_in: pair.split("_")[0] ?? "ONE",
              token_out: pair.split("_")[1] ?? "USDC",
              amount_in: amount,
              signature: "demo_signature",
              nonce: "demo_nonce",
            } satisfies RiskRequest}
            onSelect={(suggestion) => {
              if (typeof suggestion.amount === "number") {
                setAmount(suggestion.amount);
                setWhatIfAmount(suggestion.amount);
              }
            }}
          />

          {/* Recommendation */}
          {result && !loading && (
            <div className={`p-4 rounded-xl border text-sm font-medium ${recTypeCls}`}>
              <p className="font-mono text-xs mb-1 opacity-70">RECOMMENDATION</p>
              {result.recommendation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
