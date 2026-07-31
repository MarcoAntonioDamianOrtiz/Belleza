export type RolUsuario = 1 | 2

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  usuario: string
  email: string
  rol: RolUsuario
  activo: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface UsuarioCreatePayload {
  nombre: string
  apellido: string
  usuario: string
  email: string
  password: string
  rol: RolUsuario
  activo: boolean
}

export interface UsuarioUpdatePayload {
  nombre: string
  apellido: string
  usuario: string
  email: string
  rol: RolUsuario
  activo: boolean
}

export interface UsuarioFormData {
  nombre: string
  apellido: string
  usuario: string
  email: string
  rol: RolUsuario
  activo: boolean
  password?: string
}
