import { ethers } from 'ethers';
import { CONFIG } from '../config';

// Hardhat's default testing accounts - usando las mismas que en el test
const HARDHAT_PRIVATE_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account #0
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Account #1
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Account #2
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', // Account #3
];

class Web3Service {
  private static instance: Web3Service;
  private provider: ethers.JsonRpcProvider;
  private connectedSigners: Map<number, ethers.Wallet> = new Map();

  private constructor() {
    try {
      // Usar la misma configuración que en hardhat.config.ts
      this.provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.rpcUrl);
      
      // Verify provider connection immediately
      this.verifyConnection();

      console.log('Web3Service initialized for Hardhat network:', {
        chainId: CONFIG.NETWORK.chainId,
        url: CONFIG.NETWORK.rpcUrl
      });
    } catch (error) {
      console.error('Failed to initialize Web3Service:', error);
      throw error;
    }
  }

  private async verifyConnection() {
    try {
      const network = await this.provider.getNetwork();
      console.log('Provider connected to network:', {
        chainId: network.chainId,
        name: network.name
      });
    } catch (error) {
      console.error('Failed to verify provider connection:', error);
      throw new Error('Provider connection failed');
    }
  }

  public static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  public async getAccounts(): Promise<string[]> {
    return Promise.all(
      HARDHAT_PRIVATE_KEYS.map(async (key) => {
        const wallet = new ethers.Wallet(key);
        return wallet.address;
      })
    );
  }

  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  public async getSigner(index: number = 0): Promise<ethers.Wallet> {
    try {
      const existingSigner = this.connectedSigners.get(index);
      if (existingSigner) {
        return existingSigner;
      }

      console.log('Creating new signer with params:', {
        index,
        privateKey: HARDHAT_PRIVATE_KEYS[index].substring(0, 10) + '...',
        provider: 'Connecting...'
      });

      const privateKey = HARDHAT_PRIVATE_KEYS[index];
      if (!privateKey) {
        throw new Error(`No private key available for index ${index}`);
      }

      // Create wallet and connect to provider in a simpler way
      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Basic verification without accessing private fields
      const address = await wallet.getAddress();
      console.log('Wallet created:', {
        address,
        hasProvider: !!wallet.provider
      });

      this.connectedSigners.set(index, wallet);
      return wallet;
    } catch (error) {
      console.error('Detailed signer error:', {
        error,
        index,
        network: CONFIG.NETWORK.name
      });
      throw error;
    }
  }
}

export default Web3Service;
