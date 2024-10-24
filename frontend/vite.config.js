import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/treatment-stages': {
        target: 'https://rilcet.onrender.com', // Backend server URL
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // If using HTTPS, set this to true
      },
      '/evaluation': {
        target: 'https://rilcet.onrender.com', // Backend server URL
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // If using HTTPS, set this to true
      },
    },
  },
})
