<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <main
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFA] px-4 py-8 sm:px-6 md:px-8"
  >
    <div
      class="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#C56B86]/5 sm:-top-40 sm:-left-40 sm:h-96 sm:w-96"
    />

    <div
      class="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-[#C56B86]/5 sm:-right-40 sm:-bottom-40 sm:h-96 sm:w-96"
    />

    <div class="relative z-10 flex w-full justify-center">
      <RouterView />
    </div>
  </main>
</template>
