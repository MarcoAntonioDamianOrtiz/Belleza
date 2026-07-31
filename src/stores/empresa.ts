import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { Empresa, PrinterSettings } from '@/types/empresa'

export const useEmpresaStore = defineStore('empresa', () => {
  const empresa = ref<Empresa | null>(null)
  const printerSettings = ref<PrinterSettings>({
    nombreImpresora: '',
    impresionAutomatica: false,
  })

  function setEmpresa(data: Empresa | null) {
    empresa.value = data
  }

  function setPrinterSettings(data: PrinterSettings) {
    printerSettings.value = { ...data }
  }

  function clearEmpresa() {
    empresa.value = null
  }

  return {
    empresa,
    printerSettings,
    setEmpresa,
    setPrinterSettings,
    clearEmpresa,
  }
})
