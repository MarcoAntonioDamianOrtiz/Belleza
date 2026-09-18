import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  server: {
    allowedHosts: [
      'argued-con-care-seasons.trycloudflare.com',
      'weed-citations-foster-bracelet.trycloudflare.com' // <-- Added this host
    ],
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})