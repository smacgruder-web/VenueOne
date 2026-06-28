import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
    open: true,
  },
})