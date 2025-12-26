import { type Address, type WalletClient, type PublicClient, type Hash, getContract } from 'viem'
import addresses from '../config/addresses.json'
import SolvencyProofABI from '../abis/SolvencyProof.json'
import MockPriceOracleABI from '../abis/MockPriceOracle.json'
import type { AbiComponent } from '../types'

interface ProtocolState {
  tokens: `0x${string}`[];
  amounts: bigint[];
  values: bigint[];
}

interface SimulationResult {
  step: number;
  token: string;
  oldPrice: number;
  newPrice: number;
  healthFactor: number;
  timestamp: number;
  percentChange: number;
}

export class SolvencyProofService {
  private solvencyProof: any
  private priceOracle: any
  private publicClient: PublicClient | null = null
  private walletClient: WalletClient | null = null

  async initialize(publicClient: PublicClient, walletClient: WalletClient): Promise<boolean> {
    this.publicClient = publicClient
    this.walletClient = walletClient

    // Initialize contract instances with correct typing
    this.solvencyProof = getContract({
      address: addresses.solvencyProof as Address,
      abi: SolvencyProofABI.abi,
      client: this.publicClient
    })

    this.priceOracle = getContract({
      address: addresses.priceOracle as Address,
      abi: MockPriceOracleABI.abi,
      client: this.publicClient
    })

    return true
  }

  async write(contractInstance: any, method: string, args: any[]): Promise<Hash> {
    if (!this.walletClient || !this.publicClient || !this.walletClient.account) {
      throw new Error('Clients or account not initialized')
    }
    
    try {
      // Get the latest nonce before each transaction
      const nonce = await this.publicClient.getTransactionCount({
        address: this.walletClient.account.address
      })

      const { request } = await contractInstance.simulate[method](
        args,
        { 
          account: this.walletClient.account,
          chain: this.walletClient.chain,
          nonce // Add nonce to the transaction
        }
      )
      
      const hash = await this.walletClient.writeContract({
        ...request,
        account: this.walletClient.account,
        nonce // Add nonce to the write request too
      })
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
      return receipt.transactionHash
    } catch (error: any) {
      if (error.message.includes('OwnableUnauthorizedAccount')) {
        throw new Error(`Not authorized. Must be owner to call ${method}`)
      }
      throw error
    }
  }

  async updateAssets(
    tokens: Address[],
    amounts: bigint[],
    values: bigint[]
  ) {
    if (!this.solvencyProof || !this.walletClient) {
      throw new Error('Service not initialized')
    }

    return this.write(this.solvencyProof, 'updateAssets', [tokens, amounts, values])
  }

  async updateLiabilities(
    tokens: Address[],
    amounts: bigint[],
    values: bigint[]
  ) {
    if (!this.solvencyProof || !this.walletClient) {
      throw new Error('Service not initialized')
    }

    return this.write(this.solvencyProof, 'updateLiabilities', [tokens, amounts, values])
  }

  async verifySolvency(): Promise<[boolean, bigint]> {
    if (!this.solvencyProof) {
      throw new Error('Service not initialized')
    }

    return this.solvencyProof.read.verifySolvency()
  }

  async getSolvencyRatio(): Promise<bigint> {
    if (!this.solvencyProof) {
      throw new Error('Service not initialized')
    }

    return this.solvencyProof.read.getSolvencyRatio()
  }

  async getSolvencyMetrics() {
    if (!this.solvencyProof) {
      throw new Error('Service not initialized')
    }

    const [isSolvent, healthFactor] = await this.verifySolvency()
    const ratio = await this.getSolvencyRatio()

    return {
      isSolvent,
      healthFactor,
      ratio
    }
  }

  private async updateMetricsAndGetHistory(): Promise<void> {
    // Update liabilities to have meaningful ratios
    const minimalLiability = {
      tokens: [addresses.tokens.weth as `0x${string}`],
      amounts: [BigInt(1e17)], // 0.1 ETH as liability
      values: [BigInt(1e17)]   // Scaled value
    }

    await this.updateLiabilities(
      minimalLiability.tokens,
      minimalLiability.amounts,
      minimalLiability.values
    )

    // Then update assets
    const minimalAsset = {
      tokens: [addresses.tokens.weth as `0x${string}`],
      amounts: [BigInt(2e17)], // 0.2 ETH as asset (2x liability for healthy ratio)
      values: [BigInt(2e17)]   // Scaled value
    }

    await this.updateAssets(
      minimalAsset.tokens,
      minimalAsset.amounts,
      minimalAsset.values
    )
  }

  // async getSolvencyHistory(
  //   startTime: number,
  //   endTime: number
  // ): Promise<{
  //   timestamps: bigint[];
  //   ratios: bigint[];
  //   prices: Array<Record<string, number>>;
  // }> {
  //   if (!this.solvencyProof) {
  //     throw new Error('Service not initialized')
  //   }

  //   console.log('Fetching history:', { startTime, endTime })

  //   // Get historical data points
  //   const [timestamps, ratios] = await this.solvencyProof.read.getSolvencyHistory([startTime, endTime])
    
  //   // Get prices for each timestamp
  //   const prices = await Promise.all(
  //     timestamps.map(async (timestamp: any) => {
  //       const tokenPrices = await this.getAllTokenPrices()
  //       console.log(`Prices at ${timestamp}:`, tokenPrices)
  //       return tokenPrices
  //     })
  //   )

  //   return { timestamps, ratios, prices }
  // }

  async getAssetPrices(): Promise<{
    eth: number;
    btc: number;
    usdc: number;
  }> {
    if (!this.priceOracle) throw new Error('Service not initialized')
    
    const [ethPrice, btcPrice, usdcPrice] = await Promise.all([
      this.priceOracle.read.getPrice([addresses.tokens.weth as `0x${string}`]),
      this.priceOracle.read.getPrice([addresses.tokens.wbtc as `0x${string}`]),
      this.priceOracle.read.getPrice([addresses.tokens.usdc as `0x${string}`])
    ])
    
    return {
      eth: Number(ethPrice),
      btc: Number(btcPrice),
      usdc: Number(usdcPrice)
    }
  }

  // Add method to update both assets and liabilities
  async updateProtocolState(
    assets: ProtocolState,
    liabilities: ProtocolState
  ): Promise<void> {
    try {
      // Validar valores antes de actualizar
      const totalAssets = assets.values.reduce((sum, val) => sum + val, 0n);
      const totalLiabilities = liabilities.values.reduce((sum, val) => sum + val, 0n);

      console.log('State update validation:', {
        totalAssets: totalAssets.toString(),
        totalLiabilities: totalLiabilities.toString(),
        ratio: totalLiabilities > 0n ? 
          Number((totalAssets * 10000n) / totalLiabilities) / 100 : 
          (totalAssets > 0n ? 200 : 100)
      });

      // Si hay assets pero no liabilities, establecer un valor mínimo de liability
      if (totalLiabilities === 0n && totalAssets > 0n) {
        liabilities.values = assets.values.map(v => v / 2n); // 50% de los assets
        console.log('Added minimum liabilities for stability');
      }

      // Actualizar estado
      await this.updateLiabilities(liabilities.tokens, liabilities.amounts, liabilities.values);
      await new Promise(r => setTimeout(r, 1000));
      await this.updateAssets(assets.tokens, assets.amounts, assets.values);

      // Verificar resultado
      const metrics = await this.getSolvencyMetrics();
      console.log('Final metrics:', {
        healthFactor: metrics.healthFactor.toString(),
        ratio: metrics.ratio.toString()
      });
    } catch (error) {
      console.error('Protocol state update error:', error);
      throw error;
    }
  }

  async simulateMarketCrash(tokens: `0x${string}`[], amounts: bigint[], newPrices: bigint[]) {
    if (!this.priceOracle || !this.walletClient) throw new Error('Service not initialized')
    
    try {
      // 1. Obtener estado inicial y los liabilities actuales
      const [currentAssets, currentLiabilities] = await Promise.all([
        this.solvencyProof.read.getProtocolAssets(),
        this.solvencyProof.read.getProtocolLiabilities()
      ]);

      console.log('Initial state:', {
        assets: currentAssets,
        liabilities: currentLiabilities
      });

      // 2. Actualizar precios
      for (let i = 0; i < tokens.length; i++) {
        await this.write(this.priceOracle, 'setPrice', [tokens[i], newPrices[i]]);
        await new Promise(r => setTimeout(r, 1000));
      }

      // 3. Calcular nuevos valores de assets
      const newValues = amounts.map((amount, i) => (amount * newPrices[i]) / (10n ** 8n));

      // 4. Actualizar estado manteniendo los liabilities originales
      await this.updateProtocolState(
        { 
          tokens, 
          amounts, 
          values: newValues 
        },
        {
          tokens: currentLiabilities.tokens,
          amounts: currentLiabilities.amounts,
          values: currentLiabilities.values
        }
      );

      // 5. Verificar nuevo estado
      const finalMetrics = await this.getSolvencyMetrics();
      console.log('Post-crash metrics:', {
        healthFactor: Number(finalMetrics.healthFactor) / 100,
        ratio: Number(finalMetrics.ratio) / 100
      });

      return finalMetrics;
    } catch (error) {
      console.error('Market crash simulation error:', error);
      throw error;
    }
  }

  async simulateVolatility(
    volatilityPercent: number,
    steps: number = 5
  ): Promise<SimulationResult[]> {
    if (!this.priceOracle || !this.walletClient) throw new Error('Service not initialized')
    
    const tokens = {
      eth: addresses.tokens.weth as `0x${string}`,
      btc: addresses.tokens.wbtc as `0x${string}`
    }

    // Get initial prices and ensure they're positive
    const initialPrices = {
      eth: Math.max(Number(await this.priceOracle.read.getPrice([tokens.eth])) / 1e8, 0),
      btc: Math.max(Number(await this.priceOracle.read.getPrice([tokens.btc])) / 1e8, 0)
    }

    let lastPrices = { ...initialPrices }
    const results: SimulationResult[] = []

    for (let i = 0; i < steps; i++) {
      // Generate volatility between -volatilityPercent and +volatilityPercent
      const ethVolatility = (Math.random() * 2 - 1) * volatilityPercent / 100
      const btcVolatility = (Math.random() * 2 - 1) * volatilityPercent / 100

      // Ensure prices stay positive by using Math.max
      const newPrices = {
        eth: Math.max(lastPrices.eth * (1 + ethVolatility), 0.01), // Minimum price of 0.01
        btc: Math.max(lastPrices.btc * (1 + btcVolatility * 1.2), 0.01)
      }
      
      // Convert to BigInt safely ensuring no negative numbers
      const ethPriceBigInt = BigInt(Math.floor(Math.max(newPrices.eth * 1e8, 0)))
      const btcPriceBigInt = BigInt(Math.floor(Math.max(newPrices.btc * 1e8, 0)))
      
      // Update prices sequentially with safe values
      await this.updateOraclePrice(tokens.eth, ethPriceBigInt)
      await new Promise(r => setTimeout(r, 1000))
      await this.updateOraclePrice(tokens.btc, btcPriceBigInt)
      await new Promise(r => setTimeout(r, 1000))
      
      const metrics = await this.getSolvencyMetrics()
      
      // Calculate percentage changes safely
      const ethPercentChange = ((newPrices.eth - lastPrices.eth) / lastPrices.eth) * 100
      const btcPercentChange = ((newPrices.btc - lastPrices.btc) / lastPrices.btc) * 100
      
      results.push(
        {
          step: i + 1,
          token: 'ETH',
          oldPrice: lastPrices.eth,
          newPrice: newPrices.eth,
          healthFactor: Number(metrics.healthFactor) / 100,
          timestamp: Math.floor(Date.now() / 1000),
          percentChange: ethPercentChange
        },
        {
          step: i + 1,
          token: 'BTC',
          oldPrice: lastPrices.btc,
          newPrice: newPrices.btc,
          healthFactor: Number(metrics.healthFactor) / 100,
          timestamp: Math.floor(Date.now() / 1000),
          percentChange: btcPercentChange
        }
      )

      lastPrices = newPrices
      await new Promise(r => setTimeout(r, 1000))
    }

    return results
  }

  async getPrice(token: 'eth' | 'btc', timestamp: number): Promise<number> {
    if (!this.publicClient || !this.priceOracle) throw new Error('Service not initialized')

    const tokenAddress = token === 'eth' ? 
      addresses.tokens.weth as `0x${string}` : 
      addresses.tokens.wbtc as `0x${string}`
    
    try {
      const price = await this.priceOracle.read.getPrice([tokenAddress])
      return Number(price)
    } catch (error) {
      console.error(`Error fetching ${token.toUpperCase()} price:`, error)
      throw new Error(`Failed to fetch ${token.toUpperCase()} price`)
    }
  }

  async updateOraclePrice(token: Address, price: bigint) {
    if (!this.priceOracle || !this.walletClient) {
      throw new Error('Service not initialized')
    }

    try {
      // Ensure price is positive and within safe bounds
      const safePrice = price < 0n ? 0n : price
      
      // 1. Update price in oracle with safe value
      await this.write(this.priceOracle, 'setPrice', [token, safePrice])

      // 2. Get current state
      const [currentAssets, currentLiabilities] = await Promise.all([
        this.solvencyProof.read.getProtocolAssets(),
        this.solvencyProof.read.getProtocolLiabilities()
      ])

      // 3. Find token index
      const tokenIndex = currentAssets.tokens.findIndex(
        (t: string) => t.toLowerCase() === token.toLowerCase()
      )
      
      if (tokenIndex === -1) {
        console.log('Token not found in current assets:', token)
        return false
      }

      // 4. Update protocol state with new values but keep other tokens unchanged
      await this.updateProtocolState(
        {
          tokens: currentAssets.tokens,
          amounts: currentAssets.amounts,
          values: currentAssets.values.map((value: bigint, i: number) => 
            i === tokenIndex ? (currentAssets.amounts[i] * safePrice) / (10n ** 8n) : value
          )
        },
        {
          tokens: currentLiabilities.tokens,
          amounts: currentLiabilities.amounts,
          values: currentLiabilities.values.map((value: bigint, i: number) =>
            i === tokenIndex ? (currentLiabilities.amounts[i] * safePrice) / (10n ** 8n) : value
          )
        }
      )

      return true
    } catch (error) {
      console.error('Price update error:', error)
      throw error
    }
  }

  async getLatestPrices(): Promise<{ eth: number; btc: number }> {
    if (!this.priceOracle) throw new Error('Service not initialized')
    
    try {
      const [ethPrice, btcPrice] = await Promise.all([
        this.priceOracle.read.getPrice([addresses.tokens.weth as `0x${string}`]),
        this.priceOracle.read.getPrice([addresses.tokens.wbtc as `0x${string}`])
      ])
      
      // Convert from wei to regular numbers and maintain price scale
      return {
        eth: Number(ethPrice),
        btc: Number(btcPrice)
      }
    } catch (error) {
      console.error('Error fetching latest prices:', error)
      throw error
    }
  }

  async getPriceAndMetrics(timestamp: number): Promise<{
    ethPrice: number;
    btcPrice: number;
    healthFactor: bigint;
  }> {
    const [ethPrice, btcPrice] = await Promise.all([
      this.getPrice('eth', timestamp),
      this.getPrice('btc', timestamp)
    ])

    const [, healthFactor] = await this.verifySolvency()

    return {
      ethPrice,
      btcPrice,
      healthFactor
    }
  }

  async getAllTokenPrices(): Promise<Record<string, number>> {
    if (!this.priceOracle) throw new Error('Service not initialized')
    
    const tokens = {
      weth: addresses.tokens.weth,
      wbtc: addresses.tokens.wbtc,
      usdc: addresses.tokens.usdc,
      usdt: addresses.tokens.usdt,
      dai: addresses.tokens.dai,
      usdcEthLp: addresses.tokens.usdcEthLp,
      daiUsdcLp: addresses.tokens.daiUsdcLp
    }
    
    const prices = await Promise.all(
      Object.entries(tokens).map(async ([symbol, address]) => {
        const price = await this.priceOracle.read.getPrice([address as `0x${string}`])
        return [symbol, Number(price)]
      })
    )
    
    return Object.fromEntries(prices)
  }

  async getHistoricalDataInfo(): Promise<{
    totalEntries: bigint;
    maxEntries: bigint;
    oldestTimestamp: bigint;
    newestTimestamp: bigint;
    minInterval: bigint;
  }> {
    if (!this.solvencyProof) throw new Error('Service not initialized')

    const [totalEntries, maxEntries, oldestTimestamp, newestTimestamp, minInterval] =
      await this.solvencyProof.read.getHistoricalDataInfo()

    return {
      totalEntries,
      maxEntries,
      oldestTimestamp,
      newestTimestamp,
      minInterval
    }
  }

  async getSolvencyHistory(startTime: number, endTime: number) {
    if (!this.solvencyProof) throw new Error('Service not initialized')

    try {
        const [timestamps, ratios, assets, liabilities] = await this.solvencyProof.read.getSolvencyHistory([startTime, endTime])
        
        const history = timestamps.map((timestamp: bigint, index: number) => {
            const currentAssets = assets[index];
            const currentLiabilities = liabilities[index];
            
            // Calcular totales
            const totalAssets = currentAssets.values.reduce((sum: bigint, val: bigint) => sum + val, 0n);
            const totalLiabilities = currentLiabilities.values.reduce((sum: bigint, val: bigint) => sum + val, 0n);
            
            // Calcular ratio real
            let calculatedRatio: number;
            if (totalLiabilities === 0n) {
                calculatedRatio = totalAssets > 0n ? 20000 : 10000;
            } else {
                calculatedRatio = Number((totalAssets * 10000n) / totalLiabilities);
            }
            
            console.log('History entry calculation:', {
                timestamp: Number(timestamp),
                totalAssets: totalAssets.toString(),
                totalLiabilities: totalLiabilities.toString(),
                calculatedRatio,
                ratio: Number(ratios[index])
            });

            return {
                timestamp: Number(timestamp),
                ratio: Number(ratios[index]),
                assets: currentAssets.tokens.map((token: string, i: number) => ({
                    token: token.toLowerCase() === addresses.tokens.weth.toLowerCase() ? 'ETH' : 'BTC',
                    amount: currentAssets.amounts[i],
                    value: currentAssets.values[i]
                })),
                liabilities: currentLiabilities.tokens.map((token: string, i: number) => ({
                    token: token.toLowerCase() === addresses.tokens.weth.toLowerCase() ? 'ETH' : 'BTC',
                    amount: currentLiabilities.amounts[i],
                    value: currentLiabilities.values[i]
                }))
            };
        });

        return {
            timestamps: timestamps.map((ts: bigint) => Number(ts)),
            ratios: ratios.map((r: bigint) => Number(r)),
            history
        };
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
}

  // Add new method to ensure state consistency
  private async refreshState(token: Address, newPrice: bigint) {
    const [assets, liabilities] = await Promise.all([
      this.solvencyProof.read.getProtocolAssets(),
      this.solvencyProof.read.getProtocolLiabilities()
    ])

    // Update values for the token
    const tokenIndex = assets.tokens.findIndex((t: string) => t.toLowerCase() === token.toLowerCase())
    if (tokenIndex !== -1) {
      const newAssetValue = (assets.amounts[tokenIndex] * newPrice) / (10n ** 8n)
      const newLiabilityValue = (liabilities.amounts[tokenIndex] * newPrice) / (10n ** 8n)

      await this.updateProtocolState(
        {
          tokens: [token],
          amounts: [assets.amounts[tokenIndex]],
          values: [newAssetValue]
        },
        {
          tokens: [token],
          amounts: [liabilities.amounts[tokenIndex]],
          values: [newLiabilityValue]
        }
      )
    }
  }
}
