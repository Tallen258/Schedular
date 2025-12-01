import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    host: true,        // expose LAN URLs
    port: 5173,
    strictPort: true,
    open: false,       // disable auto-open in Docker
    proxy: {
      '/api': {
        target: 'http://server:3000', // Use Docker service name
        changeOrigin: true,
      }
    }
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true
  }
})
