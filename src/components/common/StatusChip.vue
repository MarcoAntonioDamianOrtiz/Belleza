<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label: string
}

const props = defineProps<Props>()

const classes = computed(() => {
  const variants = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-gray-100 text-gray-600',
  }

  return variants[props.status]
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
      classes,
    ]"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current" />

    {{ label }}
  </span>
</template>

<StatusChip status="success" label="Activo" />

<StatusChip status="warning" label="Stock bajo" />

<StatusChip status="danger" label="Agotado" />
