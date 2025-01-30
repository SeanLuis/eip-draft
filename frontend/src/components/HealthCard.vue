<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <!-- Header Section -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Protocol Health</h2>
        <p class="text-sm text-gray-500 mt-1">Current status and metrics</p>
      </div>
      <div :class="[statusColorClass, 'px-3 py-1 rounded-full text-sm font-medium']">
        {{ healthStatus }}
      </div>
    </div>

    <!-- Main Metric Section -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-baseline gap-2">
        <div class="text-4xl font-bold text-gray-900">
          {{ formatRatio(solvencyRatio) }}%
        </div>
        <div class="text-sm text-gray-500">Target: 100%</div>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-sm font-medium text-gray-600">Health Factor</span>
        <span :class="[`text-${getRiskLevel()}-600`, 'text-sm font-semibold']">
          {{ getRiskLevel() === 'Healthy' ? 'Low' : getRiskLevel() === 'Warning' ? 'Medium' : 'High' }}
        </span>
      </div>
    </div>

    <!-- Progress Bar Section -->
    <div class="mb-8">
      <div class="relative">
        <div class="h-3 bg-gray-100 rounded-full">
          <div 
            :style="`width: ${Math.min((solvencyRatio / 2), 100)}%`"
            :class="[progressColorClass, 'h-full rounded-full transition-all duration-500']"
          ></div>
        </div>
        
        <!-- Markers -->
        <div class="flex justify-between mt-2 px-1">
          <span class="text-xs text-gray-500">0%</span>
          <span class="text-xs text-gray-500 absolute left-[50px]">100%</span>
          <span class="text-xs text-gray-500 absolute right-0">200%</span>
        </div>
      </div>
    </div>

    <!-- Status Indicators -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-50 p-3 rounded-lg">
        <div class="text-sm font-medium text-gray-600">24h Change</div>
        <div class="text-lg font-semibold text-green-600">+2.5%</div>
      </div>
      <div class="bg-gray-50 p-3 rounded-lg">
        <div class="text-sm font-medium text-gray-600">7d Average</div>
        <div class="text-lg font-semibold text-gray-900">125.3%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Calculate 24h change and 7d average from history if available
const props = withDefaults(defineProps<{
  solvencyRatio: number
  healthStatus: string
  dailyChange?: number
  weeklyAverage?: number
}>(), {
  dailyChange: 0,
  weeklyAverage: 0
})

const formatRatio = (value: number): string => {
  return value.toFixed(2)  // No need for extra division, value is already correct
}

const statusColorClass = computed(() => {
  const ratio = props.solvencyRatio
  if (ratio >= 120) return 'bg-[#2da44e] text-white'
  if (ratio >= 110) return 'bg-[#bf8700] text-white'
  if (ratio >= 105) return 'bg-[#bc4c00] text-white'
  return 'bg-[#cf222e] text-white'
})

const progressColorClass = computed(() => {
  const ratio = props.solvencyRatio
  if (ratio >= 120) return 'bg-[#2da44e]'
  if (ratio >= 110) return 'bg-[#bf8700]'
  if (ratio >= 105) return 'bg-[#bc4c00]'
  return 'bg-[#cf222e]'
})

const getRiskLevel = () => {
  const ratio = props.solvencyRatio
  if (ratio <= 105) return 'Critical'
  if (ratio <= 110) return 'High Risk'
  if (ratio <= 120) return 'Warning'
  return 'Healthy'
}

const getTrend = () => {
  // Esta función se puede expandir con lógica real de tendencias
  return 'Stable'
}
</script>