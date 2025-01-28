<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Protocol Health Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <HealthCard 
        :solvencyRatio="protocolData.solvencyRatio"
        :healthStatus="protocolData.healthStatus"
      />
      <MetricsCard 
        title="Total Assets"
        :value="protocolData.totalAssets"
        :trend="protocolData.assetsTrend"
      />
      <MetricsCard 
        title="Total Liabilities"
        :value="protocolData.totalLiabilities"
        :trend="protocolData.liabilitiesTrend"
      />
    </div>

    <!-- Risk Monitoring -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RiskGauge :value="protocolData.solvencyRatio" />
      <HistoryChart :data="protocolData.history" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HealthCard from '../components/HealthCard.vue'
import MetricsCard from '../components/MetricsCard.vue'
import RiskGauge from '../components/RiskGauge.vue'
import HistoryChart from '../components/HistoryChart.vue'

const protocolData = ref({
  solvencyRatio: 120,
  healthStatus: 'HEALTHY',
  totalAssets: 1000000,
  totalLiabilities: 800000,
  assetsTrend: 'up',
  liabilitiesTrend: 'stable',
  history: []
})

onMounted(async () => {
  // Here we would fetch real data from our contract
  // await fetchProtocolData()
})
</script>
