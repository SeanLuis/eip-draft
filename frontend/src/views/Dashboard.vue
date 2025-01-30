<template>
  <div class="py-6">
    <header class="mb-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Protocol Health Monitor</h1>
        <button 
          @click="refreshData" 
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="isLoading"
        >
          <svg 
            v-if="isLoading" 
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg 
            v-else
            class="-ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </div>
    </header>
    
    <main>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Stats Overview -->
        <div class="mt-8">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <HealthCard 
              class="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg"
              :solvencyRatio="protocolData.solvencyRatio"
              :healthStatus="getHealthStatus(protocolData.solvencyRatio)"
            />
            <MetricsCard 
              class="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg"
              title="Total Assets"
              subtitle="Current collateral value"
              :value="protocolData.totalAssets"
              :trend="assetTrend"
              :trendValue="assetTrendValue"
              :dailyChange="assetDailyChange"
            />
            <MetricsCard 
              class="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg"
              title="Total Liabilities"
              subtitle="Outstanding debt"
              :value="protocolData.totalLiabilities"
              :trend="liabilityTrend"
              :trendValue="liabilityTrendValue"
              :dailyChange="liabilityDailyChange"
            />
          </div>
        </div>

        <!-- Charts Section -->
        <div class="mt-8">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- ETH Price Chart -->
            <section class="rounded-lg bg-white shadow h-[400px] overflow-hidden">
              <div class="p-6 h-full">
                <ETHTrendChart :data="protocolData.history" />
              </div>
            </section>

            <!-- BTC Price Chart -->
            <section class="rounded-lg bg-white shadow h-[400px] overflow-hidden">
              <div class="p-6 h-full">
                <BTCTrendChart :data="protocolData.history" />
              </div>
            </section>
          </div>

          <!-- Health Factor Trend (Full Width) -->
          <div class="mt-8">
            <section class="rounded-lg bg-white shadow h-[400px] overflow-hidden">
              <div class="p-6 h-full">
                <HealthFactorTrendChart :data="protocolData.history" />
              </div>
            </section>
          </div>

          <!-- Risk Gauge Section -->
          <div class="mt-8">
            <section class="rounded-lg bg-white shadow h-[400px] overflow-hidden">
              <div class="p-6 h-full">
                <RiskGauge :value="protocolData.solvencyRatio" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWeb3 } from '../composables/useWeb3'
import { SolvencyProofService } from '../services/contractIntegration'
import type { HistoricalDataPoint } from '../types'

// Components
import HealthCard from '../components/HealthCard.vue'
import MetricsCard from '../components/MetricsCard.vue'
import RiskGauge from '../components/RiskGauge.vue'
import BTCTrendChart from '../components/BTCTrendChart.vue'
import ETHTrendChart from '../components/ETHTrendChart.vue'
import HealthFactorTrendChart from '../components/HealthFactorTrendChart.vue'

// Add these interfaces at the top of the script section
interface ProtocolData {
  solvencyRatio: number;
  totalAssets: number;
  totalLiabilities: number;
  history: HistoricalDataPoint[];
}

type TrendDirection = 'up' | 'down' | 'stable';

// State
const solvencyService = ref<SolvencyProofService>()
const historyData = ref<HistoricalDataPoint[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Protocol Data
const protocolData = ref<ProtocolData>({
  solvencyRatio: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  history: []
})

// Computed Properties
const assetTrend = computed((): TrendDirection => {
  const history = protocolData.value.history
  if (history.length < 2) return 'stable'
  return history[history.length - 1].totalAssets > history[history.length - 2].totalAssets ? 'up' : 'down'
})

const assetTrendValue = computed(() => {
  const history = protocolData.value.history
  if (history.length < 2) return 0
  const current = history[history.length - 1].totalAssets
  const previous = history[history.length - 2].totalAssets
  return ((current - previous) / previous) * 100
})

const liabilityTrend = computed((): TrendDirection => {
  const history = protocolData.value.history
  if (history.length < 2) return 'stable'
  return history[history.length - 1].totalLiabilities > history[history.length - 2].totalLiabilities ? 'up' : 'down'
})

const liabilityTrendValue = computed(() => {
  const history = protocolData.value.history
  if (history.length < 2) return 0
  const current = history[history.length - 1].totalLiabilities
  const previous = history[history.length - 2].totalLiabilities
  return ((current - previous) / previous) * 100
})

// Add daily change computations
const assetDailyChange = computed(() => {
  const history = protocolData.value.history
  if (history.length < 2) return 0
  const current = history[history.length - 1].totalAssets
  const dayOld = history[0].totalAssets
  return ((current - dayOld) / dayOld) * 100
})

const liabilityDailyChange = computed(() => {
  const history = protocolData.value.history
  if (history.length < 2) return 0
  const current = history[history.length - 1].totalLiabilities
  const dayOld = history[0].totalLiabilities
  return ((current - dayOld) / dayOld) * 100
})

// Helper Functions
const getHealthStatus = (ratio: number): string => {
  if (ratio <= 105) return 'CRITICAL'
  if (ratio <= 110) return 'HIGH_RISK'
  if (ratio <= 120) return 'WARNING'
  return 'HEALTHY'
}

const fetchProtocolData = async () => {
  if (!solvencyService.value) return
  
  try {
    isLoading.value = true
    
    const now = Math.floor(Date.now() / 1000)
    const dayAgo = now - 86400
    const { history } = await solvencyService.value.getSolvencyHistory(dayAgo, now)
    
    if (history && history.length > 0) {
      console.log('Received history:', history) // Debug log
      
      const latest = history[history.length - 1]
      const previous = history.length > 1 ? history[history.length - 2] : null

      // Calcular assets y actualizar datos
      const totalAssets = latest.assets.reduce((sum: number, asset: { value: any }) => {
        const assetValue = Number(asset.value) / 1e18
        console.log('Asset value:', assetValue) // Debug log
        return sum + assetValue
      }, 0)

      const ratio = latest.ratio / 100
      const totalLiabilities = totalAssets / (ratio / 100)

      protocolData.value = {
        solvencyRatio: ratio,
        totalAssets,
        totalLiabilities,
        history: history.map((entry: { assets: any[]; ratio: number; timestamp: any }) => {
          const assets = entry.assets.reduce((sum: number, asset: { value: any }) => 
            sum + Number(asset.value) / 1e18, 0)
          const entryRatio = entry.ratio / 100
          
          // Debug log para cada entrada
          console.log('Processing entry:', {
            timestamp: entry.timestamp,
            ratio: entryRatio,
            assets,
            ethPrice: Number(entry.assets[0]?.value || 0) / Number(entry.assets[0]?.amount || 1),
            btcPrice: Number(entry.assets[1]?.value || 0) / Number(entry.assets[1]?.amount || 1)
          })

          return {
            timestamp: entry.timestamp,
            solvencyRatio: entryRatio,
            totalAssets: assets,
            totalLiabilities: assets / (entryRatio / 100),
            status: getHealthStatus(entryRatio),
            ethPrice: Number(entry.assets[0]?.value || 0) / Number(entry.assets[0]?.amount || 1),
            btcPrice: Number(entry.assets[1]?.value || 0) / Number(entry.assets[1]?.amount || 1)
          }
        })
      }
    }
  } catch (e) {
    console.error('Error fetching protocol data:', e)
  } finally {
    isLoading.value = false
  }
}

// Polling
let pollInterval: number | null = null

onMounted(async () => {
  const { publicClient, walletClient, connect } = useWeb3()
  await connect('oracle')
  
  if (publicClient.value && walletClient.value) {
    solvencyService.value = new SolvencyProofService()
    await solvencyService.value.initialize(publicClient.value, walletClient.value)
    await fetchProtocolData()
    
    // Iniciar polling cada 30 segundos
    pollInterval = window.setInterval(async () => {
      if (!isLoading.value) {
        await fetchProtocolData()
      }
    }, 30000)
  }
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

const refreshData = async () => {
  if (isLoading.value) return
  try {
    await fetchProtocolData()
  } catch (e) {
    console.error('Error refreshing data:', e)
  }
}
</script>
