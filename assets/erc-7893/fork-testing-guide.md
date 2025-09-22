# Fork Testing Guide for ERC-7893

This guide explains how to test the ERC-7893 implementation against real mainnet protocols using Hardhat's fork functionality.

## Environment Setup

Create a `.env` file in your project root:

```bash
# Fork Testing Configuration
FORK_MAINNET=false
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your-project-id

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
