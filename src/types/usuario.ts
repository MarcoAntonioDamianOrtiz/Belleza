export interface Usuario {
  nombre: string
  apellido: string
  usuario: string
  email: string
}

export type UsuarioTipo = 'empleado' | 'admin'

export interface UsuarioCreatePayload {
  nombre: string
  apellido: string
  usuario: string
  email: string
  password: string
}

export interface UsuarioFormData extends UsuarioCreatePayload {
  tipo: UsuarioTipo
}
