
import { type Address } from 'viem'

export interface SolvencyMetrics {
  isSolvent: boolean
  healthFactor: bigint
  ratio: bigint
}

export interface TokenConfig {
  address: Address
  decimals: number
  initialPrice: bigint
}