import { createClient } from '@supabase/supabase-js'
import LZString from 'lz-string'

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

// Função para compressão de dados ultra otimizada
export const compressData = (data) => {
  if (!SUPABASE_CONFIG.ENABLE_COMPRESSION || JSON.stringify(data).length < SUPABASE_CONFIG.COMPRESSION_THRESHOLD) {
    return data
  }
  
  try {
    // Compressão avançada com otimizações específicas
    const compressed = JSON.parse(JSON.stringify(data, (key, value) => {
      // Remover campos vazios, nulos ou desnecessários
      if (value === null || value === undefined || value === '') {
        return undefined
      }
      
      // Otimizar campos específicos
      if (key === 'created_at' || key === 'updated_at') {
        // Converter timestamps para números (Unix timestamp)
        return new Date(value).getTime()
      }
      
      if (key === 'id' && typeof value === 'string' && value.length > 20) {
        // Encurtar IDs longos mantendo apenas os primeiros 8 caracteres
        return value.substring(0, 8)
      }
      
      // Truncar strings muito longas de forma inteligente
      if (typeof value === 'string') {
        if (value.length > 2000) {
          return value.substring(0, 2000) + '...'
        }
        // Remover espaços extras
        return value.trim()
      }
      
      // Otimizar números decimais
      if (typeof value === 'number' && value % 1 !== 0) {
        return Math.round(value * 100) / 100 // 2 casas decimais
      }
      
      // Remover arrays vazios
      if (Array.isArray(value) && value.length === 0) {
        return undefined
      }
      
      return value
    }))
    
    // Compressão adicional usando LZ-string
    const jsonString = JSON.stringify(compressed)
    if (jsonString.length > 5000) { // Só comprimir se for grande
      return {
        _compressed: true,
        _data: LZString.compress(jsonString)
      }
    }
    
    return compressed
  } catch (error) {
    console.warn('Erro na compressão de dados:', error)
    return data
  }
}

// Função para descompressão de dados ultra otimizada
export const decompressData = (data) => {
  try {
    // Verificar se é um objeto comprimido
    if (data && typeof data === 'object' && data._compressed && data._data) {
      // Descomprimir usando LZ-string
      const decompressed = LZString.decompress(data._data)
      return JSON.parse(decompressed)
    }
    
    // Se não for comprimido, processar normalmente
    if (Array.isArray(data)) {
      return data.map(item => decompressData(item))
    }
    
    if (data && typeof data === 'object') {
      const decompressed = {}
      for (const [key, value] of Object.entries(data)) {
        // Converter timestamps de volta para ISO string
        if ((key === 'created_at' || key === 'updated_at') && typeof value === 'number') {
          decompressed[key] = new Date(value).toISOString()
        } else if (typeof value === 'object' && value !== null) {
          decompressed[key] = decompressData(value)
        } else {
          decompressed[key] = value
        }
      }
      return decompressed
    }
    
    return data
  } catch (error) {
    console.warn('Erro na descompressão de dados:', error)
    return data
  }
}

// Cache inteligente em memória com TTL dinâmico
const memoryCache = new Map()
const cacheStats = {
  hits: 0,
  misses: 0,
  evictions: 0,
  totalSize: 0
}

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

// Cache Manager inteligente com TTL dinâmico e invalidação seletiva
export const cacheManager = {
  set: (key, value, ttl = SUPABASE_CONFIG.CACHE_TTL, priority = 'normal') => {
    const now = Date.now()
    const compressedValue = compressData(value)
    const dataSize = JSON.stringify(compressedValue).length
    
    // Calcular TTL dinâmico baseado no tipo de dados
    let dynamicTTL = ttl
    if (key.includes('products')) {
      dynamicTTL = 2 * 60 * 60 * 1000 // 2 horas para produtos
    } else if (key.includes('movements')) {
      dynamicTTL = 30 * 60 * 1000 // 30 minutos para movimentações
    } else if (key.includes('sales')) {
      dynamicTTL = 60 * 60 * 1000 // 1 hora para vendas
    } else if (key.includes('bolos')) {
      dynamicTTL = 4 * 60 * 60 * 1000 // 4 horas para bolos
    }
    
    // Limpar cache se estiver muito grande (LRU)
    if (memoryCache.size >= SUPABASE_CONFIG.MAX_CACHE_SIZE) {
      const entries = Array.from(memoryCache.entries())
      // Ordenar por timestamp (mais antigos primeiro)
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      // Remover 20% dos itens mais antigos
      const toRemove = Math.ceil(entries.length * 0.2)
      for (let i = 0; i < toRemove; i++) {
        memoryCache.delete(entries[i][0])
        cacheStats.evictions++
      }
    }
    
    memoryCache.set(key, {
      value: compressedValue,
      timestamp: now,
      ttl: dynamicTTL,
      priority,
      accessCount: 0,
      lastAccess: now,
      size: dataSize
    })
    
    cacheStats.totalSize += dataSize
  },
  
  get: (key) => {
    const item = memoryCache.get(key)
    if (!item) {
      cacheStats.misses++
      return null
    }
    
    const now = Date.now()
    
    // Verificar se expirou
    if (now - item.timestamp > item.ttl) {
      memoryCache.delete(key)
      cacheStats.misses++
      cacheStats.totalSize -= item.size
      return null
    }
    
    // Atualizar estatísticas de acesso
    item.accessCount++
    item.lastAccess = now
    cacheStats.hits++
    
    return decompressData(item.value)
  },
  
  // Invalidação seletiva por padrão
  invalidate: (pattern) => {
    const regex = new RegExp(pattern)
    let invalidated = 0
    
    for (const [key, item] of memoryCache.entries()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
        cacheStats.totalSize -= item.size
        invalidated++
      }
    }
    
    console.log(`🗑️ Invalidados ${invalidated} itens do cache (padrão: ${pattern})`)
    return invalidated
  },
  
  // Invalidação por prioridade
  invalidateByPriority: (priority) => {
    let invalidated = 0
    
    for (const [key, item] of memoryCache.entries()) {
      if (item.priority === priority) {
        memoryCache.delete(key)
        cacheStats.totalSize -= item.size
        invalidated++
      }
    }
    
    console.log(`🗑️ Invalidados ${invalidated} itens do cache (prioridade: ${priority})`)
    return invalidated
  },
  
  // Limpeza de cache antigo
  cleanup: () => {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas
    let cleaned = 0
    
    for (const [key, item] of memoryCache.entries()) {
      if (now - item.lastAccess > maxAge) {
        memoryCache.delete(key)
        cacheStats.totalSize -= item.size
        cleaned++
      }
    }
    
    console.log(`🧹 Limpeza do cache: ${cleaned} itens removidos`)
    return cleaned
  },
  
  clear: () => {
    memoryCache.clear()
    cacheStats.totalSize = 0
    console.log('🗑️ Cache limpo completamente')
  },
  
  size: () => memoryCache.size,
  
  stats: () => ({
    ...cacheStats,
    hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
    avgSize: cacheStats.totalSize / memoryCache.size || 0
  }),
  
  // Obter itens mais acessados
  getTopItems: (limit = 10) => {
    const entries = Array.from(memoryCache.entries())
    return entries
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, limit)
      .map(([key, item]) => ({
        key,
        accessCount: item.accessCount,
        size: item.size,
        age: Date.now() - item.timestamp
      }))
  }
}

// Exportar o contador de requisições
export { requestCounter }
