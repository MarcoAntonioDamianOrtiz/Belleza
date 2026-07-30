<script setup lang="ts">
interface SelectOption {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  id?: string
  label?: string
  placeholder?: string
  options?: SelectOption[]
  disabled?: boolean
  required?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'Selecciona una opción',
  options: () => [],
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function handleChange(event: Event) {
  const select = event.target as HTMLSelectElement
  const value = select.value
  const option = select.selectedOptions[0]
  const originalValue = option?.dataset.valueType === 'number' ? Number(value) : value

  emit('update:modelValue', originalValue)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="mb-2 block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition',
        'focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15',
        'disabled:cursor-not-allowed disabled:bg-gray-100',
        error ? 'border-red-400' : 'border-[#E5E7EB]',
      ]"
      @change="handleChange"
    >
      <option value="" disabled>
        {{ placeholder }}
      </option>

      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :data-value-type="typeof option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="error" class="mt-1.5 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
