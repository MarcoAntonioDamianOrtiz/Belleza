<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'

import VariantesTable from './VariantesTable.vue'

interface Props {
  producto: Producto
}

defineProps<Props>()

const emit = defineEmits<{
  editProduct: [producto: Producto]
  deleteProduct: [producto: Producto]
  addVariant: [producto: Producto]
  editVariant: [variante: Variante]
  deleteVariant: [variante: Variante]
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

            <span>
              {{ producto.variantes.length }}
              {{ producto.variantes.length === 1 ? 'variante' : 'variantes' }}
            </span>
          </div>
        </div>
      </button>

      <div class="flex items-center gap-2">
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
          class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"
          title="Eliminar producto"
          @click="emit('deleteProduct', producto)"
        >
          <TrashIcon class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-[#FBEFF3] px-3 py-2 text-sm font-medium text-[#C56B86] hover:bg-[#F7E3EA]"
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
        @edit="emit('editVariant', $event)"
        @delete="emit('deleteVariant', $event)"
      />

      <div v-else class="p-8 text-center text-sm text-gray-500">
        Este producto todavía no tiene variantes.
      </div>
    </div>
  </article>
</template>
