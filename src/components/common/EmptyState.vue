<script setup lang="ts">
import { InboxIcon } from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No hay información',
  description: 'No existen registros para mostrar.',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBEFF3]">
      <InboxIcon class="h-6 w-6 text-[#C56B86]" />
    </div>

    <h3 class="font-semibold text-gray-900">
      {{ title }}
    </h3>

    <p class="mt-1 max-w-sm text-sm text-gray-500">
      {{ description }}
    </p>

    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>

<AppBreadcrumb :items="[{ label: 'Productos' }]" />
