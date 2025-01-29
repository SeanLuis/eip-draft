import { BaseContract, ContractTransactionResponse } from 'ethers'
import type { SolvencyProof } from '../../../typechain-types';

// Export types from typechain-types
export type { SolvencyProof };

// Export factory if needed
export { SolvencyProof__factory } from '../../../typechain-types';

// Additional type helpers if needed
export type SolvencyMetricsResult = Awaited<ReturnType<SolvencyProof['getProtocolAssets']>>;
export type SolvencyHistoryResult = Awaited<ReturnType<SolvencyProof['getSolvencyHistory']>>;

export interface ProtocolAssets {
  tokens: string[];
  amounts: bigint[];
  values: bigint[];
  timestamp: bigint;
}

export interface ProtocolLiabilities {
  tokens: string[];
  amounts: bigint[];
  values: bigint[];
  timestamp: bigint;
}

export interface ISolvencyProof extends BaseContract {
  getProtocolAssets: () => Promise<ProtocolAssets>;
  getProtocolLiabilities: () => Promise<ProtocolLiabilities>;
  getSolvencyRatio: () => Promise<bigint>;
  verifySolvency: () => Promise<[boolean, bigint]>;
  getSolvencyHistory: (startTime: bigint, endTime: bigint) => Promise<[bigint[], bigint[]]>;
  updateAssets: (tokens: string[], amounts: bigint[], values: bigint[]) => Promise<ContractTransactionResponse>;
  updateLiabilities: (tokens: string[], amounts: bigint[], values: bigint[]) => Promise<ContractTransactionResponse>;
  setOracle: (oracle: string, authorized: boolean) => Promise<ContractTransactionResponse>;
  assetOracles: (address: string) => Promise<boolean>;
}
