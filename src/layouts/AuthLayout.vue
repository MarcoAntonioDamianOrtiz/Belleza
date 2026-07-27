<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFA] p-6"
  >
    <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#C56B86]/5" />

    <div class="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-[#C56B86]/5" />

    <div class="relative z-10 w-full">
      <RouterView />
    </div>
  </div>
</template>
