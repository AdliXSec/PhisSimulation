import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'framer';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three';
            }
            if (id.includes('@xyflow')) {
              return 'xyflow';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf')) {
              return 'pdf';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
