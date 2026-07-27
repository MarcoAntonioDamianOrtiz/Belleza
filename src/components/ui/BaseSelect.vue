<script setup lang="ts">
interface SelectOption {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  options?: SelectOption[]
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'Selecciona una opción',
  options: () => [],
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function handleChange(event: Event) {
  const select = event.target as HTMLSelectElement
  const value = select.value

  const numericValue = Number(value)

  emit(
    'update:modelValue',
    value !== '' && !Number.isNaN(numericValue)
      ? numericValue
      : value,
  )
}
</script>

<template>
  <div>
    <label
      v-if="label"
      class="mb-2 block text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>

    <select
      :value="modelValue"
      :disabled="disabled"
      class="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
      @change="handleChange"
    >
      <option
        value=""
        disabled
      >
        {{ placeholder }}
      </option>

      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
