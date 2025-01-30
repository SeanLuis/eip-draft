// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ISolvencyProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SolvencyProof
 * @notice Implementation of DeFi Protocol Solvency Proof Standard
 */
contract SolvencyProof is ISolvencyProof, Ownable, ReentrancyGuard {
    // === Constants ===
    uint256 private constant RATIO_DECIMALS = 10000;      // Base for calculations
    uint256 private constant MIN_SOLVENCY_RATIO = 10500;  // 105%
    uint256 private constant CRITICAL_RATIO = 10200;      // 102%

    // === State Variables ===
    ProtocolAssets private currentAssets;
    ProtocolLiabilities private currentLiabilities;
    mapping(address => bool) public assetOracles;

    struct HistoricalMetric {
        uint256 timestamp;
        uint256 solvencyRatio;
        ProtocolAssets assets;
        ProtocolLiabilities liabilities;
    }
    HistoricalMetric[] private metricsHistory;

    // === Events ===
    event OracleUpdated(address indexed oracle, bool authorized);

    // === Constructor & Modifiers ===
    constructor() Ownable(msg.sender) {}

    modifier onlyOracle() {
        require(assetOracles[msg.sender], "Not authorized oracle");
        _;
    }

    // === External Functions ===
    // === Interface Implementation ===
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
        return (ratio >= MIN_SOLVENCY_RATIO, ratio);
    }

    function getSolvencyHistory(uint256 startTime, uint256 endTime) 
        external 
        view 
        returns (
            uint256[] memory timestamps,
            uint256[] memory ratios,
            ProtocolAssets[] memory assets,
            ProtocolLiabilities[] memory liabilities
        )
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
        assets = new ProtocolAssets[](count);
        liabilities = new ProtocolLiabilities[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < metricsHistory.length && index < count; i++) {
            if (metricsHistory[i].timestamp >= startTime && 
                metricsHistory[i].timestamp <= endTime) {
                timestamps[index] = metricsHistory[i].timestamp;
                ratios[index] = metricsHistory[i].solvencyRatio;
                assets[index] = metricsHistory[i].assets;
                liabilities[index] = metricsHistory[i].liabilities;
                index++;
            }
        }

        return (timestamps, ratios, assets, liabilities);
    }

    function updateAssets(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata values
    ) external onlyOracle nonReentrant {
        require(tokens.length == amounts.length && amounts.length == values.length, 
                "Array lengths mismatch");

        currentAssets = ProtocolAssets({
            tokens: tokens,
            amounts: amounts,
            values: values,
            timestamp: block.timestamp
        });

        _updateMetrics();
    }

    function updateLiabilities(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata values
    ) external onlyOracle nonReentrant {
        require(tokens.length == amounts.length && amounts.length == values.length, 
                "Array lengths mismatch");

        currentLiabilities = ProtocolLiabilities({
            tokens: tokens,
            amounts: amounts,
            values: values,
            timestamp: block.timestamp
        });

        _updateMetrics();
    }

    // === Admin Functions ===
    function setOracle(address oracle, bool authorized) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        assetOracles[oracle] = authorized;
        emit OracleUpdated(oracle, authorized);
    }

    // === Internal Functions ===
    function _calculateSolvencyRatio() internal view returns (uint256) {
        uint256 totalAssets = _sumArray(currentAssets.values);
        uint256 totalLiabilities = _sumArray(currentLiabilities.values);
        
        // Siempre que haya assets, debe haber un ratio calculable
        if (totalLiabilities == 0) {
            return totalAssets > 0 ? RATIO_DECIMALS * 2 : RATIO_DECIMALS; // 200% o 100%
        }
        
        return (totalAssets * RATIO_DECIMALS) / totalLiabilities;
    }

    function _updateMetrics() internal {
        uint256 totalAssets = _sumArray(currentAssets.values);
        uint256 totalLiabilities = _sumArray(currentLiabilities.values);
        uint256 ratio = _calculateSolvencyRatio();

        // Debug log
        emit SolvencyMetricsUpdated(
            totalAssets,
            totalLiabilities,
            ratio,
            block.timestamp
        );
        
        metricsHistory.push(HistoricalMetric({
            timestamp: block.timestamp,
            solvencyRatio: ratio,
            assets: currentAssets,
            liabilities: currentLiabilities
        }));

        // Actualizar alertas basadas en el ratio real
        if (ratio < CRITICAL_RATIO) {
            emit RiskAlert("CRITICAL", ratio, totalAssets, totalLiabilities);
        } else if (ratio < MIN_SOLVENCY_RATIO) {
            emit RiskAlert("HIGH_RISK", ratio, totalAssets, totalLiabilities);
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