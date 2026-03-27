# Smart Contract Deployment Guide

## Overview

Risk Guardian uses three smart contracts deployed on OneChain:

| Contract | Purpose |
|----------|---------|
| `RiskOracle.sol` | Core oracle — stores risk scores per swap, manages authorized feeders |
| `RiskVerifier.sol` | Signature verification — validates feeder signatures on-chain |
| `RiskRegistry.sol` | Governance registry — manages addresses, weights, and integrations |

## Prerequisites

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers ethers @typechain/hardhat
```

## Hardhat Configuration

Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    onechainTestnet: {
      url: process.env.ONECHAIN_RPC_URL || "https://rpc-testnet.onechain.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 1666700000,
    },
    onechainMainnet: {
      url: "https://rpc-mainnet.onechain.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 1666600000,
    },
  },
};

export default config;
```

## Deployment

```bash
# Compile
npx hardhat compile

# Deploy to OneChain Testnet
npx hardhat run scripts/deploy.ts --network onechainTestnet
```

### Deploy Script (`scripts/deploy.ts`)

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy RiskOracle
  const RiskOracle = await ethers.getContractFactory("RiskOracle");
  const oracle = await RiskOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddr = await oracle.getAddress();
  console.log("RiskOracle:", oracleAddr);

  // 2. Deploy RiskVerifier
  const RiskVerifier = await ethers.getContractFactory("RiskVerifier");
  const verifier = await RiskVerifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("RiskVerifier:", verifierAddr);

  // 3. Deploy RiskRegistry
  const RiskRegistry = await ethers.getContractFactory("RiskRegistry");
  const registry = await RiskRegistry.deploy(oracleAddr, verifierAddr);
  await registry.waitForDeployment();
  console.log("RiskRegistry:", await registry.getAddress());

  // 4. Authorize oracle feeder (backend service address)
  // await oracle.authorizeFeeder(FEEDER_ADDRESS, true);
}

main().catch(console.error);
```

## After Deployment

Update `src/blockchain/types.ts` with deployed addresses:

```typescript
export const ONECHAIN_TESTNET: OneChainNetwork = {
  contracts: {
    riskOracle: "0x...",    // Deployed address
    riskVerifier: "0x...",
    riskRegistry: "0x...",
  },
  // ...
};
```

## OneChain Developer Resources

- Docs: https://docs.onelabs.cc/DevelopmentDocument
- Dev Toolkit: https://onebox.onelabs.cc/chat
- OneWallet App: https://apps.apple.com/qa/app/onewallet-onechain/id6749725541
