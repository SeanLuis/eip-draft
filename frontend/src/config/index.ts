import addresses from './addresses.json';

export const CONFIG = {
  NETWORK: {
    chainId: 1337,
    name: "Hardhat",
    rpcUrl: "http://127.0.0.1:8545",
  },
  CONTRACTS: addresses,
} as const;
