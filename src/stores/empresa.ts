import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { EmpresaConfig } from '@/types/empresa'

const defaultConfig: EmpresaConfig = {
  nombre: 'Belleza',
  rfc: '',
  direccion: '',
  telefono: '',
  correo: '',
  iva: 16,
  diasDevolucion: 7,
  mensajeTicket: 'Gracias por su compra.',
  nombreImpresora: '',
  impresionAutomatica: false,
}

export const useEmpresaStore = defineStore('empresa', () => {
  const config = ref<EmpresaConfig>({ ...defaultConfig })

  function actualizar(data: EmpresaConfig) {
    config.value = { ...data }
  }

  return {
    config,
    actualizar,
  }
})
