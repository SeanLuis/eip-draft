import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';
import type { Contract } from "ethers";

// Constants for price simulation
const PRICE_DECIMALS = 8n;
const INITIAL_ETH_PRICE = 2000n * (10n ** PRICE_DECIMALS); // $2000
const INITIAL_BTC_PRICE = 35000n * (10n ** PRICE_DECIMALS); // $35000

async function main() {
  console.log("Starting deployment...");
  
  const [deployer, oracle] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Oracle account:", oracle.address);

  // Deploy Mock Tokens
  console.log("\nDeploying Mock Tokens...");
  const MockToken = await ethers.getContractFactory("MockToken");
  
  const deployedTokens = {
    usdc: await MockToken.deploy("USDC", "USDC"),
    usdt: await MockToken.deploy("USDT", "USDT"),
    dai: await MockToken.deploy("DAI", "DAI"),
    weth: await MockToken.deploy("WETH", "WETH"),
    wbtc: await MockToken.deploy("WBTC", "WBTC"),
    usdcEthLp: await MockToken.deploy("USDC-ETH LP", "LP1"),
    daiUsdcLp: await MockToken.deploy("DAI-USDC LP", "LP2"),
    protocolToken: await MockToken.deploy("Protocol", "PROT")
  };

  // Wait for all token deployments
  for (const [name, contract] of Object.entries(deployedTokens)) {
    await contract.waitForDeployment();
    console.log(`${name} deployed to:`, await contract.getAddress());
  }

  // Deploy Price Oracle
  console.log("\nDeploying Price Oracle...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const priceOracle = await MockPriceOracle.deploy();
  await priceOracle.waitForDeployment();
  console.log("PriceOracle deployed to:", await priceOracle.getAddress());

  // Deploy SolvencyProof
  console.log("\nDeploying SolvencyProof...");
  const SolvencyProof = await ethers.getContractFactory("SolvencyProof");
  const solvencyProof = await SolvencyProof.deploy();
  await solvencyProof.waitForDeployment();
  console.log("SolvencyProof deployed to:", await solvencyProof.getAddress());

  // Setup initial prices
  console.log("\nSetting initial prices...");
  await priceOracle.setPrice(await deployedTokens.weth.getAddress(), INITIAL_ETH_PRICE);
  await priceOracle.setPrice(await deployedTokens.wbtc.getAddress(), INITIAL_BTC_PRICE);
  await priceOracle.setPrice(await deployedTokens.usdc.getAddress(), 1n * (10n ** PRICE_DECIMALS));
  await priceOracle.setPrice(await deployedTokens.usdt.getAddress(), 1n * (10n ** PRICE_DECIMALS));
  await priceOracle.setPrice(await deployedTokens.dai.getAddress(), 1n * (10n ** PRICE_DECIMALS));
  await priceOracle.setPrice(await deployedTokens.usdcEthLp.getAddress(), INITIAL_ETH_PRICE / 2n);
  await priceOracle.setPrice(await deployedTokens.daiUsdcLp.getAddress(), 2n * (10n ** PRICE_DECIMALS));
  await priceOracle.setPrice(await deployedTokens.protocolToken.getAddress(), 5n * (10n ** PRICE_DECIMALS));

  // Setup oracle role
  console.log("\nSetting up oracle role...");
  await solvencyProof.setOracle(oracle.address, true);

  // Save addresses to file
  const addresses = {
    tokens: {
      usdc: await deployedTokens.usdc.getAddress(),
      usdt: await deployedTokens.usdt.getAddress(),
      dai: await deployedTokens.dai.getAddress(),
      weth: await deployedTokens.weth.getAddress(),
      wbtc: await deployedTokens.wbtc.getAddress(),
      usdcEthLp: await deployedTokens.usdcEthLp.getAddress(),
      daiUsdcLp: await deployedTokens.daiUsdcLp.getAddress(),
      protocolToken: await deployedTokens.protocolToken.getAddress()
    },
    priceOracle: await priceOracle.getAddress(),
    solvencyProof: await solvencyProof.getAddress(),
    oracle: oracle.address
  };

  const addressesPath = path.join(__dirname, '../frontend/src/config/addresses.json');
  fs.writeFileSync(
    addressesPath,
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to:", addressesPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
