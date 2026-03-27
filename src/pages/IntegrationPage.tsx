import IntegrationSection from "@/components/IntegrationSection";

export default function IntegrationPage() {
  return (
    <>
      {/* Page header */}
      <section className="pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-risk-safe/5 rounded-full blur-3xl" />
        </div>
        <div className="text-center">
          <div className="section-label mb-4 inline-flex">Ecosystem</div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Integration <span className="text-gradient">Partners</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            The Risk Oracle is deeply embedded across the OneChain product suite — not a plugin, but a native safety layer.
          </p>
        </div>
      </section>
      <IntegrationSection />

      {/* Developer API callout */}
      <section className="pb-12 relative">
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-8 md:p-12 text-center border border-primary/20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="section-label mb-4 inline-flex">Developer API</div>
          <h2 className="font-display font-bold text-3xl mb-4">Integrate in Minutes</h2>
          <p className="text-foreground-muted mb-8 leading-relaxed">
            Any protocol on OneChain can embed risk scoring with a single API call. Our RESTful API returns a Safety Score with full breakdown in under 50ms.
          </p>
          <div className="glass-card rounded-xl p-4 text-left mb-8 border border-border">
            <p className="font-mono text-xs text-foreground-subtle mb-2">// Example API call</p>
            <pre className="font-mono text-sm text-foreground-muted overflow-x-auto whitespace-pre-wrap">{`GET /v1/risk-score
  ?pair=ONE_USDC
  &amount=1000
  &wallet=0x123...abc

// Response
{
  "safetyScore": 84,
  "sandwich": 12,
  "liquidity": 91,
  "walletRisk": 15,
  "recommendation": "safe"
}`}</pre>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="btn-primary px-6 py-3 rounded-xl font-display font-semibold">
              Read the Docs
            </a>
            <a href="#" className="px-6 py-3 rounded-xl border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors font-display font-semibold">
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
