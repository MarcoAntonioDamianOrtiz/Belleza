<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[#FAFAFA]">
    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar />

      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
