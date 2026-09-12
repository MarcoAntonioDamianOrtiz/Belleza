<script setup lang="ts">
import { ref } from 'vue'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'

import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'

import VariantesTable from './VariantesTable.vue'

interface Props {
  producto: Producto
  canManage?: boolean
}

withDefaults(defineProps<Props>(), {
  canManage: false,
})

const emit = defineEmits<{
  editProduct: [producto: Producto]
  toggleProduct: [producto: Producto]
  addVariant: [producto: Producto]
  editVariant: [variante: Variante]
  toggleVariant: [variante: Variante]
}>()

const expanded = ref(false)
</script>

<template>
  <article class="interactive-lift-card overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
    <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-4 text-left"
        @click="expanded = !expanded"
      >
        <ChevronDownIcon
          :class="[
            'h-5 w-5 shrink-0 text-gray-400 transition-transform',
            expanded ? 'rotate-180' : '',
          ]"
        />

        <div class="min-w-0">
          <h2 class="truncate font-semibold text-gray-900">
            {{ producto.nombre }}
          </h2>

          <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>
              {{ producto.categoria }}
            </span>

            <span class="text-gray-300">•</span>

            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="producto.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ producto.activo ? 'Activo' : 'Inactivo' }}
            </span>

            <span class="text-gray-300">•</span>

            <span>
              {{ producto.variantes.length }}
              {{ producto.variantes.length === 1 ? 'variante' : 'variantes' }}
            </span>
          </div>
        </div>
      </button>

      <div v-if="canManage" class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          title="Editar producto"
          @click="emit('editProduct', producto)"
        >
          <PencilSquareIcon class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
          :title="producto.activo ? 'Desactivar producto' : 'Activar producto'"
          @click="emit('toggleProduct', producto)"
        >
          <NoSymbolIcon v-if="producto.activo" class="h-5 w-5" />
          <CheckCircleIcon v-else class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-[#FBEFF3] px-3 py-2 text-sm font-medium text-[#C56B86] hover:bg-[#F7E3EA] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!producto.activo"
          @click="emit('addVariant', producto)"
        >
          <PlusIcon class="h-4 w-4" />

          Variante
        </button>
      </div>
    </div>

    <div v-if="expanded" class="border-t border-[#ECECEC]">
      <VariantesTable
        v-if="producto.variantes.length"
        :variantes="producto.variantes"
        :can-manage="canManage"
        @edit="emit('editVariant', $event)"
        @toggle="emit('toggleVariant', $event)"
      />

      <div v-else class="p-8 text-center text-sm text-gray-500">
        Este producto todavía no tiene variantes.
      </div>
    </div>
  </article>
</template>
