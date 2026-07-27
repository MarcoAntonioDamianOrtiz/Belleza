<script setup lang="ts">
import { computed, ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/common/SearchBar.vue'

import ProductoAccordion from './components/ProductoAccordion.vue'

import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'

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

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return productos.value
  }

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

function newProduct() {
  console.log('Nuevo producto')
}

function editProduct(producto: Producto) {
  console.log('Editar producto', producto)
}

function deleteProduct(producto: Producto) {
  console.log('Eliminar producto', producto)
}

function addVariant(producto: Producto) {
  console.log('Agregar variante', producto)
}

function editVariant(variante: Variante) {
  console.log('Editar variante', variante)
}

function deleteVariant(variante: Variante) {
  console.log('Eliminar variante', variante)
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
        @delete-product="deleteProduct"
        @add-variant="addVariant"
        @edit-variant="editVariant"
        @delete-variant="deleteVariant"
      />

      <div
        v-if="!filteredProducts.length"
        class="rounded-2xl border border-[#ECECEC] bg-white p-12 text-center"
      >
        <p class="font-medium text-gray-900">No se encontraron productos</p>

        <p class="mt-1 text-sm text-gray-500">Intenta realizar otra búsqueda.</p>
      </div>
    </div>
  </section>
</template>
