<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppFooter from '@/components/layout/AppFooter.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[#FAFAFA]">
    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar />

      <main class="flex-1 p-4 sm:p-6">
        <RouterView />
      </main>

      <AppFooter />
    </div>
  </div>
</template>
