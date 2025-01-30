import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'

// Import components for router
import Dashboard from './views/Dashboard.vue'
import History from './views/History.vue'
import Settings from './views/Settings.vue'
import Documentation from './views/Documentation.vue'

// Import styles
import './assets/main.css'

// Configure router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Dashboard,
      name: 'dashboard'
    },
    {
      path: '/history',
      component: History,
      name: 'history'
    },
    {
      path: '/settings',
      component: Settings,
      name: 'settings'
    },
    {
      path: '/docs',
      component: Documentation,
      name: 'documentation'
    }
  ]
})

// Create Pinia store instance
const pinia = createPinia()

// Create and mount Vue app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')
