/**
 * OnChainVerificationBadge — shows whether a risk score was verified on-chain.
 */

interface Props {
  verified: boolean | null;
  swapId?: string;
  signature?: string;
}

export default function OnChainVerificationBadge({ verified, swapId, signature }: Props) {
  if (verified === null) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs ${
      verified
        ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe"
        : "border-risk-danger/30 bg-risk-danger/10 text-risk-danger"
    }`}>
      <span>{verified ? "✓" : "✗"}</span>
      <span className="font-bold">{verified ? "On-Chain Verified" : "Verification Failed"}</span>
      {swapId && (
        <span className="text-[10px] opacity-60" title={swapId}>
          {swapId.slice(0, 10)}…
        </span>
      )}
    </div>
  );
}
