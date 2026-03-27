/**
 * OneChain network configuration — real RPC endpoints and contract addresses.
 * Docs: https://docs.onelabs.cc/DevelopmentDocument
 */

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  rpcFallbacks: string[];
  explorerUrl: string;
  nativeToken: string;
  isTestnet: boolean;
  contracts: {
    riskOracle: string;
    riskVerifier: string;
    riskRegistry: string;
  };
  apis: {
    oneDex: string;
    onePredict: string;
    oneId: string;
    oneRwa: string;
    oneTransfer: string;
  };
}

export const ONECHAIN_TESTNET: ChainConfig = {
  name: "OneChain Testnet",
  chainId: 1666700000,
  rpcUrl: "https://rpc-testnet.onelabs.cc",
  rpcFallbacks: [
    "https://rpc-testnet.onechain.com",
  ],
  explorerUrl: "https://explorer-testnet.onelabs.cc",
  nativeToken: "ONE",
  isTestnet: true,
  contracts: {
    riskOracle: "0x0000000000000000000000000000000000000000",   // Deploy placeholder
    riskVerifier: "0x0000000000000000000000000000000000000000",
    riskRegistry: "0x0000000000000000000000000000000000000000",
  },
  apis: {
    oneDex: "https://openapi.onechain.pro/dex",
    onePredict: "https://api.onepredict.onechain.com",
    oneId: "https://api.oneid.xyz/v1",
    oneRwa: "https://api.onerwa.onechain.com",
    oneTransfer: "https://api.onetransfer.onechain.com",
  },
};

export const ONECHAIN_MAINNET: ChainConfig = {
  name: "OneChain Mainnet",
  chainId: 1666600000,
  rpcUrl: "https://rpc.mainnet.onelabs.cc",
  rpcFallbacks: [
    "https://rpc-mainnet.onechain.com",
  ],
  explorerUrl: "https://explorer.mainnet.onelabs.cc",
  nativeToken: "ONE",
  isTestnet: false,
  contracts: {
    riskOracle: "0x0000000000000000000000000000000000000000",
    riskVerifier: "0x0000000000000000000000000000000000000000",
    riskRegistry: "0x0000000000000000000000000000000000000000",
  },
  apis: {
    oneDex: "https://openapi.onechain.pro/dex",
    onePredict: "https://api.onepredict.onechain.com",
    oneId: "https://api.oneid.xyz/v1",
    oneRwa: "https://api.onerwa.onechain.com",
    oneTransfer: "https://api.onetransfer.onechain.com",
  },
};

export function getChainConfig(chainId?: number): ChainConfig {
  if (chainId === ONECHAIN_MAINNET.chainId) return ONECHAIN_MAINNET;
  return ONECHAIN_TESTNET;
}

export const DEFAULT_CHAIN = ONECHAIN_TESTNET;
