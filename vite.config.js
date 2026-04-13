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
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        // Don't preload heavy vendor chunks that portal homepage doesn't need
        return deps.filter(dep =>
          !dep.includes('vendor-supabase') &&
          !dep.includes('vendor-motion') &&
          !dep.includes('vendor-form') &&
          !dep.includes('vendor-ui-heavy')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Core UI — used on homepage (accordion for FAQ, slot/label for form)
          'vendor-ui-core': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-collapsible',
          ],
          // Heavy UI — used on inner pages / CRM only
          'vendor-ui-heavy': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
          ],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
