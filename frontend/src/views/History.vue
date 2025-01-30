<template>
  <div class="min-h-screen bg-[#fafafa] relative">
    <h1 class="text-2xl font-semibold text-gray-900">Solvency Metrics</h1>
        <div class="text-gray-600 my-6">
          Historical solvency data based on:
          <ul class="list-disc pl-5 mt-2">
            <li>Solvency Ratio (SR) = (TA / TL) × 100</li>
            <li>Where: TA = Σ(Assets × Price), TL = Σ(Liabilities × Price)</li>
            <li>Risk Adjustments: Asset weights (0-1), Liability risk factors (≥1)</li>
          </ul>
        </div>

        <!-- Health Status Display -->
        <div class="grid grid-cols-3 gap-6 mb-6">
          <!-- Current Health Factor -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium mb-1">Health Factor</h3>
            <p class="text-2xl font-bold" :class="getStatusColor(currentStatus)">
              {{ formatRatio(sortedHistory[0]?.ratio || 0) }}%
            </p>
            <p class="text-xs text-gray-500">Target: ≥120%</p>
          </div>

          <!-- Risk Level -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium mb-1">Risk Level</h3>
            <p class="text-2xl font-bold" :class="getStatusColor(currentStatus)">
              {{ currentStatus }}
            </p>
            <p class="text-xs text-gray-500">Based on health factor thresholds</p>
          </div>

          <!-- Asset Coverage -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium mb-1">Price Updates</h3>
            <p class="text-2xl font-bold">{{ historyData.length }}</p>
            <p class="text-xs text-gray-500">Historical data points</p>
          </div>
        </div>

        <!-- Time Range Controls -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center gap-4">
            <input 
              type="datetime-local" 
              v-model="startDate"
              class="flex-1 px-3 py-2 border rounded" 
            />
            <input 
              type="datetime-local" 
              v-model="endDate"
              class="flex-1 px-3 py-2 border rounded" 
            />
            <button @click="fetchHistory" class="px-4 py-2 bg-blue-500 text-white rounded">
              Update
            </button>
          </div>
        </div>

        <!-- Price Chart -->
        <div class="p-6">
          <div class="h-[400px] mb-6">
            <LineChart :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Historical Data Table -->
        <div class="p-6 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="p-2 text-left">Time</th>
                <th class="p-2 text-left">Health Factor</th>
                <th class="p-2 text-left" colspan="3">ETH Position</th>
                <th class="p-2 text-left" colspan="3">BTC Position</th>
                <th class="p-2 text-left">Status</th>
              </tr>
              <tr class="bg-gray-50">
                <th class="p-2"></th>
                <th class="p-2"></th>
                <th class="p-2 text-left">Amount</th>
                <th class="p-2 text-left">Price</th>
                <th class="p-2 text-left">Value</th>
                <th class="p-2 text-left">Amount</th>
                <th class="p-2 text-left">Price</th>
                <th class="p-2 text-left">Value</th>
                <th class="p-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in sortedHistory" :key="record.timestamp" class="border-t">
                <td class="p-2">{{ formatDate(record.timestamp) }}</td>
                <td class="p-2">{{ formatRatio(record.ratio) }}%</td>
                <!-- ETH -->
                <td class="p-2">{{ record.assets[0] ? formatAmount(record.assets[0].amount) : '0.0000' }}</td>
                <td class="p-2">${{ record.assets[0] ? formatTokenPrice(record.assets[0].amount, record.assets[0].value) : '0.00' }}</td>
                <td class="p-2">${{ record.assets[0] ? formatValue(record.assets[0].value) : '0.00' }}</td>
                <!-- BTC -->
                <td class="p-2">{{ record.assets[1] ? formatAmount(record.assets[1].amount) : '0.0000' }}</td>
                <td class="p-2">${{ record.assets[1] ? formatTokenPrice(record.assets[1].amount, record.assets[1].value) : '0.00' }}</td>
                <td class="p-2">${{ record.assets[1] ? formatValue(record.assets[1].value) : '0.00' }}</td>
                <td class="p-2">
                  <span :class="getStatusClass(getStatusFromHealthFactor(record.ratio))" class="px-2 py-1 rounded-full text-xs">
                    {{ getStatusFromHealthFactor(record.ratio) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useWeb3 } from '../composables/useWeb3'
import { SolvencyProofService } from '../services/contractIntegration'
import addresses from '../config/addresses.json'
import type { ChartOptions, Scale, CoreScaleOptions, Tick } from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Define proper interfaces
interface Asset {
  token: string;
  amount: bigint;
  value: bigint;
}

interface HistoryEntry {
  timestamp: number;
  ratio: number;
  healthFactor: number;
  assets: Asset[];
  liabilities?: Asset[];
}

interface ChartDataPoint {
  timestamp: number;
  ethPrice: number;
  btcPrice: number;
  healthFactor: number;
}

// State
const startDate = ref('')
const endDate = ref('')
const historyData = ref<HistoryEntry[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const solvencyService = ref<SolvencyProofService>()

// Add new polling mechanism
let pollInterval: number | null = null

// Add polling function
const pollLatestData = async () => {
  if (!solvencyService.value) return
  
  try {
    const now = Math.floor(Date.now() / 1000)
    const oneHourAgo = now - 3600
    
    const { history } = await solvencyService.value.getSolvencyHistory(oneHourAgo, now)
    
    if (history && history.length > 0) {
      const latest = history[history.length - 1]
      
      // Validar que el estado no esté corrupto
      if (latest.ratio <= 0 || latest.ratio > 30000) { // 300%
        console.warn('Invalid ratio detected:', latest.ratio)
        return
      }

      // Solo añadir si es una entrada nueva y válida
      const exists = historyData.value.some(entry => entry.timestamp === latest.timestamp)
      if (!exists) {
        historyData.value.push({
          timestamp: latest.timestamp,
          ratio: latest.ratio,
          healthFactor: latest.ratio / 100,
          assets: latest.assets,
          liabilities: latest.liabilities
        })

        // Log para debugging
        console.log('New history entry:', {
          timestamp: new Date(latest.timestamp * 1000).toLocaleString(),
          ratio: latest.ratio,
          healthFactor: latest.ratio / 100,
          status: getStatusFromHealthFactor(latest.ratio)
        })
      }

      // Mantener solo últimas 24 horas
      const oneDayAgo = now - 86400
      historyData.value = historyData.value.filter(entry => entry.timestamp > oneDayAgo)
    }
  } catch (e) {
    console.error('Polling error:', e)
  }
}

// Computed properties
const sortedHistory = computed((): HistoryEntry[] => {
  return [...historyData.value].sort((a, b) => b.timestamp - a.timestamp)
})

const currentHealthFactor = computed((): number => {
  const latest = sortedHistory.value[0]
  return latest ? latest.ratio : 0
})

const currentStatus = computed((): string => {
  const latest = sortedHistory.value[0]
  return latest ? getStatusFromHealthFactor(latest.ratio) : 'N/A'
})

// Simplificar TOKEN_LIST solo para ETH y BTC
const TOKEN_LIST = {
  WETH: {
    address: addresses.tokens.weth,
    decimals: 18,
    color: '#0969da', // ETH blue
    initialPrice: 2000n * (10n ** 8n)
  },
  WBTC: {
    address: addresses.tokens.wbtc,
    decimals: 18,
    color: '#bf8700', // BTC orange
    initialPrice: 35000n * (10n ** 8n)
  }
}

// Chart data - simplificado para solo ETH y BTC
const chartData = computed(() => ({
  labels: historyData.value.map(record => formatDate(record.timestamp)),
  datasets: [
    {
      label: 'Health Factor (%)',
      data: historyData.value.map(record => {
        const ratio = Number(record.ratio) / 100
        return Math.min(ratio, 500) // Limitar a 500% para visualización
      }),
      borderColor: '#2da44e',
      yAxisID: 'y',
      borderWidth: 2,
      fill: false,
      tension: 0.4
    },
    // Solo ETH
    {
      label: 'ETH Price ($)',
      data: historyData.value.map(record => {
        const ethAsset = record.assets?.find(a => a.token === 'ETH')
        if (!ethAsset?.amount || !ethAsset?.value) return null
        return Number(formatTokenPrice(ethAsset.amount, ethAsset.value))
      }),
      borderColor: TOKEN_LIST.WETH.color,
      borderWidth: 1,
      fill: false,
      yAxisID: 'y1',
      tension: 0.4
    },
    // Solo BTC
    {
      label: 'BTC Price ($)',
      data: historyData.value.map(record => {
        const btcAsset = record.assets?.find(a => a.token === 'BTC')
        if (!btcAsset?.amount || !btcAsset?.value) return null
        return Number(formatTokenPrice(btcAsset.amount, btcAsset.value))
      }),
      borderColor: TOKEN_LIST.WBTC.color,
      borderWidth: 1,
      fill: false,
      yAxisID: 'y1',
      tension: 0.4
    }
  ]
}))

/**
 * Price History Chart Configuration
 * Displays key metrics from TEST-CASES.md:
 * - Health Factor evolution
 * - Asset price movements
 * - Risk threshold indicators
 */
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Health Factor (%)'
      },
      min: 0,
      max: 500, // Limitar el eje Y a 500%
      ticks: {
        callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number, index: number, ticks: Tick[]): string {
          return `${Number(tickValue).toFixed(0)}%`
        }
      }
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Price ($)'
      },
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number, index: number, ticks: Tick[]): string {
          return `$${Number(tickValue).toFixed(2)}`
        }
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context): string {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${label.includes('Price') ? '$' : ''}${value.toFixed(2)}${label.includes('Factor') ? '%' : ''}`;
        }
      }
    }
  }
} as const; // Add const assertion to the entire object

// Helper functions
const getStatusColor = (status: string) => {
  return {
    'HEALTHY': 'text-[#2da44e]',
    'WARNING': 'text-[#bf8700]',
    'HIGH_RISK': 'text-[#bc4c00]',
    'CRITICAL': 'text-[#cf222e]'
  }[status] || 'text-[#57606a]'
}

/**
 * Risk Level Classification
 * Based on EIP specification thresholds
 * 
 * Formula: SR = (Total Assets / Total Liabilities) × 100
 * Where:
 * - Total Assets = Σ(Asset_i × Price_i)
 * - Total Liabilities = Σ(Liability_i × Price_i)
 */
const getStatusFromHealthFactor = (ratio: number): string => {
  // Convertir a porcentaje para comparar
  const percentage = ratio / 100
  
  // Usar umbrales dinámicos basados en el ratio actual
  if (percentage <= 105) return 'CRITICAL'
  if (percentage <= 110) return 'HIGH_RISK'
  if (percentage <= 120) return 'WARNING'
  return 'HEALTHY'
}

const formatPrice = (amount: bigint, value: bigint): string => {
  if (!amount || !value) return '0.00'
  // Precio = valor / cantidad (ambos en ETH)
  return ((Number(value) / Number(amount))).toFixed(2)
}

const formatRatio = (ratio: number | bigint): string => {
  if (!ratio) return '0.00'
  
  // Convertir BigInt a Number si es necesario
  const ratioNum = typeof ratio === 'bigint' ? Number(ratio) : ratio
  
  // Convertir a porcentaje (ratio viene en base 10000)
  return (ratioNum / 100).toFixed(2)
}

const fetchHistory = async () => {
  if (!solvencyService.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const start = Math.floor(new Date(startDate.value).getTime() / 1000)
    const end = Math.floor(new Date(endDate.value).getTime() / 1000)
    
    const { history } = await solvencyService.value.getSolvencyHistory(start, end)
    
    historyData.value = history.map((entry: any) => ({
      timestamp: entry.timestamp,
      ratio: entry.ratio,
      healthFactor: entry.ratio / 100,
      assets: entry.assets,
      liabilities: entry.liabilities
    }))

    console.log('Updated history data:', historyData.value)
  } catch (e) {
    console.error('History fetch error:', e)
    error.value = e instanceof Error ? e.message : 'Failed to fetch history'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString();
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const getStatusClass = (status: string) => {
  return {
    'HEALTHY': 'text-green-500',
    'WARNING': 'text-yellow-500',
    'HIGH_RISK': 'text-orange-500',
    'CRITICAL': 'text-red-500'
  }[status] || 'text-gray-500'
}

const formatAmount = (amount: bigint): string => {
  if (!amount) return '0.0000'
  return (Number(amount) / 1e18).toFixed(4)
}

const formatValue = (value: bigint): string => {
  if (!value) return '0.00'
  return (Number(value) / 1e18).toFixed(2) // Los valores están en ETH (18 decimals)
}

// Update the formatting functions
const formatTokenPrice = (amount: bigint, value: bigint): string => {
  if (!amount || !value || amount === 0n) return '0.00'
  const price = (Number(value) * 1e18) / Number(amount) // Convert to proper decimals
  return (price / 1e18).toFixed(2)
}

// Add composable
onMounted(async () => {
  const { publicClient, walletClient, connect } = useWeb3()
  await connect('oracle')
  
  if (publicClient.value && walletClient.value) {
    solvencyService.value = new SolvencyProofService()
    await solvencyService.value.initialize(publicClient.value, walletClient.value)
    
    // Set initial date range to last 24 hours
    const now = new Date()
    endDate.value = now.toISOString().slice(0, 16)
    now.setDate(now.getDate() - 1)
    startDate.value = now.toISOString().slice(0, 16)
    
    await fetchHistory()
  }
  
  // Start polling every 30 seconds  pollInterval = window.setInterval(pollLatestData, 30000)})// Add onUnmountedonUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>
