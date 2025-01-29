import { ref, onMounted } from 'vue';
import { SolvencyProofService } from '../services/contractIntegration';
import Web3Service from '../services/web3Service';
import type { SolvencyMetrics, HistoricalDataPoint } from '../types';

export function useSolvencyContract() {
  const service = ref<SolvencyProofService>();
  const metrics = ref<SolvencyMetrics>();
  const history = ref<HistoricalDataPoint[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const web3Service = Web3Service.getInstance();

  onMounted(async () => {
    try {
      service.value = new SolvencyProofService();
      // Use the first Hardhat account by default
      await service.value.connectWithSigner(0);
      await refreshData();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize contract';
    }
  });

  async function refreshData() {
    if (!service.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Get current metrics
      metrics.value = await service.value.getSolvencyMetrics();
      
      // Get last 7 days of history
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (7 * 24 * 60 * 60);
      history.value = await service.value.getHistoricalData(startTime, endTime);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch data';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    metrics,
    history,
    isLoading,
    error,
    refreshData
  }
}
