<template>
  <div class="min-h-screen bg-[#fafafa]">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Main Nav -->
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img class="h-8 w-auto" src="https://cdn.worldvectorlogo.com/logos/stratis-strat-2.svg" alt="Logo" />
              </div>
              <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
                <router-link
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.href"
                  :class="[
                    $route.path === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors'
                  ]"
                >
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              $route.path === item.href
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            ]"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Wrapper -->
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'History', href: '/history' },
  { name: 'Settings', href: '/settings' },
  { name: 'Documentation', href: '/docs' }
]
</script>
