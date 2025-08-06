import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    force: true,
    disabled: false
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
