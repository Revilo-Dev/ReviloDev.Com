import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5001/demo-revilo/us-central1/dashboardApi', changeOrigin: true },
    },
  },
  build: {
    assetsDir: 'assets', // This tells Vite to put assets in a folder named 'assets' inside the output directory
    publicDir: 'src/assets', // Treat src/assets as public assets and copy them to the root of the output directory
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Ensure your entry point is correct
      },
    },
  },
})
