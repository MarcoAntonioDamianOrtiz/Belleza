<script setup lang="ts">
import { computed, ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ProductoAccordion from './components/ProductoAccordion.vue'
import ProductoModal from './components/ProductoModal.vue'

import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'
import type { ProductoFormData } from './components/ProductoForm.vue'
import type { VarianteFormData } from './components/VarianteForm.vue'

const search = ref('')

const productos = ref<Producto[]>([
  {
    id: 1,
    nombre: 'Labial Mate',
    categoria: 'Maquillaje',
    variantes: [
      {
        id: 1,
        nombre: 'Rojo Cereza',
        sku: 'LAB-MAT-ROJ',
        codigoBarras: '7501234567890',
        costo: 45,
        precioMenudeo: 85,
        precioMayoreo: 70,
        stock: 24,
        garantiaMeses: null,
      },
      {
        id: 2,
        nombre: 'Rosa Nude',
        sku: 'LAB-MAT-NUD',
        codigoBarras: '7501234567891',
        costo: 45,
        precioMenudeo: 85,
        precioMayoreo: 70,
        stock: 4,
        garantiaMeses: null,
      },
      {
        id: 3,
        nombre: 'Ciruela',
        sku: 'LAB-MAT-CIR',
        codigoBarras: '7501234567892',
        costo: 45,
        precioMenudeo: 85,
        precioMayoreo: 70,
        stock: 0,
        garantiaMeses: null,
      },
    ],
  },
])

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
  deleteType.value = 'variante'
  confirmOpen.value = true
}

function saveProduct(data: ProductoFormData) {
  if (selectedProduct.value) {
    Object.assign(selectedProduct.value, data)
  } else {
    productos.value.push({
      id: Date.now(),
      ...data,
      variantes: [],
    })
  }

  closeModal()
}

function saveVariant(data: VarianteFormData) {
  if (selectedVariant.value) {
    Object.assign(selectedVariant.value, data)
    closeModal()
    return
  }

  if (!selectedProduct.value) return

  selectedProduct.value.variantes.push({
    id: Date.now(),
    ...data,
  })

  closeModal()
}

function confirmDelete() {
  if (deleteType.value === 'producto' && selectedProduct.value) {
    productos.value = productos.value.filter(
      (producto) => producto.id !== selectedProduct.value?.id,
    )
  }

  if (deleteType.value === 'variante' && selectedVariant.value) {
    for (const producto of productos.value) {
      producto.variantes = producto.variantes.filter(
        (variante) => variante.id !== selectedVariant.value?.id,
      )
    }
  }

  confirmOpen.value = false
  deleteType.value = null
  selectedProduct.value = null
  selectedVariant.value = null
}

function cancelDelete() {
  confirmOpen.value = false
  deleteType.value = null
  selectedProduct.value = null
  selectedVariant.value = null
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Productos' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Productos</h1>

        <p class="mt-1 text-sm text-gray-500">Administra los productos y sus variantes.</p>
      </div>

      <BaseButton @click="newProduct">
        <PlusIcon class="h-4 w-4" />
        Nuevo producto
      </BaseButton>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o código..." />
    </div>

    <div class="space-y-4">
      <ProductoAccordion
        v-for="producto in filteredProducts"
        :key="producto.id"
        :producto="producto"
        @edit-product="editProduct"
        @delete-product="requestDeleteProduct"
        @add-variant="addVariant"
        @edit-variant="editVariant"
        @delete-variant="requestDeleteVariant"
      />

      <div
        v-if="!filteredProducts.length"
        class="rounded-2xl border border-[#ECECEC] bg-white p-12 text-center"
      >
        <p class="font-medium text-gray-900">No se encontraron productos</p>

        <p class="mt-1 text-sm text-gray-500">Intenta realizar otra búsqueda.</p>
      </div>
    </div>

    <ProductoModal
      :open="modalOpen"
      :mode="modalMode"
      :producto="selectedProduct"
      :variante="selectedVariant"
      @close="closeModal"
      @submit-product="saveProduct"
      @submit-variant="saveVariant"
    />

    <ConfirmDialog
      :open="confirmOpen"
      :title="deleteType === 'producto' ? 'Eliminar producto' : 'Eliminar variante'"
      :description="
        deleteType === 'producto'
          ? '¿Deseas eliminar este producto y sus variantes?'
          : '¿Deseas eliminar esta variante?'
      "
      confirm-text="Eliminar"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
