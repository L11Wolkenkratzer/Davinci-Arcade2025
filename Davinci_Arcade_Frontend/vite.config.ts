// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // optional, aber häufig nützlich: automatische Vendor-Trennung
    splitVendorChunkPlugin(),
  ],

  /* ---------  DEV-SERVER  --------- */
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, '/api'),
      },
    },
  },

  /* ---------  BUILD-OPTIMIERUNG  --------- */
  build: {
    /* 1. moderner JS-Output  */
    target: 'es2022',        // spart Polyfills, kleineres Bundle

    /* 2. aggressiveres Minifying  */
    minify: 'terser',        // langsamer als esbuild, aber komprimiert besser

    /* 3. Chunks manuell aufteilen  */
    rollupOptions: {
      output: {
        manualChunks: {
          /* Dritt-Libs, die nur geladen werden, wenn sie wirklich gebraucht werden */
          react: ['react', 'react-dom'],
          phaser: ['phaser'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})
