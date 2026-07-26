<script setup lang="ts">

</script>

<template>
  <section>
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        Dashboard
      </h1>

      <p class="mt-1 text-sm text-gray-500">
        Resumen general del sistema
      </p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="item in ['Ventas de hoy', 'Ingresos', 'Stock bajo', 'Productos']"
        :key="item"
        class="rounded-2xl border border-[#ECECEC] bg-white p-6"
      >
        <p class="text-sm text-gray-500">
          {{ item }}
        </p>

        <p class="mt-3 text-2xl font-semibold text-gray-900">
          --
        </p>
      </div>
    </div>
  </section>
</template>

