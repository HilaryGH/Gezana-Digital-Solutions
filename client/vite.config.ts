import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react', 'react-icons'],
          utils: ['axios', 'jwt-decode']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'axios', 
      'lucide-react', 
      'react-icons', 
      'react-router-dom',
      'jwt-decode'
    ]
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
