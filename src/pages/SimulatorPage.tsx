import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import RiskGauge from "@/components/RiskGauge";
import RiskBreakdown from "@/components/RiskBreakdown";
import { useState, useMemo } from "react";

const PAIRS = ["ONE/USDC", "ONE/BTC", "HIGHRISK/USDC", "OCT/USDO", "WBTC/USDO"];
const VOLATILITY_OPTIONS = ["low", "medium", "high"] as const;
const WALLET_PROFILES = ["new", "normal", "flagged"] as const;

type Volatility = typeof VOLATILITY_OPTIONS[number];
type WalletProfile = typeof WALLET_PROFILES[number];

interface SimResult {
  safetyScore: number;
  sandwich: number;
  liquidity: number;
  walletRisk: number;
  explanation: string;
  recommendation: string;
}

function simulateRisk(pair: string, amount: number, vol: Volatility, wallet: WalletProfile, hops: number): SimResult {
  const pairUpper = pair.toUpperCase();
  let baseSandwich = pairUpper.includes("HIGHRISK") ? 70 : pairUpper.includes("BTC") ? 45 : 15;
  let baseLiquidity = pairUpper.includes("HIGHRISK") ? 30 : pairUpper.includes("BTC") ? 65 : 90;
  const volMod = vol === "high" ? 25 : vol === "medium" ? 10 : 0;
  baseSandwich = Math.min(100, baseSandwich + volMod + Math.min(amount / 500, 20));
  baseLiquidity = Math.max(0, baseLiquidity - volMod - Math.min(amount / 1000, 15));
  const walletScore = wallet === "flagged" ? 65 : wallet === "new" ? 35 : 10;
  const hopPenalty = Math.min((hops - 1) * 8, 30);
  const riskScore = 0.4 * baseSandwich + 0.3 * (100 - baseLiquidity) + 0.2 * walletScore + 0.1 * hopPenalty;
  const safety = Math.round(Math.max(0, Math.min(100, 100 - riskScore)));

  const explanation = safety >= 70
    ? "This swap appears safe with good liquidity and low MEV exposure."
    : safety >= 40
    ? "Moderate risk detected — consider reducing amount or choosing a more liquid pair."
    : "High risk — significant MEV exposure and thin liquidity. Proceed with extreme caution.";

  const recommendation = safety >= 70 ? "Proceed" : safety >= 40 ? "Caution" : "Avoid";

  return {
    safetyScore: safety,
    sandwich: Math.round(baseSandwich),
    liquidity: Math.round(baseLiquidity),
    walletRisk: Math.round(walletScore),
    explanation,
    recommendation,
  };
}

export default function SimulatorPage() {
  const [pair, setPair] = useState(PAIRS[0]);
  const [amount, setAmount] = useState(500);
  const [volatility, setVolatility] = useState<Volatility>("low");
  const [walletProfile, setWalletProfile] = useState<WalletProfile>("normal");
  const [hops, setHops] = useState(1);

  const result = useMemo(() => simulateRisk(pair, amount, volatility, walletProfile, hops), [pair, amount, volatility, walletProfile, hops]);

  const toggleCls = (active: boolean) =>
    active
      ? "bg-primary/20 border-primary text-primary"
      : "bg-surface border-border text-foreground-muted hover:border-primary/40";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />

      <section className="pt-28 pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Simulator</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-4">
            What If? <span className="text-gradient">Risk Sandbox</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Experiment with arbitrary swaps, volatility regimes, and wallet profiles — entirely client-side.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="glass-card rounded-2xl p-8 border border-border space-y-6">
              <div>
                <label className="block text-foreground-muted text-sm font-mono mb-2">Token Pair</label>
                <div className="flex flex-wrap gap-2">
                  {PAIRS.map((p) => (
                    <button key={p} onClick={() => setPair(p)} className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${toggleCls(pair === p)}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-foreground-muted text-sm font-mono mb-2">Amount: {amount}</label>
                <input type="range" min={10} max={10000} step={10} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full accent-primary" />
              </div>

              <div>
                <label className="block text-foreground-muted text-sm font-mono mb-2">Volatility Scenario</label>
                <div className="flex gap-2">
                  {VOLATILITY_OPTIONS.map((v) => (
                    <button key={v} onClick={() => setVolatility(v)} className={`px-4 py-2 rounded-lg border text-sm font-mono capitalize transition-colors ${toggleCls(volatility === v)}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-foreground-muted text-sm font-mono mb-2">Wallet Profile</label>
                <div className="flex gap-2">
                  {WALLET_PROFILES.map((w) => (
                    <button key={w} onClick={() => setWalletProfile(w)} className={`px-4 py-2 rounded-lg border text-sm font-mono capitalize transition-colors ${toggleCls(walletProfile === w)}`}>{w}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-foreground-muted text-sm font-mono mb-2">Transfer Hops: {hops}</label>
                <input type="range" min={1} max={5} step={1} value={hops} onChange={(e) => setHops(+e.target.value)} className="w-full accent-primary" />
              </div>
            </div>

            {/* Result */}
            <div className="glass-card rounded-2xl p-8 border border-border flex flex-col items-center gap-6">
              <RiskGauge score={result.safetyScore} size="lg" />
              <RiskBreakdown data={{ sandwich_risk: result.sandwich, liquidity_health: result.liquidity, wallet_risk: result.walletRisk }} />
              <div className="text-center mt-4">
                <span className={`inline-block font-mono text-xs font-bold px-4 py-1.5 rounded-full border ${
                  result.safetyScore >= 70
                    ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe"
                    : result.safetyScore >= 40
                    ? "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate"
                    : "border-risk-danger/30 bg-risk-danger/10 text-risk-danger"
                }`}>
                  {result.recommendation}
                </span>
                <p className="text-foreground-muted text-sm mt-4 max-w-md">{result.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
