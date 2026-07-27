<script setup lang="ts">
import { ChevronRightIcon, HomeIcon } from '@heroicons/vue/24/outline'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
  items: () => [],
})
</script>

<template>
  <nav class="flex items-center gap-2 text-sm text-gray-500">
    <RouterLink to="/" class="transition-colors hover:text-[#C56B86]" aria-label="Dashboard">
      <HomeIcon class="h-4 w-4" />
    </RouterLink>

    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <ChevronRightIcon class="h-4 w-4 text-gray-300" />

      <RouterLink v-if="item.to" :to="item.to" class="transition-colors hover:text-[#C56B86]">
        {{ item.label }}
      </RouterLink>

      <span v-else class="font-medium text-gray-700">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
