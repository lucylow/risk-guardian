import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";

const CURL_EXAMPLE = `curl -X POST https://riskoracle.lovable.app/api/assess \\
  -H "Content-Type: application/json" \\
  -d '{
    "userAddress": "0x123...abc",
    "tokenIn": "ONE",
    "tokenOut": "USDC",
    "amountIn": 1000,
    "signature": "0xsig...",
    "nonce": "abc123"
  }'`;

const TS_EXAMPLE = `const response = await fetch("/api/assess", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userAddress: "0x123...abc",
    tokenIn: "ONE",
    tokenOut: "USDC",
    amountIn: 1000,
    signature: "0xsig...",
    nonce: "abc123",
  }),
});
const { safetyScore, riskBreakdown, explanation } = await response.json();`;

const RESPONSE_EXAMPLE = `{
  "safetyScore": 84,
  "riskBreakdown": {
    "sandwichRisk": 12,
    "liquidityHealth": 91,
    "walletRisk": 15
  },
  "explanation": "Low sandwich risk and deep liquidity...",
  "recommendation": "Proceed"
}`;

const TYPES_EXAMPLE = `interface SwapRequest {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  signature: string;
  nonce: string;
}

interface RiskResponse {
  safetyScore: number;
  riskBreakdown: {
    sandwichRisk: number;
    liquidityHealth: number;
    walletRisk: number;
  };
  explanation: string;
  recommendation: string;
}`;

function CodeBlock({ title, code, lang = "bash" }: { title: string; code: string; lang?: string }) {
  return (
    <div className="glass-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono text-foreground-subtle">{title}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs font-mono text-primary hover:text-primary/80 transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground-muted whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

const RECIPES = [
  { title: "Pre-trade check on OneDEX", description: "Call Risk Guardian before showing the swap confirmation screen. If safetyScore < 40, warn the user." },
  { title: "Risk banners in OnePlay lobbies", description: "Query the Safety Score for tournament entry transactions to flag high-risk deposits." },
  { title: "Bot integration", description: "Use the API as a pre-trade filter in arbitrage or market-making bots on OneChain." },
];

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />

      <section className="pt-28 pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Developers</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-4">
            Build with <span className="text-gradient">Risk Oracle</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Integrate Safety Scores into any OneChain dApp, bot, or UI with a single API call.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-10">
          {/* Quickstart */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">Quickstart</h2>
            <div className="space-y-4">
              <CodeBlock title="cURL" code={CURL_EXAMPLE} />
              <CodeBlock title="TypeScript / Fetch" code={TS_EXAMPLE} lang="typescript" />
              <CodeBlock title="Response" code={RESPONSE_EXAMPLE} lang="json" />
            </div>
          </div>

          {/* Types */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">Type Definitions</h2>
            <CodeBlock title="TypeScript Interfaces" code={TYPES_EXAMPLE} lang="typescript" />
          </div>

          {/* Integration Recipes */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">Integration Recipes</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {RECIPES.map((r) => (
                <div key={r.title} className="glass-card rounded-xl p-6 border border-border">
                  <h3 className="font-display font-semibold text-foreground mb-2">{r.title}</h3>
                  <p className="text-foreground-muted text-sm">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OneChain Dev Links */}
          <div className="glass-card rounded-2xl p-8 border border-primary/20 text-center">
            <h2 className="font-display font-bold text-2xl mb-4">OneChain Developer Resources</h2>
            <p className="text-foreground-muted mb-6">Explore the full OneChain developer ecosystem.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://docs.onelabs.cc/DevelopmentDocument" target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-3 rounded-xl font-display font-semibold">
                OneChain Docs
              </a>
              <a href="https://onebox.onelabs.cc/chat" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors font-display font-semibold">
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
