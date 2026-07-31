import { createRouter, createWebHistory } from 'vue-router'

import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: {
        guestOnly: true,
      },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'ventas',
          name: 'ventas',
          component: () => import('@/views/ventas/POSView.vue'),
        },
        {
          path: 'productos',
          name: 'productos',
          component: () => import('@/views/productos/ProductosView.vue'),
        },
        {
          path: 'categorias',
          name: 'categorias',
          component: () => import('@/views/categorias/CategoriasView.vue'),
        },
        {
          path: 'inventario',
          name: 'inventario',
          component: () => import('@/views/inventario/InventarioView.vue'),
        },
        {
          path: 'inventario/entradas',
          name: 'inventario-entradas',
          component: () => import('@/views/inventario/EntradasView.vue'),
        },
        {
          path: 'inventario/salidas',
          name: 'inventario-salidas',
          component: () => import('@/views/inventario/SalidasView.vue'),
        },
        {
          path: 'inventario/ajustes',
          name: 'inventario-ajustes',
          component: () => import('@/views/inventario/AjustesView.vue'),
        },
        {
          path: 'inventario/historial',
          name: 'inventario-historial',
          component: () => import('@/views/inventario/HistorialView.vue'),
        },
        {
          path: 'caja',
          name: 'caja',
          component: () => import('@/views/cajas/CajaView.vue'),
        },
        {
          path: 'metodos-pago',
          name: 'metodos-pago',
          component: () => import('@/views/metodos-pago/MetodosPagoView.vue'),
          meta: {
            adminOnly: true,
          },
        },
        {
          path: 'garantias',
          name: 'garantias',
          component: () => import('@/views/garantias/GarantiasView.vue'),
        },
        {
          path: 'devoluciones',
          name: 'devoluciones',
          component: () => import('@/views/devoluciones/DevolucionesView.vue'),
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/views/usuarios/UsuariosView.vue'),
          meta: {
            adminOnly: true,
          },
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('@/views/reportes/ReportesView.vue'),
          meta: {
            adminOnly: true,
          },
        },
        {
          path: 'bitacora',
          name: 'bitacora',
          component: () => import('@/views/bitacora/BitacoraView.vue'),
          meta: {
            adminOnly: true,
          },
        },
        {
          path: 'configuracion',
          name: 'configuracion',
          component: () => import('@/views/empresa/EmpresaView.vue'),
          meta: {
            adminOnly: true,
          },
        },
      ],
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/views/errors/ForbiddenView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/errors/NotFoundView.vue'),
    },
  ],
})

setupRouterGuards(router)

export default router
