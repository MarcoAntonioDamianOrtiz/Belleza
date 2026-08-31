export type UsuarioRol = 0 | 1 | 2

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  usuario: string
  email: string
  rol: UsuarioRol
  rolNombre: string
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
}

export interface UsuarioUpdatePayload {
  nombre: string
  apellido: string
  usuario: string
  email: string
  password?: string
}

export interface UsuarioFormData {
  nombre: string
  apellido: string
  usuario: string
  email: string
  password: string
}
