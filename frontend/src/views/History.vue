<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6">Historical Data</h2>
      
      <!-- Date Range Selector -->
      <div class="mb-6 flex gap-4">
        <input type="date" v-model="startDate" class="rounded border p-2" />
        <input type="date" v-model="endDate" class="rounded border p-2" />
        <button @click="fetchHistory" class="bg-blue-500 text-white px-4 py-2 rounded">
          Update
        </button>
      </div>

      <!-- Historical Chart -->
      <div class="h-96 mb-6">
        <HistoryChart :data="historyData" />
      </div>

      <!-- Historical Records Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Solvency Ratio</th>
              <th>Total Assets</th>
              <th>Total Liabilities</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in historyData" :key="record.timestamp">
              <td>{{ formatDate(record.timestamp) }}</td>
              <td>{{ formatRatio(record.solvencyRatio) }}%</td>
              <td>{{ formatCurrency(record.totalAssets) }}</td>
              <td>{{ formatCurrency(record.totalLiabilities) }}</td>
              <td>
                <span :class="getStatusClass(record.status)">
                  {{ record.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HistoryChart from '../components/HistoryChart.vue'

const startDate = ref('')
const endDate = ref('')
const historyData = ref([])

const fetchHistory = async () => {
  // Here we would fetch historical data from our contract
  // const data = await contract.getSolvencyHistory(startDate.value, endDate.value)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

const formatRatio = (ratio: number) => {
  return (ratio / 100).toFixed(2)
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
</script>
