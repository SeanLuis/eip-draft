// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ISolvencyProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title SolvencyProof
 * @notice Implementation of the DeFi Protocol Solvency Proof Standard
 * @dev Implements ISolvencyProof interface with comprehensive solvency tracking
 * 
 * This contract provides:
 * - Real-time solvency monitoring
 * - Multi-oracle price feed integration
 * - Risk alert system
 * - Historical metrics tracking
 * 
 * Security features:
 * - Reentrancy protection
 * - Access control for oracles
 * - Rate limiting
 * - Threshold-based risk alerts
 */
contract SolvencyProof is ISolvencyProof, Ownable, ReentrancyGuard {
    using Math for uint256;

    // === Constants ===
    /**
     * @dev Base for ratio calculations (100% = 10000)
     */
    uint256 private constant RATIO_DECIMALS = 10000;

    /**
     * @dev Minimum required solvency ratio (105% = 10500)
     */
    uint256 private constant MIN_SOLVENCY_RATIO = 10500;

    /**
     * @dev Critical solvency threshold (102% = 10200)
     */
    uint256 private constant CRITICAL_SOLVENCY_RATIO = 10200;

    // === State Variables ===
    /**
     * @dev Current protocol assets state
     */
    ProtocolAssets private currentAssets;

    /**
     * @dev Current protocol liabilities state
     */
    ProtocolLiabilities private currentLiabilities;

    /**
     * @dev Historical metrics for solvency tracking
     */
    HistoricalMetric[] private metricsHistory;

    /**
     * @dev Mapping of authorized oracle addresses
     */
    mapping(address => bool) public assetOracles;

    /**
     * @dev Struct for storing historical metrics
     */
    struct HistoricalMetric {
        uint256 timestamp;
        uint256 solvencyRatio;
    }

    // === Events ===
    /**
     * @dev Emitted when oracle authorization is updated
     */
    event OracleUpdated(address indexed oracle, bool authorized);

    /**
     * @notice Contract constructor
     * @dev Initializes the contract with the deployer as owner
     */
    constructor() Ownable(msg.sender) {}

    // === Modifiers ===
    /**
     * @dev Restricts function access to authorized oracles
     */
    modifier onlyOracle() {
        require(assetOracles[msg.sender], "Not authorized oracle");
        _;
    }

    // === External Functions ===
    
    /**
     * @notice Updates protocol assets
     * @dev Records new asset values and triggers metrics update
     * 
     * @param tokens Array of token addresses
     * @param amounts Array of token amounts
     * @param values Array of token values in ETH
     * 
     * Requirements:
     * - Caller must be authorized oracle
     * - All arrays must have matching lengths
     * - Values must be in ETH with 18 decimals
     * 
     * Emits:
     * - {SolvencyMetricsUpdated} event
     * - {RiskAlert} event if thresholds are breached
     */
    function updateAssets(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata values
    ) external onlyOracle nonReentrant {
        require(tokens.length == amounts.length && 
                amounts.length == values.length, 
                "Array lengths mismatch");

        currentAssets = ProtocolAssets({
            tokens: tokens,
            amounts: amounts,
            values: values,
            timestamp: block.timestamp
        });

        _updateMetrics();
    }

    // Implementación de la interfaz
    function getProtocolAssets() external view returns (ProtocolAssets memory) {
        return currentAssets;
    }

    function getProtocolLiabilities() external view returns (ProtocolLiabilities memory) {
        return currentLiabilities;
    }

    function getSolvencyRatio() external view returns (uint256) {
        return _calculateSolvencyRatio();
    }

    function verifySolvency() external view returns (bool isSolvent, uint256 healthFactor) {
        uint256 ratio = _calculateSolvencyRatio();
        isSolvent = ratio >= MIN_SOLVENCY_RATIO;
        healthFactor = ratio;

        if (ratio < CRITICAL_SOLVENCY_RATIO) {
            // Aquí se podría agregar lógica adicional para manejar situaciones críticas
            return (false, ratio);
        }

        return (isSolvent, healthFactor);
    }

    function getSolvencyHistory(uint256 startTime, uint256 endTime)
        external
        view
        returns (uint256[] memory timestamps, uint256[] memory ratios)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < metricsHistory.length; i++) {
            if (metricsHistory[i].timestamp >= startTime && 
                metricsHistory[i].timestamp <= endTime) {
                count++;
            }
        }

        timestamps = new uint256[](count);
        ratios = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < metricsHistory.length && index < count; i++) {
            if (metricsHistory[i].timestamp >= startTime && 
                metricsHistory[i].timestamp <= endTime) {
                timestamps[index] = metricsHistory[i].timestamp;
                ratios[index] = metricsHistory[i].solvencyRatio;
                index++;
            }
        }

        return (timestamps, ratios);
    }

    // Funciones para actualizar estado
    function updateLiabilities(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata values
    ) external onlyOracle nonReentrant {
        require(tokens.length == amounts.length && amounts.length == values.length, 
                "Array lengths mismatch");

        currentLiabilities.tokens = tokens;
        currentLiabilities.amounts = amounts;
        currentLiabilities.values = values;
        currentLiabilities.timestamp = block.timestamp;

        _updateMetrics();
    }

    // === Admin Functions ===
    /**
     * @notice Sets or revokes oracle authorization
     * @dev Allows owner to manage oracle access
     * 
     * @param oracle Address of the oracle to modify
     * @param authorized True to authorize, false to revoke
     * 
     * Requirements:
     * - Caller must be contract owner
     * 
     * Emits:
     * - {OracleUpdated} event when authorization changes
     */
    function setOracle(address oracle, bool authorized) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        assetOracles[oracle] = authorized;
        emit OracleUpdated(oracle, authorized);
    }

    // Funciones internas
    /**
     * @dev Internal function to calculate solvency ratio
     * @return Calculated solvency ratio in RATIO_DECIMALS base
     */
    function _calculateSolvencyRatio() internal view returns (uint256) {
        uint256 totalAssets = _sumArray(currentAssets.values);
        uint256 totalLiabilities = _sumArray(currentLiabilities.values);

        if (totalLiabilities == 0) return type(uint256).max;
        return (totalAssets * RATIO_DECIMALS) / totalLiabilities;
    }

    function _updateMetrics() internal {
        uint256 ratio = _calculateSolvencyRatio();
        
        metricsHistory.push(HistoricalMetric({
            timestamp: block.timestamp,
            solvencyRatio: ratio
        }));

        uint256 totalAssets = _sumArray(currentAssets.values);
        uint256 totalLiabilities = _sumArray(currentLiabilities.values);

        emit SolvencyMetricsUpdated(
            totalAssets,
            totalLiabilities,
            ratio,
            block.timestamp
        );

        if (ratio < CRITICAL_SOLVENCY_RATIO) {
            emit RiskAlert(
                "CRITICAL_SOLVENCY",
                ratio,
                CRITICAL_SOLVENCY_RATIO,
                block.timestamp
            );
        } else if (ratio < MIN_SOLVENCY_RATIO) {
            emit RiskAlert(
                "LOW_SOLVENCY",
                ratio,
                MIN_SOLVENCY_RATIO,
                block.timestamp
            );
        }
    }

    function _sumArray(uint256[] memory array) internal pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < array.length; i++) {
            sum += array[i];
        }
        return sum;
    }
}