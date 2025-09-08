import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração para produção (GitHub Pages) - Otimizada
export default defineConfig({
  plugins: [react()],
  base: '/controle-estoque-vendas/',
  build: {
    outDir: 'dist',
    // Otimizações máximas para produção
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remover console.log em produção
      legalComments: 'none', // Remover comentários legais
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react'],
          utils: ['html2canvas', 'jspdf']
        },
        // Otimizar nomes de chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Configurações de chunking para melhor cache
    chunkSizeWarningLimit: 500,
    // Configurações de sourcemap (desabilitado para produção)
    sourcemap: false
  },
  // Configurações de otimização para produção
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react', 'html2canvas', 'jspdf']
  },
  // Configurações de define para otimização
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
