# Fork Testing Guide for ERC-7893

This guide explains how to test the ERC-7893 implementation against real mainnet protocols using Hardhat's fork functionality.

## Environment Setup

Create a `.env` file in your project root:

```bash
# Fork Testing Configuration
FORK_MAINNET=false
MAINNET_RPC_URL=https://ethereum.publicnode.com

# Gas Reporting
REPORT_GAS=false
```

## Running Fork Tests

### Basic Fork Testing

```bash
# Enable mainnet fork
FORK_MAINNET=true npx hardhat test

# Run with gas reporting
FORK_MAINNET=true REPORT_GAS=true npx hardhat test
```

### Protocol-Specific Testing

```bash
# Test against Aave V3
FORK_AAVE=true npx hardhat test test/fork/AaveIntegration.test.ts

# Test against Compound V3  
FORK_COMPOUND=true npx hardhat test test/fork/CompoundIntegration.test.ts

# Test Chainlink oracle integration
FORK_CHAINLINK=true npx hardhat test test/fork/ChainlinkIntegration.test.ts
```

## Production Protocol Addresses

When testing against mainnet fork, use these verified addresses:

### Aave V3
- **Pool**: `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`
- **PoolDataProvider**: `0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3`
- **WETH Gateway**: `0x893411580e590D62dDBca8a703d61Cc4A8c7b2b9`

### Compound V3
- **cUSDCv3**: `0xc3d688B66703497DAA19211EEdff47f25384cdc3`
- **Configurator**: `0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3`
- **Rewards**: `0x1B0e765F6224C21223AeA2af16c1C46E38885a40`

### Chainlink Oracles
- **ETH/USD**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- **BTC/USD**: `0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c`
- **USDC/USD**: `0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6`

## Expected Validation Results

Fork testing should demonstrate:

1. **Gas Efficiency**: Operations consume less gas than equivalent protocol functions
2. **Parameter Accuracy**: Security thresholds align with production protocols
3. **Oracle Integration**: Real Chainlink feeds work correctly with consensus mechanisms
4. **Circuit Breakers**: Respond appropriately to historical market volatility events

## Sample Fork Test Structure

```typescript
describe("Fork Testing: Aave Integration", function() {
  before(async function() {
    // Skip if not fork testing
    if (!process.env.FORK_AAVE) this.skip();
  });
  
  it("Should validate against Aave V3 liquidation thresholds", async function() {
    const aavePool = await ethers.getContractAt("IPool", AAVE_V3_POOL);
    const wethReserveData = await aavePool.getReserveData(WETH_ADDRESS);
    
    // Compare our critical ratio with Aave's liquidation threshold
    const aaveLiquidationThreshold = wethReserveData.configuration.liquidationThreshold;
    const ourCriticalRatio = await solvencyProof.CRITICAL_RATIO();
    
    expect(ourCriticalRatio).to.be.closeTo(aaveLiquidationThreshold, 500); // Within 5%
  });
});
```

## Gas Benchmarking

Fork testing enables accurate gas benchmarking against production protocols:

```typescript
it("Should consume less gas than Aave liquidation", async function() {
  const gasUsed = await solvencyProof.updateAssets.estimateGas(tokens, amounts, values);
  const aaveLiquidationGas = 400000; // Known Aave V3 liquidation gas cost
  
  expect(gasUsed).to.be.lessThan(aaveLiquidationGas);
});
```

This comprehensive testing approach ensures the ERC-7893 implementation meets production-grade requirements and performs competitively against established DeFi protocols.

## Fork Testing Results

### Aave V3 Integration Validation

![Aave Integration Comparison](../images/test-results/aave-integration-comparison.png)

*Configuration comparison between Aave V3 WETH parameters and ERC-7893 implementation showing proper alignment of liquidation thresholds, bonuses, and health factors.*

![Aave Parameter Alignment](../images/test-results/aave-parameter-alignment.png)

*Parameter alignment summary demonstrating that ERC-7893's minimum health factor (110%) provides an appropriate safety buffer above Aave's liquidation threshold (83%), with a 27% safety margin.*

### Chainlink Oracle Integration

![Chainlink Price Data](../images/test-results/chainlink-price-data.png)

*Real Chainlink price feeds from mainnet fork showing ETH/USD at $1,834.80 and BTC/USD at $34,727.83 with 100% confidence scores and fresh data status.*

![Price Validation Criteria](../images/test-results/price-validation-criteria.png)

*Price validation criteria and results showing successful validation of ETH ($1,000-$5,000 range) and BTC ($20,000-$100,000 range) with >80% confidence requirements met.*

### Market Analysis and Circuit Breakers

![Market Analysis](../images/test-results/market-analysis-volatility.png)

*Real ETH market analysis showing current price ($1,834.80), 0% volatility, stable trend, 10 history points, 0.17% price change, and normal circuit breaker status.*

![Circuit Breaker Analysis](../images/test-results/circuit-breaker-analysis.png)

*Circuit breaker analysis showing all metrics within normal limits: price change (0.17% vs 20% threshold), volatility (0% vs 15% threshold), sufficient historical data (10 points), and normal market conditions resulting in no action required.*

These results demonstrate successful integration with real mainnet protocols and validate that ERC-7893 parameters are realistic and properly calibrated against industry standards.
