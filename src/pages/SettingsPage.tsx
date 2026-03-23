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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
        enabled ? "bg-primary" : "bg-surface-highlight"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { shortAddress } = useWallet();
  const [settings, setSettings] = useState<UserSettings>(
    isMockModeEnabled() ? mockUserSettings : DEFAULT,
  );
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    // In production: persist to DB via Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <div className="mb-8">
          <div className="section-label mb-3">Preferences</div>
          <h1 className="font-display font-bold text-4xl mb-2">
            Risk <span className="text-gradient">Settings</span>
          </h1>
          {shortAddress && (
            <p className="font-mono text-sm text-foreground-subtle">
              Wallet: {shortAddress}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Auto-protect */}
          <div className="glass-card rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-foreground">Auto-Protect</p>
              <p className="text-sm text-foreground-muted mt-0.5">
                Automatically route high-risk swaps through private mempool
              </p>
            </div>
            <Toggle
              enabled={settings.auto_protect_enabled}
              onChange={(v) => update("auto_protect_enabled", v)}
              label="Auto-protect"
            />
          </div>

          {/* Risk threshold */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-display font-semibold text-foreground">Risk Threshold</p>
                <p className="text-sm text-foreground-muted mt-0.5">
                  Auto-protect triggers below this Safety Score
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-primary">
                {settings.risk_threshold}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.risk_threshold}
              onChange={(e) => update("risk_threshold", Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <div className="flex justify-between text-xs font-mono text-foreground-subtle mt-1">
              <span>0 (High risk)</span>
              <span>100 (All trades)</span>
            </div>
          </div>

          {/* Auto-adjust slippage */}
          <div className="glass-card rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-foreground">Auto-Adjust Slippage</p>
              <p className="text-sm text-foreground-muted mt-0.5">
                Increase slippage tolerance for high-risk swaps to reduce failures
              </p>
            </div>
            <Toggle
              enabled={settings.auto_adjust_slippage}
              onChange={(v) => update("auto_adjust_slippage", v)}
              label="Auto-adjust slippage"
            />
          </div>

          {/* Notifications */}
          <div className="glass-card rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-foreground">High-Risk Alerts</p>
              <p className="text-sm text-foreground-muted mt-0.5">
                Receive an alert whenever a dangerous swap is detected
              </p>
            </div>
            <Toggle
              enabled={settings.notify_on_high_risk}
              onChange={(v) => update("notify_on_high_risk", v)}
              label="Notifications"
            />
          </div>

          <button
            onClick={save}
            className={`w-full btn-primary py-3.5 rounded-xl font-display font-semibold text-base transition-all ${
              saved ? "opacity-70" : ""
            }`}
          >
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
