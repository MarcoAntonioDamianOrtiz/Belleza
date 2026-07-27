<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
})

const classes = computed(() => {
  const variants = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-gray-100 text-gray-600',
  }

  return variants[props.variant]
})
</script>

<template>
  <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', classes]">
    <slot />
  </span>
</template>
