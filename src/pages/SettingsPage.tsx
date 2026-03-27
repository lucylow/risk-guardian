/**
 * SettingsPage — manage risk preferences, persisted via user-settings edge function.
 */
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getUserSettings, saveUserSettings, type UserSettings } from "@/services/riskOracle";

const DEFAULT: UserSettings = {
  wallet_address:       "0xdemo_user",
  auto_protect_enabled: true,
  risk_threshold:       60,
  auto_adjust_slippage: true,
  notify_on_high_risk:  true,
};

function Toggle({ enabled, onChange, label }: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        enabled ? "bg-primary shadow-glow-primary" : "bg-surface-highlight"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-primary-foreground shadow-md ring-0 transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({ title, description, icon, children }: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 flex items-center justify-between gap-6 group hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-foreground">{title}</p>
          <p className="text-sm text-foreground-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { address, shortAddress } = useWallet();
  const wallet = address ?? "0xdemo_user";

  const [settings, setSettings]     = useState<UserSettings>(DEFAULT);
  const [loadState, setLoadState]   = useState<"loading" | "ready" | "error">("loading");
  const [saveState, setSaveState]   = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLoadState("loading");
    getUserSettings(wallet)
      .then((s) => { setSettings(s); setLoadState("ready"); })
      .catch(() => { setSettings({ ...DEFAULT, wallet_address: wallet }); setLoadState("error"); });
  }, [wallet]);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
    setHasChanges(true);
  };

  const save = async () => {
    setSaveState("saving");
    try {
      const updated = await saveUserSettings(wallet, {
        auto_protect_enabled: settings.auto_protect_enabled,
        risk_threshold:       settings.risk_threshold,
        auto_adjust_slippage: settings.auto_adjust_slippage,
        notify_on_high_risk:  settings.notify_on_high_risk,
      });
      setSettings(updated);
      setSaveState("saved");
      setHasChanges(false);
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const thresholdLabel =
    settings.risk_threshold >= 70
      ? "Aggressive — most trades will trigger auto-protect"
      : settings.risk_threshold >= 40
      ? "Balanced — moderate-risk trades are protected"
      : "Conservative — only the most dangerous trades are blocked";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="section-label mb-4">Preferences</div>
        <h1 className="font-display font-bold text-4xl mb-2">
          Risk <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-foreground-muted">Configure how the Oracle protects your swaps on OneDEX.</p>

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {shortAddress && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-raised border border-border">
              <div className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
              <span className="font-mono text-xs text-foreground-muted">Wallet: {shortAddress}</span>
            </div>
          )}
          {loadState === "loading" && (
            <span className="text-xs font-mono text-foreground-subtle animate-pulse">Loading settings…</span>
          )}
          {loadState === "error" && (
            <span className="text-xs font-mono text-risk-moderate">⚠ Using defaults — cloud sync unavailable</span>
          )}
          {loadState === "ready" && wallet !== "0xdemo_user" && (
            <span className="text-xs font-mono text-risk-safe">✓ Synced with cloud</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <SettingRow icon="🛡️" title="Auto-Protect" description="Automatically route high-risk swaps through a private mempool to avoid MEV bots.">
          <Toggle enabled={settings.auto_protect_enabled} onChange={(v) => update("auto_protect_enabled", v)} label="Auto-protect" />
        </SettingRow>

        <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">🎯</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-foreground">Risk Threshold</p>
                <span className="font-mono text-2xl font-bold text-primary">{settings.risk_threshold}</span>
              </div>
              <p className="text-sm text-foreground-muted mt-0.5">Auto-protect triggers when Safety Score falls below this value.</p>
            </div>
          </div>
          <input type="range" min={0} max={100} step={5} value={settings.risk_threshold} onChange={(e) => update("risk_threshold", Number(e.target.value))} className="w-full mb-3" style={{ accentColor: "hsl(var(--primary))" }} aria-label="Risk threshold" />
          <div className="flex justify-between text-xs font-mono text-foreground-subtle mb-3">
            <span>0 — Max protection</span><span>100 — No protection</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-primary/8 border border-primary/20">
            <p className="text-xs font-mono text-primary">{thresholdLabel}</p>
          </div>
        </div>

        <SettingRow icon="⚡" title="Auto-Adjust Slippage" description="Increase slippage tolerance automatically for high-risk swaps to prevent transaction failures.">
          <Toggle enabled={settings.auto_adjust_slippage} onChange={(v) => update("auto_adjust_slippage", v)} label="Auto-adjust slippage" />
        </SettingRow>

        <SettingRow icon="🔔" title="High-Risk Alerts" description="Receive an in-app alert whenever a dangerous swap is detected before confirmation.">
          <Toggle enabled={settings.notify_on_high_risk} onChange={(v) => update("notify_on_high_risk", v)} label="High-risk notifications" />
        </SettingRow>

        <div className="pt-2">
          <button
            onClick={save}
            disabled={!hasChanges || saveState === "saving"}
            className={`w-full py-3.5 rounded-xl font-display font-semibold text-base transition-all flex items-center justify-center gap-2 ${
              saveState === "saved"
                ? "bg-risk-safe/20 border border-risk-safe/30 text-risk-safe cursor-default"
                : saveState === "error"
                ? "bg-risk-danger/20 border border-risk-danger/30 text-risk-danger cursor-default"
                : saveState === "saving"
                ? "btn-primary opacity-70 cursor-wait"
                : hasChanges
                ? "btn-primary"
                : "bg-surface-highlight text-foreground-subtle cursor-not-allowed"
            }`}
          >
            {saveState === "saving" && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {saveState === "saved"  ? "✓ Settings Saved to Cloud" :
             saveState === "error"  ? "✕ Save Failed — Try Again" :
             saveState === "saving" ? "Saving…" :
             hasChanges             ? "Save Settings" :
             "No Changes"}
          </button>
        </div>

        <p className="text-xs text-center text-foreground-subtle font-mono pt-1">
          Settings are synced to the cloud and applied to all future swap assessments.
        </p>
      </div>
    </div>
  );
}
