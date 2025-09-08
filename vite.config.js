import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/controle-estoque-vendas/',
  build: {
    outDir: 'dist',
    // Otimizações de build para reduzir tamanho
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remover console.log em produção
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react']
        }
      }
    },
    // Configurações de chunking para melhor cache
    chunkSizeWarningLimit: 1000
  },
  // Otimizações de desenvolvimento
  server: {
    hmr: {
      overlay: false // Desabilitar overlay de erros para melhor performance
    }
  },
  // Configurações de otimização
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react']
  }
})
