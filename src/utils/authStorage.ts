import type { AuthUser } from '@/types/auth'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

function selectedStorage(): Storage {
  return localStorage.getItem(REFRESH_KEY) ? localStorage : sessionStorage
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY)
}

export function getStoredUser(): AuthUser | null {
  const value = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)

  if (!value) return null

  try {
    return JSON.parse(value) as AuthUser
  } catch {
    return null
  }
}

export function saveAuthSession(
  access: string,
  refresh: string,
  user: AuthUser,
  remember: boolean,
) {
  clearAuthSession()

  const storage = remember ? localStorage : sessionStorage

  storage.setItem(ACCESS_KEY, access)
  storage.setItem(REFRESH_KEY, refresh)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function updateAccessToken(access: string) {
  selectedStorage().setItem(ACCESS_KEY, access)
}

export function updateStoredUser(user: AuthUser) {
  selectedStorage().setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(ACCESS_KEY)
    storage.removeItem(REFRESH_KEY)
    storage.removeItem(USER_KEY)
  }
}
