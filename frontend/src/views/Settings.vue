<template>
  <div class="min-h-screen bg-[#fafafa] relative">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <div class="flex flex-col items-center">
          <div class="animate-spin h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full"></div>
          <p class="mt-4 text-sm text-gray-600">{{ updateProgress.message }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    
    <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Protocol Settings</h1>
        <button 
          @click="saveSettings" 
          class="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <!-- Initial Price Setup Section -->
      <div class="space-y-6">
        <section class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-1">Initial Price Setup</h2>
            <p class="text-sm text-gray-500 mb-6">Configure base prices for protocol tokens</p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div v-for="(config, symbol) in TOKEN_LIST" 
                   :key="symbol" 
                   class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div class="flex justify-between items-center mb-3">
                  <h3 class="font-medium text-gray-900">{{ symbol }}</h3>
                  <span class="text-xs text-gray-500">Current Price</span>
                </div>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <span class="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                    <input 
                      type="number" 
                      v-model="tokenPriceInputs[symbol]" 
                      class="w-full pl-8 pr-3 py-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                      :placeholder="String(Number(config.initialPrice) / 1e8)"
                    />
                  </div>
                  <button 
                    @click="updateTokenPrice(symbol, Number(tokenPriceInputs[symbol]))"
                    class="px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                @click="setupInitialPrices" 
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset to Default
              </button>
              <button 
                @click="randomizeAllPrices"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Randomize All
              </button>
            </div>
          </div>
        </section>

        <!-- Test Scenarios Section -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-1">Market Scenarios</h2>
            <p class="text-sm text-gray-500 mb-6">Test protocol behavior under different market conditions</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Market Crash Scenario -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 class="font-medium text-gray-900 mb-2">Market Crash Simulation</h3>
                <p class="text-sm text-gray-500 mb-4">Simulates a severe market downturn</p>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ETH Drop (%)</label>
                    <input 
                      v-model="settings.simulation.ethDrop" 
                      type="number" 
                      class="w-full px-3 py-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">BTC Drop (%)</label>
                    <input 
                      v-model="settings.simulation.btcDrop" 
                      type="number" 
                      class="w-full px-3 py-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <button 
                    @click="simulateMarketCrash"
                    class="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Run Crash Simulation
                  </button>
                </div>
              </div>

              <!-- Volatility Scenario -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 class="font-medium text-gray-900 mb-2">Volatility Simulation</h3>
                <p class="text-sm text-gray-500 mb-4">Tests price fluctuation impacts</p>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Volatility Range (%)</label>
                    <input 
                      v-model="settings.simulation.volatility" 
                      type="number" 
                      class="w-full px-3 py-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                    <input 
                      v-model="settings.simulation.duration" 
                      type="number" 
                      class="w-full px-3 py-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <button 
                    @click="simulateVolatility"
                    class="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Run Volatility Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Test Results -->
        <section v-if="testResults" class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Test Results: {{ testResults.testName }}</h3>
              <span :class="{
                'px-2 py-1 text-sm rounded-full': true,
                'bg-green-100 text-green-800': testResults.isSolvent,
                'bg-red-100 text-red-800': !testResults.isSolvent
              }">
                {{ testResults.isSolvent ? 'Solvent' : 'Critical' }}
              </span>
            </div>

            <div class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm space-y-2">
                <p class="flex justify-between">
                  <span class="text-gray-600">Health Factor:</span>
                  <span class="font-medium">{{ formatRatio(Number(testResults.healthFactor)) }}%</span>
                </p>
              </div>
            </div>

            <div v-if="testResults.priceChanges" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr class="text-sm text-gray-500">
                    <th class="px-4 py-3 text-left">Step</th>
                    <th class="px-4 py-3 text-left">Token</th>
                    <th class="px-4 py-3 text-right">Old Price</th>
                    <th class="px-4 py-3 text-right">New Price</th>
                    <th class="px-4 py-3 text-right">Change</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="change in testResults.priceChanges" 
                      :key="change.step"
                      class="text-sm"
                  >
                    <td class="px-4 py-3 text-gray-900">{{ change.step }}</td>
                    <td class="px-4 py-3 text-gray-900">{{ change.token }}</td>
                    <td class="px-4 py-3 text-right text-gray-900">${{ formatNumber(change.oldPrice) }}</td>
                    <td class="px-4 py-3 text-right text-gray-900">${{ formatNumber(change.newPrice) }}</td>
                    <td class="px-4 py-3 text-right" :class="getPriceChangeColor(change.percentChange)">
                      {{ formatPercentChange(change.percentChange) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue'
import { SolvencyProofService } from '../services/contractIntegration'
import { ethers } from 'ethers'
import addresses from '../config/addresses.json'
import { useWeb3 } from '../composables/useWeb3'
import QuickPriceUpdate from '../components/QuickPriceUpdate.vue'

// Define thresholds configuration
const thresholds = {
  criticalThreshold: {
    label: 'Critical Threshold',
    placeholder: '105',
    description: 'Minimum solvency ratio before critical alerts'
  },
  warningThreshold: {
    label: 'Warning Threshold',
    placeholder: '120',
    description: 'Threshold for warning notifications'
  },
  highRiskThreshold: {
    label: 'High Risk Threshold',
    placeholder: '150',
    description: 'Upper limit for high risk classification'
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Simplificar TOKEN_LIST para solo ETH y BTC
interface TokenConfig {
  address: `0x${string}`; // Note the type change here
  decimals: number;
  initialPrice: bigint;
}

const TOKEN_LIST: Record<string, TokenConfig> = {
  WETH: {
    address: addresses.tokens.weth as `0x${string}`,
    decimals: 18,
    initialPrice: 2000n * (10n ** 8n)
  },
  WBTC: {
    address: addresses.tokens.wbtc as `0x${string}`,
    decimals: 18,
    initialPrice: 35000n * (10n ** 8n)
  }
}

const settings = ref({
  criticalThreshold: 105,
  warningThreshold: 120,
  highRiskThreshold: 150,
  assets: [
    { token: 'WETH', amount: '1000', price: '2000', decimals: 18 },
    { token: 'WBTC', amount: '100', price: '35000', decimals: 18 },
    { token: 'USDC', amount: '1000000', price: '1', decimals: 6 }
  ],
  oracles: [
    { address: addresses.priceOracle, interval: 3600 }
  ],
  simulation: {
    ethDrop: 50,
    btcDrop: 40,
    volatility: 10,
    duration: 24
  }
})

const solvencyService = ref<SolvencyProofService>()
const isLoading = ref(false)
const error = ref<string | null>(null)

// Add Web3 composable
const {
  isConnected,
  account,
  connect: connectWeb3,
  disconnect
} = useWeb3()

const accountType = ref<'deployer' | 'oracle' | 'user'>('deployer')

// Connect function
const connectAs = async (type: 'deployer' | 'oracle' | 'user') => {
  try {
    await connectWeb3(type)
    accountType.value = type

    // Only initialize service if needed, don't setup initial state
    if (!solvencyService.value) {
      const { publicClient, walletClient } = useWeb3()
      if (publicClient.value && walletClient.value) {
        solvencyService.value = new SolvencyProofService()
        await solvencyService.value.initialize(
          publicClient.value,
          walletClient.value
        )
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to connect'
  }
}

// Modify onMounted to only setup service
onMounted(async () => {
  try {
    const { connect, publicClient, walletClient } = useWeb3()
    await connect('oracle')
    accountType.value = 'oracle'

    if (!publicClient.value || !walletClient.value) {
      throw new Error('Failed to initialize Web3')
    }

    solvencyService.value = new SolvencyProofService()
    const initialized = await solvencyService.value.initialize(
      publicClient.value,
      walletClient.value
    )

    if (!initialized) {
      throw new Error('Failed to initialize service')
    }

  } catch (e) {
    console.error('Mount error:', e)
    error.value = e instanceof Error ? e.message : 'Failed to initialize'
  }
})

const setupInitialState = async () => {
  if (!solvencyService.value) {
    console.error('Service not available')
    return
  }

  try {
    const tokens = settings.value.assets.map(a => TOKEN_LIST[a.token].address)

    const amounts = settings.value.assets.map(a =>
      ethers.parseUnits(
        a.amount.toString(),
        TOKEN_LIST[a.token].decimals
      )
    )

    const values = settings.value.assets.map(a => {
      const amount = ethers.parseUnits(
        a.amount.toString(),
        TOKEN_LIST[a.token].decimals
      )
      const price = ethers.parseUnits(
        a.price.toString(),
        8 // Oracle price decimals
      )
      return (amount * price) / (10n ** BigInt(TOKEN_LIST[a.token].decimals))
    })

    console.log('Setting initial state:', {
      tokens,
      amounts: amounts.map(a => a.toString()),
      values: values.map(v => v.toString())
    })

    await solvencyService.value.updateAssets(tokens, amounts, values)
  } catch (e) {
    console.error('Setup state error:', e)
    error.value = e instanceof Error ? e.message : 'Failed to setup initial state'
  }
}

const simulateMarketCrash = async () => {
  if (!solvencyService.value) return
  isLoading.value = true
  updateProgress.value.message = 'Simulating market crash...'
  
  try {
    const tokens: `0x${string}`[] = [
      TOKEN_LIST.WETH.address,
      TOKEN_LIST.WBTC.address
    ]
    
    const amounts = [
      ethers.parseEther("1000"),
      ethers.parseEther("100")
    ]

    const oldEthPrice = await solvencyService.value.getPrice('eth', Math.floor(Date.now() / 1000))
    const oldBtcPrice = await solvencyService.value.getPrice('btc', Math.floor(Date.now() / 1000))
    
    const newEthPrice = TOKEN_LIST.WETH.initialPrice * BigInt(100 - settings.value.simulation.ethDrop) / 100n
    const newBtcPrice = TOKEN_LIST.WBTC.initialPrice * BigInt(100 - settings.value.simulation.btcDrop) / 100n
    
    const metrics = await solvencyService.value.simulateMarketCrash(
      tokens,
      amounts,
      [newEthPrice, newBtcPrice]
    )

    testResults.value = {
      testName: 'Market Crash Test',
      healthFactor: Number(metrics.healthFactor),
      isSolvent: metrics.isSolvent,
      priceChanges: [
        {
          step: 1,
          token: 'ETH',
          oldPrice: Number(oldEthPrice) / 1e8,
          newPrice: Number(newEthPrice) / 1e8,
          percentChange: -settings.value.simulation.ethDrop
        },
        {
          step: 1,
          token: 'BTC',
          oldPrice: Number(oldBtcPrice) / 1e8,
          newPrice: Number(newBtcPrice) / 1e8,
          percentChange: -settings.value.simulation.btcDrop
        }
      ]
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to simulate crash'
  } finally {
    isLoading.value = false
    updateProgress.value.message = ''
  }
}

async function simulateVolatility() {
  if (!solvencyService.value) return
  isLoading.value = true
  updateProgress.value.message = 'Simulating market volatility...'
  
  try {
    const volatility = settings.value.simulation.volatility
    const steps = 5

    const results = await solvencyService.value.simulateVolatility(
      volatility,
      steps
    )

    testResults.value = {
      testName: 'Volatility Test',
      healthFactor: results[results.length - 1].healthFactor * 100,
      isSolvent: true,
      priceChanges: results
    }

    console.log('Volatility test results:', testResults.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to simulate volatility'
  } finally {
    isLoading.value = false
    updateProgress.value.message = ''
  }
}

const saveSettings = async () => {
  if (!solvencyService.value || !isConnected.value) {
    error.value = 'Not connected or service not initialized'
    return
  }

  // Ensure we're connected as oracle
  if (accountType.value !== 'oracle') {
    error.value = 'Must be connected as oracle to update prices'
    return
  }

  isLoading.value = true
  try {
    console.log('Current settings:', JSON.stringify(settings.value, null, 2))

    // Update prices first
    for (const asset of settings.value.assets) {
      const tokenAddress = TOKEN_LIST[asset.token].address
      const price = BigInt(Math.floor(Number(asset.price) * 1e8))
      await solvencyService.value.updateOraclePrice(tokenAddress, price)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Calculate assets and liabilities
    const tokens = settings.value.assets.map(a => TOKEN_LIST[a.token].address)
    const amounts = settings.value.assets.map(a =>
      ethers.parseUnits(a.amount.toString(), TOKEN_LIST[a.token].decimals)
    )

    // Calculate values using current prices
    const values = await Promise.all(settings.value.assets.map(async (a) => {
      const amount = ethers.parseUnits(a.amount.toString(), TOKEN_LIST[a.token].decimals)
      const price = ethers.parseUnits(a.price.toString(), 8)
      return (amount * price) / (10n ** BigInt(TOKEN_LIST[a.token].decimals))
    }))

    // Set liabilities as 50% of assets for testing
    const liabilityAmounts = amounts.map(amount => amount / 2n)
    const liabilityValues = values.map(value => value / 2n)

    await solvencyService.value.updateProtocolState(
      { tokens, amounts, values },
      { tokens, amounts: liabilityAmounts, values: liabilityValues }
    )

    console.log('Settings saved successfully')
  } catch (e) {
    console.error('Save settings error:', e)
    error.value = e instanceof Error ? e.message : 'Failed to save settings'
  } finally {
    isLoading.value = false
  }
}

// Add quick price update function
const updateTokenPrice = async (token: string, price: number) => {
  if (!solvencyService.value) return
  
  isLoading.value = true
  updateProgress.value.message = 'Updating price...'
  
  try {
    const tokenAddress = TOKEN_LIST[token].address
    const priceValue = BigInt(Math.floor(price * 1e8))
    
    await solvencyService.value.updateOraclePrice(tokenAddress, priceValue)
    
    const assetIndex = settings.value.assets.findIndex(a => a.token === token)
    if (assetIndex >= 0) {
      settings.value.assets[assetIndex].price = price.toString()
    }

    await fetchLatestHistory()
    
    console.log(`Updated ${token} price to ${price}`)
  } catch (e) {
    error.value = `Failed to update ${token} price: ${e instanceof Error ? e.message : String(e)}`
    console.error('Price update error:', e)
  } finally {
    isLoading.value = false
    updateProgress.value.message = ''
  }
}

// Update fetchLatestHistory to include price updates
const fetchLatestHistory = async () => {
  const now = Math.floor(Date.now() / 1000)
  const oneHourAgo = now - 3600
  
  try {
    const { timestamps, ratios, history } = await solvencyService.value?.getSolvencyHistory(
      oneHourAgo,
      now
    ) || {}

    if (history && history.length > 0) {
      const latest = history[history.length - 1]
      const ethAsset = latest.assets.find((a: { token: string }) => a.token === 'ETH')
      const btcAsset = latest.assets.find((a: { token: string }) => a.token === 'BTC')
      
      testResults.value = {
        testName: 'Price Update',
        healthFactor: latest.ratio,
        isSolvent: latest.ratio >= 10500,
        priceChanges: [
          ethAsset && {
            step: 1,
            token: 'ETH',
            oldPrice: Number(ethAsset.value) / Number(ethAsset.amount),
            newPrice: Number(ethAsset.value) / Number(ethAsset.amount),
            percentChange: 0
          },
          btcAsset && {
            step: 1,
            token: 'BTC',
            oldPrice: Number(btcAsset.value) / Number(btcAsset.amount),
            newPrice: Number(btcAsset.value) / Number(btcAsset.amount),
            percentChange: 0
          }
        ].filter(Boolean)
      }
    }
  } catch (e) {
    console.error('History fetch error:', e)
  }
}

// 1. Definir secciones claras para las configuraciones
const sections = {
  assets: {
    title: 'Asset Configuration',
    description: 'Configure protocol assets and their initial values'
  },
  prices: {
    title: 'Price Management',
    description: 'Update asset prices individually or in batch'
  },
  simulation: {
    title: 'Market Simulation',
    description: 'Test different market scenarios'
  },
  tests: {
    title: 'Protocol Tests',
    description: 'Run predefined test scenarios'
  }
}

// 3. Estado reactivo para la UI
interface TestResult {
  testName: string;
  healthFactor: number;
  isSolvent: boolean;
  priceChanges?: {
    step: number;
    token: string;
    oldPrice: number;
    newPrice: number;
    percentChange: number;
  }[];
}
const testResults = ref<TestResult | null>(null)


// Add a new ref for managing token prices directly
const tokenPriceInputs = ref<Record<string, string>>(
  Object.keys(TOKEN_LIST).reduce((acc, token) => {
    // Initialize with current prices from settings or default values
    const asset = settings.value.assets.find(a => a.token === token)
    acc[token] = asset?.price || String(Number(TOKEN_LIST[token].initialPrice) / 1e8)
    return acc
  }, {} as Record<string, string>)
)

// Añadir nuevas funciones después de las funciones existentes
const generateRandomPrice = (basePrice: bigint) => {
  // Generar variación aleatoria entre -20% y +20%
  const variation = (Math.random() * 0.4) - 0.2
  const newPrice = Number(basePrice) * (1 + variation)
  return Math.floor(newPrice)
}

const randomizeAllPrices = async () => {
  if (!solvencyService.value) return
  isLoading.value = true
  
  try {
    // Generar nuevos precios aleatorios para cada token
    for (const [symbol, config] of Object.entries(TOKEN_LIST)) {
      const newPrice = generateRandomPrice(config.initialPrice)
      tokenPriceInputs.value[symbol] = (newPrice / 1e8).toString()
    }
    
    // Actualizar todos los precios
    await updateAllPrices()
  } catch (e) {
    error.value = `Failed to randomize prices: ${e instanceof Error ? e.message : String(e)}`
  } finally {
    isLoading.value = false
  }
}

const updateAllPrices = async () => {
  if (!solvencyService.value) return
  isLoading.value = true
  
  try {
    // Actualizar cada token secuencialmente
    for (const [symbol, price] of Object.entries(tokenPriceInputs.value)) {
      await updateTokenPrice(symbol, Number(price))
      // Pequeña pausa entre actualizaciones
      await new Promise(r => setTimeout(r, 500))
    }
    
    // Actualizar histórico después de todos los cambios
    await fetchLatestHistory()
  } catch (e) {
    error.value = `Failed to update all prices: ${e instanceof Error ? e.message : String(e)}`
  } finally {
    isLoading.value = false
  }
}

// Agregar nuevo estado para el progreso
const updateProgress = ref({
  total: 0,
  current: 0,
  message: ''
})

const formatPercentage = (percent: number): string => {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

// Add new function to set initial prices
const setupInitialPrices = async () => {
  if (!solvencyService.value) return
  isLoading.value = true
  updateProgress.value.message = 'Setting initial prices...'
  
  try {
    // Set initial prices for ETH and BTC only
    await solvencyService.value.updateOraclePrice(
      TOKEN_LIST.WETH.address as `0x${string}`,
      TOKEN_LIST.WETH.initialPrice
    )
    await new Promise(r => setTimeout(r, 1000))
    
    await solvencyService.value.updateOraclePrice(
      TOKEN_LIST.WBTC.address as `0x${string}`,
      TOKEN_LIST.WBTC.initialPrice
    )

    // Initialize protocol state with just ETH and BTC
    const tokens = [TOKEN_LIST.WETH.address, TOKEN_LIST.WBTC.address]
    const amounts = [
      ethers.parseEther("1000"), // 1000 ETH
      ethers.parseEther("100")   // 100 BTC
    ]
    const values = [
      TOKEN_LIST.WETH.initialPrice * BigInt(1000),
      TOKEN_LIST.WBTC.initialPrice * BigInt(100)
    ]

    await solvencyService.value.updateProtocolState(
      { tokens: tokens as `0x${string}`[], amounts, values },
      {
        tokens: tokens as `0x${string}`[],
        amounts: amounts.map(a => a / 2n),
        values: values.map(v => v / 2n)
      }
    )
    
    console.log('Initial prices set successfully')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to set initial prices'
    console.error('Setup error:', e)
  } finally {
    isLoading.value = false
    updateProgress.value.message = ''
  }
}

// Add these formatting functions in the <script setup> section:
const formatNumber = (num: number): string => {
  return num.toFixed(2)
}

const formatPercentChange = (change: number): string => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

const formatRatio = (ratio: number): string => {
  return (ratio / 100).toFixed(2)
}

const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}
</script>

<style>
/* Add any custom styles needed */
.border-3 {
  border-width: 3px;
}

/* Remove spinner buttons from number inputs */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
