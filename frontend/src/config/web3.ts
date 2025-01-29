import { type PublicClient, createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createTestClient, http as testHttp, publicActions, walletActions } from 'viem'
import { hardhat } from 'viem/chains'
import addresses from './addresses.json'

// Hardhat's default accounts - Matching deploy.ts and tests
export const accounts = {
  deployer: privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'), // Account #0
  oracle: privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'),   // Account #1 - Oracle autorizado
  user: privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a')     // Account #2
}

// Configuración específica para Hardhat local
export const localHardhatChain = {
  ...hardhat,
  id: 1337,
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545']
    },
    public: {
      http: ['http://127.0.0.1:8545']
    }
  }
}

export function createClient(): PublicClient {
  return createPublicClient({
    chain: localHardhatChain,
    transport: http()
  })
}

export function createLocalWalletClient(account = accounts.deployer) {
  return createWalletClient({
    account,
    chain: localHardhatChain,
    transport: http()
  })
}

// Testing client with both public and wallet actions
export function createTestingClient(account = accounts.deployer) {
  return createTestClient({
    chain: localHardhatChain,
    transport: testHttp(),
    account,
    mode: 'anvil'
  })
  .extend(publicActions)
  .extend(walletActions)
}

export const contractAddresses = addresses
