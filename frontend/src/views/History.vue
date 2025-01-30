<template>
  <div class="min-h-screen bg-[#fafafa]">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Protocol History</h1>
          <p class="mt-1 text-sm text-gray-500">Track historical solvency metrics and price movements</p>
        </div>
        <div class="flex gap-3">
          <button 
            @click="fetchHistory" 
            class="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            :disabled="isLoading"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Updating...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <!-- Time Range Selector -->
      <div class="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div class="flex-1 w-full sm:w-auto">
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="datetime-local" 
              v-model="startDate"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div class="flex-1 w-full sm:w-auto">
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="datetime-local" 
              v-model="endDate"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div class="flex-shrink-0 self-end">
            <button 
              @click="fetchHistory"
              class="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Health Status Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Current Health Factor</h3>
          <p class="mt-2 text-3xl font-semibold" :class="getStatusColor(currentStatus)">
            {{ formatRatio(sortedHistory[0]?.ratio || 0) }}%
          </p>
          <div class="mt-1">
            <span class="text-sm" :class="getStatusColor(currentStatus)">{{ currentStatus }}</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Data Points</h3>
          <p class="mt-2 text-3xl font-semibold text-gray-900">{{ historyData.length }}</p>
          <p class="mt-1 text-sm text-gray-500">Historical records</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Last Update</h3>
          <p class="mt-2 text-3xl font-semibold text-gray-900">
            {{ sortedHistory[0] ? new Date(sortedHistory[0].timestamp * 1000).toLocaleTimeString() : '-' }}
          </p>
          <p class="mt-1 text-sm text-gray-500">{{ sortedHistory[0] ? new Date(sortedHistory[0].timestamp * 1000).toLocaleDateString() : '-' }}</p>
        </div>
      </div>

      <!-- Price Chart with Economic Style -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Price History</h2>
          <div class="flex gap-2">
            <button 
              v-for="period in timePeriods"
              :key="period.value"
              @click="setChartPeriod(period.value)"
              :class="[
                'px-3 py-1 text-sm rounded-md',
                selectedPeriod === period.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="h-[400px]" ref="chartContainer"></div>
        </div>
      </div>

      <!-- Historical Data Table with Pagination -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Historical Records</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">
              Showing {{ paginatedHistory.length }} of {{ sortedHistory.length }} entries
            </span>
            <select 
              v-model="pageSize" 
              class="form-select text-sm border-gray-200 rounded-md"
            >
              <option :value="10">10 per page</option>
              <option :value="25">25 per page</option>
              <option :value="50">50 per page</option>
            </select>
          </div>
        </div>
        
        <!-- Table Content -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Factor</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colspan="3">ETH Position</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colspan="3">BTC Position</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in paginatedHistory" :key="record.timestamp" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(record.timestamp) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ formatRatio(record.ratio) }}%</td>
                <!-- ETH Data -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatAmount(record.assets[0]?.amount || 0n) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ formatTokenPrice(record.assets[0]?.amount || 0n, record.assets[0]?.value || 0n) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ formatValue(record.assets[0]?.value || 0n) }}</td>
                <!-- BTC Data -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatAmount(record.assets[1]?.amount || 0n) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ formatTokenPrice(record.assets[1]?.amount || 0n, record.assets[1]?.value || 0n) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ formatValue(record.assets[1]?.value || 0n) }}</td>
                <!-- Status Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    {
                      'bg-green-100 text-green-800': getStatusFromHealthFactor(record.ratio) === 'HEALTHY',
                      'bg-yellow-100 text-yellow-800': getStatusFromHealthFactor(record.ratio) === 'WARNING',
                      'bg-orange-100 text-orange-800': getStatusFromHealthFactor(record.ratio) === 'HIGH_RISK',
                      'bg-red-100 text-red-800': getStatusFromHealthFactor(record.ratio) === 'CRITICAL'
                    }
                  ]">
                    {{ getStatusFromHealthFactor(record.ratio) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ startIndex + 1 }}</span>
                to
                <span class="font-medium">{{ endIndex }}</span>
                of
                <span class="font-medium">{{ sortedHistory.length }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">First</span>
                  <ChevronDoubleLeftIcon class="h-5 w-5" />
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page.value"
                  @click="currentPage = page.value"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    currentPage === page.value
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page.value }}
                </button>
                <button
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Last</span>
                  <ChevronDoubleRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useWeb3 } from '../composables/useWeb3'
import { SolvencyProofService } from '../services/contractIntegration'
import addresses from '../config/addresses.json'
import type { ChartOptions, Scale, CoreScaleOptions, Tick } from 'chart.js'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/solid'
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi, LineData, Time, UTCTimestamp, CreatePriceLineOptions } from 'lightweight-charts'

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
        callback: function(tickValue: number | string): string {
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
        callback: function(tickValue: number | string): string {
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
} as const;

// Helper functions
const getStatusColor = (status: string): string => {
  const colors = {
    'HEALTHY': 'text-[#2da44e]',
    'WARNING': 'text-[#bf8700]',
    'HIGH_RISK': 'text-[#bc4c00]',
    'CRITICAL': 'text-[#cf222e]'
  };
  return colors[status as keyof typeof colors] || 'text-[#57606a]';
};

const formatPrice = (amount: bigint, value: bigint): string => {
  if (!amount || !value) return '0.00';
  // Precio = valor / cantidad (ambos en ETH)
  return ((Number(value) / Number(amount))).toFixed(2);
}

const formatRatio = (ratio: number | bigint): string => {
  if (!ratio) return '0.00';
  
  // Convertir BigInt a Number si es necesario
  const ratioNum = typeof ratio === 'bigint' ? Number(ratio) : ratio;
  
  // Convertir a porcentaje (ratio viene en base 10000)
  return (ratioNum / 100).toFixed(2);
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
  return new Date(timestamp * 1000).toLocaleString()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const getStatusClass = (status: string): string => {
  const classes = {
    'HEALTHY': 'text-green-500',
    'WARNING': 'text-yellow-500',
    'HIGH_RISK': 'text-orange-500',
    'CRITICAL': 'text-red-500'
  };
  return classes[status as keyof typeof classes] || 'text-gray-500';
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

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)

// Pagination computed properties
const totalPages = computed(() => Math.ceil(sortedHistory.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, sortedHistory.value.length))

const paginatedHistory = computed(() => {
  return sortedHistory.value.slice(startIndex.value, endIndex.value)
})

// Añadir interfaces para paginación
interface PaginationRange {
  value: number | string;
  isNumber: boolean;
}

// Actualizar la función displayedPages con tipos adecuados
const displayedPages = computed(() => {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: PaginationRange[] = [];
  let lastNumber: number | undefined;

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 || 
      i === totalPages.value || 
      (i >= currentPage.value - delta && i <= currentPage.value + delta)
    ) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (lastNumber) {
      if (i - lastNumber === 2) {
        rangeWithDots.push({ value: lastNumber + 1, isNumber: true });
      } else if (i - lastNumber !== 1) {
        rangeWithDots.push({ value: '...', isNumber: false });
      }
    }
    rangeWithDots.push({ value: i, isNumber: true });
    lastNumber = i;
  });

  return rangeWithDots;
});

// Añadir la función getStatusFromHealthFactor que faltaba
const getStatusFromHealthFactor = (ratio: number): string => {
  const percentage = ratio / 100;
  
  if (percentage <= 105) return 'CRITICAL';
  if (percentage <= 110) return 'HIGH_RISK';
  if (percentage <= 120) return 'WARNING';
  return 'HEALTHY';
};

// Watch for changes that should reset pagination
watch([pageSize], () => {
  currentPage.value = 1
})

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
  
  // Initialize chart
  setupChart()
  updateChartData()
  
  // Start polling every 30 seconds
  pollInterval = window.setInterval(pollLatestData, 30000)
})

// Update existing onUnmounted
onUnmounted(() => {
  // Clear polling interval
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  
  // Clean up chart resources
  if (chart.value) {
    chart.value.remove()
  }
  
  // Clear refs
  chartContainer.value = null
  healthSeries.value = null
  ethSeries.value = null
  btcSeries.value = null
})

// Chart related state
const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<IChartApi | null>(null)
const healthSeries = ref<ISeriesApi<'Line'> | null>(null)
const ethSeries = ref<ISeriesApi<'Line'> | null>(null)
const btcSeries = ref<ISeriesApi<'Line'> | null>(null)

// Time period controls
const timePeriods = [
  { label: '3H', value: 3600 * 3 },
  { label: '7H', value: 3600 * 7 },
  { label: '12H', value: 3600 * 12 },
  { label: '24H', value: 3600 * 24 },
  { label: '3D', value: 3600 * 24 * 3 },
  { label: '7D', value: 3600 * 24 * 7 }
]
const selectedPeriod = ref(3600 * 3) // Default to 3 hours

// Setup chart function
const setupChart = () => {
  if (!chartContainer.value) return

  cleanupChart()

  // Configuración del gráfico con estilo más financiero
  chart.value = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: '#ffffff' },
      textColor: '#333',
      fontSize: 12,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    grid: {
      vertLines: { color: 'rgba(42, 46, 57, 0.05)' },
      horzLines: { color: 'rgba(42, 46, 57, 0.05)' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1,
        color: 'rgba(42, 46, 57, 0.1)',
        style: 0,
        labelBackgroundColor: 'rgba(42, 46, 57, 0.8)',
      },
      horzLine: {
        width: 1,
        color: 'rgba(42, 46, 57, 0.1)',
        style: 0,
        labelBackgroundColor: 'rgba(42, 46, 57, 0.8)',
      },
    },
    leftPriceScale: {
      visible: true,
      borderColor: 'rgba(42, 46, 57, 0.1)',
      borderVisible: true,
      scaleMargins: {
        top: 0.2,
        bottom: 0.2,
      },
      ticksVisible: true,
    },
    rightPriceScale: {
      visible: true,
      borderColor: 'rgba(42, 46, 57, 0.1)',
      borderVisible: true,
      scaleMargins: {
        top: 0.2,
        bottom: 0.2,
      },
    },
    timeScale: {
      borderColor: 'rgba(42, 46, 57, 0.1)',
      timeVisible: true,
      secondsVisible: false,
      borderVisible: true,
      fixLeftEdge: true, // Mantener borde izquierdo fijo
      fixRightEdge: true, // Mantener borde derecho fijo
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);
        
        // Formato más detallado para las últimas 24 horas
        if (diffHours < 24) {
          return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
        // Formato con fecha para datos más antiguos
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
  })

  // Series del Health Factor con estilo más suave
  healthSeries.value = chart.value.addLineSeries({
    color: 'rgba(45, 164, 78, 0.8)',
    lineWidth: 2,
    title: 'Health Factor',
    priceFormat: {
      type: 'percent',
      precision: 2,
    },
    priceScaleId: 'left',
    // Agregar área bajo la curva con transparencia
    lineType: 1, // 0 = línea, 1 = área
    topColor: 'rgba(45, 164, 78, 0.2)',
    bottomColor: 'rgba(45, 164, 78, 0.0)',
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
  })

  // Líneas de umbral con estilo más sutil
  const thresholdLines = [
    {
      price: 120,
      color: 'rgba(34, 197, 94, 0.5)',
      lineWidth: 1,
      lineStyle: 1,
      axisLabelVisible: true,
      title: 'HEALTHY (120%)',
    },
    {
      price: 110,
      color: 'rgba(234, 179, 8, 0.5)',
      lineWidth: 1,
      lineStyle: 1,
      axisLabelVisible: true,
      title: 'WARNING (110%)',
    },
    {
      price: 105,
      color: 'rgba(239, 68, 68, 0.5)',
      lineWidth: 1,
      lineStyle: 1,
      axisLabelVisible: true,
      title: 'CRITICAL (105%)',
    },
  ]

  thresholdLines.forEach(line => {
    healthSeries.value?.createPriceLine(line)
  })

  // Series de precios con estilo más elegante
  ethSeries.value = chart.value.addLineSeries({
    color: 'rgba(98, 126, 234, 0.8)',
    lineWidth: 1.5,
    title: 'ETH Price',
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
    priceScaleId: 'right',
    // Agregar área bajo la curva con transparencia
    lineType: 1,
    topColor: 'rgba(98, 126, 234, 0.1)',
    bottomColor: 'rgba(98, 126, 234, 0.0)',
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
  })

  btcSeries.value = chart.value.addLineSeries({
    color: 'rgba(247, 147, 26, 0.8)',
    lineWidth: 1.5,
    title: 'BTC Price',
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
    priceScaleId: 'right',
    // Agregar área bajo la curva con transparencia
    lineType: 1,
    topColor: 'rgba(247, 147, 26, 0.1)',
    bottomColor: 'rgba(247, 147, 26, 0.0)',
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
  })

  // Leyenda con estilo más profesional
  const legendContainer = document.createElement('div')
  legendContainer.classList.add('chart-legend')
  chartContainer.value.appendChild(legendContainer)

  const updateLegend = (param: any) => {
    if (!param || !param.time || !legendContainer || !param.seriesPrices) return

    const healthPoint = param.seriesPrices?.get(healthSeries.value) ?? 0
    const ethPoint = param.seriesPrices?.get(ethSeries.value) ?? 0
    const btcPoint = param.seriesPrices?.get(btcSeries.value) ?? 0

    const getStatus = (value: number) => {
      if (value >= 120) return ['HEALTHY', 'rgba(34, 197, 94, 0.9)']
      if (value >= 110) return ['WARNING', 'rgba(234, 179, 8, 0.9)']
      if (value >= 105) return ['HIGH RISK', 'rgba(239, 68, 68, 0.9)']
      return ['CRITICAL', 'rgba(220, 38, 38, 0.9)']
    }

    const [status, color] = getStatus(healthPoint)
    const date = new Date(param.time * 1000)

    legendContainer.innerHTML = `
      <div class="flex flex-col gap-2 p-3 rounded-lg bg-white/95 shadow-sm border border-gray-100">
        <div class="text-xs text-gray-500 mb-1">
          ${date.toLocaleString()}
        </div>
        <div class="flex items-center gap-2 text-base font-medium" style="color: ${color}">
          <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
          <span>${healthPoint.toFixed(2)}% - ${status}</span>
        </div>
        <div class="text-sm text-gray-600 space-y-1 mt-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[rgba(98,126,234,0.8)]"></span>
            <span>ETH: $${Number(ethPoint).toFixed(2)}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[rgba(247,147,26,0.8)]"></span>
            <span>BTC: $${Number(btcPoint).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `
  }

  chart.value.subscribeCrosshairMove(updateLegend)

  // Resize handler
  const resizeObserver = new ResizeObserver(() => {
    if (chart.value && chartContainer.value) {
      chart.value.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight,
      })
    }
  })

  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value)
  }

  return () => {
    resizeObserver.disconnect()
    chart.value?.unsubscribeCrosshairMove(updateLegend)
  }
}

// Update chart data function
const updateChartData = () => {
  if (!healthSeries.value || !ethSeries.value || !btcSeries.value) return

  // Ordenar los datos por timestamp ascendente
  const orderedHistory = [...sortedHistory.value].sort((a, b) => a.timestamp - b.timestamp)

  try {
    // Guardar el rango visible actual
    const visibleRange = chart.value?.timeScale().getVisibleLogicalRange()
    
    // Health Factor data - Ajustar para mostrar el porcentaje correcto
    const healthData: LineData<Time>[] = orderedHistory.map(record => ({
      time: record.timestamp as UTCTimestamp,
      value: record.ratio / 100, // Convertir a porcentaje (ej: 150 -> 1.5)
    }))

    // Price data for ETH and BTC en USD
    const ethData: LineData<Time>[] = orderedHistory.map(record => {
      const ethAsset = record.assets[0]
      if (!ethAsset?.amount || !ethAsset?.value) return { 
        time: record.timestamp as UTCTimestamp,
        value: 0
      }
      return {
        time: record.timestamp as UTCTimestamp,
        value: Number(formatTokenPrice(ethAsset.amount, ethAsset.value))
      }
    })

    const btcData: LineData<Time>[] = orderedHistory.map(record => {
      const btcAsset = record.assets[1]
      if (!btcAsset?.amount || !btcAsset?.value) return {
        time: record.timestamp as UTCTTimestamp,
        value: 0
      }
      return {
        time: record.timestamp as UTCTimestamp,
        value: Number(formatTokenPrice(btcAsset.amount, btcAsset.value))
      }
    })

    // Actualizar las series con los nuevos datos
    healthSeries.value.setData(healthData)
    ethSeries.value.setData(ethData)
    btcSeries.value.setData(btcData)

    // Restaurar el rango visible si existía
    if (visibleRange && chart.value) {
      chart.value.timeScale().setVisibleLogicalRange(visibleRange)
    }

  } catch (e) {
    console.error('Error updating chart data:', e)
  }
}

// Period selection handler
const setChartPeriod = async (period: number) => {
  selectedPeriod.value = period
  const now = Math.floor(Date.now() / 1000)
  const start = now - period
  
  // Mantener el rango completo en los datos
  const extendedStart = now - (3600 * 24 * 7) // Siempre cargar hasta 7 días atrás
  startDate.value = new Date(extendedStart * 1000).toISOString().slice(0, 16)
  endDate.value = new Date(now * 1000).toISOString().slice(0, 16)
  
  await fetchHistory()
  updateChartData()
  
  // Centrar la vista en el período seleccionado
  if (chart.value) {
    const timeScale = chart.value.timeScale()
    timeScale.setVisibleLogicalRange({
      from: start,
      to: now
    })
  }
}

// Update existing onMounted
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
    
    // Asegurar que el chartContainer está listo
    await nextTick()
    setupChart()
    updateChartData()
  }
  
  // Start polling every 30 seconds
  pollInterval = window.setInterval(pollLatestData, 30000)
})

// Actualizar onUnmounted para una limpieza más completa
onUnmounted(() => {
  try {
    // Primero detener el polling
    if (pollInterval) {
      window.clearInterval(pollInterval)
      pollInterval = null
    }

    // Luego limpiar el gráfico de forma segura
    cleanupChart()

    // Limpiar las referencias
    chartContainer.value = null
  } catch (error) {
    console.warn('Unmount cleanup warning:', error)
  }
})

// Watch for history changes
watch(
  sortedHistory,
  () => {
    if (!chart.value || !healthSeries.value || !ethSeries.value || !btcSeries.value) {
      return
    }
    
    try {
      updateChartData()
    } catch (e) {
      console.error('Error in watch callback:', e)
    }
  },
  { deep: true }
)

// Agregar una función para limpiar el gráfico
const cleanupChart = () => {
  try {
    // Primero limpiar las series
    if (healthSeries.value) {
      healthSeries.value = null
    }
    if (ethSeries.value) {
      ethSeries.value = null
    }
    if (btcSeries.value) {
      btcSeries.value = null
    }

    // Luego limpiar el gráfico principal
    if (chart.value) {
      try {
        chart.value.remove()
      } catch (e) {
        console.warn('Chart removal warning:', e)
      }
      chart.value = null
    }

    // Finalmente limpiar el contenedor
    if (chartContainer.value) {
      chartContainer.value.innerHTML = ''
    }
  } catch (error) {
    console.warn('Cleanup warning:', error)
  }
}
</script>

<style>
.chart-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  pointer-events: none;
}
</style>
