<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import { registrarEntrada } from '@/api/inventario'
import { createProducto, deleteProducto, getProductos, updateProducto } from '@/api/productos'
import { createVariante, deleteVariante, getVariantes, updateVariante } from '@/api/variantes'
import { getFriendlyError } from '@/utils/apiError'
import { useClientPagination } from '@/composables/useClientPagination'
import { showError, showSuccess } from '@/utils/notifications'

import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'
import type { ProductoFormData } from './components/ProductoForm.vue'
import type { VarianteFormData } from './components/VarianteForm.vue'

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

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return productos.value

  return productos.value.filter((producto) => {
    const productMatch =
      producto.nombre.toLowerCase().includes(term) ||
      producto.categoria.toLowerCase().includes(term)

    const variantMatch = producto.variantes.some((variante) =>
      [variante.nombre, variante.sku, variante.codigoBarras].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )

    return productMatch || variantMatch
  })
})

const { page, totalPages, paginatedItems, goToPage } = useClientPagination(filteredProducts, 10)

async function loadData() {
  loading.value = true

  try {
    const [categoryItems, productItems, variantItems] = await Promise.all([
      getCategorias(),
      getProductos(),
      getVariantes(),
    ])

    categorias.value = categoryItems

    const categoryMap = new Map(categoryItems.map((item) => [item.id, item.nombre]))

    productos.value = productItems.map((item) => ({
      id: item.id,
      categoriaId: item.categoria,
      categoria: categoryMap.get(item.categoria) ?? 'Sin categoría',
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      activo: item.activo,
      fechaCreacion: item.fecha_creacion,
      fechaActualizacion: item.fecha_actualizacion,
      variantes: variantItems.filter((variante) => variante.productoId === item.id),
    }))
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar los productos.'))
  } finally {
    loading.value = false
  }
}

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

function requestDeleteProduct(producto: Producto) {
  selectedProduct.value = producto
  selectedVariant.value = null
  deleteType.value = 'producto'
  confirmOpen.value = true
}

function requestDeleteVariant(variante: Variante) {
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
      activo: true,
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
    const currentVariants = productos.value.flatMap((producto) => producto.variantes)
    const normalizedSku = data.sku.trim().toLowerCase()
    const normalizedBarcode = data.codigoBarras.trim().toLowerCase()

    const duplicateSku = currentVariants.find(
      (variante) =>
        variante.id !== selectedVariant.value?.id &&
        variante.sku.trim().toLowerCase() === normalizedSku,
    )

    if (duplicateSku) {
      await showError('Ya existe una variante con ese SKU. Usa uno diferente.')
      return
    }

    const duplicateBarcode = currentVariants.find(
      (variante) =>
        variante.id !== selectedVariant.value?.id &&
        variante.codigoBarras.trim().toLowerCase() === normalizedBarcode,
    )

    if (duplicateBarcode) {
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
      activo: true,
    }

    if (selectedVariant.value) {
      await updateVariante(selectedVariant.value.id, payload)
      await showSuccess('Variante actualizada correctamente.')
    } else {
      const createdVariant = await createVariante(payload)

      if (data.stock > 0) {
        try {
          await registrarEntrada({
            variante_id: createdVariant.id,
            cantidad: data.stock,
            observaciones: 'Stock inicial de la variante.',
          })
        } catch {
          closeModal()
          await loadData()
          await showError(
            'La variante se creó, pero no fue posible registrar el stock inicial. Puedes agregarlo desde Inventario.',
          )
          return
        }
      }

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
      await deleteProducto(selectedProduct.value.id)
      await showSuccess('Producto desactivado correctamente.')
    }

    if (deleteType.value === 'variante' && selectedVariant.value) {
      await deleteVariante(selectedVariant.value.id)
      await showSuccess('Variante desactivada correctamente.')
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

      <BaseButton :disabled="!categorias.length" @click="newProduct">
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
        v-for="producto in paginatedItems"
        :key="producto.id"
        :producto="producto"
        @edit-product="editProduct"
        @delete-product="requestDeleteProduct"
        @add-variant="addVariant"
        @edit-variant="editVariant"
        @delete-variant="requestDeleteVariant"
      />

      <BasePagination
        v-if="filteredProducts.length > 10"
        :page="page"
        :total-pages="totalPages"
        @change="goToPage"
      />

      <div
        v-if="!filteredProducts.length"
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
      :title="deleteType === 'producto' ? 'Desactivar producto' : 'Desactivar variante'"
      :description="
        deleteType === 'producto'
          ? '¿Deseas desactivar este producto?'
          : '¿Deseas desactivar esta variante?'
      "
      confirm-text="Desactivar"
      :loading="saving"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
