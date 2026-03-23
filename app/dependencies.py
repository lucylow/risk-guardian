from fastapi import Header, HTTPException, status


def get_current_user_address(x_user_address: str = Header(...)) -> str:
    # Demo-only identity extraction.
    # Replace with OneWallet JWT/signature validation in production.
    if not x_user_address:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing user address",
        )
    return x_user_address
