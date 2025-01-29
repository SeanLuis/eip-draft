import { SolvencyMetrics, HistoricalDataPoint, TokenInfo } from '../types';

// Mock token addresses from your test
const MOCK_ADDRESSES = {
    WETH: '0x1234...', // Add mock addresses
    WBTC: '0x5678...',
    USDC: '0x91011...',
    // Add other tokens
};

export const generateMockAssets = (): TokenInfo[] => [
    {
        address: MOCK_ADDRESSES.WETH,
        symbol: 'WETH',
        amount: '1000.0',
        value: '2000000' // $2M worth of ETH
    },
    {
        address: MOCK_ADDRESSES.WBTC,
        symbol: 'WBTC',
        amount: '100.0',
        value: '3500000' // $3.5M worth of BTC
    },
    {
        address: MOCK_ADDRESSES.USDC,
        symbol: 'USDC',
        amount: '1000000.0',
        value: '1000000' // $1M USDC
    }
];

export const generateMockMetrics = (): SolvencyMetrics => ({
    totalAssets: 6500000, // $6.5M
    totalLiabilities: 5000000, // $5M
    solvencyRatio: 130, // 130%
    timestamp: Date.now(),
    isSolvent: true  // Added missing property
});

export const generateMockHistory = (): HistoricalDataPoint[] => {
    const now = Date.now();
    const dayInMs = 86400000;
    
    return Array(7).fill(0).map((_, i) => ({
        timestamp: now - ((6 - i) * dayInMs),
        solvencyRatio: 120 + Math.sin(i) * 10,
        totalAssets: 6500000 + (Math.random() - 0.5) * 1000000,
        totalLiabilities: 5000000 + (Math.random() - 0.5) * 500000,
        status: 'HEALTHY',
        ethPrice: 2000 + (Math.random() - 0.5) * 100,  // Added missing property
        btcPrice: 35000 + (Math.random() - 0.5) * 1000  // Added missing property
    }));
};

export const generateMarketCrashData = (): SolvencyMetrics => ({
    totalAssets: 6500000,
    totalLiabilities: 5000000,
    solvencyRatio: 3, // 0.03% from test
    timestamp: new Date('2025-01-28T20:38:51.000Z').getTime(),
    isSolvent: false
});

export const generateVolatilityData = (): HistoricalDataPoint[] => [
    {
        timestamp: new Date('2025-01-28T21:39:13.000Z').getTime(),
        solvencyRatio: 200,
        ethPrice: 2000,
        btcPrice: 35000,
        totalAssets: 6500000,    // Added missing property
        totalLiabilities: 5000000, // Added missing property
        status: 'HIGH_RISK'
    },
    {
        timestamp: new Date('2025-01-28T22:39:13.000Z').getTime(),
        solvencyRatio: 216,
        ethPrice: 2160,
        btcPrice: 37800,
        totalAssets: 7020000,
        totalLiabilities: 5200000,
        status: 'CRITICAL'
    },
    {
        timestamp: new Date('2025-01-28T23:39:13.000Z').getTime(),
        solvencyRatio: 218,
        ethPrice: 2180,
        btcPrice: 38150,
        totalAssets: 7085000,
        totalLiabilities: 5300000,
        status: 'CRITICAL'
    },
    {
        timestamp: new Date('2025-01-29T00:39:13.000Z').getTime(),
        solvencyRatio: 202,
        ethPrice: 2020,
        btcPrice: 35350,
        totalAssets: 6565000,
        totalLiabilities: 5100000,
        status: 'HIGH_RISK'
    },
    {
        timestamp: new Date('2025-01-29T01:39:34.000Z').getTime(),
        solvencyRatio: 184,
        ethPrice: 1840,
        btcPrice: 32200,
        totalAssets: 5980000,
        totalLiabilities: 4900000,
        status: 'HIGH_RISK'
    }
];
