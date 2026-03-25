/**
 * wallet-history — paginated risk assessment history for a wallet address.
 *
 * GET ?wallet=0x…&limit=20&offset=0&order=desc
 *   → { total, limit, offset, data: HistoryEntry[] }
 *
 * Useful for the History page and future mobile clients without direct DB access.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const url    = new URL(req.url);
  const wallet = url.searchParams.get("wallet")?.trim().toLowerCase();
  if (!wallet) return json({ error: "wallet query param required" }, 400);

  const limit  = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")  ?? 20)));
  const offset = Math.max(0,              Number(url.searchParams.get("offset") ?? 0));
  const order  = url.searchParams.get("order") === "asc" ? true : false; // ascending?

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fetch page + count in parallel
  const [pageResult, countResult] = await Promise.all([
    db
      .from("risk_assessments")
      .select("id, token_in, token_out, amount_in, safety_score, sandwich_risk, liquidity_health, wallet_risk, explanation, recommendation, created_at")
      .eq("user_address", wallet)
      .order("created_at", { ascending: order })
      .range(offset, offset + limit - 1),
    db
      .from("risk_assessments")
      .select("id", { count: "exact", head: true })
      .eq("user_address", wallet),
  ]);

  if (pageResult.error) {
    console.error("wallet-history page error:", pageResult.error.message);
    return json({ error: "Database error" }, 500);
  }

  // ── Stats aggregation ─────────────────────────────────────────────────────
  let stats = null;
  if (offset === 0) {
    const { data: allScores } = await db
      .from("risk_assessments")
      .select("safety_score, sandwich_risk, liquidity_health, wallet_risk")
      .eq("user_address", wallet)
      .limit(500);

    if (allScores && allScores.length > 0) {
      const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
      stats = {
        avg_safety_score:     avg(allScores.map((r) => r.safety_score)),
        avg_sandwich_risk:    avg(allScores.map((r) => r.sandwich_risk)),
        avg_liquidity_health: avg(allScores.map((r) => r.liquidity_health)),
        avg_wallet_risk:      avg(allScores.map((r) => r.wallet_risk)),
        safe_count:           allScores.filter((r) => r.safety_score >= 70).length,
        moderate_count:       allScores.filter((r) => r.safety_score >= 40 && r.safety_score < 70).length,
        danger_count:         allScores.filter((r) => r.safety_score < 40).length,
      };
    }
  }

  return json({
    wallet,
    total:  countResult.count ?? 0,
    limit,
    offset,
    data:   pageResult.data ?? [],
    stats,
    fetched_at: new Date().toISOString(),
  });
});
