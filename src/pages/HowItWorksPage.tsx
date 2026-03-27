import HowItWorksSection from "@/components/HowItWorksSection";

export default function HowItWorksPage() {
  return (
    <>
      {/* Page header */}
      <section className="pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="text-center">
          <div className="section-label mb-4 inline-flex">Technical Deep Dive</div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            From raw blockchain data to a human-readable Safety Score in under 50ms — a look inside the Oracle's three-layer architecture.
          </p>
        </div>
      </section>
      <HowItWorksSection />

      {/* Architecture detail block */}
      <section className="pb-12 relative">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12">
          <div className="section-label mb-6 inline-flex">Architecture</div>
          <h2 className="font-display font-bold text-3xl mb-8">Technical Architecture</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Off-chain Microservice",
                items: ["Sub-50ms P95 response time", "Stateless, horizontally scalable", "Deployed on OneChain edge nodes", "99.9% uptime SLA target"],
              },
              {
                title: "AI Models",
                items: ["GBM classifier for sandwich detection", "Monte Carlo simulation for pool health", "Graph neural network for wallet scoring", "Ensemble aggregation for final score"],
              },
              {
                title: "Data Sources",
                items: ["Live mempool via OneChain RPC", "Pool reserves from OneDEX contracts", "Wallet reputation from OneID API", "Price forecasts from OnePredict"],
              },
              {
                title: "Integration API",
                items: ["RESTful JSON API", "Single-call dApp integration", "WebSocket for real-time updates", "SDK available for TypeScript & Rust"],
              },
            ].map((block) => (
              <div key={block.title} className="glass-card rounded-2xl p-6 border border-border">
                <h3 className="font-display font-semibold text-foreground mb-4 text-lg">{block.title}</h3>
                <ul className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
