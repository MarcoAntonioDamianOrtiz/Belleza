<script setup lang="ts">
import { computed, reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

export interface VarianteMovimientoOption {
  value: string
  label: string
  stock: number
}

interface Props {
  tipo: TipoMovimiento
  variantes: VarianteMovimientoOption[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

export interface MovimientoFormData {
  varianteId: string
  cantidad: number
  motivo: string
}

const emit = defineEmits<{
  submit: [data: MovimientoFormData]
  cancel: []
}>()

const form = reactive<MovimientoFormData>({
  varianteId: '',
  cantidad: 1,
  motivo: '',
})

const selectedVariant = computed(() =>
  props.variantes.find((item) => item.value === form.varianteId),
)

const title = computed(() => {
  if (props.tipo === 'entrada') return 'Registrar entrada'
  if (props.tipo === 'salida') return 'Registrar salida'
  return 'Registrar ajuste'
})

function submitForm() {
  if (!form.varianteId || !form.motivo.trim()) return

  const cantidad = Number(form.cantidad)

  if (cantidad <= 0) return

  emit('submit', {
    varianteId: form.varianteId,
    cantidad,
    motivo: form.motivo.trim(),
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div>
      <h3 class="font-semibold text-gray-900">{{ title }}</h3>
      <p class="mt-1 text-sm text-gray-500">Ingresa la información del movimiento.</p>
    </div>

    <BaseSelect
      v-model="form.varianteId"
      label="Producto / Variante"
      :options="variantes"
      placeholder="Selecciona una variante"
      required
    />

    <div v-if="selectedVariant" class="rounded-xl bg-gray-50 px-4 py-3">
      <p class="text-xs font-medium uppercase text-gray-400">Stock actual</p>
      <p class="mt-1 text-lg font-semibold text-gray-900">{{ selectedVariant.stock }} unidades</p>
    </div>

    <BaseInput
      v-if="tipo !== 'ajuste'"
      v-model="form.cantidad"
      type="number"
      label="Cantidad"
      min="1"
      required
    />

    <BaseInput v-else v-model="form.cantidad" type="number" min="1" required>
      <template #label>
        <span>Stock real</span>
        <HelpTooltip
          text="Cantidad total de unidades que realmente existen al revisar el producto."
        />
      </template>
    </BaseInput>

    <div>
      <label for="motivo-movimiento" class="mb-2 block text-sm font-medium text-gray-700">
        Motivo
      </label>

      <textarea
        id="motivo-movimiento"
        v-model="form.motivo"
        rows="3"
        required
        placeholder="Describe el motivo del movimiento"
        class="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      />
    </div>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit" :loading="loading"> Registrar </BaseButton>
    </div>
  </form>
</template>
