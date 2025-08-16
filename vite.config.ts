import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config: any = {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    server: {
      port: 3000,
    },
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
