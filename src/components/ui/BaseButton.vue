<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  loading: false,
})

const buttonClasses = computed(() => {
  const variants = {
    primary: 'bg-[#C56B86] text-white hover:bg-[#B55F79]',
    secondary: 'border border-[#ECECEC] bg-white text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  return variants[props.variant]
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-50',
      buttonClasses,
    ]"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />

    <slot />
  </button>
</template>
