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
  }
})