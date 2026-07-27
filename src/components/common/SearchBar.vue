<script setup lang="ts">
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue?: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Buscar...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clearSearch() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="relative w-full">
    <MagnifyingGlassIcon
      class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
    />

    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pr-10 pl-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      @input="updateValue"
    />

    <button
      v-if="modelValue"
      type="button"
      class="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      aria-label="Limpiar búsqueda"
      @click="clearSearch"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>
