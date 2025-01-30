<template>
  <div class="py-6">
    <header class="mb-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Protocol Health Monitor</h1>
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-1">
            <section class="rounded-lg bg-white shadow">
              <div class="p-6">
                <div class="mt-2 h-80">
                  <RiskGauge :value="protocolData.solvencyRatio" />
                </div>
              </div>
            </section>

            <section class="rounded-lg bg-white shadow">
              <div class="p-6">
                <h3 class="text-base font-semibold leading-6 text-gray-900">Solvency Trend</h3>
                <div class="mt-2 h-80">
                  <HistoryChart :data="protocolData.history" />
                </div>
              </div>
            </section>

            <section class="rounded-lg bg-white shadow">
              <div class="p-6">
                <div class="h-80">
                  <SolvencyTrend :data="protocolData.history" />
                </div>
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
import addresses from '../config/addresses.json'

// Components
import HealthCard from '../components/HealthCard.vue'
import MetricsCard from '../components/MetricsCard.vue'
import RiskGauge from '../components/RiskGauge.vue'
import HistoryChart from '../components/HistoryChart.vue'
import SolvencyTrend from '../components/SolvencyTrend.vue'

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
      const latest = history[history.length - 1]
      const previous = history.length > 1 ? history[history.length - 2] : null

      // Calculate total assets from ETH and BTC positions
      const totalAssets = latest.assets.reduce((sum: number, asset: { value: any }) => {
        return sum + (Number(asset.value) / 1e18)
      }, 0)

      // Calculate liabilities based on health factor
      const totalLiabilities = totalAssets / (latest.ratio / 10000)

      // Calculate daily changes
      const prevTotal = previous ? previous.assets.reduce((sum: number, asset: { value: any }) => sum + Number(asset.value) / 1e18, 0) : totalAssets
      const assetChange = ((totalAssets - prevTotal) / prevTotal) * 100

      protocolData.value = {
        solvencyRatio: latest.ratio / 100,  // Convert from 11272 to 112.72
        totalAssets,
        totalLiabilities,
        history: history.map((entry: { assets: any[]; ratio: number; timestamp: any }) => {
          const assets = entry.assets.reduce((sum: number, asset: { value: any }) => sum + Number(asset.value) / 1e18, 0)
          const ratio = entry.ratio / 100
          return {
            timestamp: entry.timestamp,
            solvencyRatio: ratio,
            totalAssets: assets,
            totalLiabilities: assets / (ratio / 100),
            status: getHealthStatus(ratio),
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
    
    // Poll every 30 seconds
    pollInterval = window.setInterval(fetchProtocolData, 30000)
  }
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>
