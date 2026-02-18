
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'zustand', 'react-hook-form'],
          ui: ['lucide-react', 'recharts', 'react-lazy-load-image-component'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          utils: ['date-fns', 'papaparse', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'react-hook-form']
  }
});
