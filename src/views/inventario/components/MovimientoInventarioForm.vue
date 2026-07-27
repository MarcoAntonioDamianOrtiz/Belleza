<script setup lang="ts">
import { computed, reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

interface Props {
  tipo: TipoMovimiento
}

const props = defineProps<Props>()

export interface MovimientoFormData {
  varianteId: number
  cantidad?: number
  stockNuevo?: number
  motivo: string
}

const emit = defineEmits<{
  submit: [data: MovimientoFormData]
  cancel: []
}>()

// MOCK temporal.
// Después las variantes disponibles vendrán del backend.
const variantes = [
  {
    value: 1,
    label: 'Labial Mate - Rojo Cereza',
    stock: 24,
  },
  {
    value: 2,
    label: 'Labial Mate - Rosa Nude',
    stock: 4,
  },
  {
    value: 3,
    label: 'Labial Mate - Ciruela',
    stock: 0,
  },
]

const form = reactive({
  varianteId: 0,
  cantidad: 1,
  stockNuevo: 0,
  motivo: '',
})

const selectedVariant = computed(() =>
  variantes.find((variante) => variante.value === Number(form.varianteId)),
)

const title = computed(() => {
  if (props.tipo === 'entrada') return 'Registrar entrada'
  if (props.tipo === 'salida') return 'Registrar salida'

  return 'Registrar ajuste'
})

function submitForm() {
  if (!form.varianteId || !form.motivo.trim()) return

  if (props.tipo === 'ajuste') {
    const stockNuevo = Number(form.stockNuevo)

    if (stockNuevo < 0) return

    emit('submit', {
      varianteId: Number(form.varianteId),
      stockNuevo,
      motivo: form.motivo.trim(),
    })

    return
  }

  if (form.cantidad <= 0) return

  emit('submit', {
    varianteId: Number(form.varianteId),
    cantidad: Number(form.cantidad),
    motivo: form.motivo.trim(),
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div>
      <h3 class="font-semibold text-gray-900">
        {{ title }}
      </h3>

      <p class="mt-1 text-sm text-gray-500">Ingresa la información del movimiento de inventario.</p>
    </div>

    <BaseSelect
      v-model="form.varianteId"
      label="Producto / Variante"
      :options="variantes"
      placeholder="Selecciona una variante"
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

    <BaseInput v-else v-model="form.stockNuevo" type="number" min="0" required>
      <template #label>
        <span>Stock real</span>

        <HelpTooltip
          text="Cantidad de unidades que realmente existen después de revisar físicamente el inventario."
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

      <BaseButton type="submit"> Registrar </BaseButton>
    </div>
  </form>
</template>
