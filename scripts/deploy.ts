import { ethers } from "hardhat";
import {
  MockToken,
  MockToken__factory,
  MockPriceOracle,
  MockPriceOracle__factory,
  SolvencyProof,
  SolvencyProof__factory,
} from "../typechain-types";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");
  const [deployer, oracle] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Oracle account:", oracle.address);

  // Deploy tokens
  console.log("\nDeploying Mock Tokens...");
  const MockTokenFactory = (await ethers.getContractFactory(
    "MockToken"
  )) as unknown as MockToken__factory;

  const usdc = (await MockTokenFactory.deploy("USDC", "USDC")) as MockToken;
  await usdc.waitForDeployment();
  console.log("USDC deployed to:", await usdc.getAddress());

  const usdt = (await MockTokenFactory.deploy("USDT", "USDT")) as MockToken;
  await usdt.waitForDeployment();
  console.log("USDT deployed to:", await usdt.getAddress());

  const dai = (await MockTokenFactory.deploy("DAI", "DAI")) as MockToken;
  await dai.waitForDeployment();
  console.log("DAI deployed to:", await dai.getAddress());

  const weth = (await MockTokenFactory.deploy("WETH", "WETH")) as MockToken;
  await weth.waitForDeployment();
  console.log("WETH deployed to:", await weth.getAddress());

  const wbtc = (await MockTokenFactory.deploy("WBTC", "WBTC")) as MockToken;
  await wbtc.waitForDeployment();
  console.log("WBTC deployed to:", await wbtc.getAddress());

  const usdcEthLp = (await MockTokenFactory.deploy(
    "USDC-ETH LP",
    "LP1"
  )) as MockToken;
  await usdcEthLp.waitForDeployment();
  console.log("USDC-ETH LP deployed to:", await usdcEthLp.getAddress());

  const daiUsdcLp = (await MockTokenFactory.deploy(
    "DAI-USDC LP",
    "LP2"
  )) as MockToken;
  await daiUsdcLp.waitForDeployment();
  console.log("DAI-USDC LP deployed to:", await daiUsdcLp.getAddress());

  const protocolToken = (await MockTokenFactory.deploy(
    "Protocol",
    "PROT"
  )) as MockToken;
  await protocolToken.waitForDeployment();
  console.log("Protocol Token deployed to:", await protocolToken.getAddress());

  // Deploy Price Oracle
  console.log("\nDeploying Price Oracle...");
  const MockPriceOracleFactory = (await ethers.getContractFactory(
    "MockPriceOracle"
  )) as unknown as MockPriceOracle__factory;
  const mockPriceOracle = (await MockPriceOracleFactory.deploy()) as MockPriceOracle;
  await mockPriceOracle.waitForDeployment();
  const priceOracleAddress = await mockPriceOracle.getAddress();
  console.log("PriceOracle deployed to:", priceOracleAddress);

  // Transfer ownership to oracle
  await mockPriceOracle.transferOwnership(oracle.address);
  console.log("MockPriceOracle ownership transferred to oracle:", oracle.address);

  // Deploy SolvencyProof
  console.log("\nDeploying SolvencyProof...");
  const SolvencyProofFactory = (await ethers.getContractFactory(
    "SolvencyProof"
  )) as unknown as SolvencyProof__factory;
  const solvencyProof = (await SolvencyProofFactory.deploy()) as SolvencyProof;
  await solvencyProof.waitForDeployment();
  console.log("SolvencyProof deployed to:", await solvencyProof.getAddress());

  // Setup oracle role
  console.log("\nSetting up oracle role...");
  await solvencyProof.setOracle(oracle.address, true);

  // Setup initial protocol state
  console.log("\nInitializing protocol state...");

  // Initial asset setup con valores más realistas
  const tokens = [
    await weth.getAddress(),
    await wbtc.getAddress()
  ];

  const amounts = [
    ethers.parseEther("1000"),    // 1000 ETH
    ethers.parseEther("100")      // 100 BTC
  ];

  // Calcular valores iniciales con precios
  const ethPrice = 2000n * (10n ** 8n);  // $2000 con 8 decimales
  const btcPrice = 35000n * (10n ** 8n); // $35000 con 8 decimales

  await mockPriceOracle.connect(oracle).setPrice(await weth.getAddress(), ethPrice);
  await mockPriceOracle.connect(oracle).setPrice(await wbtc.getAddress(), btcPrice);

  const values = [
    (amounts[0] * ethPrice) / (10n ** 8n), // Valor en ETH
    (amounts[1] * btcPrice) / (10n ** 8n)  // Valor en BTC
  ];

  // Set initial protocol state
  console.log("Setting initial assets...");
  await solvencyProof.connect(oracle).updateAssets(tokens, amounts, values);

  // Set initial liabilities (50% de los assets para ratio inicial de 200%)
  console.log("Setting initial liabilities...");
  await solvencyProof.connect(oracle).updateLiabilities(
    tokens,
    amounts.map(a => a / 2n),
    values.map(v => v / 2n)
  );

  // Verificar estado inicial
  const [isSolvent, healthFactor] = await solvencyProof.verifySolvency();
  const ratio = await solvencyProof.getSolvencyRatio();
  
  console.log("\nInitial protocol state:");
  console.log("- Is solvent:", isSolvent);
  console.log("- Health factor:", Number(healthFactor) / 100, "%");
  console.log("- Solvency ratio:", Number(ratio) / 100, "%");

  // Save addresses
  const addresses = {
    tokens: {
      usdc: await usdc.getAddress(),
      usdt: await usdt.getAddress(),
      dai: await dai.getAddress(),
      weth: await weth.getAddress(),
      wbtc: await wbtc.getAddress(),
      usdcEthLp: await usdcEthLp.getAddress(),
      daiUsdcLp: await daiUsdcLp.getAddress(),
      protocolToken: await protocolToken.getAddress(),
    },
    priceOracle: priceOracleAddress,
    solvencyProof: await solvencyProof.getAddress(),
    oracle: oracle.address,
  };

  // Save addresses to frontend config
  const frontendDir = path.join(__dirname, "..", "frontend", "src", "config");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  console.log("\nAddresses saved to frontend config");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
