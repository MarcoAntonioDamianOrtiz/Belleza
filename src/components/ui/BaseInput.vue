<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700">
      {{ label }}

      <span v-if="required" class="text-red-500"> * </span>
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition',
        'placeholder:text-gray-400',
        'focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15',
        'disabled:cursor-not-allowed disabled:bg-gray-100',
        error ? 'border-red-400' : 'border-[#E5E7EB]',
      ]"
      @input="handleInput"
    />

    <p v-if="error" class="mt-1.5 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<BaseInput v-model="email" label="Correo electrónico" placeholder="correo@ejemplo.com" required />
