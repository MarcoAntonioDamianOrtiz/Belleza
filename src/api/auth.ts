import api from './axios'

import type { AuthUser, LoginPayload } from '@/types/auth'

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    access: string
    refresh: string
    usuario: AuthUser
  }
}

export interface AuthMeResponse {
  success: boolean
  message?: string
  data: AuthUser
}

export interface LogoutResponse {
  success: boolean
  message?: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login/', payload)

  return data
}

export async function getAuthenticatedUser(): Promise<AuthMeResponse> {
  const { data } = await api.get<AuthMeResponse>('/auth/me/')

  return data
}

export async function logout(refresh: string): Promise<LogoutResponse> {
  const { data } = await api.post<LogoutResponse>('/auth/logout/', {
    refresh,
  })

  return data
}
