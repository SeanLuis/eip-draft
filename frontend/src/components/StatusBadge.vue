<template>
  <span :class="[
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    statusClass
  ]">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case 'HEALTHY':
      return 'bg-emerald-100 text-emerald-800'
    case 'WARNING':
      return 'bg-orange-100 text-orange-800'
    case 'HIGH_RISK':
      return 'bg-yellow-100 text-yellow-800'
    case 'CRITICAL':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>
