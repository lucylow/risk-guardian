import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useWallet";

interface HistoryEntry {
  id: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  safety_score: number;
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
  created_at: string;
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? "bg-risk-safe/10 border-risk-safe/30 text-risk-safe"
      : score >= 40
      ? "bg-risk-moderate/10 border-risk-moderate/30 text-risk-moderate"
      : "bg-risk-danger/10 border-risk-danger/30 text-risk-danger";
  const label = score >= 70 ? "Safe" : score >= 40 ? "Moderate" : "High Risk";
  return (
    <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      {score} · {label}
    </span>
  );
}

export default function HistoryPage() {
  const { address } = useWallet();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setHistory(data as HistoryEntry[]);
      setLoading(false);
    })();
  }, [address]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-4xl">
        <div className="mb-8">
          <div className="section-label mb-3">On-Chain Records</div>
          <h1 className="font-display font-bold text-4xl mb-2">
            Assessment <span className="text-gradient">History</span>
          </h1>
          <p className="text-foreground-muted">All risk assessments logged from the demo engine.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📜</div>
            <p className="font-display font-semibold text-lg text-foreground mb-2">No assessments yet</p>
            <p className="text-foreground-muted text-sm">
              Head to the{" "}
              <a href="/#demo" className="text-primary underline underline-offset-2">
                demo
              </a>{" "}
              and click "Assess Risk" to log your first entry.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="glass-card rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 items-center hover:border-primary/30 transition-colors"
              >
                {/* Token pair */}
                <div>
                  <p className="text-xs font-mono text-foreground-subtle mb-1">SWAP</p>
                  <p className="font-display font-semibold text-foreground">
                    {entry.token_in} → {entry.token_out}
                  </p>
                  <p className="text-xs font-mono text-foreground-muted mt-0.5">
                    {entry.amount_in.toLocaleString()} tokens
                  </p>
                </div>

                {/* Breakdown */}
                <div className="hidden md:block">
                  <p className="text-xs font-mono text-foreground-subtle mb-1">BREAKDOWN</p>
                  <div className="space-y-0.5 text-xs font-mono text-foreground-muted">
                    <p>🥪 Sandwich: {entry.sandwich_risk}</p>
                    <p>💧 Liquidity: {entry.liquidity_health}</p>
                    <p>👛 Wallet: {entry.wallet_risk}</p>
                  </div>
                </div>

                {/* Score */}
                <div>
                  <p className="text-xs font-mono text-foreground-subtle mb-1.5">SAFETY SCORE</p>
                  <ScoreBadge score={entry.safety_score} />
                </div>

                {/* Date */}
                <div className="text-right">
                  <p className="text-xs font-mono text-foreground-subtle mb-1">DATE</p>
                  <p className="text-sm text-foreground-muted">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-mono text-foreground-subtle">
                    {new Date(entry.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
