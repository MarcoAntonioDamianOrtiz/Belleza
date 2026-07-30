<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

import HistorialVentas from './components/HistorialVentas.vue'
import MetodoPago from './components/MetodoPago.vue'
import ResumenVenta from './components/ResumenVenta.vue'
import TicketPreview from './components/TicketPreview.vue'
import VentaCarrito from './components/VentaCarrito.vue'

import { useCarritoStore } from '@/stores/carrito'
import { createMockId, normalizeSearch } from '@/utils/helpers'
import { formatCurrency } from '@/utils/formatCurrency'

import type {
  MetodoPago as MetodoPagoType,
  TipoPrecio,
  VarianteVenta,
  VentaRealizada,
} from '@/types/venta'

type PosTab = 'venta' | 'historial'

const tab = ref<PosTab>('venta')
const search = ref('')
const scannerCode = ref('')
const scannerMessage = ref('')
const paymentOpen = ref(false)
const ticketOpen = ref(false)
const selectedSale = ref<VentaRealizada | null>(null)
const paymentMethod = ref<MetodoPagoType>('efectivo')
const received = ref(0)
const paymentError = ref('')

const carrito = useCarritoStore()
const {
  items,
  tipoPrecio,
  descuentoPorcentaje,
  subtotal,
  descuentoMonto,
  iva,
  total,
  totalArticulos,
} = storeToRefs(carrito)

const variantes = ref<VarianteVenta[]>([
  {
    id: 1,
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    codigoBarras: '7501234567890',
    stock: 24,
    precioMenudeo: 85,
    precioMayoreo: 70,
  },
  {
    id: 2,
    producto: 'Labial Mate',
    variante: 'Rosa Nude',
    sku: 'LAB-MAT-NUD',
    codigoBarras: '7501234567891',
    stock: 4,
    precioMenudeo: 85,
    precioMayoreo: 70,
  },
  {
    id: 3,
    producto: 'Labial Mate',
    variante: 'Ciruela',
    sku: 'LAB-MAT-CIR',
    codigoBarras: '7501234567892',
    stock: 0,
    precioMenudeo: 85,
    precioMayoreo: 70,
  },
  {
    id: 4,
    producto: 'Crema Facial',
    variante: 'Hidratante 250 ml',
    sku: 'CRE-HID-250',
    codigoBarras: '7501234567900',
    stock: 12,
    precioMenudeo: 180,
    precioMayoreo: 155,
  },
])

const ventas = ref<VentaRealizada[]>([
  {
    id: 1,
    folio: 'V-0001',
    fecha: '30/07/2026 09:45',
    usuario: 'Administrador',
    tipoPrecio: 'menudeo',
    metodoPago: 'efectivo',
    items: [
      {
        variante: variantes.value[0]!,
        cantidad: 2,
      },
    ],
    subtotal: 170,
    descuento: 0,
    iva: 27.2,
    total: 197.2,
    efectivoRecibido: 200,
    cambio: 2.8,
  },
])

const filteredVariants = computed(() => {
  const term = normalizeSearch(search.value)

  if (!term) return variantes.value

  return variantes.value.filter((item) =>
    [item.producto, item.variante, item.sku, item.codigoBarras].some((value) =>
      normalizeSearch(value).includes(term),
    ),
  )
})

function displayPrice(variante: VarianteVenta) {
  return tipoPrecio.value === 'mayoreo' ? variante.precioMayoreo : variante.precioMenudeo
}

function addVariant(variante: VarianteVenta) {
  carrito.agregar(variante)
}

function scanCode() {
  const code = scannerCode.value.trim()

  if (!code) return

  // Cuando el backend esté disponible, este punto llamará:
  // GET /api/variantes/codigo/{codigo}/
  const variante = variantes.value.find((item) => item.codigoBarras === code)

  if (!variante) {
    scannerMessage.value = 'No se encontró una variante con ese código.'
    return
  }

  if (variante.stock <= 0) {
    scannerMessage.value = 'La variante está agotada.'
    return
  }

  carrito.agregar(variante)
  scannerCode.value = ''
  scannerMessage.value = `${variante.producto} - ${variante.variante} agregado al carrito.`
}

function setPriceType(value: TipoPrecio) {
  tipoPrecio.value = value
}

function setDiscount(value: number) {
  descuentoPorcentaje.value = Math.min(100, Math.max(0, value || 0))
}

function openPayment() {
  if (!items.value.length) return

  paymentMethod.value = 'efectivo'
  received.value = 0
  paymentError.value = ''
  paymentOpen.value = true
}

function confirmPayment() {
  paymentError.value = ''

  if (paymentMethod.value === 'efectivo' && received.value < total.value) {
    paymentError.value = 'El efectivo recibido es menor que el total.'
    return
  }

  const sale: VentaRealizada = {
    id: createMockId(),
    folio: `V-${String(ventas.value.length + 1).padStart(4, '0')}`,
    fecha: new Date().toLocaleString('es-MX'),
    usuario: 'Administrador',
    tipoPrecio: tipoPrecio.value,
    metodoPago: paymentMethod.value,
    items: items.value.map((item) => ({
      variante: { ...item.variante },
      cantidad: item.cantidad,
    })),
    subtotal: subtotal.value,
    descuento: descuentoMonto.value,
    iva: iva.value,
    total: total.value,
    efectivoRecibido: paymentMethod.value === 'efectivo' ? received.value : undefined,
    cambio:
      paymentMethod.value === 'efectivo' ? Math.max(0, received.value - total.value) : undefined,
  }

  ventas.value.unshift(sale)
  selectedSale.value = sale
  paymentOpen.value = false
  ticketOpen.value = true
  carrito.vaciar()
}

function showTicket(venta: VentaRealizada) {
  selectedSale.value = venta
  ticketOpen.value = true
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Ventas' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Ventas / POS</h1>
      <p class="mt-1 text-sm text-gray-500">
        Busca variantes, administra el carrito y registra ventas.
      </p>
    </div>

    <div class="mb-6 inline-flex rounded-xl bg-gray-100 p-1">
      <button
        type="button"
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition',
          tab === 'venta' ? 'bg-white text-[#C56B86] shadow-sm' : 'text-gray-500',
        ]"
        @click="tab = 'venta'"
      >
        Nueva venta
      </button>

      <button
        type="button"
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition',
          tab === 'historial' ? 'bg-white text-[#C56B86] shadow-sm' : 'text-gray-500',
        ]"
        @click="tab = 'historial'"
      >
        Historial
      </button>
    </div>

    <div v-if="tab === 'venta'" class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div class="space-y-5">
        <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
          <div class="flex items-center gap-2">
            <QrCodeIcon class="h-5 w-5 text-[#C56B86]" />
            <h2 class="font-semibold text-gray-900">Código de barras</h2>
          </div>

          <form class="mt-4 flex flex-col gap-3 sm:flex-row" @submit.prevent="scanCode">
            <input
              v-model="scannerCode"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="Escanea o escribe el código..."
              class="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />

            <BaseButton type="submit">
              <ArrowRightIcon class="h-4 w-4" />
              Agregar
            </BaseButton>
          </form>

          <p v-if="scannerMessage" class="mt-3 text-sm text-gray-500">
            {{ scannerMessage }}
          </p>
        </div>

        <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
          <div class="flex items-center gap-2">
            <MagnifyingGlassIcon class="h-5 w-5 text-[#C56B86]" />
            <h2 class="font-semibold text-gray-900">Buscar variantes</h2>
          </div>

          <div class="mt-4">
            <SearchBar
              v-model="search"
              placeholder="Buscar por producto, variante, SKU o código..."
            />
          </div>

          <div class="mt-5 overflow-x-auto">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="border-y border-gray-200 bg-gray-50">
                <tr class="text-xs font-semibold uppercase text-gray-500">
                  <th class="px-4 py-3">Producto</th>
                  <th class="px-4 py-3">Variante</th>
                  <th class="px-4 py-3">SKU</th>
                  <th class="px-4 py-3">Precio</th>
                  <th class="px-4 py-3">Stock</th>
                  <th class="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="variante in filteredVariants"
                  :key="variante.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-4 py-4 font-medium text-gray-900">
                    {{ variante.producto }}
                  </td>
                  <td class="px-4 py-4 text-gray-600">{{ variante.variante }}</td>
                  <td class="px-4 py-4 text-gray-600">{{ variante.sku }}</td>
                  <td class="px-4 py-4 font-semibold text-gray-900">
                    {{ formatCurrency(displayPrice(variante)) }}
                  </td>
                  <td class="px-4 py-4">
                    <StatusChip
                      :status="
                        variante.stock <= 0 ? 'danger' : variante.stock <= 5 ? 'warning' : 'success'
                      "
                      :label="variante.stock <= 0 ? 'Agotado' : `${variante.stock} disponibles`"
                    />
                  </td>
                  <td class="px-4 py-4 text-right">
                    <BaseButton
                      variant="secondary"
                      :disabled="variante.stock <= 0"
                      @click="addVariant(variante)"
                    >
                      Agregar
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside class="space-y-5">
        <VentaCarrito
          :items="items"
          :tipo-precio="tipoPrecio"
          @increment="carrito.incrementar"
          @decrement="carrito.disminuir"
          @remove="carrito.eliminar"
          @clear="carrito.vaciar"
        />

        <ResumenVenta
          :tipo-precio="tipoPrecio"
          :descuento="descuentoPorcentaje"
          :subtotal="subtotal"
          :descuento-monto="descuentoMonto"
          :iva="iva"
          :total="total"
          :total-articulos="totalArticulos"
          @update:tipo-precio="setPriceType"
          @update:descuento="setDiscount"
        >
          <BaseButton class="mt-5 w-full" :disabled="!items.length" @click="openPayment">
            <ShoppingCartIcon class="h-5 w-5" />
            Cobrar {{ formatCurrency(total) }}
          </BaseButton>
        </ResumenVenta>
      </aside>
    </div>

    <HistorialVentas v-else :ventas="ventas" @view="showTicket" @reprint="showTicket" />

    <BaseModal :open="paymentOpen" title="Cobrar venta" max-width="lg" @close="paymentOpen = false">
      <MetodoPago v-model="paymentMethod" v-model:recibido="received" :total="total" />

      <p v-if="paymentError" class="mt-4 text-sm text-red-500">
        {{ paymentError }}
      </p>

      <div class="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
        <BaseButton variant="secondary" @click="paymentOpen = false"> Cancelar </BaseButton>

        <BaseButton @click="confirmPayment"> Confirmar venta </BaseButton>
      </div>
    </BaseModal>

    <BaseModal
      :open="ticketOpen"
      title="Ticket de venta"
      max-width="md"
      @close="ticketOpen = false"
    >
      <TicketPreview v-if="selectedSale" :venta="selectedSale" />
    </BaseModal>
  </section>
</template>
