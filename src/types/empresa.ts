export interface EmpresaConfig {
  nombre: string
  rfc: string
  direccion: string
  telefono: string
  correo: string
  iva: number
  diasDevolucion: number
  mensajeTicket: string
  nombreImpresora: string
  impresionAutomatica: boolean
  logoUrl?: string
}
