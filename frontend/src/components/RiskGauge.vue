<template>
  <div class="bg-white rounded-lg">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Risk Analytics</h3>
        <p class="text-sm text-gray-500 mt-1">Real-time risk assessment</p>
      </div>
      <div :class="[getRiskClass(), 'px-3 py-1 rounded-full text-sm font-medium']">
        {{ getRiskLabel() }}
      </div>
    </div>

    <!-- Gauge Container -->
    <div class="relative h-[180px] flex items-center justify-center mb-4">
      <svg class="w-full h-full" viewBox="-10 -10 220 220">
        <!-- Background Track -->
        <path
          d="M 0,100 A 100,100 0 0,1 200,100"
          class="stroke-gray-200"
          fill="none"
          stroke-width="20"
          stroke-linecap="round"
        />
        
        <!-- Colored Track -->
        <path
          :d="gaugeArc"
          :class="gaugeColor"
          fill="none"
          stroke-width="20"
          stroke-linecap="round"
        />

        <!-- Value Label -->
        <text
          x="100"
          y="120"
          text-anchor="middle"
          class="text-3xl font-bold"
          :fill="getTextColor()"
        >
          {{ value.toFixed(1) }}%
        </text>
        
        <!-- Min/Max Labels -->
        <text x="0" y="140" class="text-sm" fill="#6B7280">100%</text>
        <text x="180" y="140" class="text-sm" fill="#6B7280">200%</text>
      </svg>
    </div>

    <!-- Risk Indicators - Fixed height and scroll if needed -->
    <div class="grid grid-cols-3 gap-2 overflow-x-auto">
      <div v-for="(threshold, index) in thresholds" :key="index"
        class="text-center p-2 rounded-lg min-w-[100px]"
        :class="value >= threshold.value ? threshold.activeClass : 'bg-gray-50'"
      >
        <div class="text-xs" :class="value >= threshold.value ? 'text-white' : 'text-gray-500'">
          {{ threshold.label }}
        </div>
        <div class="font-semibold text-sm" :class="value >= threshold.value ? 'text-white' : 'text-gray-700'">
          {{ threshold.value }}%
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
  { label: 'Critical', value: 120, activeClass: 'bg-red-500' },
  { label: 'High Risk', value: 180, activeClass: 'bg-orange-500' },
  { label: 'Extreme', value: 200, activeClass: 'bg-purple-500' }
]

const gaugeArc = computed(() => {
  const normalizedValue = Math.min(Math.max(props.value - 100, 0), 100) / 100
  const x = 100 - 100 * Math.cos(normalizedValue * Math.PI)
  const y = 100 - 100 * Math.sin(normalizedValue * Math.PI)
  return `M 0,100 A 100,100 0 0,1 ${x},${y}`
})

// Update gauge colors to match test scenarios
const gaugeColor = computed(() => {
  if (props.value <= 120) return 'stroke-green-500'
  if (props.value <= 180) return 'stroke-orange-500'
  if (props.value <= 200) return 'stroke-red-500'
  return 'stroke-purple-500'
})

const getRiskLabel = () => {
  if (props.value <= 110) return 'Low Risk'
  if (props.value <= 150) return 'Medium Risk'
  return 'High Risk'
}

const getRiskClass = () => {
  if (props.value <= 110) return 'bg-green-100 text-green-800'
  if (props.value <= 150) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getTextColor = () => {
  if (props.value <= 110) return '#22c55e'
  if (props.value <= 150) return '#eab308'
  return '#ef4444'
}
</script>
