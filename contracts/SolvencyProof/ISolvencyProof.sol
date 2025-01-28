// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISolvencyProof Interface
 * @notice Standard interface for implementing solvency proofs in DeFi protocols
 * @dev This interface defines the core functionality for tracking and verifying protocol solvency
 * 
 * The interface implements a comprehensive system for:
 * - Asset and liability tracking
 * - Solvency ratio calculations
 * - Risk monitoring and alerts
 * - Historical data management
 */
interface ISolvencyProof {
    /**
     * @dev Protocol assets structure
     * @notice Represents the current state of protocol assets
     * 
     * @param tokens Array of token addresses managed by the protocol
     * @param amounts Array of token amounts held by the protocol
     * @param values Array of token values in ETH denomination
     * @param timestamp Last update timestamp
     * 
     * Requirements:
     * - All arrays must have the same length
     * - Values must be denominated in ETH with 18 decimals
     */
    struct ProtocolAssets {
        address[] tokens;
        uint256[] amounts;
        uint256[] values;
        uint256 timestamp;
    }

    /**
     * @dev Protocol liabilities structure
     * @notice Represents the current state of protocol liabilities
     * 
     * @param tokens Array of token addresses that the protocol owes
     * @param amounts Array of token amounts owed
     * @param values Array of liability values in ETH denomination
     * @param timestamp Last update timestamp
     * 
     * Requirements:
     * - All arrays must have the same length
     * - Values must be denominated in ETH with 18 decimals
     */
    struct ProtocolLiabilities {
        address[] tokens;
        uint256[] amounts;
        uint256[] values;
        uint256 timestamp;
    }

    /**
     * @dev Emitted when solvency metrics are updated
     * @notice Provides real-time updates of protocol's financial health
     * 
     * @param totalAssets Sum of all asset values in ETH
     * @param totalLiabilities Sum of all liability values in ETH
     * @param solvencyRatio Current solvency ratio (base 10000)
     * @param timestamp Update timestamp
     */
    event SolvencyMetricsUpdated(
        uint256 totalAssets,
        uint256 totalLiabilities,
        uint256 solvencyRatio,
        uint256 timestamp
    );

    /**
     * @dev Emitted when risk thresholds are breached
     * @notice Alerts stakeholders of potential solvency risks
     * 
     * @param riskType Type of risk detected (e.g., "CRITICAL_SOLVENCY", "LOW_SOLVENCY")
     * @param currentValue Current value that triggered the alert
     * @param threshold Risk threshold that was breached
     * @param timestamp Alert timestamp
     */
    event RiskAlert(
        string riskType,
        uint256 currentValue,
        uint256 threshold,
        uint256 timestamp
    );

    /**
     * @notice Retrieves current protocol assets
     * @dev Returns complete asset information including tokens, amounts, and values
     * @return Complete ProtocolAssets struct with current asset state
     */
    function getProtocolAssets() external view returns (ProtocolAssets memory);

    /**
     * @notice Retrieves current protocol liabilities
     * @dev Returns complete liability information including tokens, amounts, and values
     * @return Complete ProtocolLiabilities struct with current liability state
     */
    function getProtocolLiabilities() external view returns (ProtocolLiabilities memory);

    /**
     * @notice Calculates current solvency ratio
     * @dev Computation: (Total Assets / Total Liabilities) * 10000
     * @return Current solvency ratio in base 10000 (e.g., 12000 = 120%)
     */
    function getSolvencyRatio() external view returns (uint256);

    /**
     * @notice Verifies protocol solvency status
     * @dev Checks if current solvency ratio meets minimum requirements
     * 
     * @return isSolvent Boolean indicating if protocol is solvent
     * @return healthFactor Current health factor (same as solvency ratio)
     * 
     * Requirements:
     * - Returns true if solvency ratio >= minimum required ratio
     * - Health factor represents current solvency ratio
     */
    function verifySolvency() external view returns (bool isSolvent, uint256 healthFactor);

    /**
     * @notice Retrieves historical solvency metrics
     * @dev Returns arrays of timestamps and corresponding solvency ratios
     * 
     * @param startTime Start of time range to query
     * @param endTime End of time range to query
     * @return timestamps Array of update timestamps
     * @return ratios Array of historical solvency ratios
     * 
     * Requirements:
     * - startTime must be <= endTime
     * - Arrays will have matching lengths
     */
    function getSolvencyHistory(uint256 startTime, uint256 endTime) 
        external 
        view 
        returns (uint256[] memory timestamps, uint256[] memory ratios);
}