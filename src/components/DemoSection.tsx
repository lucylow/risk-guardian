import RiskOracleWidget from "./RiskOracleWidget";

export default function DemoSection() {
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
            Simulate a swap and get a real-time Safety Score — exactly like the live product
            experience inside OneDEX.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <RiskOracleWidget pair="ONE_USDC" amount={1000} wallet="normal" />
        </div>

        <p className="text-center text-foreground-subtle text-xs font-mono mt-6">
          ⚠ This demo calls a live edge function. The production version uses real-time mempool
          data and OnePredict AI models.
        </p>
      </div>
    </section>
  );
}
