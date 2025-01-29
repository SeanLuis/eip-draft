<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'

const props = defineProps<{
  data: Array<{
    timestamp: number;
    solvencyRatio: number;
    ethPrice: number;
    btcPrice: number;
  }>;
}>();

const chartContainer = ref<HTMLElement | null>(null)
let chart: any = null
let solvencyRatioSeries: any = null
let ethPriceSeries: any = null

onMounted(() => {
  if (!chartContainer.value) return

  // Crear el gráfico
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

  // Serie para Solvency Ratio
  solvencyRatioSeries = chart.addAreaSeries({
    lineColor: '#3b82f6',
    topColor: 'rgba(59, 130, 246, 0.4)',
    bottomColor: 'rgba(59, 130, 246, 0.0)',
    lineWidth: 2,
    priceFormat: {
      type: 'percent',
    },
    title: 'Solvency Ratio',
  })

  // Serie para ETH Price
  ethPriceSeries = chart.addLineSeries({
    color: '#10b981',
    lineWidth: 2,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
    title: 'ETH Price',
    priceScaleId: 'eth',
  })

  // Configurar escala de precios separada para ETH
  chart.priceScale('eth').applyOptions({
    position: 'right',
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  })

  updateChartData()
  
  // Ajustar el tamaño al contenedor
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
  if (!solvencyRatioSeries || !ethPriceSeries) return

  const formattedData = props.data.map(item => ({
    time: new Date(item.timestamp).getTime() / 1000,
    value: item.solvencyRatio / 100, // Convertir a decimal para formato porcentual
  }))

  const ethData = props.data.map(item => ({
    time: new Date(item.timestamp).getTime() / 1000,
    value: item.ethPrice,
  }))

  solvencyRatioSeries.setData(formattedData)
  ethPriceSeries.setData(ethData)
  
  chart.timeScale().fitContent()
}

watch(() => props.data, updateChartData, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.remove()
  }
})
</script>
