<template>
  <div class="flex items-center gap-2">
    <span class="font-medium">{{ token }}:</span>
    <input
      type="number"
      v-model="newPrice"
      class="w-32 px-2 py-1 border rounded"
    />
    <button
      @click="updatePrice"
      class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Update
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  token: string
  currentPrice: number
  onUpdate: (token: string, price: number) => Promise<void>
}>()

const newPrice = ref(props.currentPrice)

const updatePrice = async () => {
  await props.onUpdate(props.token, newPrice.value)
}
</script>
