<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-800">SolvencyProof Dashboard</h1>
      </div>
    </nav>

    <main class="container mx-auto px-6 py-8">
      <!-- Health Status Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <HealthCard 
          :solvencyRatio="solvencyRatio"
          :healthStatus="healthStatus"
        />
        <MetricsCard 
          title="Total Assets"
          :value="totalAssets"
          trend="up"
        />
        <MetricsCard 
          title="Total Liabilities"
          :value="totalLiabilities"
          trend="down"
        />
      </div>

      <!-- Risk Monitoring -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <RiskGauge :value="solvencyRatio" />
        <HistoryChart :data="historyData" />
      </div>

      <!-- Asset/Liability Tables -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AssetTable :assets="assets" />
        <LiabilityTable :liabilities="liabilities" />
      </div>
    </main>
  </div>
</template>
