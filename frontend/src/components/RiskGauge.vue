<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">Risk Gauge</h2>
    <div class="relative h-40">
      <svg class="w-full h-full" viewBox="0 0 200 100">
        <!-- Gauge Background -->
        <path 
          d="M20,80 A60,60 0 0,1 180,80"
          class="stroke-gray-200"
          fill="none"
          stroke-width="20"
        />
        <!-- Gauge Value -->
        <path 
          :d="gaugeArc"
          :class="gaugeColor"
          fill="none"
          stroke-width="20"
        />
        <!-- Current Value Indicator -->
        <circle
          :cx="indicatorPosition.x"
          :cy="indicatorPosition.y"
          r="5"
          :class="gaugeColor"
        />
      </svg>
      <div class="absolute bottom-0 w-full text-center text-2xl font-bold">
        {{ value.toFixed(2) }}%
      </div>
    </div>
  </div>
</template>
