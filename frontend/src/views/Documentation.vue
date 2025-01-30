<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Understanding Protocol Solvency</h1>
      <p class="mt-2 text-gray-500">EIP-XXXX: DeFi Protocol Solvency Proof Standard</p>
    </div>

    <div class="space-y-6 max-w-4xl">
      <!-- Abstract -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Abstract</h2>
        <p class="text-gray-600">
          This EIP introduces a standardized interface for DeFi protocols to implement verifiable solvency proofs. 
          It defines methods for reporting assets, liabilities, and financial health metrics, enabling real-time, 
          transparent verification of protocols' financial state through smart contracts.
        </p>
      </section>

      <!-- Basic Concept -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">What is Protocol Solvency? 🤔</h2>
        <p class="text-gray-600 mb-4">
          Imagine you have a piggy bank (that's our protocol!) where you can store different types of coins (cryptocurrencies).
          We need to make sure that the piggy bank always has enough money to give back to everyone who put money in it.
        </p>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-medium text-blue-900 mb-2">Real World Example:</h3>
          <p class="text-blue-800">
            Think of a bank: If everyone has deposited $1000 in total, the bank should always have enough money
            to give back those $1000. In our case, we work with cryptocurrencies like ETH and BTC instead of dollars.
          </p>
        </div>
      </section>

      <!-- Health Factor -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Health Factor Examples 📊</h2>
        
        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="border rounded-lg p-4 bg-green-50 border-green-200">
            <h3 class="font-medium text-green-800">HEALTHY (>120%)</h3>
            <p class="text-green-700 text-sm mt-1">Like having $120 to cover every $100 borrowed</p>
          </div>
          <div class="border rounded-lg p-4 bg-red-50 border-red-200">
            <h3 class="font-medium text-red-800">CRITICAL (<105%)</h3>
            <p class="text-red-700 text-sm mt-1">Like having only $105 to cover every $100 borrowed</p>
          </div>
        </div>

        <!-- Example Calculation -->
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="font-medium text-yellow-900 mb-2">Calculation Example:</h3>
          <div class="space-y-2 text-yellow-800">
            <p>If users have deposited 10 ETH (worth $2000 each):</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Total Assets = $20,000</li>
              <li>Total Liabilities = $16,000 (8 ETH borrowed)</li>
              <li>Health Factor = (20,000/16,000) × 100 = 125%</li>
              <li>Status: HEALTHY (>120%)</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Market Scenarios -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Market Crash Simulation 📉</h2>
        
        <div class="space-y-4">
          <div class="bg-white border rounded-lg p-4">
            <h3 class="font-medium mb-2">Simulation Steps:</h3>
            <ol class="list-decimal pl-5 space-y-2 text-gray-600">
              <li>Initial: 10 ETH at $2000 each = $20,000 assets</li>
              <li>After 50% crash: 10 ETH at $1000 each = $10,000 assets</li>
              <li>But liabilities stay the same: $16,000</li>
              <li>New health factor: (10,000/16,000) × 100 = 62.5% (CRITICAL!)</li>
            </ol>
          </div>

          <div class="bg-red-50 p-4 rounded-lg">
            <h3 class="font-medium text-red-900 mb-2">Why This Matters:</h3>
            <p class="text-red-800">
              Just like a bank needs to stay solvent, our protocol needs to maintain healthy ratios
              to ensure everyone can withdraw their funds when they want to.
            </p>
          </div>
        </div>
      </section>

      <!-- Mathematical Model -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Mathematical Model</h2>
        <div class="space-y-6">
          <!-- Core Formula -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-medium mb-2">Core Solvency Ratio</h3>
            <div class="font-mono bg-white p-3 rounded border text-sm">
              SR = (TA / TL) × 100
              <div class="mt-2 text-gray-600 text-xs">
                Where:
                <br>TA = Σ(Assets × Price)
                <br>TL = Σ(Liabilities × Price)
              </div>
            </div>
          </div>

          <!-- Risk Metrics -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-medium mb-2">Risk-Adjusted Health Factor</h3>
            <div class="font-mono bg-white p-3 rounded border text-sm">
              HF = Σ(A×P×W) / Σ(L×P×R)
              <div class="mt-2 text-gray-600 text-xs">
                Where:
                <br>W = Risk weight (0-1)
                <br>R = Risk factor (≥1)
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const healthLevels = [
  {
    name: 'Healthy',
    range: '≥120%',
    description: 'Protocol has sufficient buffer against market volatility',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800'
  },
  {
    name: 'Warning',
    range: '110-120%',
    description: 'Monitor closely, consider risk reduction',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800'
  },
  {
    name: 'High Risk',
    range: '105-110%',
    description: 'Immediate action required',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800'
  },
  {
    name: 'Critical',
    range: '<105%',
    description: 'Emergency measures needed',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800'
  }
]
</script>

<style scoped>
.prose {
  @apply max-w-none;
}

pre {
  @apply p-4 bg-white rounded border font-mono;
}
</style>
