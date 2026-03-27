import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import RealTimeRiskMonitor from "@/components/RealTimeRiskMonitor";
import OracleMetricsDashboard from "@/components/OracleMetricsDashboard";

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
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Real-time risk scores verified and stored on OneChain. Every assessment is signed, verifiable, and immutable.
          </p>
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
          <h2 className="font-display font-bold text-2xl mb-6">Architecture</h2>
          <div className="glass-card rounded-2xl p-8 border border-border space-y-6">
            {[
              { step: "1", title: "Off-Chain Computation", desc: "Risk engine aggregates data from OneDEX pools, OnePredict volatility, OneID reputation, and mempool analysis." },
              { step: "2", title: "Feeder Signs Score", desc: "Authorized oracle feeder signs the RiskScore struct using EIP-191, creating a verifiable attestation." },
              { step: "3", title: "On-Chain Storage", desc: "Score is submitted to RiskOracle.sol on OneChain, emitting a RiskScoreUpdated event for indexing." },
              { step: "4", title: "Verification", desc: "Any dApp (OneDEX, OnePoker, etc.) can call RiskVerifier.sol to verify scores before executing transactions." },
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
          <div className="space-y-4">
            {[
              {
                name: "RiskOracle.sol",
                desc: "Core oracle contract. Stores risk scores per swap, manages authorized feeders, and emits events for indexing.",
                features: ["Swap risk score storage", "Wallet risk profiles", "Feeder authorization", "Event emission"],
              },
              {
                name: "RiskVerifier.sol",
                desc: "Signature verification contract. Validates that off-chain scores were signed by an authorized feeder before on-chain use.",
                features: ["EIP-191 signature verification", "Authorized signer management", "Stateless verification"],
              },
              {
                name: "RiskRegistry.sol",
                desc: "Registry contract for governance. Manages contract upgrades, fee parameters, and ecosystem integrations.",
                features: ["Contract registry", "Parameter governance", "Integration management"],
              },
            ].map((c) => (
              <div key={c.name} className="glass-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">📄</span>
                  <h3 className="font-mono font-semibold text-foreground">{c.name}</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate">
                    Testnet
                  </span>
                </div>
                <p className="text-foreground-muted text-sm mb-3">{c.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {c.features.map((f) => (
                    <span key={f} className="text-[10px] font-mono px-2 py-1 rounded-md bg-surface-highlight text-foreground-subtle">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OneChain Integration */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6">OneChain Native Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "⛽", title: "Zero Gas Mode", desc: "Gasless risk assessments via OneWallet meta-transactions. Users pay zero fees for risk checks." },
              { icon: "🔐", title: "OneID Attestation", desc: "Wallet reputation scores are anchored to OneID DIDs, creating persistent cross-chain identity." },
              { icon: "🎰", title: "OnePoker Multipliers", desc: "Safety Scores feed into OnePoker to adjust risk multipliers: safe traders earn bonuses." },
              { icon: "🏦", title: "OneRWA Collateral", desc: "RWA-backed positions are factored into systemic risk calculations for deeper portfolio analysis." },
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

      <FooterSection />
    </div>
  );
}
