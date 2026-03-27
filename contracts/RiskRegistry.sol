// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RiskRegistry
 * @notice Governance registry for the Risk Oracle ecosystem.
 *         Manages contract addresses, fee parameters, and integration metadata.
 *         Used by OneDEX, OnePoker, and other OneChain dApps to discover oracle services.
 */
contract RiskRegistry {
    struct Integration {
        string name;           // e.g. "OneDEX", "OnePoker"
        address integrator;    // Integrator contract address
        bool active;
        uint256 registeredAt;
    }

    address public owner;
    address public riskOracleAddress;
    address public riskVerifierAddress;

    mapping(bytes32 => Integration) public integrations;
    bytes32[] public integrationIds;

    // Risk parameters (governable)
    uint256 public sandwichWeight = 400;     // 40.0% × 1000
    uint256 public liquidityWeight = 300;    // 30.0%
    uint256 public walletWeight = 200;       // 20.0%
    uint256 public volatilityWeight = 100;   // 10.0%

    event OracleAddressUpdated(address indexed oracle);
    event VerifierAddressUpdated(address indexed verifier);
    event IntegrationRegistered(bytes32 indexed id, string name, address integrator);
    event WeightsUpdated(uint256 sandwich, uint256 liquidity, uint256 wallet, uint256 volatility);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _oracle, address _verifier) {
        owner = msg.sender;
        riskOracleAddress = _oracle;
        riskVerifierAddress = _verifier;
    }

    function setOracleAddress(address _oracle) external onlyOwner {
        riskOracleAddress = _oracle;
        emit OracleAddressUpdated(_oracle);
    }

    function setVerifierAddress(address _verifier) external onlyOwner {
        riskVerifierAddress = _verifier;
        emit VerifierAddressUpdated(_verifier);
    }

    function registerIntegration(string calldata name, address integrator) external onlyOwner {
        bytes32 id = keccak256(abi.encodePacked(name, integrator));
        integrations[id] = Integration({
            name: name,
            integrator: integrator,
            active: true,
            registeredAt: block.timestamp
        });
        integrationIds.push(id);
        emit IntegrationRegistered(id, name, integrator);
    }

    function updateWeights(
        uint256 _sandwich,
        uint256 _liquidity,
        uint256 _wallet,
        uint256 _volatility
    ) external onlyOwner {
        require(_sandwich + _liquidity + _wallet + _volatility == 1000, "Weights must sum to 1000");
        sandwichWeight = _sandwich;
        liquidityWeight = _liquidity;
        walletWeight = _wallet;
        volatilityWeight = _volatility;
        emit WeightsUpdated(_sandwich, _liquidity, _wallet, _volatility);
    }

    function getIntegrationCount() external view returns (uint256) {
        return integrationIds.length;
    }
}
