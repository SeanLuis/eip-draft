<template>
  <div class="min-h-screen bg-[#f6f8fa] p-6">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-semibold text-[#24292f]">Protocol Settings</h1>
        <div class="flex items-center space-x-2">
          <span v-if="isLoading" class="text-sm text-gray-600">
            <svg class="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <button @click="saveSettings" class="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-sm font-semibold rounded-md transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-[#ffebe9] border border-[#ff8182] text-[#cf222e] px-4 py-3 rounded-md mb-6">
        {{ error }}
      </div>

      <!-- Oracle Information -->
      <div class="bg-white border border-[#d0d7de] rounded-md shadow-sm">
        <div class="px-6 py-4 border-b border-[#d0d7de]">
          <h2 class="text-lg font-medium text-[#24292f]">Price Oracle</h2>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-center space-x-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-[#57606a] mb-1">Oracle Address</label>
              <div class="flex items-center space-x-2">
                <code class="bg-[#f6f8fa] px-2 py-1 rounded text-sm font-mono text-[#24292f]">
                  {{ CONFIG.CONTRACTS.MockPriceOracle }}
                </code>
                <button @click="copyToClipboard(CONFIG.CONTRACTS.MockPriceOracle)" class="text-[#57606a] hover:text-[#24292f]">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 010 14.25v-7.5z"/>
                    <path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm text-[#57606a]">Default price oracle used for asset valuation</p>
            </div>
            <div class="flex items-center px-3 py-1 bg-[#ddf4ff] text-[#0969da] rounded-full text-sm">
              Active
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Thresholds -->
      <div class="bg-white border border-[#d0d7de] rounded-md shadow-sm">
        <div class="px-6 py-4 border-b border-[#d0d7de]">
          <h2 class="text-lg font-medium text-[#24292f]">Risk Thresholds</h2>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(threshold, key) in thresholds" :key="key" class="space-y-2">
              <label class="block text-sm font-medium text-[#57606a]">{{ threshold.label }}</label>
              <div class="relative">
                <input
                  v-model="settings[key]"
                  type="number"
                  :placeholder="threshold.placeholder"
                  class="block w-full px-3 py-2 border border-[#d0d7de] rounded-md shadow-sm focus:ring-2 focus:ring-[#0969da] focus:border-transparent"
                />
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-[#57606a]">%</span>
              </div>
              <p class="text-xs text-[#57606a]">{{ threshold.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Asset Configuration -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Asset Configuration</h2>
        <div class="space-y-4">
          <div v-for="(asset, index) in settings.assets" :key="index" class="grid grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Token</label>
              <select v-model="asset.token" class="w-full rounded border p-2">
                <option value="WETH">WETH</option>
                <option value="WBTC">WBTC</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="USDC-ETH-LP">USDC-ETH LP</option>
                <option value="DAI-USDC-LP">DAI-USDC LP</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Initial Amount</label>
              <input v-model="asset.amount" type="number" class="w-full rounded border p-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Initial Price ($)</label>
              <input v-model="asset.price" type="number" class="w-full rounded border p-2" />
            </div>
            <div class="flex items-end">
              <button @click="removeAsset(index)" class="bg-red-500 text-white px-4 py-2 rounded">
                Remove
              </button>
            </div>
          </div>
          <button @click="addAsset" class="bg-green-500 text-white px-4 py-2 rounded">
            Add Asset
          </button>
        </div>
      </div>

      <!-- Price Oracle Configuration -->
      <div class="bg-white border border-[#d0d7de] rounded-md shadow-sm">
        <div class="px-6 py-4 border-b border-[#d0d7de]">
          <h2 class="text-lg font-medium text-[#24292f]">Price Oracle Configuration</h2>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#57606a]">Oracle Address</label>
              <div class="mt-1 flex items-center space-x-2">
                <code class="flex-1 bg-[#f6f8fa] px-2 py-1 rounded text-sm font-mono text-[#24292f]">
                  {{ CONFIG.CONTRACTS.MockPriceOracle }}
                </code>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#57606a]">Update Interval (s)</label>
              <input 
                v-model="settings.oracles[0].interval" 
                type="number" 
                class="mt-1 block w-full px-3 py-2 border border-[#d0d7de] rounded-md"
              />
            </div>
          </div>
          <p class="mt-2 text-sm text-[#57606a]">
            Using deployed MockPriceOracle from hardhat network
          </p>
        </div>
      </div>

      <!-- Market Simulation -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Market Simulation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold mb-3">Market Crash Scenario</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ETH Price Drop (%)</label>
                <input v-model="settings.simulation.ethDrop" type="number" class="w-full rounded border p-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">BTC Price Drop (%)</label>
                <input v-model="settings.simulation.btcDrop" type="number" class="w-full rounded border p-2" />
              </div>
              <button @click="simulateMarketCrash" class="bg-red-500 text-white px-4 py-2 rounded">
                Simulate Crash
              </button>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-3">Volatility Testing</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Volatility Range (%)</label>
                <input v-model="settings.simulation.volatility" type="number" class="w-full rounded border p-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Test Duration (hours)</label>
                <input v-model="settings.simulation.duration" type="number" class="w-full rounded border p-2" />
              </div>
              <button @click="simulateVolatility" class="bg-yellow-500 text-white px-4 py-2 rounded">
                Test Volatility
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Settings -->
      <div class="flex justify-end">
        <button @click="saveSettings" class="bg-blue-500 text-white px-6 py-3 rounded font-semibold">
          Save All Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SolvencyProofService } from '../services/contractIntegration'
import Web3Service from '../services/web3Service'
import { ethers } from 'ethers'
import { CONFIG } from '../config'

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

// Definir los tokens disponibles con sus direcciones y precios iniciales
const TOKEN_LIST = {
    USDC: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    USDT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    DAI: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    WETH: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    WBTC: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    USDC_ETH_LP: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    DAI_USDC_LP: "0x0165878A594ca255338adfa4d48449f69242Eb8F"
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
    { address: CONFIG.CONTRACTS.MockPriceOracle, interval: 3600 }
  ],
  simulation: {
    ethDrop: 50,
    btcDrop: 40,
    volatility: 10,
    duration: 24
  }
})

const solvencyService = ref<SolvencyProofService>()
const web3Service = Web3Service.getInstance()
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    console.log('Mounting Settings component...');
    solvencyService.value = new SolvencyProofService();
    
    // Initialize service with oracle
    const initialized = await solvencyService.value.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize service');
    }
    
    console.log('Service initialized, setting up initial state...');
    await setupInitialState();
  } catch (e) {
    console.error('Mount error:', e);
    error.value = e instanceof Error ? e.message : 'Failed to initialize';
  }
});

const setupInitialState = async () => {
  if (!solvencyService.value) {
    console.error('Service not available');
    return;
  }
  
  try {
    const tokens = settings.value.assets.map(a => TOKEN_LIST[a.token].address);
    const amounts = settings.value.assets.map(a => 
      ethers.parseUnits(a.amount, a.decimals)
    );
    const values = settings.value.assets.map(a => {
      const amount = ethers.parseUnits(a.amount, a.decimals);
      const price = ethers.parseUnits(a.price, 8); // Oracle uses 8 decimals
      return (amount * price / ethers.parseUnits('1', a.decimals));
    });
    
    console.log('Updating initial state with:', {
      tokens,
      amounts: amounts.map(a => a.toString()),
      values: values.map(v => v.toString())
    });

    await solvencyService.value.updateAssets(tokens, amounts, values);
  } catch (e) {
    console.error('Setup state error:', e);
    error.value = e instanceof Error ? e.message : 'Failed to setup initial state';
  }
}

const addAsset = () => {
  settings.value.assets.push({ token: 'WETH', amount: 0, price: 0 })
}

const removeAsset = (index: number) => {
  settings.value.assets.splice(index, 1)
}

const simulateMarketCrash = async () => {
  if (!solvencyService.value) return
  
  isLoading.value = true
  try {
    const tokens = [
      TOKEN_LIST.WETH.address,
      TOKEN_LIST.WBTC.address
    ]
    
    const amounts = [
      ethers.parseEther("1000"),
      ethers.parseEther("100")
    ]
    
    // Calcular nuevos precios después del crash
    const wethPrice = TOKEN_LIST.WETH.initialPrice * BigInt(100 - settings.value.simulation.ethDrop) / 100n
    const wbtcPrice = TOKEN_LIST.WBTC.initialPrice * BigInt(100 - settings.value.simulation.btcDrop) / 100n
    const values = [wethPrice, wbtcPrice]
    
    await solvencyService.value.simulateMarketCrash(tokens, amounts, values)
    const metrics = await solvencyService.value.getSolvencyMetrics()
    console.log('Market crash simulation results:', metrics)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to simulate crash'
  } finally {
    isLoading.value = false
  }
}

const simulateVolatility = async () => {
  if (!solvencyService.value) return
  
  isLoading.value = true
  try {
    const steps = 5
    const basePrice = TOKEN_LIST.WETH.initialPrice
    
    for (let i = 0; i < steps; i++) {
      const volatility = Math.sin(i) * (settings.value.simulation.volatility / 100)
      const newPrice = basePrice * BigInt(Math.floor((1 + volatility) * 100)) / 100n
      
      await solvencyService.value.simulateVolatility(
        TOKEN_LIST.WETH.address,
        ethers.parseEther("1000"),
        newPrice
      )
      
      if (i < steps - 1) {
        await new Promise(r => setTimeout(r, 
          (settings.value.simulation.duration * 3600 * 1000) / steps
        ))
      }
    }
    
    const metrics = await solvencyService.value.getSolvencyMetrics()
    console.log('Volatility simulation results:', metrics)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to simulate volatility'
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  if (!solvencyService.value) return
  
  isLoading.value = true
  try {
    const tokens = settings.value.assets.map(a => TOKEN_LIST[a.token].address)
    const amounts = settings.value.assets.map(a => 
      ethers.parseUnits(a.amount, a.decimals)
    )
    const values = settings.value.assets.map(a => 
      ethers.parseUnits(
        (Number(a.amount) * Number(a.price)).toString(),
        8
      )
    )
    
    const tx = await solvencyService.value.updateAssets(tokens, amounts, values)
    await tx.wait()
    console.log('Settings saved successfully')
  } catch (e) {
    console.error('Save settings error:', e)
    error.value = e instanceof Error ? e.message : 'Failed to save settings'
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* Add any additional custom styles here */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
