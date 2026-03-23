export interface UserSettings {
  auto_protect_enabled: boolean;
  risk_threshold: number;
  auto_adjust_slippage: boolean;
  notify_on_high_risk: boolean;
}

export interface MockHistoryEntry {
  id: number;
  token_in: string;
  token_out: string;
  amount_in: number;
  safety_score: number;
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
  created_at: string;
}

export const mockUserSettings: UserSettings = {
  auto_protect_enabled: false,
  risk_threshold: 50,
  auto_adjust_slippage: true,
  notify_on_high_risk: true,
};

export const mockHistory: MockHistoryEntry[] = [
  {
    id: 1,
    token_in: "ONE",
    token_out: "USDC",
    amount_in: 100,
    safety_score: 92,
    sandwich_risk: 5,
    liquidity_health: 95,
    wallet_risk: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    token_in: "ONE",
    token_out: "BTC",
    amount_in: 1000,
    safety_score: 78,
    sandwich_risk: 12,
    liquidity_health: 88,
    wallet_risk: 15,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
