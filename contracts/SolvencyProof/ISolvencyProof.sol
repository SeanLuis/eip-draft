// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISolvencyProof - Standard Interface for DeFi Protocol Solvency
 * @dev Defines core functionality for verifying and tracking protocol solvency
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
     * @param healthFactor Health factor calculated as totalAssets / totalLiabilities
     * @param timestamp Update timestamp
     */
    event SolvencyMetricsUpdated(
        uint256 totalAssets,
        uint256 totalLiabilities,
        uint256 healthFactor,
        uint256 timestamp
    );

    /**
     * @dev Emitted when risk thresholds are breached
     * @notice Alerts stakeholders of potential solvency risks
     * 
     * @param riskLevel Risk level indicating severity of the breach (CRITICAL, HIGH_RISK, WARNING)
     * @param currentValue Current value that triggered the alert
     * @param threshold Risk threshold that was breached
     * @param timestamp Alert timestamp
     */
    event RiskAlert(
        string riskLevel,
        uint256 currentValue,
        uint256 threshold,
        uint256 timestamp
    );

    /**
     * @notice Get protocol's current assets
     * @return Full asset state including tokens, amounts and values
     */
    function getProtocolAssets() external view returns (ProtocolAssets memory);

    /**
     * @notice Get protocol's current liabilities
     * @return Full liability state including tokens, amounts and values
     */
    function getProtocolLiabilities() external view returns (ProtocolLiabilities memory);

    /**
     * @notice Calculate current solvency ratio
     * @return SR = (Total Assets / Total Liabilities) × 10000
     */
    function getSolvencyRatio() external view returns (uint256);

    /**
     * @notice Check protocol solvency status
     * @return isSolvent True if ratio >= minimum required
     * @return healthFactor Current solvency ratio
     */
    function verifySolvency() external view returns (bool isSolvent, uint256 healthFactor);

    /**
     * @notice Get historical solvency metrics
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return timestamps Array of historical update timestamps
     * @return ratios Array of historical solvency ratios
     * @return assets Array of historical asset states
     * @return liabilities Array of historical liability states
     */
    function getSolvencyHistory(uint256 startTime, uint256 endTime) 
        external 
        view 
        returns (
            uint256[] memory timestamps,
            uint256[] memory ratios,
            ProtocolAssets[] memory assets,
            ProtocolLiabilities[] memory liabilities
        );

    /**
     * @notice Update protocol assets
     * @dev Only callable by authorized oracle
     */
    function updateAssets(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata values
    ) external;

    /**
     * @notice Update protocol liabilities
     * @dev Only callable by authorized oracle
     */
    function updateLiabilities(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata values
    ) external;
}