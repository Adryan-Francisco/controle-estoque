import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - usando variáveis de ambiente para produção
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfwnbkothjrjtjnvsrbg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1md25ia290aGpyanRqbnZzcmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDIwNzIsImV4cCI6MjA3MTkxODA3Mn0.7dy0FD5xhNvCff4YGCRFMC2TpTcyyuYh4X9evqX63TE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Desabilitar detecção automática para reduzir requisições
    flowType: 'implicit' // Usar flow implícito para melhor performance
  },
  global: {
    headers: {
      'X-Client-Info': 'controle-estoque-optimized',
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    enabled: false // Desabilitar realtime para reduzir uso de recursos
  }
})

// Configurações de otimização
export const SUPABASE_CONFIG = {
  // Configurações de paginação
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Configurações ULTRA conservadoras - Modo Offline First
  CACHE_TTL: 2 * 60 * 60 * 1000, // 2 HORAS (aumentado ainda mais)
  MAX_CACHE_SIZE: 5, // Máximo 5 itens no cache (reduzido ainda mais)
  
  // Configurações de retry ULTRA conservadoras
  MAX_RETRIES: 2, // 2 retries para erros de rede
  RETRY_DELAY: 15000, // 15 segundos entre retries
  
  // Configurações de timeout
  REQUEST_TIMEOUT: 60000, // 60 segundos (aumentado)
  
  // Configurações de modo offline
  OFFLINE_MODE: false, // Sempre permitir requisições em produção
  SYNC_INTERVAL: 10 * 60 * 1000, // Sincronizar apenas a cada 10 minutos
  MAX_DAILY_REQUESTS: 20, // Máximo 20 requisições por dia (reduzido drasticamente)
  
  // Configurações de compressão
  ENABLE_COMPRESSION: true,
  COMPRESSION_THRESHOLD: 1024 // Comprimir se > 1KB
}

// Função para compressão de dados simples
export const compressData = (data) => {
  if (!SUPABASE_CONFIG.ENABLE_COMPRESSION || JSON.stringify(data).length < SUPABASE_CONFIG.COMPRESSION_THRESHOLD) {
    return data
  }
  
  try {
    // Compressão simples removendo espaços e campos desnecessários
    return JSON.parse(JSON.stringify(data, (key, value) => {
      // Remover campos vazios ou nulos
      if (value === null || value === undefined || value === '') {
        return undefined
      }
      // Truncar strings muito longas
      if (typeof value === 'string' && value.length > 1000) {
        return value.substring(0, 1000) + '...'
      }
      return value
    }))
  } catch (error) {
    console.warn('Erro na compressão de dados:', error)
    return data
  }
}

// Função para descompressão de dados
export const decompressData = (data) => {
  return data
}

// Cache simples em memória
const memoryCache = new Map()

// Sistema de contagem de requisições diárias
const requestCounter = {
  getToday: () => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('supabase_requests_today')
    const data = stored ? JSON.parse(stored) : { date: today, count: 0 }
    
    if (data.date !== today) {
      // Novo dia, resetar contador
      data.date = today
      data.count = 0
      localStorage.setItem('supabase_requests_today', JSON.stringify(data))
    }
    
    return data.count
  },
  
  increment: () => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('supabase_requests_today')
    const data = stored ? JSON.parse(stored) : { date: today, count: 0 }
    
    if (data.date !== today) {
      data.date = today
      data.count = 0
    }
    
    data.count++
    localStorage.setItem('supabase_requests_today', JSON.stringify(data))
    return data.count
  },
  
  canMakeRequest: () => {
    return requestCounter.getToday() < SUPABASE_CONFIG.MAX_DAILY_REQUESTS
  }
}

export const cacheManager = {
  set: (key, value, ttl = SUPABASE_CONFIG.CACHE_TTL) => {
    // Limpar cache se estiver muito grande
    if (memoryCache.size >= SUPABASE_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = memoryCache.keys().next().value
      memoryCache.delete(firstKey)
    }
    
    memoryCache.set(key, {
      value: compressData(value),
      timestamp: Date.now(),
      ttl
    })
  },
  
  get: (key) => {
    const item = memoryCache.get(key)
    if (!item) return null
    
    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      memoryCache.delete(key)
      return null
    }
    
    return decompressData(item.value)
  },
  
  clear: () => {
    memoryCache.clear()
  },
  
  size: () => memoryCache.size
}

// Exportar o contador de requisições
export { requestCounter }
