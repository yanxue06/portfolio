import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // only scan the site's own entry; otherwise the dev server crawls island/*.html too
  optimizeDeps: { entries: ['index.html'] },
})
