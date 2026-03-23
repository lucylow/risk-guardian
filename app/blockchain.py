import asyncio
import logging
from typing import Any, Dict, List

from web3 import Web3
from web3.middleware import geth_poa_middleware
from web3.exceptions import ContractLogicError

from .config import settings

logger = logging.getLogger(__name__)


class OneChainClient:
    def __init__(self) -> None:
        self.w3 = Web3(Web3.HTTPProvider(settings.ONE_CHAIN_RPC_URL))
        self.connected = self.w3.is_connected()
        if not self.connected:
            logger.warning("Failed to connect to OneChain RPC: %s", settings.ONE_CHAIN_RPC_URL)

        # Some EVM chains require PoA middleware for block header handling.
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.one_dex_contract = None
        self._init_contract()

    def _init_contract(self) -> None:
        one_dex_abi = [
            {
                "inputs": [
                    {"internalType": "address", "name": "token0", "type": "address"},
                    {"internalType": "address", "name": "token1", "type": "address"},
                ],
                "name": "getPool",
                "outputs": [{"internalType": "address", "name": "poolAddress", "type": "address"}],
                "stateMutability": "view",
                "type": "function",
            },
            {
                "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
                "name": "getReserves",
                "outputs": [
                    {"internalType": "uint256", "name": "reserve0", "type": "uint256"},
                    {"internalType": "uint256", "name": "reserve1", "type": "uint256"},
                ],
                "stateMutability": "view",
                "type": "function",
            },
            {
                "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
                "name": "totalSupply",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function",
            },
        ]

        if not self.connected:
            logger.warning("Skipping OneDex contract initialization due to RPC connectivity failure")
            return

        if not Web3.is_address(settings.ONE_DEX_CONTRACT_ADDRESS):
            logger.warning(
                "Invalid ONE_DEX_CONTRACT_ADDRESS: %s",
                settings.ONE_DEX_CONTRACT_ADDRESS,
            )
            return

        try:
            self.one_dex_contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(settings.ONE_DEX_CONTRACT_ADDRESS),
                abi=one_dex_abi,
            )
        except Exception as exc:
            logger.exception("Failed to initialize OneDex contract: %s", exc)
            self.one_dex_contract = None

    def _ensure_ready(self) -> None:
        if not self.connected:
            raise ConnectionError("OneChain RPC is not connected")
        if self.one_dex_contract is None:
            raise RuntimeError("OneDex contract is not initialized")

    async def get_pool(self, token0: str, token1: str) -> str:
        self._ensure_ready()
        if not Web3.is_address(token0) or not Web3.is_address(token1):
            raise ValueError("token0 and token1 must be valid EVM addresses")

        loop = asyncio.get_running_loop()
        try:
            return await loop.run_in_executor(
                None,
                self.one_dex_contract.functions.getPool(
                    Web3.to_checksum_address(token0), Web3.to_checksum_address(token1)
                ).call,
            )
        except (ContractLogicError, ValueError) as exc:
            logger.warning("getPool failed for %s/%s: %s", token0, token1, exc)
            raise
        except Exception as exc:
            logger.exception("Unexpected getPool error for %s/%s: %s", token0, token1, exc)
            raise

    async def get_reserves(self, pool_address: str) -> Dict[str, int]:
        self._ensure_ready()
        if not Web3.is_address(pool_address):
            raise ValueError("pool_address must be a valid EVM address")

        loop = asyncio.get_running_loop()
        try:
            reserve0, reserve1 = await loop.run_in_executor(
                None,
                self.one_dex_contract.functions.getReserves(Web3.to_checksum_address(pool_address)).call,
            )
        except (ContractLogicError, ValueError) as exc:
            logger.warning("getReserves failed for %s: %s", pool_address, exc)
            raise
        except Exception as exc:
            logger.exception("Unexpected getReserves error for %s: %s", pool_address, exc)
            raise
        return {"reserve0": reserve0, "reserve1": reserve1}

    async def get_pool_liquidity_usd(self, token0: str, token1: str) -> float:
        pool_addr = await self.get_pool(token0, token1)
        if not pool_addr or int(pool_addr, 16) == 0:
            raise LookupError(f"No pool found for token pair {token0}/{token1}")
        reserves = await self.get_reserves(pool_addr)
        return float(reserves["reserve0"] + reserves["reserve1"]) / 1e18

    async def get_mempool_snapshot(self) -> List[Dict[str, Any]]:
        # Most public RPC endpoints do not expose txpool for pending tx introspection.
        return []

    async def get_wallet_transactions(self, address: str, limit: int = 100) -> List[Dict[str, Any]]:
        # Wallet tx history generally requires indexer/explorer APIs or archive infra.
        _ = (address, limit)
        return []


try:
    onechain = OneChainClient()
except Exception as exc:
    logger.exception("OneChain client initialization failed: %s", exc)
    onechain = None

