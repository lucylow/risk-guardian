/**
 * WalletConnectButton — OneWallet-first connect button for the navbar.
 */

import { useOneWallet } from "@/hooks/useOneWallet";

export default function WalletConnectButton() {
  const { isConnected, shortAddress, oneId, connect, disconnect, isLoading } = useOneWallet();

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 text-sm rounded-lg bg-surface-highlight text-foreground-muted animate-pulse">
        Connecting…
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-risk-safe/10 border border-risk-safe/20">
          <span className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
          <span className="text-xs font-mono text-foreground-muted">
            {oneId ? `@${oneId.id}` : shortAddress}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs px-2 py-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-highlight transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="btn-primary px-4 py-2 text-sm rounded-lg inline-flex items-center gap-2"
    >
      <span>👛</span>
      Connect OneWallet
    </button>
  );
}
