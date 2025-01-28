import { expect } from "chai";
import { ethers } from "hardhat";
import { 
    SolvencyProof,
    MockToken,
    MockPriceOracle 
} from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

function printTestSummary(title: string, data: any) {
    console.log('\n' + '='.repeat(50));
    console.log(`Test Summary: ${title}`);
    console.log('-'.repeat(50));
    
    if (data.metrics) {
        console.table({
            'Start Time': new Date(Number(data.metrics.start) * 1000).toISOString(),
            'End Time': new Date(Number(data.metrics.end) * 1000).toISOString(),
            'Records': data.metrics.recordCount
        });
    }
    
    if (data.prices) {
        console.log('\nPrice Changes:');
        console.table(data.prices.map((p: any) => ({
            'Step': p.step,
            'ETH Price': `$${(Number(p.ethPrice) / 1e8).toFixed(2)}`,
            'BTC Price': `$${(Number(p.btcPrice) / 1e8).toFixed(2)}`,
            'Ratio': `${(Number(p.ratio) / 100).toFixed(2)}%`  // Convertir a porcentaje
        })));
    }
    
    if (data.solvency) {
        console.log('\nSolvency Status:');
        console.table({
            'Is Solvent': data.solvency.isSolvent,
            'Health Factor': `${(Number(data.solvency.healthFactor) / 100).toFixed(2)}%`,
            'Updated At': new Date(Number(data.solvency.timestamp) * 1000).toISOString()
        });
    }
    console.log('='.repeat(50) + '\n');
}

describe("SolvencyProof Real World Scenarios", function () {
    let solvencyProof: SolvencyProof;
    let mockPriceOracle: MockPriceOracle;
    
    // Stablecoins
    let usdc: MockToken;
    let usdt: MockToken;
    let dai: MockToken;
    
    // Volatile assets
    let weth: MockToken;
    let wbtc: MockToken;
    
    // LP tokens
    let usdcEthLp: MockToken;
    let daiUsdcLp: MockToken;
    
    // Protocol tokens
    let protocolToken: MockToken;
    
    let owner: HardhatEthersSigner;
    let oracle: HardhatEthersSigner;
    let users: HardhatEthersSigner[];
    
    // Price simulation parameters
    const PRICE_DECIMALS = 8n;
    const INITIAL_ETH_PRICE = 2000n * (10n ** PRICE_DECIMALS); // $2000
    const INITIAL_BTC_PRICE = 35000n * (10n ** PRICE_DECIMALS); // $35000
    
    beforeEach(async function () {
        [owner, oracle, ...users] = await ethers.getSigners();

        // Deploy contracts using correct typing
        const MockTokenFactory = await ethers.getContractFactory("MockToken");
        const MockPriceOracleFactory = await ethers.getContractFactory("MockPriceOracle");
        const SolvencyProofFactory = await ethers.getContractFactory("SolvencyProof");

        // Deploy tokens
        usdc = await MockTokenFactory.deploy("USDC", "USDC") as unknown as MockToken;
        await usdc.waitForDeployment();
        
        usdt = await MockTokenFactory.deploy("USDT", "USDT") as unknown as MockToken;
        await usdt.waitForDeployment();
        
        dai = await MockTokenFactory.deploy("DAI", "DAI") as unknown as MockToken;
        await dai.waitForDeployment();
        
        weth = await MockTokenFactory.deploy("WETH", "WETH") as unknown as MockToken;
        await weth.waitForDeployment();
        
        wbtc = await MockTokenFactory.deploy("WBTC", "WBTC") as unknown as MockToken;
        await wbtc.waitForDeployment();
        
        usdcEthLp = await MockTokenFactory.deploy("USDC-ETH LP", "LP1") as unknown as MockToken;
        await usdcEthLp.waitForDeployment();
        
        daiUsdcLp = await MockTokenFactory.deploy("DAI-USDC LP", "LP2") as unknown as MockToken;
        await daiUsdcLp.waitForDeployment();
        
        protocolToken = await MockTokenFactory.deploy("Protocol", "PROT") as unknown as MockToken;
        await protocolToken.waitForDeployment();

        // Deploy price oracle and solvency proof
        mockPriceOracle = await MockPriceOracleFactory.deploy() as unknown as MockPriceOracle;
        await mockPriceOracle.waitForDeployment();
        
        solvencyProof = await SolvencyProofFactory.deploy() as unknown as SolvencyProof;
        await solvencyProof.waitForDeployment();

        // Setup initial prices using BigInt operations
        await mockPriceOracle.setPrice(await weth.getAddress(), INITIAL_ETH_PRICE);
        await mockPriceOracle.setPrice(await wbtc.getAddress(), INITIAL_BTC_PRICE);
        await mockPriceOracle.setPrice(await usdc.getAddress(), 1n * (10n ** PRICE_DECIMALS));
        await mockPriceOracle.setPrice(await usdt.getAddress(), 1n * (10n ** PRICE_DECIMALS));
        await mockPriceOracle.setPrice(await dai.getAddress(), 1n * (10n ** PRICE_DECIMALS));
        await mockPriceOracle.setPrice(await usdcEthLp.getAddress(), INITIAL_ETH_PRICE / 2n);
        await mockPriceOracle.setPrice(await daiUsdcLp.getAddress(), 2n * (10n ** PRICE_DECIMALS));
        await mockPriceOracle.setPrice(await protocolToken.getAddress(), 5n * (10n ** PRICE_DECIMALS));

        await solvencyProof.setOracle(await oracle.getAddress(), true);
    });

    describe("Market Crash Scenario", function() {
        it("Should handle rapid price movements and maintain solvency tracking", async function() {
            // Initial healthy state
            await setupInitialProtocolState();
            let [_isSolvent, _healthFactor] = await solvencyProof.verifySolvency();
            expect(_isSolvent).to.be.true;
            expect(_healthFactor).to.be.gt(12000n); // >120%

            // Simulate market crash
            await simulateMarketCrash();
            [_isSolvent, _healthFactor] = await solvencyProof.verifySolvency();
            
            // Verify risk alerts were emitted
            await expect(updateProtocolMetrics())
                .to.emit(solvencyProof, "RiskAlert")
                .withArgs("CRITICAL_SOLVENCY", anyValue, anyValue, anyValue);

            const [isSolvent, healthFactor] = await solvencyProof.verifySolvency();
            printTestSummary("Market Crash", {
                solvency: {
                    isSolvent,
                    healthFactor,
                    timestamp: await time.latest()
                }
            });
        });

        it("Should track historical metrics during volatility", async function() {
            // First set up initial state but don't include in test window
            await setupInitialProtocolState();
            
            // Add initial liabilities to ensure meaningful ratios
            const tokens = [await weth.getAddress()];
            const liabilityAmount = ethers.parseEther("0.5"); // 0.5 ETH liability
            const price = await mockPriceOracle.getPrice(await weth.getAddress());
            const liabilityValue = (liabilityAmount * price) / (10n ** PRICE_DECIMALS);
            
            await solvencyProof.connect(oracle).updateLiabilities(
                tokens,
                [liabilityAmount],
                [liabilityValue]
            );

            // Add delay after setup to ensure clean test window
            await time.increase(3600);
            const startTime = await time.latest();
            await time.increase(1); // Ensure first update is after startTime

            const priceHistory = [];
    
            // Record exactly 5 price points
            for (let i = 0; i < 5; i++) {
                await simulateMarketVolatility(i);
                
                // Capture prices before updating metrics
                const currentEthPrice = await mockPriceOracle.getPrice(await weth.getAddress());
                const currentBtcPrice = await mockPriceOracle.getPrice(await wbtc.getAddress());
                
                const tx = await updateProtocolMetrics();
                await tx.wait();
                
                // Store prices with their corresponding update
                priceHistory.push({
                    step: i,
                    ethPrice: currentEthPrice,
                    btcPrice: currentBtcPrice,
                    timestamp: await time.latest()
                });

                if (i < 4) {
                    await time.increase(3600);
                }
            }

            const endTime = await time.latest();
            const [timestamps, ratios] = await solvencyProof.getSolvencyHistory(
                startTime,
                endTime
            );

            // Match prices with their corresponding ratios
            const combinedHistory = priceHistory.map((entry, index) => ({
                ...entry,
                ratio: ratios[index]
            }));

            printTestSummary("Volatility Tracking", {
                metrics: {
                    start: startTime,
                    end: endTime,
                    recordCount: timestamps.length
                },
                prices: combinedHistory
            });

            // Validate price changes
            for (let i = 1; i < combinedHistory.length; i++) {
                const current = combinedHistory[i];
                const previous = combinedHistory[i-1];
                
                // Log detailed price changes for debugging
                console.log(`Step ${i} price change:`, {
                    ethDiff: `${((Number(current.ethPrice) - Number(previous.ethPrice)) / 1e8).toFixed(2)}`,
                    btcDiff: `${((Number(current.btcPrice) - Number(previous.btcPrice)) / 1e8).toFixed(2)}`,
                    ratioDiff: `${((Number(current.ratio) - Number(previous.ratio)) / 100).toFixed(2)}%`
                });
            }

            // Final validations
            expect(timestamps.length).to.equal(5, "Should have 5 historical records");
            expect(ratios.length).to.equal(5, "Should have 5 ratio records");
            
            // Verify timestamps are sequential
            for(let i = 1; i < timestamps.length; i++) {
                expect(timestamps[i]).to.be.gt(
                    timestamps[i-1],
                    "Timestamps should be sequential"
                );
            }

            // Verify all ratios are non-zero and within expected range
            ratios.forEach((ratio, index) => {
                expect(ratio).to.be.gt(0, `Ratio at index ${index} should be greater than 0`);
                expect(ratio).to.be.lt(30000n, `Ratio at index ${index} should be less than 300%`);
            });

            // Verify price volatility was reflected in ratios
            const volatilityDetected = combinedHistory.some((entry, i) => {
                if (i === 0) return false;
                return Math.abs(Number(entry.ratio) - Number(combinedHistory[i-1].ratio)) > 100; // 1% change
            });
            // Corregir la sintaxis del expect - remover la coma
            expect(volatilityDetected, "Should detect price volatility in ratios").to.be.true;
        });
    });

    describe("Complex Asset/Liability Scenarios", function() {
        it("Should handle multiple asset types with different risk profiles", async function() {
            // Setup complex portfolio
            const tokens = await Promise.all([
                weth.getAddress(),
                wbtc.getAddress(),
                usdc.getAddress(),
                usdcEthLp.getAddress(),
                protocolToken.getAddress()
            ]);
            
            const amounts = [
                ethers.parseEther("100"),     // 100 ETH
                ethers.parseEther("5"),       // 5 BTC
                ethers.parseUnits("500000", 6), // 500k USDC
                ethers.parseEther("1000"),    // 1000 LP tokens
                ethers.parseEther("50000")    // 50k Protocol tokens
            ];

            // Calculate values based on current prices
            const values = await Promise.all(
                tokens.map(async (token, i) => {
                    const price = await mockPriceOracle.getPrice(token);
                    return (amounts[i] * price) / (10n ** 8n); // Adjust for oracle decimals
                })
            );

            await solvencyProof.connect(oracle).updateAssets(tokens, amounts, values);
            
            // Add complex liabilities
            const liabilityTokens = await Promise.all([
                usdc.getAddress(), 
                dai.getAddress(), 
                weth.getAddress()
            ]);

            const liabilityAmounts = [
                ethers.parseUnits("400000", 6), // 400k USDC
                ethers.parseEther("300000"),    // 300k DAI
                ethers.parseEther("50")         // 50 ETH
            ];
            
            const liabilityValues = await Promise.all(
                liabilityTokens.map(async (token, i) => {
                    const price = await mockPriceOracle.getPrice(token);
                    return (liabilityAmounts[i] * price) / (10n ** 8n);
                })
            );

            await solvencyProof.connect(oracle).updateLiabilities(
                liabilityTokens,
                liabilityAmounts,
                liabilityValues
            );

            // Verify complex portfolio metrics
            const ratio = await solvencyProof.getSolvencyRatio();
            expect(ratio).to.be.gt(10500n); // >105%
        });
    });

    // Helper functions
    async function setupInitialProtocolState() {
        const tokens = [
            await weth.getAddress(),
            await wbtc.getAddress(),
            await usdc.getAddress()
        ];
        
        const amounts = [
            ethers.parseEther("1000"),      // 1000 ETH
            ethers.parseEther("100"),       // 100 BTC
            ethers.parseUnits("1000000", 6) // 1M USDC
        ];

        const values = await Promise.all(tokens.map(async (token, i) => {
            const price = await mockPriceOracle.getPrice(token);
            return (amounts[i] * price) / (10n ** 8n); // Adjust for oracle decimals
        }));

        await solvencyProof.connect(oracle).updateAssets(tokens, amounts, values);

        // Set initial liabilities (50% of assets)
        const liabilityAmounts = amounts.map(amount => amount / 2n);
        const liabilityValues = values.map(value => value / 2n);

        await solvencyProof.connect(oracle).updateLiabilities(
            tokens,
            liabilityAmounts,
            liabilityValues
        );
    }

    async function simulateMarketCrash() {
        await mockPriceOracle.setPrice(
            await weth.getAddress(), 
            INITIAL_ETH_PRICE / 2n
        );
        await mockPriceOracle.setPrice(
            await wbtc.getAddress(), 
            (INITIAL_BTC_PRICE * 60n) / 100n // 60% of initial price
        );
        await mockPriceOracle.setPrice(await usdcEthLp.getAddress(), INITIAL_ETH_PRICE / 4n);
        await mockPriceOracle.setPrice(await protocolToken.getAddress(), 1n * (10n ** PRICE_DECIMALS));
    }

    async function simulateMarketVolatility(step: number) {
        const volatility = Math.sin(step) * 0.1;
        // Ensure we have a minimum price even with volatility
        const ethPrice = INITIAL_ETH_PRICE * BigInt(Math.floor((1 + volatility) * 100)) / 100n;
        const btcPrice = INITIAL_BTC_PRICE * BigInt(Math.floor((1 + volatility) * 100)) / 100n;
        
        console.log('Setting new prices:', {
            step,
            volatility,
            ethPrice: ethPrice.toString(),
            btcPrice: btcPrice.toString()
        });
        
        await mockPriceOracle.setPrice(await weth.getAddress(), ethPrice);
        await mockPriceOracle.setPrice(await wbtc.getAddress(), btcPrice);

        // Also update USDC price to ensure stable baseline
        await mockPriceOracle.setPrice(
            await usdc.getAddress(), 
            1n * (10n ** PRICE_DECIMALS)
        );
    }

    async function updateProtocolMetrics() {
        const tokens = [await weth.getAddress()];
        const amounts = [ethers.parseEther("1")];
        const currentPrice = await mockPriceOracle.getPrice(await weth.getAddress());
        const value = amounts[0] * currentPrice / (10n ** PRICE_DECIMALS);

        const tx = await solvencyProof.connect(oracle).updateAssets(
            tokens,
            amounts,
            [value]
        );
        
        // Wait for transaction confirmation
        await tx.wait();
        return tx;
    }
});