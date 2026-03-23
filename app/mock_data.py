from typing import Any, Dict


MOCK_POOLS: Dict[str, Dict[str, Any]] = {
    "ONE_USDC": {
        "liquidity_usd": 5_000_000,
        "volume_24h": 2_000_000,
        "lp_holder_concentration": 0.2,
    },
    "ONE_BTC": {
        "liquidity_usd": 500_000,
        "volume_24h": 200_000,
        "lp_holder_concentration": 0.6,
    },
    "SHIT_USDC": {
        "liquidity_usd": 5_000,
        "volume_24h": 500,
        "lp_holder_concentration": 0.95,
    },
}

MOCK_WALLETS: Dict[str, Dict[str, Any]] = {
    "0x1234567890123456789012345678901234567890": {"score": 85, "flags": []},
    "0xdeadbeef": {"score": 15, "flags": ["suspicious"]},
}


def get_mock_pool_health(token_in: str, token_out: str) -> Dict[str, Any]:
    key = f"{token_in}_{token_out}".upper()
    if key in MOCK_POOLS:
        return MOCK_POOLS[key]

    return {
        "liquidity_usd": 100_000,
        "volume_24h": 50_000,
        "lp_holder_concentration": 0.5,
    }


def get_mock_mempool(token_pair: str) -> Dict[str, Any]:
    if "SHIT" in token_pair:
        pending = 30
    elif token_pair == "ONE_BTC":
        pending = 15
    else:
        pending = 5

    return {
        "pending_count": pending,
        "gas_price_percentile": 50 + pending,
        "gas_price_std": 10,
        "time_since_last_block": 2,
    }


def get_mock_wallet_reputation(address: str) -> Dict[str, Any]:
    if address in MOCK_WALLETS:
        return MOCK_WALLETS[address]
    return {"score": 50, "flags": []}


def get_mock_volatility(token_pair: str) -> float:
    if "SHIT" in token_pair:
        return 80.0
    if "BTC" in token_pair:
        return 60.0
    return 30.0
