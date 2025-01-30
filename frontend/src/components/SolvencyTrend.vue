<template>
  <div class="h-full">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-base font-semibold text-gray-900">Solvency Trend</h3>
        <p class="text-sm text-gray-500">Protocol health over time</p>
      </div>
      <div class="flex gap-2">
        <button 
          v-for="period in timePeriods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'px-2 py-1 text-sm rounded',
            selectedPeriod === period.value 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    <div ref="chartContainer" class="h-[calc(100%-2rem)]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createChart, CrosshairMode, LineStyle, type ChartOptions, type DeepPartial } from 'lightweight-charts'

const props = defineProps<{
  data: Array<{
    timestamp: number;
    solvencyRatio: number;
  }>;
}>();

const chartContainer = ref<HTMLElement | null>(null)
const selectedPeriod = ref('1D')
let chart: any = null
let mainSeries: any = null
let criticalLine: any = null
let warningLine: any = null

const timePeriods = [
  { label: '1D', value: '1D', hours: 24 },
  { label: '1W', value: '1W', hours: 168 },
  { label: '1M', value: '1M', hours: 720 },
  { label: 'ALL', value: 'ALL', hours: -1 }
] as const

// Add filterDataByPeriod function
const filterDataByPeriod = (period: string) => {
  if (!props.data.length) return []
  
  const now = Date.now() / 1000
  const periodHours = timePeriods.find(p => p.value === period)?.hours || 24
  
  if (periodHours === -1) return props.data // ALL period
  
  const cutoff = now - (periodHours * 3600)
  return props.data.filter(item => item.timestamp >= cutoff)
}

// Update chart configuration with proper types
const chartConfig: DeepPartial<ChartOptions> = {
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
    vertLine: {
      width: 1 as const,
      color: '#2962FF',
      style: LineStyle.Dashed,
    },
    horzLine: {
      width: 1 as const,
      color: '#2962FF',
      style: LineStyle.Dashed,
    },
  },
  rightPriceScale: {
    borderColor: '#dde0e3',
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
    mode: 1, // Percentage mode
    borderVisible: true,
  },
  timeScale: {
    borderColor: '#dde0e3',
    timeVisible: true,
    secondsVisible: false,
  },
}

// Update updateChartData function
const updateChartData = () => {
  if (!mainSeries || !chart) return

  const filteredData = filterDataByPeriod(selectedPeriod.value)
  const formattedData = filteredData.map(item => ({
    time: item.timestamp,
    value: item.solvencyRatio / 100,  // Fix ratio scaling
  }))

  mainSeries.setData(formattedData)

  // Remove existing lines if they exist
  if (criticalLine) chart.removeSeries(criticalLine)
  if (warningLine) chart.removeSeries(warningLine)

  // Create new reference lines
  criticalLine = chart.addLineSeries({
    color: '#cf222e',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
  })

  warningLine = chart.addLineSeries({
    color: '#bf8700',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
  })

  const referenceData = filteredData.map(d => ({
    time: d.timestamp,
  }))

  criticalLine.setData(referenceData.map(d => ({ ...d, value: 120 })))
  warningLine.setData(referenceData.map(d => ({ ...d, value: 110 })))

  chart.timeScale().fitContent()
}

// Update onMounted to use the proper type
onMounted(() => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, chartConfig)

  mainSeries = chart.addAreaSeries({
    lineColor: '#2da44e',
    topColor: 'rgba(45, 164, 78, 0.3)',
    bottomColor: 'rgba(45, 164, 78, 0.0)',
    lineWidth: 2,
    priceFormat: {
      type: 'percent',
      precision: 2,
    },
  })

  updateChartData()
  
  const resizeObserver = new ResizeObserver(() => {
    if (chartContainer.value && chart) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight,
      })
    }
  })

  resizeObserver.observe(chartContainer.value)
})

watch(() => props.data, updateChartData, { deep: true })
watch(selectedPeriod, (newPeriod) => {
  updateChartData()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.remove()
  }
})
</script>
