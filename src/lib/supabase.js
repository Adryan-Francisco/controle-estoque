import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://mfwnbkothjrjtjnvsrbg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1md25ia290aGpyanRqbnZzcmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDIwNzIsImV4cCI6MjA3MTkxODA3Mn0.7dy0FD5xhNvCff4YGCRFMC2TpTcyyuYh4X9evqX63TE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'X-Client-Info': 'controle-estoque'
    }
  }
})
