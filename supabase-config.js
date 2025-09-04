// Configuração do Supabase
// Substitua as URLs e chaves pelas suas credenciais do Supabase

export const supabaseConfig = {
  url: 'https://mfwnbkothjrjtjnvsrbg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1md25ia290aGpyanRqbnZzcmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDIwNzIsImV4cCI6MjA3MTkxODA3Mn0.7dy0FD5xhNvCff4YGCRFMC2TpTcyyuYh4X9evqX63TE'
}

// Para usar em produção, crie um arquivo .env.local com:
// VITE_SUPABASE_URL=sua_url_aqui
// VITE_SUPABASE_ANON_KEY=sua_chave_aqui
