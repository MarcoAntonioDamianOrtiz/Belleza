import api from './axios'

import type { AuthUserResponse, LoginPayload, LoginResponse, RefreshResponse } from '@/types/auth'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login/', payload)
  return data
}

export async function refreshAccessToken(refresh: string): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/auth/refresh/', { refresh })
  return data
}

export async function getAuthenticatedUser(): Promise<AuthUserResponse> {
  const { data } = await api.get<AuthUserResponse>('/auth/me/')
  return data
}

export async function logout(refresh: string): Promise<void> {
  await api.post('/auth/logout/', { refresh })
}
