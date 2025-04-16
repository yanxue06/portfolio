import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Use standard sass implementation
        implementation: 'sass'
      }, 
      postcss: { 
        plugins: [
          tailwindcss(),
        ],
      }
    }
  },
  resolve: {
    // Prevent Node.js built-ins from being bundled
    browserField: true,
    mainFields: ['browser', 'module', 'main'],
    conditions: ['browser', 'default'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})