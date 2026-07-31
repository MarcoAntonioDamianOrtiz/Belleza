export interface Empresa {
  id: string
  nombre: string
  rfc: string
  direccion: string
  telefono: string
  logo: string
  mensajeTicket: string
  iva: number
  diasDevolucion: number
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface EmpresaPayload {
  nombre: string
  rfc?: string | null
  direccion: string
  telefono?: string | null
  logo?: string | null
  mensaje_ticket: string
  iva: number
  dias_devolucion: number
}

export interface PrinterSettings {
  nombreImpresora: string
  impresionAutomatica: boolean
}
