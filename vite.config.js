import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-accordion',
          ],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
