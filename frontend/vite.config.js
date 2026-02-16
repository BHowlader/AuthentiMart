import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        // Code splitting configuration
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react-dom') || id.includes('react-router')) {
                            return 'vendor-react'
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-ui'
                        }
                        if (id.includes('axios') || id.includes('@react-oauth')) {
                            return 'vendor-utils'
                        }
                    }
                },
            },
        },
        // Increase chunk warning limit
        chunkSizeWarningLimit: 500,
        // Use esbuild for minification (built into Vite)
        minify: 'esbuild',
        // Generate source maps for debugging (optional - can disable for smaller builds)
        sourcemap: false,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    },
})
