<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<template>
  <div class="flex min-h-screen min-w-0 overflow-x-hidden bg-[#FAFAFA]">
    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar />

      <main class="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <RouterView />
      </main>

    </div>
  </div>
</template>
