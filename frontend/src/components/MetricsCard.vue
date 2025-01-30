<template>
  <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
    </div>

    <div class="flex-grow">
      <div class="flex justify-between items-baseline mb-4">
        <div class="text-3xl font-bold text-gray-900">
          {{ formatValue(value) }}
        </div>
        <div :class="[trendColorClass, 'flex items-center gap-1']">
          <span v-if="trend === 'up'" class="flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            {{ formatValue(trendValue) }}%
          </span>
          <span v-else-if="trend === 'down'" class="flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            {{ formatValue(trendValue) }}%
          </span>
          <span v-else class="flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
            </svg>
            Stable
          </span>
        </div>
      </div>

      <!-- Additional Metrics -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-sm text-gray-500">24h Change</div>
          <div class="font-semibold" :class="dailyChangeColor">
            {{ formatPercentage(dailyChange) }}
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-sm text-gray-500">7d Average</div>
          <div class="font-semibold text-gray-900">
            {{ formatValue(weeklyAverage) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendValue?: number;
  dailyChange?: number;
  weeklyAverage?: number;
}

import { computed } from 'vue';

const formatValue = (value?: number): string => {
  if (!value) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatPercentage = (value?: number): string => {
  if (!value || isNaN(value)) return '0%'
  const fixedValue = value.toFixed(2)
  return `${value > 0 ? '+' : ''}${fixedValue}%`
}

const props = defineProps<Props>();

const trendColorClass = computed(() => {
  const colors = {
    'up': 'text-[#2da44e]',
    'down': 'text-[#cf222e]',
    'stable': 'text-[#57606a]'
  } as const;
  return colors[props.trend];
});

const dailyChangeColor = computed(() => {
  if (!props.dailyChange) return 'text-[#57606a]';
  return props.dailyChange > 0 ? 'text-[#2da44e]' : props.dailyChange < 0 ? 'text-[#cf222e]' : 'text-[#57606a]';
});
</script>
