// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // ✅ Babel-Optimierungen für Production
      babel: {
        plugins: [
          // Entfernt console.log in Production
          process.env.NODE_ENV === 'production' && [
            'transform-remove-console',
            { exclude: ['error', 'warn'] }
          ]
        ].filter(Boolean)
      }
    })
  ],

  // 🚀 Build-Optimierungen
  build: {
    // Größere Chunk-Größe für bessere Compression
    chunkSizeWarningLimit: 1000,
    
    // CSS Code-Splitting deaktivieren für kleinere Bundles
    cssCodeSplit: false,
    
    // Source Maps nur in Development
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minification optimieren
    minify: 'terser',
    terserOptions: {
      compress: {
        // Entfernt console.log automatisch
        drop_console: true,
        drop_debugger: true,
        // Entfernt ungenutzte Code-Pfade
        dead_code: true,
        // Optimiert Conditionals
        conditionals: true
      },
      mangle: {
        // Verkürzt Variablen-Namen
        toplevel: true
      }
    },

    // 📦 Rollup-Optimierungen für Bundle-Splitting
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Intelligentes Chunk-Splitting
        manualChunks: {
          // React-Core separat
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          
          // Game-Engines separat (große Files)
          'games': [
            './src/Tetris/Tetris.tsx',
            './src/Game_SPACESHIPS/SpaceshipsGame.tsx'
          ],
          
          // Videos separat für lazy loading
          'media': [
            './public/Videos/tetris.mp4',
            './public/Videos/sonic-preview.mp4',
            './public/Videos/SpaceShip.mp4',
            './public/Videos/Snake.mp4'
          ]
        },
        
        // Optimierte Asset-Namen
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(assetInfo.name)) {
            return `media/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(assetInfo.name)) {
            return `img/[name]-[hash][extname]`;
          }
          if (ext === 'css') {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  },

  // 🔧 Development Server Optimierungen
  server: {
    // HTTP/2 für bessere Performance
    https: false,
    
    // Optimierte HMR
    hmr: {
      overlay: false // Weniger DOM-Updates
    },
    
    // Verbesserte Proxy-Konfiguration
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // ✅ Entfernt unnötige rewrite-Funktion
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxy request:', req.method, req.url);
          });
        }
      }
    }
  },

  // ⚡ Asset-Optimierungen
  assetsInclude: [
    // Video-Files explizit als Assets definieren
    '**/*.mp4',
    '**/*.webm',
    '**/*.ogg'
  ],

  // 🎮 Game-spezifische Optimierungen
  define: {
    // Globale Performance-Flags
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
    
    // Entfernt Debug-Code in Production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },

  // 🚀 Dependency Pre-bundling Optimierungen
  optimizeDeps: {
    // Wichtige Dependencies pre-bundlen
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    
    // Exclude problematische Modules
    exclude: [
      // Große Video-Files nicht pre-bundlen
    ]
  },

  // 📁 Resolve-Optimierungen
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@components': resolve(__dirname, 'src/components'),
      '@games': resolve(__dirname, 'src'),
      '@videos': resolve(__dirname, 'public/Videos')
    }
  },

  // 🗜️ CSS-Optimierungen
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Falls du SCSS verwendest
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
