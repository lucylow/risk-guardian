import logging

from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3

logger = logging.getLogger(__name__)


def verify_onewallet_signature(address: str, message: str, signature: str) -> bool:
    """
    Verify EIP-191 signed message from OneWallet-compatible account.
    """
    try:
        message_hash = encode_defunct(text=message)
        recovered = Account.recover_message(message_hash, signature=signature)
        return Web3.to_checksum_address(recovered) == Web3.to_checksum_address(address)
    except Exception as exc:
        logger.error("Signature verification failed: %s", exc)
        return False

