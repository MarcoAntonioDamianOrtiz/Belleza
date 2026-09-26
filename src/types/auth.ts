export type AuthRole = 0 | 1 | 2

export interface AuthUser {
  id: string
  nombre: string
  apellido?: string
  usuario?: string
  email?: string
  activo?: boolean
  rol: AuthRole
}

export interface LoginPayload {
  usuario: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    access: string
    refresh: string
    usuario: AuthUser
  }
}

export interface AuthUserResponse {
  success: boolean
  data: AuthUser
}

export interface RefreshResponse {
  access: string
}
