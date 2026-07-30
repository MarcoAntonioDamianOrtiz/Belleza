export type RolUsuario = 'administrador' | 'empleado'

export interface Usuario {
  id: number
  nombre: string
  apellidos: string
  username: string
  correo: string
  rol: RolUsuario
  activo: boolean
  ultimoAcceso?: string
}

export interface UsuarioFormData {
  nombre: string
  apellidos: string
  username: string
  correo: string
  rol: RolUsuario
  activo: boolean
  password?: string
}
