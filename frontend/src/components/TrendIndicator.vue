
<template>
  <div :class="[
    'inline-flex items-center gap-1 font-medium',
    colorClass
  ]">
    <component :is="icon" class="w-4 h-4" />
    <span v-if="showValue">
      {{ formatChange(value) }}
    </span>
    <span v-if="timeframe" class="text-gray-500 font-normal">
      {{ timeframe }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

interface Props {
  value?: number
  showValue?: boolean
  timeframe?: string
}

const props = defineProps<Props>()

const icon = computed(() => {
  if (!props.value || props.value === 0) {
    return NeutralIcon
  }
  return props.value > 0 ? IncreaseIcon : DecreaseIcon
})

const colorClass = computed(() => {
  if (!props.value || props.value === 0) return 'text-gray-600'
  return props.value > 0 ? 'text-[#2da44e]' : 'text-[#cf222e]'
})

const formatChange = (value?: number): string => {
  if (!value) return '0%'
  const formatted = Math.abs(value).toFixed(2)
  return `${value > 0 ? '+' : '-'}${formatted}%`
}

// Icons como componentes funcionales
const IncreaseIcon = () => h('svg', {
  viewBox: '0 0 16 16',
  fill: 'currentColor',
  class: 'transform rotate-0',
}, [
  h('path', {
    d: 'M8.533.133a1 1 0 0 0-1.066 0L.934 4.798a1 1 0 0 0 1.066 1.733L8 2.445l6 4.086a1 1 0 0 0 1.066-1.733L8.533.133z'
  })
])

const DecreaseIcon = () => h('svg', {
  viewBox: '0 0 16 16',
  fill: 'currentColor',
  class: 'transform rotate-180',
}, [
  h('path', {
    d: 'M8.533.133a1 1 0 0 0-1.066 0L.934 4.798a1 1 0 0 0 1.066 1.733L8 2.445l6 4.086a1 1 0 0 0 1.066-1.733L8.533.133z'
  })
])

const NeutralIcon = () => h('svg', {
  viewBox: '0 0 16 16',
  fill: 'currentColor',
}, [
  h('path', {
    d: 'M8 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'
  })
])
</script>