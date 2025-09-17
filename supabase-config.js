// Configuração do Supabase
// Substitua as URLs e chaves pelas suas credenciais do Supabase

export const supabaseConfig = {
  url: 'https://fxyyaajaghtlrgxproir.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eXlhYWphZ2h0bHJneHByb2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTg3NDIsImV4cCI6MjA3MzA3NDc0Mn0.BvSft04PaqYDmnaL-pakwnscqf7FygP5114rqMtC-gk'
}

// Para usar em produção, crie um arquivo .env.local com:
// VITE_SUPABASE_URL=sua_url_aqui
// VITE_SUPABASE_ANON_KEY=sua_chave_aqui
