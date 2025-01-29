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
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'

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

const timePeriods = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: 'ALL', value: 'ALL' }
]

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
      vertLine: {
        width: 1,
        color: '#2962FF',
        style: LineStyle.Dashed,
      },
      horzLine: {
        width: 1,
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
    },
    timeScale: {
      borderColor: '#dde0e3',
      timeVisible: true,
      secondsVisible: false,
    },
  })

  mainSeries = chart.addAreaSeries({
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.3)',
    bottomColor: 'rgba(41, 98, 255, 0.0)',
    lineWidth: 2,
    priceFormat: {
      type: 'percent',
    },
  })

  // Agregar líneas de referencia
  const criticalLine = chart.addLineSeries({
    color: '#ef4444',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
  })

  const warningLine = chart.addLineSeries({
    color: '#f59e0b',
    lineWidth: 1,
    lineStyle: LineStyle.Dashed,
  })

  criticalLine.setData(props.data.map(d => ({
    time: d.timestamp,
    value: 120, // Línea crítica en 120%
  })))

  warningLine.setData(props.data.map(d => ({
    time: d.timestamp,
    value: 150, // Línea de advertencia en 150%
  })))

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
  if (!mainSeries) return

  const formattedData = props.data.map(item => ({
    time: new Date(item.timestamp).getTime() / 1000,
    value: item.solvencyRatio / 100,
  }))

  mainSeries.setData(formattedData)
  chart.timeScale().fitContent()
}

watch(() => props.data, updateChartData, { deep: true })
watch(selectedPeriod, (newPeriod) => {
  // Aquí puedes implementar la lógica para filtrar los datos según el período seleccionado
  // Por ahora solo actualizamos los datos completos
  updateChartData()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.remove()
  }
})
</script>
