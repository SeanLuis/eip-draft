import { ethers } from 'ethers';
import Web3Service from './web3Service';
import { CONFIG } from '../config';
import type { SolvencyMetrics, HistoricalDataPoint } from '../types';
import { SolvencyProof__factory, SolvencyProof } from '../../../typechain-types';

export class SolvencyProofService {
  private contract: SolvencyProof;
  private web3Service: Web3Service;
  private oracle: ethers.Signer | null = null;

  constructor() {
    try {
      this.web3Service = Web3Service.getInstance();
      const provider = this.web3Service.getProvider();
      
      // Agregar log para debug
      console.log('Initializing contract with:', {
        address: CONFIG.CONTRACTS.SolvencyProof,
        provider: provider ? 'Provider Ready' : 'No Provider'
      });
      
      // Usar el método target() para obtener la dirección en ethers v6
      this.contract = SolvencyProof__factory.connect(
        CONFIG.CONTRACTS.SolvencyProof,
        provider
      );

      // Verificar que el contrato se inicializó correctamente
      console.log('Contract initialized:', {
        address: CONFIG.CONTRACTS.SolvencyProof,
        target: this.contract.target, // En ethers v6 usamos target en lugar de address
        network: CONFIG.NETWORK.chainId
      });
    } catch (error) {
      console.error('Failed to initialize:', error);
      throw error;
    }
  }

  public async initialize(): Promise<boolean> {
    try {
      // Usar Account #1 (oracle) en lugar de Account #0 (owner)
      this.oracle = await this.web3Service.getSigner(1); // Cambiar a índice 1
      const oracleAddress = await this.oracle.getAddress();
      console.log('Oracle initialized:', oracleAddress);

      // Verificar que el address tiene permisos de oracle
      const isOracle = await this.contract.assetOracles(oracleAddress);
      console.log('Is oracle authorized?:', isOracle);

      if (!isOracle) {
        throw new Error('Account is not authorized as oracle');
      }

      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }

  public async updateAssets(
    tokens: string[],
    amounts: bigint[],
    values: bigint[]
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.oracle) {
      throw new Error('Oracle not initialized');
    }

    try {
      console.log('updateAssets input:', {
        tokens,
        amounts: amounts.map(a => a.toString()),
        values: values.map(v => v.toString())
      });

      // Use proper typing for fragments and filter only FunctionFragment
      const functionNames = Object.values(this.contract.interface.fragments)
        .filter((fragment): fragment is ethers.FunctionFragment => 
          fragment.type === 'function')
        .map(fragment => fragment.selector);
      
      console.log('Available contract functions:', functionNames);

      // Use direct contract method instead of creating new instance
      const tx = await this.contract.connect(this.oracle).updateAssets(
        tokens,
        amounts,
        values,
        {
          from: await this.oracle.getAddress(),
          gasLimit: 500000
        }
      );
      
      console.log('Transaction sent:', {
        hash: tx.hash,
        from: await this.oracle.getAddress(),
        to: this.contract.target
      });

      const receipt = await tx.wait();
      console.log('Transaction mined:', receipt);

      return tx;
    } catch (error: any) {
      console.error('UpdateAssets detailed error:', {
        error,
        errorName: error.name,
        errorMessage: error.message,
        contractAddress: this.contract.target,
        oracleAddress: await this.oracle.getAddress(),
        params: {
          tokens,
          amounts: amounts.map(a => a.toString()),
          values: values.map(v => v.toString())
        }
      });
      throw error;
    }
  }

  public async simulateMarketCrash(
    tokens: string[],
    amounts: bigint[],
    values: bigint[]
  ): Promise<any> {
    return this.updateAssets(tokens, amounts, values);
  }

  public async simulateVolatility(
    token: string,
    amount: bigint,
    value: bigint
  ): Promise<any> {
    return this.updateAssets([token], [amount], [value]);
  }

  public async connectWithSigner(signerIndex: number = 0): Promise<void> {
    const signer = await this.web3Service.getSigner(signerIndex);
    this.contract = this.contract.connect(signer);
  }

  public async getSolvencyMetrics(): Promise<SolvencyMetrics> {
    try {
      const [isSolvent, healthFactor] = await this.contract.verifySolvency();
      const assets = await this.contract.getProtocolAssets();
      const liabilities = await this.contract.getProtocolLiabilities();
      
      return {
        totalAssets: Number(assets.values.reduce((a: bigint, b: bigint) => a + b, 0n)),
        totalLiabilities: Number(liabilities.values.reduce((a: bigint, b: bigint) => a + b, 0n)),
        solvencyRatio: Number(healthFactor),
        timestamp: Number(assets.timestamp),
        isSolvent,
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  public async getHistoricalData(
    startTime: number,
    endTime: number
  ): Promise<HistoricalDataPoint[]> {
    try {
      const [timestamps, ratios] = await this.contract.getSolvencyHistory(
        BigInt(startTime),
        BigInt(endTime)
      );

      return timestamps.map((timestamp: bigint, index: number) => ({
        timestamp: Number(timestamp),
        solvencyRatio: Number(ratios[index]),
        totalAssets: 0,
        totalLiabilities: 0,
        status: this.getSolvencyStatus(Number(ratios[index])),
        ethPrice: 0,
        btcPrice: 0 
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  public async getContract(): Promise<typeof this.contract> {
    return this.contract;
  }

  private getSolvencyStatus(ratio: number): 'HEALTHY' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL' {
    if (ratio >= 150) return 'HEALTHY';
    if (ratio >= 120) return 'WARNING';
    if (ratio >= 105) return 'HIGH_RISK';
    return 'CRITICAL';
  }
}
