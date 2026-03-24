/**
 * SettingsPage — manage risk preferences: auto-protect, threshold, slippage, alerts.
 */
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useWallet } from "@/hooks/useWallet";
import { isMockModeEnabled } from "@/lib/mockMode";
import { mockUserSettings, type UserSettings } from "@/services/mockApi";

const DEFAULT: UserSettings = {
  auto_protect_enabled: true,
  risk_threshold: 60,
  auto_adjust_slippage: true,
  notify_on_high_risk: true,
};

function Toggle({
  enabled,
  onChange,
  label,
}: {
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

interface SettingRowProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}
function SettingRow({ title, description, icon, children }: SettingRowProps) {
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
  const { shortAddress } = useWallet();
  const [settings, setSettings] = useState<UserSettings>(
    isMockModeEnabled() ? mockUserSettings : DEFAULT,
  );
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setHasChanges(true);
  };

  const save = () => {
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const thresholdLabel =
    settings.risk_threshold >= 70
      ? "Aggressive — most trades protected"
      : settings.risk_threshold >= 40
      ? "Balanced — moderate-risk trades protected"
      : "Conservative — only dangerous trades blocked";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <div className="section-label mb-4">Preferences</div>
          <h1 className="font-display font-bold text-4xl mb-2">
            Risk <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-foreground-muted">
            Configure how the Oracle protects your swaps on OneDEX.
          </p>
          {shortAddress && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-surface-raised border border-border">
              <div className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
              <span className="font-mono text-xs text-foreground-muted">Wallet: {shortAddress}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Auto-protect */}
          <SettingRow
            icon="🛡️"
            title="Auto-Protect"
            description="Automatically route high-risk swaps through a private mempool to avoid MEV bots."
          >
            <Toggle
              enabled={settings.auto_protect_enabled}
              onChange={(v) => update("auto_protect_enabled", v)}
              label="Auto-protect"
            />
          </SettingRow>

          {/* Risk threshold */}
          <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-foreground">Risk Threshold</p>
                  <span className="font-mono text-2xl font-bold text-primary">
                    {settings.risk_threshold}
                  </span>
                </div>
                <p className="text-sm text-foreground-muted mt-0.5">
                  Auto-protect triggers when Safety Score falls below this value.
                </p>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.risk_threshold}
              onChange={(e) => update("risk_threshold", Number(e.target.value))}
              className="w-full mb-3"
              style={{ accentColor: "hsl(var(--primary))" }}
              aria-label="Risk threshold"
            />
            <div className="flex justify-between text-xs font-mono text-foreground-subtle mb-3">
              <span>0 — Max protection</span>
              <span>100 — No protection</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-primary/8 border border-primary/20">
              <p className="text-xs font-mono text-primary">{thresholdLabel}</p>
            </div>
          </div>

          {/* Auto-adjust slippage */}
          <SettingRow
            icon="⚡"
            title="Auto-Adjust Slippage"
            description="Increase slippage tolerance automatically for high-risk swaps to prevent transaction failures."
          >
            <Toggle
              enabled={settings.auto_adjust_slippage}
              onChange={(v) => update("auto_adjust_slippage", v)}
              label="Auto-adjust slippage"
            />
          </SettingRow>

          {/* Notifications */}
          <SettingRow
            icon="🔔"
            title="High-Risk Alerts"
            description="Receive an in-app alert whenever a dangerous swap is detected before confirmation."
          >
            <Toggle
              enabled={settings.notify_on_high_risk}
              onChange={(v) => update("notify_on_high_risk", v)}
              label="High-risk notifications"
            />
          </SettingRow>

          {/* Save button */}
          <div className="pt-2">
            <button
              onClick={save}
              disabled={!hasChanges && !saved}
              className={`w-full py-3.5 rounded-xl font-display font-semibold text-base transition-all ${
                saved
                  ? "bg-risk-safe/20 border border-risk-safe/30 text-risk-safe cursor-default"
                  : hasChanges
                  ? "btn-primary"
                  : "bg-surface-highlight text-foreground-subtle cursor-not-allowed"
              }`}
            >
              {saved ? "✓ Settings Saved" : hasChanges ? "Save Settings" : "No Changes"}
            </button>
          </div>

          {/* Info note */}
          <p className="text-xs text-center text-foreground-subtle font-mono pt-1">
            Settings are stored locally and applied to all future swap assessments.
          </p>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
