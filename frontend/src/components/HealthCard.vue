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
          {{ getRiskLevel() === 'green' ? 'Low' : getRiskLevel() === 'yellow' ? 'Medium' : 'High' }}
        </span>
      </div>
    </div>

    <!-- Progress Bar Section -->
    <div class="mb-8">
      <div class="relative">
        <div class="h-3 bg-gray-100 rounded-full">
          <div 
            :style="`width: ${Math.min(solvencyRatio, 200)}%`"
            :class="[progressColorClass, 'h-full rounded-full transition-all duration-500']"
          ></div>
        </div>
        
        <!-- Markers -->
        <div class="flex justify-between mt-2 px-1">
          <span class="text-xs text-gray-500">0%</span>
          <span class="text-xs text-gray-500 absolute left-[97px]">100%</span>
          <span class="text-xs text-gray-500 absolute left-[147px]">150%</span>
          <span class="text-xs text-gray-500 absolute right-0">200%</span>
        </div>
        
        <!-- Marker Lines -->
        <div class="absolute top-0 left-[100px] w-px h-2 bg-gray-400"></div>
        <div class="absolute top-0 left-[150px] w-px h-2 bg-gray-400"></div>
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

interface Props {
  solvencyRatio: number
  healthStatus: string
}

const props = defineProps<Props>()

const formatRatio = (value: number): string => value.toFixed(2)

const statusColorClass = computed(() => ({
  'HEALTHY': 'bg-green-100 text-green-800',
  'WARNING': 'bg-yellow-100 text-yellow-800',
  'HIGH_RISK': 'bg-orange-100 text-orange-800',
  'CRITICAL': 'bg-red-100 text-red-800'
}[props.healthStatus]))

const progressColorClass = computed(() => ({
  'HEALTHY': 'bg-green-500',
  'WARNING': 'bg-yellow-500',
  'HIGH_RISK': 'bg-orange-500',
  'CRITICAL': 'bg-red-500'
}[props.healthStatus]))

const getRiskLevel = () => {
  if (props.solvencyRatio <= 110) return 'green'
  if (props.solvencyRatio <= 150) return 'yellow'
  return 'red'
}

const getTrend = () => {
  // Esta función se puede expandir con lógica real de tendencias
  return 'Stable'
}
</script>