import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Use standard sass implementation
        implementation: 'sass'
      }
    }
  },
  resolve: {
    // Prevent Node.js built-ins from being bundled
    browserField: true,
    mainFields: ['browser', 'module', 'main'],
    conditions: ['browser', 'default']
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'animation-vendor': ['framer-motion'],
          'icons-vendor': ['@mui/icons-material', 'react-icons'],
          'utils-vendor': ['react-lazy-load-image-component', 'typeit-react']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification using esbuild (built-in, faster than terser)
    minify: 'esbuild',
    // Remove console and debugger in production
    esbuild: {
      drop: ['console', 'debugger']
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})