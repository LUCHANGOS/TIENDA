import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config: any = {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/storage']
          }
        }
      }
    },
    server: {
      port: 3000,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8'
      }
    },
    preview: {
      port: 4173,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8'
      }
    }
  }

  if (command === 'serve') {
    // Desarrollo local
    config.base = '/'
  } else {
    // Producción (GitHub Pages)
    config.base = '/TIENDA/'
  }

  return config
})
