import api from './axios'

import { unwrapList } from '@/utils/apiResponse'

import type {
  Usuario,
  UsuarioCreatePayload,
  UsuarioRol,
  UsuarioUpdatePayload,
} from '@/types/usuario'

interface UsuarioApi {
  id: string
  nombre: string
  apellido: string
  usuario: string
  email: string
  rol: UsuarioRol
  rol_nombre: string
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
    rol: Number(item.rol) as UsuarioRol,
    rolNombre: item.rol_nombre,
    activo: item.activo,
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get('/usuarios/')
  return unwrapList<UsuarioApi>(data).map(mapUsuario)
}

export async function createUsuario(payload: UsuarioCreatePayload): Promise<void> {
  await api.post('/usuarios/', payload)
}

export async function updateUsuario(id: string, payload: UsuarioUpdatePayload): Promise<void> {
  await api.patch(`/usuarios/${id}/`, payload)
}

export async function deactivateUsuario(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}/`)
}

export async function activateUsuario(id: string): Promise<void> {
  await api.post(`/usuarios/${id}/activar/`)
}
