from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    USE_MOCK_DATA: bool = False
    DATABASE_URL: str = "sqlite:///./risk_oracle.db"
    FLASHBOTS_RELAY_URL: str = "https://relay.flashbots.net"

    # OneChain blockchain
    ONE_CHAIN_RPC_URL: str = "https://rpc.onechain.io"
    ONE_DEX_CONTRACT_ADDRESS: str = "0x0000000000000000000000000000000000000000"

    # OnePredict
    ONE_PREDICT_API_URL: str = "https://api.onepredict.io/v1"
    ONE_PREDICT_API_KEY: str = ""

    # OneID
    ONE_ID_API_URL: str = "https://api.oneid.io/v1"
    ONE_ID_API_KEY: str = ""

    # Security
    SECRET_KEY: str = "change_this_in_production"

    # AI Models
    SANDWICH_MODEL_PATH: str = "models/sandwich_xgb.joblib"
    LIQUIDITY_MODEL_PATH: str = "models/liquidity_lstm.joblib"
    WALLET_MODEL_PATH: str = "models/wallet_autoencoder.joblib"

    # Caching
    FEATURE_CACHE_TTL: int = 60

    class Config:
        env_file = ".env"


settings = Settings()

