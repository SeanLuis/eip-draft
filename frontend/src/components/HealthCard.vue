
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">Protocol Health</h2>
    <div class="flex items-center justify-between">
      <div :class="statusColorClass">
        {{ healthStatus }}
      </div>
      <div class="text-2xl font-bold">
        {{ formatRatio(solvencyRatio) }}%
      </div>
    </div>
    <!-- Risk Level Indicator -->
    <div class="mt-4">
      <div class="h-2 bg-gray-200 rounded-full">
        <div 
          :class="progressColorClass"
          :style="`width: ${Math.min(solvencyRatio, 200)}%`"
          class="h-full rounded-full transition-all duration-500"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  solvencyRatio: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
}>();

const statusColorClass = computed(() => ({
  'HEALTHY': 'text-green-500',
  'WARNING': 'text-yellow-500',
  'HIGH_RISK': 'text-orange-500',
  'CRITICAL': 'text-red-500'
}[props.healthStatus]));

const progressColorClass = computed(() => ({
  'HEALTHY': 'bg-green-500',
  'WARNING': 'bg-yellow-500',
  'HIGH_RISK': 'bg-orange-500',
  'CRITICAL': 'bg-red-500'
}[props.healthStatus]));
</script>