export interface TokenInfo {
    address: string;
    symbol: string;
    amount: string;
    value: string;
}

export interface SolvencyMetrics {
    totalAssets: number;
    totalLiabilities: number;
    solvencyRatio: number;
    timestamp: number;
    isSolvent: boolean;
}

export interface RiskAlert {
    type: 'CRITICAL_SOLVENCY' | 'LOW_SOLVENCY' | 'WARNING';
    currentValue: number;
    threshold: number;
    timestamp: number;
}

export interface HistoricalDataPoint {
    timestamp: number;
    solvencyRatio: number;
    totalAssets: number;
    totalLiabilities: number;
    status: 'HEALTHY' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
    ethPrice: number;
    btcPrice: number;
}

export interface ProtocolSettings {
    criticalThreshold: number;
    warningThreshold: number;
    oracles: { address: string }[];
}

export interface ContractAddresses {
  USDC: string;
  USDT: string;
  DAI: string;
  WETH: string;
  WBTC: string;
  USDC_ETH_LP: string;
  DAI_USDC_LP: string;
  Protocol_Token: string;
  MockPriceOracle: string;
  SolvencyProof: string;
  OracleAddress: string;
}
