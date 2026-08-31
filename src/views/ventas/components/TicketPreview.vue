<script setup lang="ts">
import { PrinterIcon } from '@heroicons/vue/24/outline'

import BaseButton from '@/components/ui/BaseButton.vue'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

import type { TicketEmpresa, VentaDetalle } from '@/types/venta'

interface Props {
  venta: VentaDetalle
  empresa?: TicketEmpresa | null
}

defineProps<Props>()

function printTicket() {
  window.print()
}
</script>

<template>
  <div>
    <div id="ticket-preview" class="mx-auto max-w-sm bg-white text-sm text-gray-800">
      <div class="text-center">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#C56B86] font-bold text-white"
        >
          B
        </div>
        <h3 class="mt-3 text-lg font-semibold">
          {{ empresa?.nombre ?? 'Belleza' }}
        </h3>
        <p v-if="empresa?.direccion" class="text-xs text-gray-500">
          {{ empresa.direccion }}
        </p>
        <p v-if="empresa?.telefono" class="text-xs text-gray-500">
          {{ empresa.telefono }}
        </p>
      </div>

      <div class="my-5 border-y border-dashed border-gray-300 py-4 text-xs">
        <div class="flex justify-between gap-4">
          <span>Folio</span>
          <span class="font-medium">{{ venta.folio }}</span>
        </div>
        <div class="mt-2 flex justify-between gap-4">
          <span>Fecha</span>
          <span class="font-medium">{{ formatDate(venta.fecha) }}</span>
        </div>
        <div class="mt-2 flex justify-between gap-4">
          <span>Cajero</span>
          <span class="font-medium">{{ venta.usuario }}</span>
        </div>
        <div class="mt-2 flex justify-between gap-4">
          <span>Pago</span>
          <span class="font-medium">{{ venta.metodoPago }}</span>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in venta.productos"
          :key="`${item.producto}-${item.variante}-${index}`"
        >
          <div class="flex justify-between gap-4">
            <span class="font-medium"> {{ item.producto }} - {{ item.variante }} </span>
            <span>{{ item.cantidad }}</span>
          </div>
          <p class="mt-1 text-right text-xs text-gray-500">
            {{ formatCurrency(item.precioUnitario) }} ·
            {{ formatCurrency(item.subtotal) }}
          </p>
        </div>
      </div>

      <dl class="mt-5 space-y-2 border-t border-dashed border-gray-300 pt-4">
        <div class="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{{ formatCurrency(venta.subtotal) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt>Descuento</dt>
          <dd>-{{ formatCurrency(venta.descuento) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt>IVA</dt>
          <dd>{{ formatCurrency(venta.iva) }}</dd>
        </div>
        <div class="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd>{{ formatCurrency(venta.total) }}</dd>
        </div>
      </dl>

      <div
        class="mt-5 border-t border-dashed border-gray-300 pt-4 text-center text-xs text-gray-500"
      >
        {{ empresa?.mensajeTicket ?? 'Gracias por su compra.' }}
      </div>
    </div>

    <div class="mt-6 flex justify-stretch sm:justify-end">
      <BaseButton class="w-full sm:w-auto" @click="printTicket">
        <PrinterIcon class="h-5 w-5" />
        Imprimir ticket
      </BaseButton>
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  #ticket-preview,
  #ticket-preview * {
    visibility: visible;
  }

  #ticket-preview {
    position: absolute;
    inset: 0 auto auto 0;
    width: 80mm;
    padding: 8mm;
  }
}
</style>
