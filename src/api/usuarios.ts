import api from './axios'

import type { Usuario, UsuarioCreatePayload, UsuarioUpdatePayload } from '@/types/usuario'

interface UsuarioApi {
  id: string
  nombre: string
  apellido: string
  usuario: string
  email: string
  rol: 1 | 2
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

function mapUsuario(item: UsuarioApi): Usuario {
  return {
    id: item.id,
    nombre: item.nombre,
    apellido: item.apellido,
    usuario: item.usuario,
    email: item.email,
    rol: item.rol,
    activo: item.activo,
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<UsuarioApi[]>('/usuarios/')
  return data.map(mapUsuario)
}

export async function createUsuario(payload: UsuarioCreatePayload): Promise<Usuario> {
  const { data } = await api.post<UsuarioApi>('/usuarios/', payload)
  return mapUsuario(data)
}

export async function updateUsuario(id: string, payload: UsuarioUpdatePayload): Promise<Usuario> {
  const { data } = await api.patch<UsuarioApi>(`/usuarios/${id}/`, payload)
  return mapUsuario(data)
}

export async function deleteUsuario(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}/`)
}
