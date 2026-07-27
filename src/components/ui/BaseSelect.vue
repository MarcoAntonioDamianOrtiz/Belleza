<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  options?: Option[]
  disabled?: boolean
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Seleccionar',
  options: () => [],
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700">
      {{ label }}

      <span v-if="required" class="text-red-500"> * </span>
    </label>

    <select
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>
        {{ placeholder }}
      </option>

      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
