<template>
  <div class="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden">
    <!-- Header Section -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h3 class="text-base font-semibold text-gray-900">Solvency Ratio</h3>
            <div :class="[
              getRiskClass(),
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
            ]">
              {{ getRiskLabel() }}
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500">Protocol health assessment</p>
        </div>
        <!-- Current Value Display -->
        <div class="text-right">
          <div class="text-2xl font-mono font-bold tracking-tight" :class="getTextColorClass()">
            {{ value.toFixed(1) }}%
          </div>
          <div class="text-xs text-gray-500 mt-0.5">Current Ratio</div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <div class="space-y-6">
        <div class="relative">
          <!-- Background Segments - Adjusted widths -->
          <div class="relative h-3 flex rounded-full overflow-hidden">
            <!-- Critical: 100-105% (5% range) -->
            <div class="w-[5%] bg-red-500/90 border-r border-white/10"></div>
            <!-- High Risk: 105-110% (5% range) -->
            <div class="w-[5%] bg-yellow-500/90 border-r border-white/10"></div>
            <!-- Warning: 110-120% (10% range) -->
            <div class="w-[10%] bg-orange-500/90 border-r border-white/10"></div>
            <!-- Healthy: 120-200% (80% range) -->
            <div class="flex-1 bg-emerald-500/90"></div>
          </div>

          <!-- Adjusted Label Positions -->
          <div class="absolute -top-5 left-0 right-0">
            <div class="relative w-full flex justify-between px-1">
              <span class="text-[10px] font-mono text-gray-600">100%</span>
              <span class="text-[10px] font-mono text-red-600 absolute left-[5%] -translate-x-1/2">105%</span>
              <span class="text-[10px] font-mono text-yellow-600 absolute left-[10%] -translate-x-1/2">110%</span>
              <span class="text-[10px] font-mono text-orange-600 absolute left-[20%] -translate-x-1/2">120%</span>
              <span class="text-[10px] font-mono text-emerald-600">200%</span>
            </div>
          </div>

          <!-- Status Labels - Adjusted -->
          <div class="absolute -bottom-5 left-0 right-0">
            <div class="relative w-full flex">
              <span class="text-[10px] font-medium text-red-700 absolute left-[2.5%] -translate-x-1/2">Critical</span>
              <span class="text-[10px] font-medium text-yellow-700 absolute left-[7.5%] -translate-x-1/2">High Risk</span>
              <span class="text-[10px] font-medium text-orange-700 absolute left-[15%] -translate-x-1/2">Warning</span>
              <span class="text-[10px] font-medium text-emerald-700 absolute right-0">Healthy</span>
            </div>
          </div>
          
          <!-- Progress Indicator -->
          <div 
            class="absolute top-0 h-3 w-1.5 bg-white border border-gray-300 rounded-full transition-all duration-500 shadow-md"
            :style="{
              left: `calc(${getProgressPosition()}% - 3px)`,
              zIndex: 10
            }"
          ></div>
        </div>

        <!-- Current Status -->
        <div class="text-center">
          <div class="text-sm font-medium" :class="getTextColorClass()">
            {{ getRiskLabel() }} - {{ value.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
}>()

const thresholds = [
  { 
    label: 'Critical Zone (≤105%)',
    value: 105,
    barClass: 'bg-red-500',
    textClass: 'text-red-700',
    range: [100, 105]
  },
  { 
    label: 'High Risk Zone (≤110%)',
    value: 110,
    barClass: 'bg-yellow-500',
    textClass: 'text-yellow-700',
    range: [105, 110]
  },
  { 
    label: 'Warning Zone (≤120%)',
    value: 120,
    barClass: 'bg-orange-500',
    textClass: 'text-orange-700',
    range: [110, 120]
  },
  { 
    label: 'Healthy Zone (>120%)',
    value: 200,
    barClass: 'bg-green-500',
    textClass: 'text-green-700',
    range: [120, 200]
  }
]

const isActive = (thresholdValue: number) => {
  return props.value <= thresholdValue
}

const getProgressForThreshold = (thresholdValue: number) => {
  const threshold = thresholds.find(t => t.value === thresholdValue)
  if (!threshold) return 0
  
  const [min, max] = threshold.range
  if (props.value < min) return 0
  if (props.value > max) return 100
  
  return Math.round(((props.value - min) / (max - min)) * 100)
}

// Remove unused gauge methods and keep only the necessary color helpers
const getTextColorClass = () => {
  if (props.value <= 105) return 'text-red-600'
  if (props.value <= 110) return 'text-yellow-600'
  if (props.value <= 120) return 'text-orange-600'
  return 'text-emerald-600'
}

const getRiskLabel = () => {
  if (props.value <= 105) return 'Critical'
  if (props.value <= 110) return 'High Risk'
  if (props.value <= 120) return 'Warning'
  return 'Healthy'
}

const getRiskClass = () => {
  if (props.value <= 105) return 'bg-red-100 text-red-800'
  if (props.value <= 110) return 'bg-yellow-100 text-yellow-800'
  if (props.value <= 120) return 'bg-orange-100 text-orange-800'
  return 'bg-emerald-100 text-emerald-800'
}

// Calcula la posición del indicador en la barra
const getProgressPosition = () => {
  const minValue = 100
  const maxValue = 200
  const normalizedValue = Math.min(Math.max(props.value, minValue), maxValue)
  return ((normalizedValue - minValue) / (maxValue - minValue)) * 100
}
</script>
