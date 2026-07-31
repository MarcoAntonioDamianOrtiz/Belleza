import type { Router } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    await authStore.initializeSession()

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    const guestOnly = to.matched.some((record) => record.meta.guestOnly)

    const adminOnly = to.matched.some((record) => record.meta.adminOnly)

    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    if (guestOnly && authStore.isAuthenticated) {
      return { name: 'dashboard' }
    }

    if (adminOnly && !authStore.isAdmin) {
      return { name: 'forbidden' }
    }

    return true
  })
}
