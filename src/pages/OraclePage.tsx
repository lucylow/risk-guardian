import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import RealTimeRiskMonitor from "@/components/RealTimeRiskMonitor";
import OracleMetricsDashboard from "@/components/OracleMetricsDashboard";
import ContractSourceViewer from "@/components/ContractSourceViewer";
import OnChainVerificationBadge from "@/components/OnChainVerificationBadge";

export default function OraclePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Blockchain</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-4">
            On-Chain Risk <span className="text-gradient">Oracle</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto mb-6">
            Real-time risk scores computed off-chain, signed by authorized feeders, and verified on OneChain. Every assessment is immutable and auditable.
          </p>
          <div className="flex justify-center gap-3">
            <OnChainVerificationBadge verified={true} swapId="0xdemo_swap_id_001" />
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-6">Oracle Performance</h2>
          <OracleMetricsDashboard />
        </div>
      </section>

      {/* Live Feed */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-6">Live Event Stream</h2>
          <RealTimeRiskMonitor />
        </div>
      </section>

      {/* Architecture */}
      <section className="pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6">Oracle Architecture</h2>
          <div className="glass-card rounded-2xl p-8 border border-border space-y-6">
            {[
              { step: "1", title: "Off-Chain Computation", desc: "Edge function aggregates data from OneDEX pools, OnePredict volatility, and OneID reputation. AI explanation via Gemini 2.5 Flash." },
              { step: "2", title: "Oracle Feeder Signs", desc: "Authorized feeder generates SHA-256 swapId and signs the RiskScore with EIP-191, creating a verifiable attestation." },
              { step: "3", title: "On-Chain Publication", desc: "Score is submitted to RiskOracle.sol on OneChain via publishRiskScore(), emitting a RiskScorePublished event." },
              { step: "4", title: "dApp Verification", desc: "OneDEX, OnePoker, or any dApp calls RiskVerifier.sol to verify the score before executing transactions." },
              { step: "5", title: "Frontend Reading", desc: "React hooks subscribe to on-chain events and read scores via getSwapRisk(swapId) for real-time UI updates." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="font-display font-bold text-xs text-primary-foreground">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-foreground-muted text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Contracts */}
      <section className="pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6">Smart Contracts</h2>
          <ContractSourceViewer />
        </div>
      </section>

      {/* Data Flow */}
      <section className="pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6">Risk Assessment Data Flow</h2>
          <div className="glass-card rounded-xl p-6 border border-border">
            <pre className="font-mono text-xs text-foreground-muted overflow-x-auto whitespace-pre leading-relaxed">{`┌─────────────┐    POST /risk-assess     ┌──────────────────┐
│  Frontend   │ ───────────────────────→ │  Edge Function   │
│  (React)    │                          │  (Deno Runtime)  │
│             │ ←─────────────────────── │                  │
│  useRisk    │  SignedRiskResponse +    │  computeFullRisk │
│  Oracle()   │  oracle.swapId          │  getExplanation  │
└─────────────┘  oracle.signature       │  signScore()     │
      ↕                                 └────────┬─────────┘
┌─────────────┐                                  │
│ OneWallet   │                                  ↓
│ (signing)   │                          ┌──────────────────┐
└─────────────┘                          │  RiskOracle.sol  │
                                         │  (OneChain)      │
┌─────────────┐  subscribe events        │                  │
│  Live Feed  │ ←─────────────────────── │  publishRisk()   │
│  Component  │  RiskScorePublished      │  getSwapRisk()   │
└─────────────┘                          └──────────────────┘
                                                 ↕
                                         ┌──────────────────┐
                                         │ RiskVerifier.sol │
                                         │ (EIP-191 verify) │
                                         └──────────────────┘`}</pre>
          </div>
        </div>
      </section>

      {/* OneChain Native */}
      <section className="pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6">OneChain Native Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "⛽", title: "Zero Gas Mode", desc: "Gasless risk assessments via OneWallet meta-transactions. Users pay zero fees for risk checks." },
              { icon: "🔐", title: "OneID Attestation", desc: "Wallet reputation scores are anchored to OneID DIDs, creating persistent cross-chain identity." },
              { icon: "🎰", title: "OnePoker Multipliers", desc: "Safety Scores feed into OnePoker to adjust risk multipliers: safe traders earn bonuses up to 1.5×." },
              { icon: "🏦", title: "OneRWA Collateral", desc: "RWA-backed positions are factored into systemic risk calculations via the RiskRegistry weight system." },
              { icon: "📊", title: "OneDEX Integration", desc: "Pool TVL, LP concentration, and volume data flow into the liquidity health component of the risk score." },
              { icon: "📈", title: "OnePredict Volatility", desc: "AI-driven volatility forecasts from OnePredict feed the volatilityRisk component in real-time." },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-5 border border-border">
                <span className="text-2xl mb-2 block">{f.icon}</span>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                <p className="text-foreground-muted text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Guide CTA */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="glass-card rounded-2xl p-8 md:p-12 border border-primary/20 text-center">
            <span className="text-4xl mb-4 block">🚀</span>
            <h2 className="font-display font-bold text-3xl mb-4">Deploy Your Own Oracle</h2>
            <p className="text-foreground-muted max-w-xl mx-auto mb-6">
              The full Solidity source for RiskOracle, RiskVerifier, and RiskRegistry is included in the <code className="text-primary font-mono text-sm">contracts/</code> folder. Deploy to OneChain Testnet with Hardhat.
            </p>
            <div className="glass-card rounded-xl p-4 text-left mb-6 border border-border max-w-md mx-auto">
              <pre className="font-mono text-xs text-foreground-muted whitespace-pre-wrap">{`npx hardhat compile
npx hardhat run scripts/deploy.ts \\
  --network onechainTestnet`}</pre>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://docs.onelabs.cc/DevelopmentDocument"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 rounded-xl font-display font-semibold"
              >
                OneChain Docs
              </a>
              <a
                href="https://onebox.onelabs.cc/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors font-display font-semibold"
              >
                OneBox Dev Toolkit
              </a>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
