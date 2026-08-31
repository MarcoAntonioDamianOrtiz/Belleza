<script setup lang="ts">
import { RouterView } from 'vue-router'

import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
uiStore.initializeTheme()
</script>

<template>
  <RouterView />
</template>
