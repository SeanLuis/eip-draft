import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true, // Enable IR compilation for complex contracts
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 1000
      },
      forking: process.env.FORK_MAINNET ? {
        url: process.env.MAINNET_RPC_URL || 'https://ethereum.publicnode.com',
        blockNumber: 18500000
      } : undefined
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  }
};

export default config;