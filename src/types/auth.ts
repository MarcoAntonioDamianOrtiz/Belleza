import type { RolUsuario } from './usuario'

export interface UsuarioAutenticado {
  id: number
  nombre: string
  username: string
  rol: RolUsuario
}
