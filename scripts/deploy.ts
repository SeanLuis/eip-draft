import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...\n");

  // Get signers
  const [deployer, oracle] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Price simulation parameters
  const PRICE_DECIMALS = 8n;
  const INITIAL_ETH_PRICE = 2000n * (10n ** PRICE_DECIMALS); // $2000
  const INITIAL_BTC_PRICE = 35000n * (10n ** PRICE_DECIMALS); // $35000

  // Deploy all tokens
  const MockToken = await ethers.getContractFactory("MockToken");
  
  console.log("\nDeploying tokens...");
  const usdc = await MockToken.deploy("USDC", "USDC");
  await usdc.waitForDeployment();
  console.log("USDC deployed to:", await usdc.getAddress());

  const usdt = await MockToken.deploy("USDT", "USDT");
  await usdt.waitForDeployment();
  console.log("USDT deployed to:", await usdt.getAddress());

  const dai = await MockToken.deploy("DAI", "DAI");
  await dai.waitForDeployment();
  console.log("DAI deployed to:", await dai.getAddress());

  const weth = await MockToken.deploy("WETH", "WETH");
  await weth.waitForDeployment();
  console.log("WETH deployed to:", await weth.getAddress());

  const wbtc = await MockToken.deploy("WBTC", "WBTC");
  await wbtc.waitForDeployment();
  console.log("WBTC deployed to:", await wbtc.getAddress());

  const usdcEthLp = await MockToken.deploy("USDC-ETH LP", "LP1");
  await usdcEthLp.waitForDeployment();
  console.log("USDC-ETH LP deployed to:", await usdcEthLp.getAddress());

  const daiUsdcLp = await MockToken.deploy("DAI-USDC LP", "LP2");
  await daiUsdcLp.waitForDeployment();
  console.log("DAI-USDC LP deployed to:", await daiUsdcLp.getAddress());

  const protocolToken = await MockToken.deploy("Protocol", "PROT");
  await protocolToken.waitForDeployment();
  console.log("Protocol Token deployed to:", await protocolToken.getAddress());

  // Deploy price oracle and solvency proof
  console.log("\nDeploying core contracts...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const mockPriceOracle = await MockPriceOracle.deploy();
  await mockPriceOracle.waitForDeployment();
  console.log("MockPriceOracle deployed to:", await mockPriceOracle.getAddress());

  const SolvencyProof = await ethers.getContractFactory("SolvencyProof");
  const solvencyProof = await SolvencyProof.deploy();
  await solvencyProof.waitForDeployment();
  console.log("SolvencyProof deployed to:", await solvencyProof.getAddress());

  // Setup initial prices
  console.log("\nSetting initial prices...");
  await mockPriceOracle.setPrice(await weth.getAddress(), INITIAL_ETH_PRICE);
  await mockPriceOracle.setPrice(await wbtc.getAddress(), INITIAL_BTC_PRICE);
  await mockPriceOracle.setPrice(await usdc.getAddress(), 1n * (10n ** PRICE_DECIMALS));
  await mockPriceOracle.setPrice(await usdt.getAddress(), 1n * (10n ** PRICE_DECIMALS));
  await mockPriceOracle.setPrice(await dai.getAddress(), 1n * (10n ** PRICE_DECIMALS));
  await mockPriceOracle.setPrice(await usdcEthLp.getAddress(), INITIAL_ETH_PRICE / 2n);
  await mockPriceOracle.setPrice(await daiUsdcLp.getAddress(), 2n * (10n ** PRICE_DECIMALS));
  await mockPriceOracle.setPrice(await protocolToken.getAddress(), 5n * (10n ** PRICE_DECIMALS));

  // Set deployer as oracle
  console.log("\nConfiguring permissions...");
  await solvencyProof.setOracle(oracle.address, true);  // Set Account #1 as oracle

  console.log("\nDeployment Summary:");
  console.log({
    USDC: await usdc.getAddress(),
    USDT: await usdt.getAddress(),
    DAI: await dai.getAddress(),
    WETH: await weth.getAddress(),
    WBTC: await wbtc.getAddress(),
    "USDC-ETH LP": await usdcEthLp.getAddress(),
    "DAI-USDC LP": await daiUsdcLp.getAddress(),
    "Protocol Token": await protocolToken.getAddress(),
    MockPriceOracle: await mockPriceOracle.getAddress(),
    SolvencyProof: await solvencyProof.getAddress(),
    "Oracle Address": oracle.address, // Add this to verify
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
