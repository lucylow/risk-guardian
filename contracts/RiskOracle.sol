// SPDX-License-Identifier: MIT
// Reference Solidity — deploy with Hardhat/Foundry on OneChain
// RPC: https://rpc-testnet.onechain.com  |  ChainID: 1666700000

pragma solidity ^0.8.20;

/**
 * @title RiskOracle
 * @notice On-chain risk score storage for the Risk Guardian / Risk Oracle system.
 *         Authorized oracle feeders compute risk off-chain and publish signed scores
 *         to this contract, where any dApp (OneDEX, OnePoker, etc.) can read them.
 */
contract RiskOracle {
    // ── Structs ──────────────────────────────────────────────────────────────

    struct RiskScore {
        uint256 safetyScore;      // 0–1000 (×10 precision, e.g. 845 = 84.5%)
        uint256 sandwichRisk;     // 0–1000
        uint256 liquidityRisk;    // 0–1000
        uint256 walletRisk;       // 0–1000
        uint256 volatilityRisk;   // 0–1000
        uint256 timestamp;        // Unix seconds
        address swapInitiator;
        address tokenIn;
        address tokenOut;
    }

    // ── State ────────────────────────────────────────────────────────────────

    address public owner;
    mapping(bytes32 => RiskScore) public swapRiskScores;
    mapping(address => uint256) public walletRiskProfiles;
    mapping(address => bool) public authorizedFeeders;
    uint256 public totalScoresPublished;

    // ── Events ───────────────────────────────────────────────────────────────

    event RiskScorePublished(
        bytes32 indexed swapId,
        address indexed swapInitiator,
        uint256 safetyScore,
        uint256 timestamp
    );

    event WalletRiskUpdated(address indexed wallet, uint256 riskScore);
    event FeederAuthorized(address indexed feeder, bool authorized);

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyFeeder() {
        require(authorizedFeeders[msg.sender], "Unauthorized feeder");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        authorizedFeeders[msg.sender] = true;
        emit FeederAuthorized(msg.sender, true);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    function authorizeFeeder(address feeder, bool authorized) external onlyOwner {
        authorizedFeeders[feeder] = authorized;
        emit FeederAuthorized(feeder, authorized);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    // ── Core ─────────────────────────────────────────────────────────────────

    /**
     * @notice Publish a risk score for a swap. Called by authorized oracle feeders.
     * @param initiator Address that initiated the swap
     * @param tokenIn   Input token address
     * @param tokenOut  Output token address
     * @param amountIn  Amount of tokenIn (wei)
     * @param score     The computed RiskScore struct
     */
    function publishRiskScore(
        address initiator,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        RiskScore calldata score
    ) external onlyFeeder {
        require(score.safetyScore <= 1000, "Score out of range");
        require(score.timestamp <= block.timestamp + 60, "Future timestamp");

        bytes32 swapId = computeSwapId(initiator, tokenIn, tokenOut, amountIn, score.timestamp);
        swapRiskScores[swapId] = score;
        totalScoresPublished++;

        emit RiskScorePublished(swapId, initiator, score.safetyScore, score.timestamp);
    }

    /**
     * @notice Update aggregate wallet risk profile.
     */
    function updateWalletRisk(address wallet, uint256 riskScore) external onlyFeeder {
        require(riskScore <= 1000, "Score out of range");
        walletRiskProfiles[wallet] = riskScore;
        emit WalletRiskUpdated(wallet, riskScore);
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    function getSwapRisk(bytes32 swapId) external view returns (RiskScore memory) {
        return swapRiskScores[swapId];
    }

    function getWalletRisk(address wallet) external view returns (uint256) {
        return walletRiskProfiles[wallet];
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    function computeSwapId(
        address initiator,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(initiator, tokenIn, tokenOut, amountIn, timestamp));
    }
}
