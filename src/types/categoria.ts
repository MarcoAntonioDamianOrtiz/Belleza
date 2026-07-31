export interface Categoria {
  id: string
  nombre: string
  descripcion: string
  activo: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface CategoriaPayload {
  nombre: string
  descripcion?: string
  activo?: boolean
}
