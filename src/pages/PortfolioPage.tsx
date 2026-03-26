import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import RiskGauge from "@/components/RiskGauge";
import { useOneWallet } from "@/hooks/useOneWallet";
import { useState, useEffect } from "react";

interface TokenHolding {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  riskScore: number;
}

interface LiquidityPosition {
  pair: string;
  tvl: number;
  share: number;
  ilRisk: "low" | "medium" | "high";
}

const MOCK_TOKENS: TokenHolding[] = [
  { symbol: "ONE", name: "OneChain", balance: "12,500", usdValue: 3125, riskScore: 82 },
  { symbol: "USDO", name: "OneChain USD", balance: "2,450.00", usdValue: 2450, riskScore: 95 },
  { symbol: "OCT", name: "OneChain Token", balance: "15,320", usdValue: 1532, riskScore: 68 },
  { symbol: "WBTC", name: "Wrapped BTC", balance: "0.045", usdValue: 4500, riskScore: 74 },
];

const MOCK_LP: LiquidityPosition[] = [
  { pair: "ONE/USDO", tvl: 2400000, share: 0.12, ilRisk: "low" },
  { pair: "OCT/ONE", tvl: 890000, share: 0.08, ilRisk: "medium" },
  { pair: "WBTC/USDO", tvl: 5600000, share: 0.03, ilRisk: "high" },
];

const MOCK_RWA = {
  totalUsd: 8500,
  assets: 3,
  diversificationIndex: 72,
  collateralized: true,
};

function riskBadge(score: number) {
  if (score >= 70) return "border-risk-safe/30 bg-risk-safe/10 text-risk-safe";
  if (score >= 40) return "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate";
  return "border-risk-danger/30 bg-risk-danger/10 text-risk-danger";
}

function ilBadge(level: string) {
  const map: Record<string, string> = {
    low: "border-risk-safe/30 bg-risk-safe/10 text-risk-safe",
    medium: "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate",
    high: "border-risk-danger/30 bg-risk-danger/10 text-risk-danger",
  };
  return map[level] ?? map.low;
}

export default function PortfolioPage() {
  const { address, shortAddress, oneId, isConnected } = useOneWallet();
  const [aggregateScore] = useState(76);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Portfolio</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-4">
            Your Risk <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            A holistic view of your OneChain holdings, liquidity positions, and RWA exposure — all scored for risk.
          </p>
        </div>
      </section>

      {/* Wallet banner + aggregate gauge */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 border border-border flex flex-col md:flex-row items-center gap-8">
            <RiskGauge score={aggregateScore} size="md" />
            <div className="flex-1 text-center md:text-left">
              <p className="text-foreground-muted text-sm font-mono mb-1">Connected Wallet</p>
              <p className="font-display font-bold text-xl text-foreground">
                {oneId ? `@${oneId.displayName}` : shortAddress ?? "Not connected"}
              </p>
              {oneId && (
                <span className="inline-block mt-2 text-xs font-mono px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent">
                  {oneId.reputationTier} · {oneId.crossChainActivity}% cross-chain
                </span>
              )}
              <p className="text-foreground-subtle text-sm mt-3">
                Aggregate Safety Score across all positions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Holdings */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-6">Spot Holdings</h2>
          <div className="grid gap-3">
            {MOCK_TOKENS.map((t) => (
              <div key={t.symbol} className="glass-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center font-display font-bold text-sm text-foreground">
                    {t.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">{t.symbol}</p>
                    <p className="text-foreground-subtle text-xs">{t.name}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="font-mono text-sm text-foreground">{t.balance}</p>
                    <p className="text-foreground-subtle text-xs">${t.usdValue.toLocaleString()}</p>
                  </div>
                  <span className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${riskBadge(t.riskScore)}`}>
                    {t.riskScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Liquidity Positions */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-6">Liquidity Positions</h2>
          <div className="grid gap-3">
            {MOCK_LP.map((lp) => (
              <div key={lp.pair} className="glass-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-foreground">{lp.pair}</p>
                  <p className="text-foreground-subtle text-xs">TVL ${(lp.tvl / 1e6).toFixed(1)}M · {(lp.share * 100).toFixed(2)}% share</p>
                </div>
                <span className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${ilBadge(lp.ilRisk)}`}>
                  IL Risk: {lp.ilRisk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RWA Exposure */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-6">RWA Exposure</h2>
          <div className="glass-card rounded-2xl p-8 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-foreground-subtle text-xs font-mono mb-1">Total USD</p>
                <p className="font-display font-bold text-2xl text-foreground">${MOCK_RWA.totalUsd.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs font-mono mb-1">Assets</p>
                <p className="font-display font-bold text-2xl text-foreground">{MOCK_RWA.assets}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs font-mono mb-1">Diversification</p>
                <p className="font-display font-bold text-2xl text-foreground">{MOCK_RWA.diversificationIndex}%</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs font-mono mb-1">Collateralized</p>
                <p className="font-display font-bold text-2xl text-risk-safe">{MOCK_RWA.collateralized ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
