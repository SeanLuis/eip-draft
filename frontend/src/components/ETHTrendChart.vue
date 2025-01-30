<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <h3 class="text-base font-semibold text-gray-900">ETH Price Trend</h3>
        <p class="text-sm text-gray-500">Ethereum price history</p>
      </div>
    </div>
    <div class="flex-grow relative min-h-0">
      <div ref="chartContainer" class="absolute inset-0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createChart, CrosshairMode } from 'lightweight-charts'

const props = defineProps<{
  data: Array<{
    timestamp: number;
    ethPrice: number;
  }>;
}>();

const chartContainer = ref<HTMLElement | null>(null)
let chart: any = null
let priceSeries: any = null

onMounted(() => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: '#ffffff' },
      textColor: '#333',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
    },
    rightPriceScale: {
      borderColor: '#dde0e3',
    },
    timeScale: {
      borderColor: '#dde0e3',
      timeVisible: true,
    },
  })

  priceSeries = chart.addLineSeries({
    color: '#3b82f6', // Green color for ETH
    lineWidth: 2,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
    title: 'ETH Price',
  })

  updateChartData()
  
  const resizeObserver = new ResizeObserver(() => {
    if (chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight,
      })
    }
  })

  resizeObserver.observe(chartContainer.value)
})

const updateChartData = () => {
  if (!priceSeries || !props.data) return

  const chartData = props.data
    .filter(item => item.ethPrice > 0) // Filter out invalid prices
    .map(item => ({
      time: new Date(item.timestamp * 1000).getTime() / 1000,
      value: item.ethPrice
    }))

  console.log('ETH Chart Data:', chartData)
  priceSeries.setData(chartData)
  chart.timeScale().fitContent()
}

watch(() => props.data, updateChartData, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.remove()
  }
})
</script>
