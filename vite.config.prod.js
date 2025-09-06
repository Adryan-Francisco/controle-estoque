import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração para produção (GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: '/controle-estoque-vendas/',
  build: {
    outDir: 'dist'
  }
})
