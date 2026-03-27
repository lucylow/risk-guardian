// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RiskVerifier
 * @notice Verifies that off-chain risk scores were signed by an authorized oracle feeder.
 *         Any dApp can call `verifyRiskSignature()` before executing a swap to ensure
 *         the risk assessment is authentic and untampered.
 */
contract RiskVerifier {
    mapping(address => bool) public authorizedSigners;
    address public owner;

    event SignerUpdated(address indexed signer, bool authorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedSigners[msg.sender] = true;
    }

    function setAuthorizedSigner(address signer, bool authorized) external onlyOwner {
        authorizedSigners[signer] = authorized;
        emit SignerUpdated(signer, authorized);
    }

    /**
     * @notice Verify that a risk score was signed by an authorized feeder.
     * @param initiator  Swap initiator address
     * @param tokenIn    Input token
     * @param tokenOut   Output token
     * @param amountIn   Amount (wei)
     * @param safetyScore The safety score (0–1000)
     * @param timestamp  When the score was computed
     * @param signature  EIP-191 signature bytes
     * @return True if the signature is from an authorized signer
     */
    function verifyRiskSignature(
        address initiator,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 safetyScore,
        uint256 timestamp,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(
            initiator, tokenIn, tokenOut, amountIn, safetyScore, timestamp
        ));

        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address signer = recoverSigner(ethSignedMessageHash, signature);
        return authorizedSigners[signer];
    }

    function recoverSigner(bytes32 hash, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature v");

        return ecrecover(hash, v, r, s);
    }
}
