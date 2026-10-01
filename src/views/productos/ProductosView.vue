<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

import ProductoAccordion from './components/ProductoAccordion.vue'
import ProductoModal from './components/ProductoModal.vue'

import { getCategorias } from '@/api/categorias'
import {
  activarProducto,
  createProducto,
  desactivarProducto,
  getProductosPage,
  updateProducto,
} from '@/api/productos'
import {
  activarVariante,
  createVariante,
  desactivarVariante,
  getVariantesByProduct,
  getVariantesPage,
  updateVariante,
} from '@/api/variantes'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'
import { useAuthStore } from '@/stores/auth'

import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'
import type { ProductoFormData } from './components/ProductoForm.vue'
import type { VarianteFormData } from './components/VarianteForm.vue'

const authStore = useAuthStore()

const search = ref('')
const loading = ref(false)
const saving = ref(false)
const productos = ref<Producto[]>([])
const categorias = ref<Categoria[]>([])

const modalOpen = ref(false)
const modalMode = ref<'producto' | 'variante'>('producto')
const selectedProduct = ref<Producto | null>(null)
const selectedVariant = ref<Variante | null>(null)

const confirmOpen = ref(false)
const deleteType = ref<'producto' | 'variante' | null>(null)

const page = ref(1)
const totalPages = ref(1)
const count = ref(0)
let requestId = 0

async function loadData() {
  const currentRequest = ++requestId
  loading.value = !productos.value.length

  try {
    if (!categorias.value.length) categorias.value = await getCategorias()
    const result = await getProductosPage(page.value, 10, {
      activo: authStore.isAdmin ? 'todos' : undefined,
      search: search.value,
    })
    const variantGroups = await Promise.all(
      result.items.map((item) =>
        getVariantesByProduct(item.id, authStore.isAdmin ? 'todos' : undefined),
      ),
    )
    if (currentRequest !== requestId) return

    const categoryMap = new Map(categorias.value.map((item) => [item.id, item.nombre]))
    productos.value = result.items.map((item, index) => ({
      id: item.id,
      categoriaId: item.categoria,
      categoria: item.categoria_nombre ?? categoryMap.get(item.categoria) ?? 'Sin categoría',
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      activo: item.activo,
      fechaCreacion: item.fecha_creacion,
      fechaActualizacion: item.fecha_actualizacion,
      variantes: variantGroups[index] ?? [],
    }))
    count.value = result.count
    totalPages.value = result.totalPages
  } catch (error) {
    if (currentRequest === requestId)
      await showError(getFriendlyError(error, 'No fue posible cargar los productos.'))
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

function goToPage(value: number) {
  if (value === page.value) return
  page.value = value
  void loadData()
}

watch(search, (_value, _old, onCleanup) => {
  page.value = 1
  ++requestId
  const timer = setTimeout(() => void loadData(), 300)
  onCleanup(() => clearTimeout(timer))
})

function closeModal() {
  modalOpen.value = false
  selectedProduct.value = null
  selectedVariant.value = null
}

function newProduct() {
  selectedProduct.value = null
  selectedVariant.value = null
  modalMode.value = 'producto'
  modalOpen.value = true
}

function editProduct(producto: Producto) {
  selectedProduct.value = producto
  selectedVariant.value = null
  modalMode.value = 'producto'
  modalOpen.value = true
}

function addVariant(producto: Producto) {
  if (!producto.activo) return
  selectedProduct.value = producto
  selectedVariant.value = null
  modalMode.value = 'variante'
  modalOpen.value = true
}

function editVariant(variante: Variante) {
  selectedProduct.value =
    productos.value.find((item) => item.variantes.some((current) => current.id === variante.id)) ??
    null
  selectedVariant.value = variante
  modalMode.value = 'variante'
  modalOpen.value = true
}

function requestToggleProduct(producto: Producto) {
  if (!authStore.isAdmin) return
  selectedProduct.value = producto
  selectedVariant.value = null
  deleteType.value = 'producto'
  confirmOpen.value = true
}

function requestToggleVariant(variante: Variante) {
  if (!authStore.isAdmin) return
  selectedVariant.value = variante
  selectedProduct.value = null
  deleteType.value = 'variante'
  confirmOpen.value = true
}

async function saveProduct(data: ProductoFormData) {
  saving.value = true

  try {
    const payload = {
      categoria: data.categoriaId,
      nombre: data.nombre,
      descripcion: data.descripcion,
    }

    if (selectedProduct.value) {
      await updateProducto(selectedProduct.value.id, payload)
      await showSuccess('Producto actualizado correctamente.')
    } else {
      await createProducto(payload)
      await showSuccess('Producto creado correctamente.')
    }

    closeModal()
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible guardar el producto.'))
  } finally {
    saving.value = false
  }
}

async function saveVariant(data: VarianteFormData) {
  if (!selectedProduct.value) return

  saving.value = true

  try {
    const normalizedSku = data.sku.trim().toLowerCase()
    const normalizedBarcode = data.codigoBarras.trim().toLowerCase()
    const [skuMatches, barcodeMatches] = await Promise.all([
      getVariantesPage(1, 10, 'todos', { search: data.sku.trim() }),
      getVariantesPage(1, 10, 'todos', { search: data.codigoBarras.trim() }),
    ])
    if (skuMatches.items.some((item) => item.id !== selectedVariant.value?.id && item.sku.trim().toLowerCase() === normalizedSku)) {
      await showError('Ya existe una variante con ese SKU. Usa uno diferente.')
      return
    }
    if (barcodeMatches.items.some((item) => item.id !== selectedVariant.value?.id && item.codigoBarras.trim().toLowerCase() === normalizedBarcode)) {
      await showError('Ya existe una variante con ese código de barras. Usa uno diferente.')
      return
    }

    const payload = {
      producto: selectedProduct.value.id,
      codigo_barras: data.codigoBarras,
      sku: data.sku,
      nombre: data.nombre,
      stock_minimo: data.stockMinimo,
      costo: data.costo,
      precio_menudeo: data.precioMenudeo,
      precio_mayoreo: data.precioMayoreo,
      garantia_meses: data.garantiaMeses,
    }

    if (selectedVariant.value) {
      await updateVariante(selectedVariant.value.id, payload)
      await showSuccess('Variante actualizada correctamente.')
    } else {
      // El backend registra automáticamente el movimiento de inventario inicial.
      await createVariante({ ...payload, stock: data.stock })
      await showSuccess('Variante creada correctamente.')
    }

    closeModal()
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible guardar la variante.'))
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  saving.value = true

  try {
    if (deleteType.value === 'producto' && selectedProduct.value) {
      if (selectedProduct.value.activo) {
        await desactivarProducto(selectedProduct.value.id)
        await showSuccess('Producto desactivado correctamente.')
      } else {
        await activarProducto(selectedProduct.value.id)
        await showSuccess('Producto activado correctamente.')
      }
    }

    if (deleteType.value === 'variante' && selectedVariant.value) {
      if (selectedVariant.value.activo) {
        await desactivarVariante(selectedVariant.value.id)
        await showSuccess('Variante desactivada correctamente.')
      } else {
        await activarVariante(selectedVariant.value.id)
        await showSuccess('Variante activada correctamente.')
      }
    }

    confirmOpen.value = false
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible desactivar el registro.'))
  } finally {
    saving.value = false
    deleteType.value = null
    selectedProduct.value = null
    selectedVariant.value = null
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Productos' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Productos</h1>
        <p class="mt-1 text-sm text-gray-500">Administra los productos y sus variantes.</p>
      </div>

      <BaseButton :disabled="!categorias.some((item) => item.activo)" @click="newProduct">
        <PlusIcon class="h-4 w-4" />
        Nuevo producto
      </BaseButton>
    </div>

    <p
      v-if="!loading && !categorias.length"
      class="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700"
    >
      Primero registra una categoría para poder crear productos.
    </p>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o código..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando productos..." />

    <div v-else class="space-y-4">
      <ProductoAccordion
        v-for="producto in productos"
        :key="producto.id"
        :producto="producto"
        :can-toggle="authStore.isAdmin"
        @edit-product="editProduct"
        @toggle-product="requestToggleProduct"
        @add-variant="addVariant"
        @edit-variant="editVariant"
        @toggle-variant="requestToggleVariant"
      />

      <BasePagination
        v-if="count > 10"
        :page="page"
        :total-pages="totalPages"
        @change="goToPage"
      />

      <div
        v-if="!productos.length"
        class="rounded-2xl border border-[#ECECEC] bg-white p-12 text-center"
      >
        <p class="font-medium text-gray-900">No se encontraron productos</p>
        <p class="mt-1 text-sm text-gray-500">Registra un producto o intenta otra búsqueda.</p>
      </div>
    </div>

    <ProductoModal
      :open="modalOpen"
      :mode="modalMode"
      :categorias="categorias"
      :producto="selectedProduct"
      :variante="selectedVariant"
      @close="closeModal"
      @submit-product="saveProduct"
      @submit-variant="saveVariant"
    />

    <ConfirmDialog
      :open="confirmOpen"
      :title="
        deleteType === 'producto'
          ? selectedProduct?.activo
            ? 'Desactivar producto'
            : 'Activar producto'
          : selectedVariant?.activo
            ? 'Desactivar variante'
            : 'Activar variante'
      "
      :description="
        deleteType === 'producto'
          ? selectedProduct?.activo
            ? '¿Deseas desactivar este producto?'
            : '¿Deseas activar este producto?'
          : selectedVariant?.activo
            ? '¿Deseas desactivar esta variante?'
            : '¿Deseas activar esta variante?'
      "
      :confirm-text="
        (deleteType === 'producto' ? selectedProduct?.activo : selectedVariant?.activo)
          ? 'Desactivar'
          : 'Activar'
      "
      :loading="saving"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
