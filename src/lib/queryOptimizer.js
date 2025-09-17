// =====================================================
// OTIMIZADOR DE QUERIES PARA SUPABASE
// =====================================================
// Este módulo contém otimizações específicas para queries mais comuns
// Data: 2024
// Versão: 1.0 - Ultra Otimizada

import { supabase } from './supabase'

// =====================================================
// QUERIES OTIMIZADAS PARA PRODUTOS
// =====================================================

export const optimizedQueries = {
  // Buscar produtos com filtros otimizados
  getProducts: async (userId, filters = {}) => {
    let query = supabase
      .from('produtos')
      .select('id, nome, preco, estoque_atual, estoque_minimo, categoria, created_at')
      .eq('user_id', userId)
    
    // Aplicar filtros otimizados
    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria)
    }
    
    if (filters.status) {
      switch (filters.status) {
        case 'low_stock':
          query = query.lte('estoque_atual', supabase.raw('estoque_minimo'))
          break
        case 'out_of_stock':
          query = query.eq('estoque_atual', 0)
          break
        case 'in_stock':
          query = query.gt('estoque_atual', supabase.raw('estoque_minimo'))
          break
      }
    }
    
    if (filters.search) {
      query = query.ilike('nome', `%${filters.search}%`)
    }
    
    // Ordenação otimizada
    const orderBy = filters.orderBy || 'created_at'
    const ascending = filters.ascending !== false
    query = query.order(orderBy, { ascending })
    
    // Paginação otimizada
    const page = filters.page || 0
    const pageSize = filters.pageSize || 20
    query = query.range(page * pageSize, (page + 1) * pageSize - 1)
    
    return query
  },

  // Buscar produtos com estoque baixo (query específica)
  getLowStockProducts: async (userId) => {
    return supabase
      .from('produtos')
      .select('id, nome, estoque_atual, estoque_minimo, categoria')
      .eq('user_id', userId)
      .lte('estoque_atual', supabase.raw('estoque_minimo'))
      .gt('estoque_atual', 0)
      .order('estoque_atual', { ascending: true })
  },

  // Buscar produtos sem estoque
  getOutOfStockProducts: async (userId) => {
    return supabase
      .from('produtos')
      .select('id, nome, categoria')
      .eq('user_id', userId)
      .eq('estoque_atual', 0)
      .order('created_at', { ascending: false })
  },

  // Buscar estatísticas de produtos (query agregada)
  getProductStats: async (userId) => {
    return supabase
      .from('produtos')
      .select('estoque_atual, preco, categoria')
      .eq('user_id', userId)
  },

  // =====================================================
  // QUERIES OTIMIZADAS PARA VENDAS
  // =====================================================

  // Buscar vendas com filtros otimizados
  getSales: async (userId, filters = {}) => {
    let query = supabase
      .from('vendas')
      .select(`
        id, 
        cliente_nome, 
        valor_total, 
        metodo_pagamento, 
        status, 
        created_at,
        venda_itens(id, nome, quantidade, preco_total)
      `)
      .eq('user_id', userId)
    
    // Filtros de data otimizados
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.metodo_pagamento) {
      query = query.eq('metodo_pagamento', filters.metodo_pagamento)
    }
    
    if (filters.cliente) {
      query = query.ilike('cliente_nome', `%${filters.cliente}%`)
    }
    
    // Ordenação otimizada
    query = query.order('created_at', { ascending: false })
    
    // Paginação
    const page = filters.page || 0
    const pageSize = filters.pageSize || 20
    query = query.range(page * pageSize, (page + 1) * pageSize - 1)
    
    return query
  },

  // Buscar vendas por período (query agregada)
  getSalesByPeriod: async (userId, startDate, endDate) => {
    return supabase
      .from('vendas')
      .select('valor_total, created_at, metodo_pagamento')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'concluida')
      .order('created_at', { ascending: true })
  },

  // Buscar estatísticas de vendas
  getSalesStats: async (userId, period = '30 days') => {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7 days':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30 days':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90 days':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1 year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }
    
    return supabase
      .from('vendas')
      .select('valor_total, metodo_pagamento, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'concluida')
  },

  // =====================================================
  // QUERIES OTIMIZADAS PARA MOVIMENTAÇÕES
  // =====================================================

  // Buscar movimentações com filtros otimizados
  getMovements: async (userId, filters = {}) => {
    let query = supabase
      .from('movimentacoes')
      .select(`
        id, 
        tipo, 
        quantidade, 
        motivo, 
        created_at,
        produtos(nome, categoria)
      `)
      .eq('user_id', userId)
    
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo)
    }
    
    if (filters.produto_id) {
      query = query.eq('produto_id', filters.produto_id)
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    // Ordenação otimizada
    query = query.order('created_at', { ascending: false })
    
    // Limite otimizado
    const limit = filters.limit || 50
    query = query.limit(limit)
    
    return query
  },

  // Buscar movimentações por produto
  getMovementsByProduct: async (userId, produtoId, limit = 20) => {
    return supabase
      .from('movimentacoes')
      .select('id, tipo, quantidade, motivo, created_at')
      .eq('user_id', userId)
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false })
      .limit(limit)
  },

  // =====================================================
  // QUERIES OTIMIZADAS PARA BOLOS
  // =====================================================

  // Buscar bolos com filtros otimizados
  getBolos: async (userId, filters = {}) => {
    let query = supabase
      .from('bolos')
      .select('id, nome, preco_por_kg, categoria, disponivel, created_at')
      .eq('user_id', userId)
      .eq('disponivel', true)
    
    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria)
    }
    
    if (filters.search) {
      query = query.ilike('nome', `%${filters.search}%`)
    }
    
    // Ordenação otimizada
    query = query.order('created_at', { ascending: false })
    
    // Limite otimizado
    const limit = filters.limit || 100
    query = query.limit(limit)
    
    return query
  },

  // =====================================================
  // QUERIES DE RELATÓRIOS OTIMIZADAS
  // =====================================================

  // Relatório de estoque
  getStockReport: async (userId) => {
    return supabase
      .from('produtos')
      .select(`
        id, 
        nome, 
        categoria, 
        estoque_atual, 
        estoque_minimo, 
        preco,
        valor_total
      `)
      .eq('user_id', userId)
      .order('categoria', { ascending: true })
  },

  // Relatório de vendas por categoria
  getSalesByCategory: async (userId, startDate, endDate) => {
    return supabase
      .from('vendas')
      .select(`
        valor_total,
        venda_itens(
          produtos(categoria)
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'concluida')
  },

  // =====================================================
  // QUERIES DE BUSCA OTIMIZADAS
  // =====================================================

  // Busca global otimizada
  globalSearch: async (userId, searchTerm) => {
    const searchPattern = `%${searchTerm}%`
    
    // Buscar em paralelo
    const [products, sales, bolos] = await Promise.all([
      supabase
        .from('produtos')
        .select('id, nome, categoria, tipo')
        .eq('user_id', userId)
        .ilike('nome', searchPattern)
        .limit(10),
      
      supabase
        .from('vendas')
        .select('id, cliente_nome, valor_total, created_at, tipo')
        .eq('user_id', userId)
        .ilike('cliente_nome', searchPattern)
        .limit(10),
      
      supabase
        .from('bolos')
        .select('id, nome, categoria, preco_por_kg, tipo')
        .eq('user_id', userId)
        .eq('disponivel', true)
        .ilike('nome', searchPattern)
        .limit(10)
    ])
    
    return {
      products: products.data || [],
      sales: sales.data || [],
      bolos: bolos.data || []
    }
  },

  // =====================================================
  // QUERIES DE DASHBOARD OTIMIZADAS
  // =====================================================

  // Dados do dashboard em uma única query
  getDashboardData: async (userId) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Executar queries em paralelo
    const [
      productsResult,
      salesResult,
      movementsResult,
      bolosResult
    ] = await Promise.all([
      supabase
        .from('produtos')
        .select('id, estoque_atual, estoque_minimo, preco, categoria')
        .eq('user_id', userId),
      
      supabase
        .from('vendas')
        .select('valor_total, created_at, status')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('movimentacoes')
        .select('id, created_at, tipo')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('bolos')
        .select('id, disponivel')
        .eq('user_id', userId)
        .eq('disponivel', true)
    ])
    
    // Processar dados localmente
    const products = productsResult.data || []
    const sales = salesResult.data || []
    const movements = movementsResult.data || []
    const bolos = bolosResult.data || []
    
    return {
      totalProducts: products.length,
      totalBolos: bolos.length,
      totalValue: products.reduce((sum, p) => sum + (p.preco * p.estoque_atual), 0),
      lowStock: products.filter(p => p.estoque_atual <= p.estoque_minimo && p.estoque_atual > 0).length,
      outOfStock: products.filter(p => p.estoque_atual <= 0).length,
      totalSales: sales.length,
      totalSalesValue: sales.reduce((sum, s) => sum + s.valor_total, 0),
      totalMovements: movements.length,
      recentMovements: movements.filter(m => {
        const movementDate = new Date(m.created_at)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return movementDate >= weekAgo
      }).length
    }
  }
}

// =====================================================
// UTILITÁRIOS DE OTIMIZAÇÃO
// =====================================================

// Cache de queries frequentes
const queryCache = new Map()

export const cachedQuery = async (cacheKey, queryFn, ttl = 5 * 60 * 1000) => {
  const cached = queryCache.get(cacheKey)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < ttl) {
    console.log(`📦 Cache hit para: ${cacheKey}`)
    return cached.data
  }
  
  console.log(`🔄 Executando query: ${cacheKey}`)
  const result = await queryFn()
  
  queryCache.set(cacheKey, {
    data: result,
    timestamp: now
  })
  
  return result
}

// Limpar cache de queries
export const clearQueryCache = () => {
  queryCache.clear()
  console.log('🗑️ Cache de queries limpo')
}

// =====================================================
// MONITORAMENTO DE PERFORMANCE
// =====================================================

export const queryPerformance = {
  times: new Map(),
  
  start: (queryName) => {
    queryPerformance.times.set(queryName, Date.now())
  },
  
  end: (queryName) => {
    const startTime = queryPerformance.times.get(queryName)
    if (startTime) {
      const duration = Date.now() - startTime
      console.log(`⏱️ Query ${queryName}: ${duration}ms`)
      queryPerformance.times.delete(queryName)
      return duration
    }
    return 0
  },
  
  getStats: () => {
    return Array.from(queryPerformance.times.entries()).map(([name, time]) => ({
      name,
      duration: Date.now() - time
    }))
  }
}

export default optimizedQueries