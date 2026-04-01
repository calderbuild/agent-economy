// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentEconomyAttestation
 * @notice Logs economic events (task completions, tool purchases, payments)
 *         as on-chain attestations on Kite Chain for auditability.
 */
contract AgentEconomyAttestation {
    event Attestation(
        bytes32 indexed taskHash,
        address indexed agent,
        uint256 amount,
        string attestationType,
        uint256 timestamp
    );

    uint256 public attestationCount;

    /**
     * @notice Log an attestation for an economic event.
     * @param taskHash Hash of the task ID
     * @param agent Address of the agent involved
     * @param amount Amount in token smallest units
     * @param attestationType Type: "task_completed", "tool_purchased", "payment_received"
     */
    function logAttestation(
        bytes32 taskHash,
        address agent,
        uint256 amount,
        string calldata attestationType
    ) external {
        attestationCount++;
        emit Attestation(taskHash, agent, amount, attestationType, block.timestamp);
    }

    /**
     * @notice Convenience: log multiple attestations in one transaction.
     */
    function logBatch(
        bytes32[] calldata taskHashes,
        address[] calldata agents,
        uint256[] calldata amounts,
        string[] calldata types
    ) external {
        require(
            taskHashes.length == agents.length &&
            agents.length == amounts.length &&
            amounts.length == types.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < taskHashes.length; i++) {
            attestationCount++;
            emit Attestation(taskHashes[i], agents[i], amounts[i], types[i], block.timestamp);
        }
    }
}
