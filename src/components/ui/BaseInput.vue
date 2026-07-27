<script setup lang="ts">
interface Props {
  modelValue?: string | number | null
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
  'update:modelValue': [value: string | number]
}>()

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement

  if (input.type === 'number') {
    emit('update:modelValue', input.value === '' ? '' : Number(input.value))

    return
  }

  emit('update:modelValue', input.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label || $slots.label" class="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
      <slot name="label">
        {{ label }}
      </slot>
    </label>

    <input :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :required="required" :class="[
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition',
      'placeholder:text-gray-400',
      'focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15',
      'disabled:cursor-not-allowed disabled:bg-gray-100',
      error ? 'border-red-400' : 'border-[#E5E7EB]',
    ]" @input="handleInput" />

    <p v-if="error" class="mt-1.5 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<BaseInput v-model="email" label="Correo electrónico" placeholder="correo@ejemplo.com" required />
