<template>
  <div class="min-h-screen bg-[#f6f8fa] p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Understanding Protocol Solvency</h1>
      
      <!-- Basic Explanation -->
      <section class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">What is Protocol Solvency? 🤔</h2>
        <p class="mb-4">
          Imagine you have a piggy bank (that's our protocol!) where you can store different types of coins (cryptocurrencies).
          We need to make sure that the piggy bank always has enough money to give back to everyone who put money in it.
        </p>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-bold mb-2">Real World Example:</h3>
          <p>
            Think of a bank: If everyone has deposited $1000 in total, the bank should always have enough money
            to give back those $1000. In our case, we work with cryptocurrencies like ETH and BTC instead of dollars.
          </p>
        </div>
      </section>

      <!-- Health Factor Explanation -->
      <section class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Understanding Health Factor 📊</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="border p-4 rounded-lg">
            <h3 class="font-bold text-green-600">HEALTHY (>120%)</h3>
            <p>Like having $120 to cover every $100 borrowed</p>
          </div>
          <div class="border p-4 rounded-lg">
            <h3 class="font-bold text-red-600">CRITICAL (<105%)</h3>
            <p>Like having only $105 to cover every $100 borrowed</p>
          </div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="font-bold mb-2">Example:</h3>
          <p>
            If users have deposited 10 ETH (worth $2000 each), that's $20,000 in total assets.
            If users have borrowed 8 ETH ($16,000), the health factor would be: (20,000/16,000) × 100 = 125%
            This is healthy because we have 25% more assets than liabilities!
          </p>
        </div>
      </section>

      <!-- Market Crash Scenario -->
      <section class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">What Happens in a Market Crash? 📉</h2>
        <div class="mb-4">
          <p>Let's see what happens when prices drop suddenly:</p>
          <ol class="list-decimal pl-5 mt-2 space-y-2">
            <li>Initial: 10 ETH at $2000 each = $20,000 assets</li>
            <li>After 50% crash: 10 ETH at $1000 each = $10,000 assets</li>
            <li>But liabilities stay the same: $16,000</li>
            <li>New health factor: (10,000/16,000) × 100 = 62.5% (CRITICAL!)</li>
          </ol>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <h3 class="font-bold mb-2">Why This Is Important:</h3>
          <p>
            Just like a bank needs to stay solvent, our protocol needs to maintain healthy ratios
            to ensure everyone can withdraw their funds when they want to.
          </p>
        </div>
      </section>

      <!-- Volatility Testing -->
      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Testing Price Changes 📊</h2>
        <p class="mb-4">
          We simulate different market conditions to ensure the protocol stays healthy:
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div class="border p-4 rounded-lg">
            <h3 class="font-bold">Market Crash Test</h3>
            <p>Simulates sudden price drops to test protocol safety</p>
          </div>
          <div class="border p-4 rounded-lg">
            <h3 class="font-bold">Volatility Test</h3>
            <p>Tests how the protocol handles price ups and downs</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
