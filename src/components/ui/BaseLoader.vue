<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: 'Cargando...',
})
</script>

<template>
  <div class="flex items-center justify-center gap-3 p-8">
    <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#C56B86] border-t-transparent" />

    <span class="text-sm text-gray-500">
      {{ text }}
    </span>
  </div>
</template>
