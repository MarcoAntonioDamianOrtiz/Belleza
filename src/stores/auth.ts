import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getAuthenticatedUser, login, logout } from '@/api/auth'

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveAuthSession,
  updateStoredUser,
} from '@/utils/authStorage'

import type { AuthUser, LoginPayload } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(getStoredUser())
  const accessToken = ref<string | null>(getAccessToken())
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isAdmin = computed(() => user.value?.rol === 1)

  async function signIn(payload: LoginPayload, remember = false) {
    loading.value = true

    try {
      const response = await login(payload)

      user.value = response.data.usuario
      accessToken.value = response.data.access

      saveAuthSession(
        response.data.access,
        response.data.refresh,
        response.data.usuario,
        remember,
      )

      return response
    } finally {
      loading.value = false
    }
  }

  async function loadUser() {
    const response = await getAuthenticatedUser()

    user.value = response.data
    updateStoredUser(response.data)

    return response.data
  }

  async function initializeSession() {
    if (initialized.value) return

    try {
      accessToken.value = getAccessToken()

      if (accessToken.value) {
        await loadUser()
      }
    } catch {
      clearAuthSession()
      accessToken.value = null
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function signOut() {
    const refresh = getRefreshToken()

    try {
      if (refresh) {
        await logout(refresh)
      }
    } finally {
      clearAuthSession()
      accessToken.value = null
      user.value = null
      initialized.value = true
    }
  }

  return {
    user,
    accessToken,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    signIn,
    loadUser,
    initializeSession,
    signOut,
  }
})
