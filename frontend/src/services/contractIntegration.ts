import { type Address, type WalletClient, type PublicClient, type Hash, getContract } from 'viem'
import addresses from '../config/addresses.json'
import SolvencyProofABI from '../../../artifacts/contracts/SolvencyProof/SolvencyProof.sol/SolvencyProof.json'
import MockPriceOracleABI from '../../../artifacts/contracts/test/MockPriceOracle.sol/MockPriceOracle.json'

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
    if (!this.walletClient || !this.publicClient) throw new Error('Clients not initialized')
    
    const { request } = await contractInstance.simulate[method](
      args,
      { 
        account: this.walletClient.account,
        chain: this.walletClient.chain
      }
    )
    
    const hash = await this.walletClient.writeContract(request)
    
    // Esperar a que la transacción se mine
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
    return receipt.transactionHash
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

  async getSolvencyHistory(
    startTime: number,
    endTime: number
  ): Promise<[bigint[], bigint[]]> {
    if (!this.solvencyProof) {
      throw new Error('Service not initialized')
    }

    return this.solvencyProof.read.getSolvencyHistory([startTime, endTime])
  }

  async simulateMarketCrash(
    tokens: Address[],
    amounts: bigint[],
    newPrices: bigint[]
  ) {
    if (!this.priceOracle || !this.walletClient) {
      throw new Error('Service not initialized')
    }

    // Update prices in oracle
    for (let i = 0; i < tokens.length; i++) {
      await this.write(this.priceOracle, 'setPrice', [tokens[i], newPrices[i]])
    }

    // Update asset values
    const values = amounts.map((amount, i) => 
      (amount * newPrices[i]) / (10n ** 8n)
    )

    return this.updateAssets(tokens, amounts, values)
  }

  async simulateVolatility(
    token: Address,
    amount: bigint,
    newPrice: bigint
  ) {
    if (!this.priceOracle || !this.walletClient) {
      throw new Error('Service not initialized')
    }

    // Update price in oracle
    await this.write(this.priceOracle, 'setPrice', [token, newPrice])

    // Update asset value
    const value = (amount * newPrice) / (10n ** 8n)
    return this.updateAssets([token], [amount], [value])
  }
}
