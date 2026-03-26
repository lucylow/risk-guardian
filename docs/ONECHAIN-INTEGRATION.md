# OneChain Integration Guide

> How Risk Guardian / The Risk Oracle integrates with the OneChain ecosystem.

## Overview

Risk Guardian is a **OneChain-native dApp** that leverages 8 ecosystem products to deliver a comprehensive DeFi risk assessment engine.

| Product | Role | Status |
|---------|------|--------|
| **OneWallet** | Auth, signing, Zero Gas Mode | ✅ Adapter + Hook |
| **OneID** | Cross-chain DID, reputation | ✅ Adapter + UI |
| **OneDEX** | Pool data, swap context | ✅ Adapter |
| **OnePredict** | Volatility forecasts | ✅ Adapter + Badge |
| **OneTransfer** | Transfer path analysis | ✅ Adapter (stub) |
| **OneRWA** | RWA collateral exposure | ✅ Adapter (stub) |
| **OnePlay** | Gamification badges, XP | ✅ Adapter + UI |
| **OnePoker** | Social risk signals | 🔜 Planned |

## Architecture

```
src/onechain/
  index.ts                       # Barrel export
  types.ts                       # Shared TypeScript interfaces
  onewallet/onewalletClient.ts   # OneWallet connect + sign
  oneid/oneidClient.ts           # OneID DID resolution
  onedex/onedexClient.ts         # Pool health data
  onepredict/onepredictClient.ts # Volatility forecasts
  onetransfer/onetransferClient.ts
  onerwa/onerwaClient.ts
  oneplay/oneplayClient.ts
```

All adapters are **mock-first** — they return deterministic demo data by default, with typed interfaces ready for real API integration.

## OneWallet Integration

**Hook:** `useOneWallet()`

```tsx
import { useOneWallet } from "@/hooks/useOneWallet";

function MyComponent() {
  const { address, isConnected, oneId, connect, sign } = useOneWallet();
  // ...
}
```

**Features:**
- Extension / mobile bridge detection
- USDO and OCT balance display
- Zero Gas Mode eligibility
- Message signing for `/assess` endpoint

**App Store:** https://apps.apple.com/qa/app/onewallet-onechain/id6749725541

## OneID Integration

**Adapter:** `resolveOneIdForWallet(address, chainId)`

Returns `OneIdProfile` with:
- Display name and DID
- Linked wallets across chains
- Reputation tier: `veteran` | `active` | `new` | `flagged`
- Risk flags (e.g., `wash_trading`, `flash_loan_abuse`)
- Cross-chain activity score (0–100)

**SDK Docs:** https://docs.oneid.xyz/developers-guide/oneid-sdk

## OneDEX Integration

**Adapter:** `getPoolHealth(tokenIn, tokenOut)`

Returns `PoolHealth` with:
- Pool reserves and TVL
- Fee basis points
- LP concentration index (rug risk indicator)
- 24h volume

## OnePredict Integration

**Adapter:** `getVolatilityForecast(tokenIn, tokenOut, horizonMinutes)`

Returns `VolatilityForecast` with:
- Volatility index (0–100)
- Trend direction
- Confidence score

**UI Component:** `<OneChainVolatilityBadge />` displays inline volatility indicator.

## Risk Engine Formula

The enriched `RiskContext` feeds into the Safety Score:

```
sandwichRisk    = f(volatility, poolSize, amount)
liquidityHealth = f(tvlUsd, lpConcentration, volume24h)
walletRisk      = f(oneIdReputation, crossChainActivity, riskFlags)
systemicRisk    = f(rwaExposure, transferPathComplexity)

riskScore = 0.35×sandwich + 0.25×(100-liquidity) + 0.20×wallet + 0.10×systemic + 0.10×volatility
safetyScore = clamp(100 - riskScore, 0, 100)
```

## Developer Resources

- **OneChain Docs:** https://docs.onelabs.cc/DevelopmentDocument
- **OneBox Toolkit:** https://onebox.onelabs.cc/chat
- **OneID SDK:** https://docs.oneid.xyz/developers-guide/oneid-sdk
- **Hackathon:** https://dorahacks.io/hackathon/stellar-hacks-kale-reflector

## Running in Mock Mode

All adapters default to mock mode. Toggle via the floating demo button in the app.

To switch adapters to real endpoints, set environment variables:
- `VITE_ONECHAIN_MODE=live`
- `VITE_ONEID_API_KEY=...`
- `VITE_ONEDEX_API_URL=...`
- `VITE_ONEPREDICT_API_URL=...`
