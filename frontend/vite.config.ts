import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },

  // Optimize for Three.js and web-ifc
  optimizeDeps: {
    include: ['three', 'web-ifc', '@react-three/fiber', '@react-three/drei'],
    esbuildOptions: {
      target: 'esnext',
    },
  },

  // Build optimizations
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js into its own chunk
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          // Separate web-ifc into its own chunk
          'web-ifc': ['web-ifc'],
          // React core
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Increase chunk size warning limit for 3D libraries
    chunkSizeWarningLimit: 1000,
  },

  // Server configuration
  server: {
    port: 5173,
    host: true,
    open: true,
  },

  // Worker configuration for web-ifc
  worker: {
    format: 'es',
  },
})
