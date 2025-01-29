<template>
  <div class="h-full w-full">
    <Line
      v-if="chartData"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: Array<{
    timestamp: number;
    solvencyRatio: number;
    ethPrice: number;
    btcPrice: number;
  }>;
}>();

const chartData = computed(() => ({
  labels: props.data.map(d => new Date(d.timestamp).toLocaleDateString()),
  datasets: [
    {
      label: 'Solvency Ratio',
      data: props.data.map(d => d.solvencyRatio),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      yAxisID: 'y'
    },
    {
      label: 'ETH Price',
      data: props.data.map(d => d.ethPrice),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      yAxisID: 'y1'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: any) => `Solvency: ${context.parsed.y.toFixed(2)}%`
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 0
      }
    },
    y: {
      beginAtZero: false,
      position: 'left',
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        callback: (value: number) => `${value}%`,
        stepSize: 5
      },
      title: {
        display: true,
        text: 'Solvency Ratio (%)'
      }
    },
    y1: {
      beginAtZero: false,
      position: 'right',
      title: {
        display: true,
        text: 'ETH Price ($)'
      }
    }
  }
}
</script>
