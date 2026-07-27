<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

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
      class="search-input w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pr-4 pl-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      @input="updateValue"
    />
  </div>
</template>
