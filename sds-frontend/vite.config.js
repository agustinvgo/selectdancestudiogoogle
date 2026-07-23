import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            // Transmisión en vivo: el video HLS se sirve por el mismo origen que el portal
            // (evita CORS y cookies de terceros que bloquean navegadores como Edge).
            // En producción, nginx hace este mismo proxy de /live -> MediaMTX.
            '/live': {
                target: 'http://localhost:8888',
                changeOrigin: true,
            },
        },
    },
    build: {
        sourcemap: false,
        minify: 'terser',
        // Avisar si algún chunk supera 500KB
        chunkSizeWarningLimit: 500,
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                // Chunk splitting: React/router se cachea separado del app code
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    query:  ['@tanstack/react-query'],
                    ui:     ['react-hot-toast', '@headlessui/react', '@heroicons/react', 'lucide-react'],
                    motion: ['framer-motion'],
                },
                // Hash en nombres para cache-busting automático
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
    },
});
