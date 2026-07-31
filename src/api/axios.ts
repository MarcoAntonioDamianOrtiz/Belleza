import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from '@/utils/authStorage'

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let refreshPromise: Promise<string> | null = null

async function obtainNewAccessToken(): Promise<string> {
  const refresh = getRefreshToken()

  if (!refresh) {
    throw new Error('Sesión no disponible')
  }

  const response = await axios.post<{ access: string }>(
    `${import.meta.env.VITE_API_URL}/auth/refresh/`,
    { refresh },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    },
  )

  updateAccessToken(response.data.access)

  return response.data.access
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401
    const isAuthRequest =
      request?.url?.includes('/auth/login/') || request?.url?.includes('/auth/refresh/')

    if (!isUnauthorized || !request || request._retry || isAuthRequest) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      refreshPromise ??= obtainNewAccessToken()

      const access = await refreshPromise
      request.headers.Authorization = `Bearer ${access}`

      return api(request)
    } catch {
      clearAuthSession()

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }

      return Promise.reject(error)
    } finally {
      refreshPromise = null
    }
  },
)

export default api
