export interface AuthUser {
  id: string
  nombre: string
  rol: 1 | 2
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
