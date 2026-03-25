/**
 * user-settings — GET/POST risk preferences keyed by wallet address.
 *
 * GET  ?wallet=0x…  → returns settings row (or defaults if not found)
 * POST { wallet, auto_protect_enabled?, risk_threshold?, … } → upserts and returns updated row
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULTS = {
  auto_protect_enabled: true,
  risk_threshold: 60,
  auto_adjust_slippage: true,
  notify_on_high_risk: true,
};

function supabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function sanitizeWallet(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const w = raw.trim().toLowerCase();
  // Accept 0x addresses or demo strings
  if (!w || w.length > 100) return null;
  return w;
}

function sanitizeSettings(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (typeof body.auto_protect_enabled === "boolean")
    out.auto_protect_enabled = body.auto_protect_enabled;
  if (typeof body.auto_adjust_slippage === "boolean")
    out.auto_adjust_slippage = body.auto_adjust_slippage;
  if (typeof body.notify_on_high_risk === "boolean")
    out.notify_on_high_risk = body.notify_on_high_risk;
  if (typeof body.risk_threshold === "number") {
    const t = Math.round(body.risk_threshold);
    if (t >= 0 && t <= 100) out.risk_threshold = t;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const db = supabaseAdmin();

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const url = new URL(req.url);
    const wallet = sanitizeWallet(url.searchParams.get("wallet"));
    if (!wallet) return json({ error: "wallet query param required" }, 400);

    const { data, error } = await db
      .from("user_settings")
      .select("*")
      .eq("wallet_address", wallet)
      .maybeSingle();

    if (error) {
      console.error("GET user_settings error:", error.message);
      return json({ error: "Database error" }, 500);
    }

    // Return existing row or synthesise defaults
    return json(data ?? { wallet_address: wallet, ...DEFAULTS });
  }

  // ── POST (upsert) ─────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const wallet = sanitizeWallet(body.wallet);
    if (!wallet) return json({ error: "wallet field required" }, 400);

    const updates = sanitizeSettings(body);
    if (Object.keys(updates).length === 0) {
      return json({ error: "No valid settings fields provided" }, 400);
    }

    const { data, error } = await db
      .from("user_settings")
      .upsert(
        { wallet_address: wallet, ...updates },
        { onConflict: "wallet_address" },
      )
      .select("*")
      .single();

    if (error) {
      console.error("POST user_settings error:", error.message);
      return json({ error: "Database error" }, 500);
    }

    return json(data);
  }

  return json({ error: "Method not allowed" }, 405);
});
