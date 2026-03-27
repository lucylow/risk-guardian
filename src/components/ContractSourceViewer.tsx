import { useState } from "react";

const CONTRACTS = [
  {
    name: "RiskOracle.sol",
    desc: "Core oracle — stores risk scores per swap, manages authorized feeders, emits RiskScorePublished events.",
    features: ["publishRiskScore()", "getSwapRisk()", "authorizeFeeder()", "computeSwapId()"],
    status: "testnet" as const,
    lines: 145,
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RiskOracle {
    struct RiskScore {
        uint256 safetyScore;      // 0-1000
        uint256 sandwichRisk;
        uint256 liquidityRisk;
        uint256 walletRisk;
        uint256 volatilityRisk;
        uint256 timestamp;
        address swapInitiator;
        address tokenIn;
        address tokenOut;
    }

    mapping(bytes32 => RiskScore) public swapRiskScores;
    mapping(address => bool) public authorizedFeeders;

    event RiskScorePublished(
        bytes32 indexed swapId,
        address indexed swapInitiator,
        uint256 safetyScore,
        uint256 timestamp
    );

    function publishRiskScore(
        address initiator,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        RiskScore calldata score
    ) external { /* ... */ }

    function getSwapRisk(bytes32 swapId)
        external view returns (RiskScore memory)
    { return swapRiskScores[swapId]; }

    function computeSwapId(
        address initiator, address tokenIn,
        address tokenOut, uint256 amountIn,
        uint256 timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            initiator, tokenIn, tokenOut,
            amountIn, timestamp
        ));
    }
}`,
  },
  {
    name: "RiskVerifier.sol",
    desc: "Signature verification — validates that off-chain scores were signed by an authorized feeder using EIP-191.",
    features: ["verifyRiskSignature()", "recoverSigner()", "setAuthorizedSigner()"],
    status: "testnet" as const,
    lines: 88,
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RiskVerifier {
    mapping(address => bool) public authorizedSigners;

    function verifyRiskSignature(
        address initiator,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 safetyScore,
        uint256 timestamp,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(
            initiator, tokenIn, tokenOut,
            amountIn, safetyScore, timestamp
        ));
        bytes32 ethHash = keccak256(
            abi.encodePacked(
                "\\x19Ethereum Signed Message:\\n32",
                hash
            )
        );
        address signer = recoverSigner(ethHash, signature);
        return authorizedSigners[signer];
    }
}`,
  },
  {
    name: "RiskRegistry.sol",
    desc: "Governance registry — manages contract addresses, risk weight parameters, and ecosystem integrations.",
    features: ["updateWeights()", "registerIntegration()", "setOracleAddress()"],
    status: "planned" as const,
    lines: 98,
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RiskRegistry {
    uint256 public sandwichWeight = 400;   // 40%
    uint256 public liquidityWeight = 300;  // 30%
    uint256 public walletWeight = 200;     // 20%
    uint256 public volatilityWeight = 100; // 10%

    function updateWeights(
        uint256 _s, uint256 _l,
        uint256 _w, uint256 _v
    ) external {
        require(_s + _l + _w + _v == 1000,
            "Must sum to 1000");
        sandwichWeight = _s;
        liquidityWeight = _l;
        walletWeight = _w;
        volatilityWeight = _v;
    }
}`,
  },
];

const statusStyles: Record<string, string> = {
  testnet: "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate",
  planned: "border-foreground-subtle/30 bg-surface-highlight text-foreground-subtle",
  mainnet: "border-risk-safe/30 bg-risk-safe/10 text-risk-safe",
};

export default function ContractSourceViewer() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {CONTRACTS.map((c) => (
        <div key={c.name} className="glass-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setExpanded(expanded === c.name ? null : c.name)}
            className="w-full text-left p-5 flex items-start justify-between hover:bg-surface-highlight/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">📄</span>
                <h3 className="font-mono font-semibold text-foreground">{c.name}</h3>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${statusStyles[c.status]}`}>
                  {c.status}
                </span>
                <span className="font-mono text-[10px] text-foreground-subtle">{c.lines} lines</span>
              </div>
              <p className="text-foreground-muted text-sm">{c.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {c.features.map((f) => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-foreground-subtle text-sm ml-4 shrink-0">
              {expanded === c.name ? "▲" : "▼"}
            </span>
          </button>

          {/* Source code */}
          {expanded === c.name && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-4 py-2 bg-surface-highlight/30">
                <span className="font-mono text-[10px] text-foreground-subtle">Solidity ^0.8.20</span>
                <button
                  onClick={() => navigator.clipboard.writeText(c.source)}
                  className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-foreground-muted leading-relaxed whitespace-pre">
                {c.source}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
