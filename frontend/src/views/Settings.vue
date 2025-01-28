<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6">Protocol Settings</h2>

      <!-- Risk Thresholds -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">Risk Thresholds</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label>Critical Threshold (%)</label>
            <input 
              v-model="settings.criticalThreshold"
              type="number" 
              class="w-full rounded border p-2"
            />
          </div>
          <div class="form-group">
            <label>Warning Threshold (%)</label>
            <input 
              v-model="settings.warningThreshold"
              type="number" 
              class="w-full rounded border p-2"
            />
          </div>
        </div>
      </div>

      <!-- Oracle Management -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">Oracle Management</h3>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="oracle in settings.oracles" :key="oracle.address">
            <div class="flex items-center gap-4">
              <input 
                v-model="oracle.address"
                type="text"
                placeholder="Oracle Address"
                class="flex-1 rounded border p-2"
              />
              <button 
                @click="removeOracle(oracle.address)"
                class="bg-red-500 text-white px-4 py-2 rounded"
              >
                Remove
              </button>
            </div>
          </div>
          <button 
            @click="addOracle"
            class="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Oracle
          </button>
        </div>
      </div>

      <!-- Save Button -->
      <button 
        @click="saveSettings"
        class="bg-blue-500 text-white px-6 py-3 rounded font-semibold"
      >
        Save Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  criticalThreshold: 105,
  warningThreshold: 120,
  oracles: [{ address: '' }]
})

const addOracle = () => {
  settings.value.oracles.push({ address: '' })
}

const removeOracle = (address: string) => {
  settings.value.oracles = settings.value.oracles.filter(
    oracle => oracle.address !== address
  )
}

const saveSettings = async () => {
  // Here we would update contract settings
  // await contract.updateSettings(settings.value)
}
</script>
