import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/**
 * vite.config.ts — إعداد Vite لمشروع B-Shop V2.
 * - alias @/ بيشاور على src/ (نفس عُرف المشروع الأصلي في Nuxt).
 * - allowedHosts مفتوح في التطوير عشان روابط المعاينة والبروكسي.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
