import { useEffect, useState } from "react";
import {
  type RiskRequest,
  getSwapSuggestions,
  logSuggestionFeedback,
  type Suggestion,
} from "@/services/riskOracle";

interface AlternativeSuggestionsProps {
  request: RiskRequest;
  onSelect: (suggestion: Suggestion) => void;
}

export default function AlternativeSuggestions({
  request,
  onSelect,
}: AlternativeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [adaptiveThreshold, setAdaptiveThreshold] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await getSwapSuggestions(request);
        if (!active) return;
        setAdaptiveThreshold(data.adaptive_threshold);
        setSuggestions(data.suggestions ?? []);
      } catch (error) {
        if (active) setSuggestions([]);
        console.error("Failed to load suggestions", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [
    request.user_address,
    request.token_in,
    request.token_out,
    request.amount_in,
  ]);

  if (loading) {
    return <p className="text-xs text-foreground-subtle">Loading safer alternatives...</p>;
  }
  if (!suggestions.length) return null;

  return (
    <div className="p-4 rounded-xl bg-surface-raised border border-border">
      <p className="text-xs font-mono text-foreground-muted mb-2">ALTERNATIVE SAFER SWAPS</p>
      {adaptiveThreshold !== null && (
        <p className="text-xs text-foreground-subtle mb-3">
          Adaptive threshold: <span className="font-mono text-primary">{adaptiveThreshold}</span>
        </p>
      )}
      <div className="space-y-2">
        {suggestions.map((s, idx) => (
          <div
            key={`${s.type}-${idx}`}
            className="rounded-lg border border-border bg-surface p-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{s.description}</p>
              <p className="text-xs text-foreground-subtle">{s.recommendation}</p>
              {s.safety_score !== null && (
                <p className="text-xs text-primary mt-1">Safety: {s.safety_score}</p>
              )}
            </div>
            <button
              onClick={async () => {
                onSelect(s);
                await logSuggestionFeedback({
                  user_address: request.user_address,
                  suggestion_type: s.type,
                  suggested_params: { type: s.type, amount: s.amount, description: s.description } as Record<string, unknown>,
                  safety_score: s.safety_score,
                  accepted: true,
                });
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              Try
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
