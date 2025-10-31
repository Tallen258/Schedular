import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    host: true,        // expose LAN URLs
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // <-- change if your server uses another port
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true
  }
})
