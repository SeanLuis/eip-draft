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
            +{{ trendValue }}%
          </span>
          <span v-else-if="trend === 'down'" class="flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            -{{ trendValue }}%
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
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  subtitle?: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendValue?: number;
  dailyChange?: number;
  weeklyAverage?: number;
}>();

const formatValue = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact'
  }).format(value);
};

const formatPercentage = (value?: number): string => {
  if (!value) return '0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const trendColorClass = computed(() => ({
  'up': 'text-green-500',
  'down': 'text-red-500',
  'stable': 'text-gray-500'
}[props.trend]));

const dailyChangeColor = computed(() => {
  if (!props.dailyChange) return 'text-gray-900';
  return props.dailyChange > 0 ? 'text-green-600' : props.dailyChange < 0 ? 'text-red-600' : 'text-gray-900';
});
</script>
