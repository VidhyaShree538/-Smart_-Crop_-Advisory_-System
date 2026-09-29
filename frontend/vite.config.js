import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to FastAPI backend during development
    proxy: {
      '/predict-crop': 'http://localhost:8000',
      '/predict-fertilizer': 'http://localhost:8000',
      '/weather': 'http://localhost:8000',
      '/history': 'http://localhost:8000',
      '/trends': 'http://localhost:8000',
      '/chat': 'http://localhost:8000',
    }
  }
})
