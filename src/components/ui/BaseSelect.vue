<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

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

const props = withDefaults(defineProps<Props>(), {
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

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  open.value = false
}

function closeOnOutsidePointer(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) {
    open.value = false
  }
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutsidePointer)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsidePointer)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div ref="root" class="relative w-full">
    <label v-if="label" :for="id" class="mb-2 block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <select
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute h-px w-px opacity-0"
    >
      <option value="" />
      <option v-for="option in options" :key="String(option.value)" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <button
      :id="id"
      type="button"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :class="[
        'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2.5 text-left text-sm outline-none transition',
        'focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15',
        'disabled:cursor-not-allowed disabled:bg-gray-100',
        error ? 'border-red-400' : 'border-[#E5E7EB]',
      ]"
      @click="toggle"
    >
      <span
        :class="['min-w-0 flex-1 truncate', selectedOption ? 'text-gray-700' : 'text-gray-400']"
      >
        {{ selectedOption?.label ?? placeholder }}
      </span>

      <ChevronDownIcon
        :class="['h-4 w-4 shrink-0 text-gray-400 transition-transform', open ? 'rotate-180' : '']"
      />
    </button>

    <div
      v-if="open"
      role="listbox"
      class="absolute left-0 right-0 z-[80] mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
    >
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        role="option"
        :aria-selected="option.value === modelValue"
        class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-[#FBEFF3] hover:text-[#C56B86]"
        @click="selectOption(option)"
      >
        <span class="min-w-0 flex-1 truncate">
          {{ option.label }}
        </span>

        <CheckIcon v-if="option.value === modelValue" class="h-4 w-4 shrink-0 text-[#C56B86]" />
      </button>

      <p v-if="!options.length" class="px-3 py-3 text-center text-sm text-gray-400">
        No hay opciones disponibles.
      </p>
    </div>

    <p v-if="error" class="mt-1.5 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
