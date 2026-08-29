import api from './axios'

import { unwrapList } from '@/utils/apiResponse'

import type { Usuario, UsuarioCreatePayload } from '@/types/usuario'

interface UsuarioApi {
  nombre: string
  apellido: string
  usuario: string
  email: string
}

function mapUsuario(item: UsuarioApi): Usuario {
  return {
    nombre: item.nombre,
    apellido: item.apellido,
    usuario: item.usuario,
    email: item.email,
  }
}

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get('/usuarios/')
  return unwrapList<UsuarioApi>(data).map(mapUsuario)
}

export async function createUsuario(payload: UsuarioCreatePayload): Promise<void> {
  await api.post('/usuarios/', payload)
}

export async function createAdministrador(payload: UsuarioCreatePayload): Promise<void> {
  await api.post('/usuarios/crear-admin/', payload)
}
