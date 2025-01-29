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
              :healthStatus="protocolData.healthStatus"
            />
            <MetricsCard 
              class="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg"
              title="Total Assets"
              subtitle="Current collateral value"
              :value="protocolData.totalAssets"
              :trend="protocolData.assetsTrend"
              :trendValue="5"
              :dailyChange="2.5"
              :weeklyAverage="980000"
            />
            <MetricsCard 
              class="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg"
              title="Total Liabilities"
              subtitle="Outstanding debt"
              :value="protocolData.totalLiabilities"
              :trend="protocolData.liabilitiesTrend"
              :trendValue="2"
              :dailyChange="-1.2"
              :weeklyAverage="790000"
            />
          </div>
        </div>

        <!-- Charts Section -->
        <div class="mt-8">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-1">
            <section class="rounded-lg bg-white shadow">
              <div class="p-6">
                <h3 class="text-base font-semibold leading-6 text-gray-900">Risk Analysis</h3>
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
import { ref, onMounted } from 'vue'
import HealthCard from '../components/HealthCard.vue'
import MetricsCard from '../components/MetricsCard.vue'
import RiskGauge from '../components/RiskGauge.vue'
import HistoryChart from '../components/HistoryChart.vue'
import SolvencyTrend from '../components/SolvencyTrend.vue'
import { generateMarketCrashData, generateVolatilityData } from '../services/mockData'

const protocolData = ref({
  solvencyRatio: 3, // From market crash test
  healthStatus: 'CRITICAL',
  totalAssets: 6500000,
  totalLiabilities: 5000000,
  history: generateVolatilityData()
})

onMounted(async () => {
  // Here we would fetch real data from our contract
  // await fetchProtocolData()
})
</script>
