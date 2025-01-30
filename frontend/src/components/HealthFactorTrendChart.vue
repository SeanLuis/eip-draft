<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <h3 class="text-base font-semibold text-gray-900">Health Factor Trend</h3>
        <p class="text-sm text-gray-500">Protocol health factor evolution</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="h-3 w-3 bg-[#cf222e] rounded mr-1"></div>
          <span class="text-sm text-gray-600">Critical (105%)</span>
        </div>
        <div class="flex items-center">
          <div class="h-3 w-3 bg-[#bf8700] rounded mr-1"></div>
          <span class="text-sm text-gray-600">Warning (110%)</span>
        </div>
        <div class="flex items-center">
          <div class="h-3 w-3 bg-[#2da44e] rounded mr-1"></div>
          <span class="text-sm text-gray-600">Healthy (>120%)</span>
        </div>
      </div>
    </div>
    <div class="flex-grow relative min-h-0">
      <div ref="chartContainer" class="absolute inset-0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'

const props = defineProps<{
  data: Array<{
    timestamp: number;
    solvencyRatio: number;
  }>;
}>();

const chartContainer = ref<HTMLElement | null>(null)
let chart: any = null
let healthFactorSeries: any = null
let criticalLine: any = null
let warningLine: any = null
let healthyLine: any = null

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
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderColor: '#dde0e3',
      timeVisible: true,
    },
  })

  // Main health factor series
  healthFactorSeries = chart.addAreaSeries({
    lineColor: '#3b82f6',
    topColor: 'rgba(59, 130, 246, 0.4)',
    bottomColor: 'rgba(59, 130, 246, 0.0)',
    lineWidth: 2,
    priceFormat: {
      type: 'percent',
      precision: 2,
    },
    title: 'Health Factor',
  })

  // Reference lines
  criticalLine = chart.addLineSeries({
    color: '#ef4444',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
    title: 'Critical',
  })

  warningLine = chart.addLineSeries({
    color: '#f59e0b',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
    title: 'Warning',
  })

  healthyLine = chart.addLineSeries({
    color: '#10b981',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
    title: 'Healthy',
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
  if (!healthFactorSeries || !props.data) return

  const chartData = props.data.map(item => ({
    time: new Date(item.timestamp * 1000).getTime() / 1000,
    value: item.solvencyRatio
  }))

  // Set reference lines data
  const referenceData = chartData.map(item => ({
    time: item.time
  }))

  healthFactorSeries.setData(chartData)
  criticalLine.setData(referenceData.map(d => ({ ...d, value: 105 })))
  warningLine.setData(referenceData.map(d => ({ ...d, value: 110 })))
  healthyLine.setData(referenceData.map(d => ({ ...d, value: 120 })))

  chart.timeScale().fitContent()
}

watch(() => props.data, updateChartData, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.remove()
  }
})
</script>
