<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
}
</script>

<template>
  <span
    :class="[
      'inline-block animate-spin rounded-full border-2 border-[#C56B86] border-t-transparent',
      sizes[props.size],
    ]"
    role="status"
    aria-label="Cargando"
  />
</template>
