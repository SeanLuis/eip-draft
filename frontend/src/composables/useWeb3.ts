import { ref } from 'vue'
import { type PublicClient, type WalletClient } from 'viem'
import { createClient, createLocalWalletClient, accounts, contractAddresses } from '../config/web3'

// Create a singleton instance
const publicClient = ref<PublicClient | null>(null)
const walletClient = ref<WalletClient | null>(null)
const isConnected = ref(false)
const account = ref<string | null>(null)
const error = ref<string | null>(null)

export function useWeb3() {
  async function connect(accountType: 'deployer' | 'oracle' | 'user' = 'deployer') {
    try {
      const selectedAccount = accounts[accountType]
      
      // Create clients
      publicClient.value = createClient()
      walletClient.value = createLocalWalletClient(selectedAccount)
      
      // Set state
      account.value = selectedAccount.address
      isConnected.value = true
      error.value = null

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to connect'
      isConnected.value = false
      account.value = null
      return false
    }
  }

  function disconnect() {
    walletClient.value = null
    account.value = null
    isConnected.value = false
  }

  return {
    publicClient,
    walletClient,
    isConnected,
    account,
    error,
    addresses: contractAddresses,
    connect,
    disconnect,
    accounts
  }
}
