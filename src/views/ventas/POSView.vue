<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import HistorialVentas from './components/HistorialVentas.vue'
import MetodoPago from './components/MetodoPago.vue'
import ResumenVenta from './components/ResumenVenta.vue'
import TicketPreview from './components/TicketPreview.vue'
import VentaCarrito from './components/VentaCarrito.vue'

import { getCajasActivas } from '@/api/cajas'
import { getEmpresa } from '@/api/empresa'
import { getMetodosPagoActivos } from '@/api/metodosPago'
import { getProductos } from '@/api/productos'
import { getVarianteByCode, getVariantes } from '@/api/variantes'
import {
  cancelVenta,
  createVenta,
  getTicketVenta,
  getVenta,
  getVentas,
  reprintTicketVenta,
} from '@/api/ventas'
import { useAuthStore } from '@/stores/auth'
import { useCarritoStore } from '@/stores/carrito'
import { formatCurrency } from '@/utils/formatCurrency'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { Caja } from '@/types/caja'
import type { Empresa } from '@/types/empresa'
import type { MetodoPagoCatalogo } from '@/types/metodoPago'
import type { TicketEmpresa, VarianteVenta, VentaDetalle, VentaResumen } from '@/types/venta'

type PosTab = 'venta' | 'historial'

const authStore = useAuthStore()
const carrito = useCarritoStore()

const { items, descuento, subtotal, descuentoAplicado, iva, total, totalArticulos } =
  storeToRefs(carrito)

const tab = ref<PosTab>('venta')
const search = ref('')
const scannerCode = ref('')
const scannerMessage = ref('')
const loading = ref(false)
const saving = ref(false)

const paymentOpen = ref(false)
const ticketOpen = ref(false)
const cancelOpen = ref(false)

const selectedSale = ref<VentaDetalle | null>(null)
const ticketEmpresa = ref<TicketEmpresa | null>(null)
const saleToCancel = ref<VentaResumen | null>(null)

const paymentMethodId = ref('')
const selectedCajaId = ref('')
const received = ref(0)
const paymentError = ref('')

const variantes = ref<VarianteVenta[]>([])
const ventas = ref<VentaResumen[]>([])
const metodos = ref<MetodoPagoCatalogo[]>([])
const cajas = ref<Caja[]>([])
const empresa = ref<Empresa | null>(null)

const openBoxes = computed(() =>
  cajas.value.filter((item) => item.activa && item.estado === 'ABIERTA'),
)

const cajaOptions = computed(() =>
  openBoxes.value.map((item) => ({
    label: item.nombre,
    value: item.id,
  })),
)

const selectedPaymentMethod = computed(() =>
  metodos.value.find((item) => item.id === paymentMethodId.value),
)

const isCash = computed(() =>
  selectedPaymentMethod.value?.nombre.toLowerCase().includes('efectivo'),
)

const filteredVariants = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return variantes.value

  return variantes.value.filter((item) =>
    [item.producto, item.variante, item.sku, item.codigoBarras].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

async function loadData() {
  loading.value = true

  try {
    const [products, variants, paymentMethods, boxes, sales] = await Promise.all([
      getProductos(),
      getVariantes(),
      getMetodosPagoActivos(),
      getCajasActivas(),
      getVentas(),
    ])

    const productMap = new Map(products.map((item) => [item.id, item.nombre]))

    variantes.value = variants.map((item) => ({
      id: item.id,
      producto: productMap.get(item.productoId) ?? 'Producto',
      variante: item.nombre,
      sku: item.sku,
      codigoBarras: item.codigoBarras,
      stock: item.stock,
      precioMenudeo: item.precioMenudeo,
      precioMayoreo: item.precioMayoreo,
    }))

    metodos.value = paymentMethods
    cajas.value = boxes
    ventas.value = sales

    if (!paymentMethodId.value && paymentMethods[0]) {
      paymentMethodId.value = paymentMethods[0].id
    }

    const firstOpenBox = boxes.find((item) => item.estado === 'ABIERTA')

    if (!selectedCajaId.value && firstOpenBox) {
      selectedCajaId.value = firstOpenBox.id
    }

    try {
      empresa.value = await getEmpresa()
      carrito.ivaPorcentaje = empresa.value.iva
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        empresa.value = null
        carrito.ivaPorcentaje = 0
      } else {
        throw error
      }
    }
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar la información de ventas.'))
  } finally {
    loading.value = false
  }
}

function addVariant(variante: VarianteVenta) {
  carrito.agregar(variante)
}

async function scanCode() {
  const code = scannerCode.value.trim()

  if (!code) return

  scannerMessage.value = ''

  try {
    const item = await getVarianteByCode(code)
    const product = await getProductos()
    const productName =
      product.find((current) => current.id === item.productoId)?.nombre ?? 'Producto'

    const variante: VarianteVenta = {
      id: item.id,
      producto: productName,
      variante: item.nombre,
      sku: item.sku,
      codigoBarras: item.codigoBarras,
      stock: item.stock,
      precioMenudeo: item.precioMenudeo,
      precioMayoreo: item.precioMayoreo,
    }

    if (variante.stock <= 0) {
      scannerMessage.value = 'La variante está agotada.'
      return
    }

    carrito.agregar(variante)
    scannerCode.value = ''
    scannerMessage.value = `${variante.producto} - ${variante.variante} agregado al carrito.`
  } catch (error) {
    scannerMessage.value = getFriendlyError(error, 'No se encontró una variante con ese código.')
  }
}

function setDiscount(value: number) {
  descuento.value = Math.max(0, Number(value) || 0)
}

function openPayment() {
  paymentError.value = ''

  if (!items.value.length) return

  if (!empresa.value) {
    paymentError.value = 'Primero registra la información del negocio en Configuración.'
    paymentOpen.value = true
    return
  }

  if (!openBoxes.value.length) {
    paymentError.value = 'Primero abre una caja para registrar la venta.'
    paymentOpen.value = true
    return
  }

  if (!metodos.value.length) {
    paymentError.value = 'No hay métodos de pago disponibles.'
    paymentOpen.value = true
    return
  }

  paymentMethodId.value ||= metodos.value[0]?.id ?? ''
  selectedCajaId.value ||= openBoxes.value[0]?.id ?? ''
  received.value = 0
  paymentOpen.value = true
}

async function loadTicket(saleId: string, mode: 'generate' | 'reprint' | 'detail' = 'generate') {
  if (mode === 'detail') {
    selectedSale.value = await getVenta(saleId)
    ticketEmpresa.value = empresa.value
    return
  }

  try {
    const result =
      mode === 'reprint' ? await reprintTicketVenta(saleId) : await getTicketVenta(saleId)

    selectedSale.value = result.venta
    ticketEmpresa.value = result.empresa ?? empresa.value
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 405)
    ) {
      selectedSale.value = await getVenta(saleId)
      ticketEmpresa.value = empresa.value
      return
    }

    throw error
  }
}

async function confirmPayment() {
  paymentError.value = ''

  if (!selectedCajaId.value) {
    paymentError.value = 'Selecciona una caja abierta.'
    return
  }

  if (!paymentMethodId.value) {
    paymentError.value = 'Selecciona un método de pago.'
    return
  }

  if (isCash.value && received.value < total.value) {
    paymentError.value = 'El efectivo recibido es menor que el total.'
    return
  }

  saving.value = true

  try {
    const result = await createVenta({
      caja_id: selectedCajaId.value,
      metodo_pago_id: paymentMethodId.value,
      descuento: descuentoAplicado.value,
      productos: items.value.map((item) => ({
        variante_id: item.variante.id,
        cantidad: item.cantidad,
      })),
    })

    await loadTicket(result.venta_id)
    paymentOpen.value = false
    ticketOpen.value = true
    carrito.vaciar()

    await showSuccess(result.message)
    await loadData()
  } catch (error) {
    paymentError.value = getFriendlyError(error, 'No fue posible registrar la venta.')
  } finally {
    saving.value = false
  }
}

async function showTicket(venta: VentaResumen) {
  loading.value = true

  try {
    await loadTicket(venta.id, 'detail')
    ticketOpen.value = true
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar la venta.'))
  } finally {
    loading.value = false
  }
}

async function reprintTicket(venta: VentaResumen) {
  loading.value = true

  try {
    await loadTicket(venta.id, 'reprint')
    ticketOpen.value = true
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible preparar el ticket.'))
  } finally {
    loading.value = false
  }
}

function requestCancel(venta: VentaResumen) {
  saleToCancel.value = venta
  cancelOpen.value = true
}

async function confirmCancel() {
  if (!saleToCancel.value) return

  saving.value = true

  try {
    const message = await cancelVenta(saleToCancel.value.id)
    cancelOpen.value = false
    await showSuccess(message)
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cancelar la venta.'))
  } finally {
    saving.value = false
    saleToCancel.value = null
  }
}

onMounted(loadData)
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

    <BaseLoader v-if="loading" text="Cargando ventas..." />

    <div v-else-if="tab === 'venta'" class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
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
              class="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
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
            <table class="mobile-stack-table w-full min-w-[720px] text-left text-sm">
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
                  class="interactive-lift-row"
                >
                  <td data-label="Producto" class="px-4 py-4 font-medium text-gray-900">
                    {{ variante.producto }}
                  </td>
                  <td data-label="Variante" class="px-4 py-4 text-gray-600">
                    {{ variante.variante }}
                  </td>
                  <td data-label="SKU" class="px-4 py-4 text-gray-600">{{ variante.sku }}</td>
                  <td data-label="Precio" class="px-4 py-4 font-semibold text-gray-900">
                    {{ formatCurrency(variante.precioMenudeo) }}
                  </td>
                  <td data-label="Stock" class="px-4 py-4">
                    <StatusChip
                      :status="
                        variante.stock <= 0 ? 'danger' : variante.stock <= 5 ? 'warning' : 'success'
                      "
                      :label="variante.stock <= 0 ? 'Agotado' : `${variante.stock} disponibles`"
                    />
                  </td>
                  <td data-label="Acciones" class="px-4 py-4 text-right">
                    <BaseButton
                      variant="secondary"
                      :disabled="variante.stock <= 0"
                      @click="addVariant(variante)"
                    >
                      Agregar
                    </BaseButton>
                  </td>
                </tr>

                <tr v-if="!filteredVariants.length">
                  <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                    No se encontraron variantes.
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
          @increment="carrito.incrementar"
          @decrement="carrito.disminuir"
          @remove="carrito.eliminar"
          @clear="carrito.vaciar"
        />

        <ResumenVenta
          :descuento="descuento"
          :subtotal="subtotal"
          :descuento-aplicado="descuentoAplicado"
          :iva="iva"
          :total="total"
          :total-articulos="totalArticulos"
          @update:descuento="setDiscount"
        >
          <BaseButton class="mt-5 w-full" :disabled="!items.length" @click="openPayment">
            <ShoppingCartIcon class="h-5 w-5" />
            Cobrar {{ formatCurrency(total) }}
          </BaseButton>
        </ResumenVenta>
      </aside>
    </div>

    <HistorialVentas
      v-else-if="!loading"
      :ventas="ventas"
      :can-cancel="authStore.isAdmin"
      @view="showTicket"
      @reprint="reprintTicket"
      @cancel="requestCancel"
    />

    <BaseModal :open="paymentOpen" title="Cobrar venta" max-width="lg" @close="paymentOpen = false">
      <div class="space-y-5">
        <BaseSelect
          v-model="selectedCajaId"
          label="Caja"
          :options="cajaOptions"
          placeholder="Selecciona una caja abierta"
          required
        />

        <MetodoPago
          v-model="paymentMethodId"
          v-model:recibido="received"
          :metodos="metodos"
          :total="total"
        />
      </div>

      <p v-if="paymentError" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {{ paymentError }}
      </p>

      <div class="tablet-action-stack mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
        <BaseButton variant="secondary" @click="paymentOpen = false"> Cancelar </BaseButton>
        <BaseButton :loading="saving" @click="confirmPayment"> Confirmar venta </BaseButton>
      </div>
    </BaseModal>

    <BaseModal
      :open="ticketOpen"
      title="Ticket de venta"
      max-width="md"
      @close="ticketOpen = false"
    >
      <TicketPreview
        v-if="selectedSale"
        :venta="selectedSale"
        :empresa="ticketEmpresa ?? empresa"
      />
    </BaseModal>

    <ConfirmDialog
      :open="cancelOpen"
      title="Cancelar venta"
      :description="`¿Deseas cancelar la venta ${saleToCancel?.folio ?? ''}? El stock será reintegrado.`"
      confirm-text="Cancelar venta"
      :loading="saving"
      @confirm="confirmCancel"
      @cancel="cancelOpen = false"
    />
  </section>
</template>
