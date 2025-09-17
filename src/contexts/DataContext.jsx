import { createContext, useContext, useState, useEffect, useCallback } from 'react'
<<<<<<< HEAD
import { supabase } from '../lib/supabase'
=======
import { supabase, SUPABASE_CONFIG, cacheManager, requestCounter } from '../lib/supabase'
import { optimizedQueries, cachedQuery, queryPerformance } from '../lib/queryOptimizer'
import { useAuth } from './AuthContext'
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [sales, setSales] = useState([])
  const [bolos, setBolos] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Buscar produtos - ÚNICA FUNÇÃO QUE FAZ REQUISIÇÕES
  const fetchProducts = useCallback(async () => {
    try {
      console.log('🔄 Buscando produtos...')
      setIsLoading(true)

<<<<<<< HEAD
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })
=======
      const requestFn = () => optimizedQueries.getProducts(user.id, {
        page,
        pageSize: SUPABASE_CONFIG.DEFAULT_PAGE_SIZE
      })

      const { data, error } = await makeRequest(requestFn)
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        setProducts([])
        return
      }

      console.log('✅ Produtos carregados:', data?.length || 0)
      setProducts(data || [])
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Funções vazias para outras tabelas (sem requisições)
  const fetchMovements = useCallback(async () => {
    console.log('⚠️ Movimentações desabilitadas - tabela não existe')
    setMovements([])
  }, [])

  const fetchSales = useCallback(async () => {
    console.log('⚠️ Vendas desabilitadas - tabela não existe')
    setSales([])
  }, [])

  const fetchBolos = useCallback(async () => {
    console.log('⚠️ Bolos desabilitadas - tabela não existe')
    setBolos([])
  }, [])

<<<<<<< HEAD
  // Atualizar dados - APENAS PRODUTOS
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Atualizando dados (apenas produtos)...')
    await fetchProducts()
    setMovements([])
    setSales([])
    setBolos([])
  }, [fetchProducts])
=======
    // Verificar throttling
    if (!forceRefresh && (now - lastDataFetch) < FETCH_INTERVAL) {
      console.log('⏳ Throttling: aguardando para buscar movimentações')
      return
    }

    try {
      console.log('🔄 Buscando movimentações do Supabase...')
      setIsLoading(true)
      setLastDataFetch(now)

      const requestFn = () => optimizedQueries.getMovements(user.id, {
        limit: 50
      })

      const { data, error } = await makeRequest(requestFn)

      if (error) {
        console.error('❌ Erro ao buscar movimentações:', error)
        // Usar dados locais se houver
        const localData = JSON.parse(localStorage.getItem(`movements_${user.id}`) || '[]')
        setMovements(localData)
        return
      }

      console.log('✅ Movimentações carregadas:', data?.length || 0)
      setMovements(data || [])
      
      // Atualizar cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: data || [],
          timestamp: now
        }
      }))

      // Salvar no localStorage
      localStorage.setItem(`movements_${user.id}`, JSON.stringify(data || []))

    } catch (error) {
      console.error('❌ Erro crítico ao buscar movimentações:', error)
      // Usar dados locais
      const localData = JSON.parse(localStorage.getItem(`movements_${user.id}`) || '[]')
      setMovements(localData)
    } finally {
      setIsLoading(false)
    }
  }, [user, cache, lastDataFetch, FETCH_INTERVAL, makeRequest])

  // Buscar bolos com cache e throttling
  const fetchBolos = useCallback(async (forceRefresh = false) => {
    if (!user) return

    // VERIFICAÇÃO RIGOROSA: Se há dados locais, NÃO fazer requisições
    const localData = JSON.parse(localStorage.getItem(`bolos_${user.id}`) || '[]')
    if (localData.length > 0 && !forceRefresh) {
      console.log('📱 Dados locais de bolos disponíveis. Usando dados locais.')
      setBolos(localData)
      return
    }

    const now = Date.now()
    const cacheKey = `bolos_${user.id}`
    
    // Verificar cache
    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < FETCH_INTERVAL) {
      console.log('📦 Usando cache para bolos')
      setBolos(cache[cacheKey].data)
      return
    }

    // Verificar throttling
    if (!forceRefresh && (now - lastDataFetch) < FETCH_INTERVAL) {
      console.log('⏳ Throttling: aguardando para buscar bolos')
      return
    }

    try {
      console.log('🔄 Buscando bolos do Supabase...')
      setIsLoading(true)
      setLastDataFetch(now)

      const requestFn = () => optimizedQueries.getBolos(user.id, {
        limit: 100
      })

      const { data, error } = await makeRequest(requestFn)

      if (error) {
        console.error('❌ Erro ao buscar bolos:', error)
        // Usar dados locais se houver
        const localData = JSON.parse(localStorage.getItem(`bolos_${user.id}`) || '[]')
        setBolos(localData)
        return
      }

      console.log('✅ Bolos carregados:', data?.length || 0)
      setBolos(data || [])
      
      // Atualizar cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: data || [],
          timestamp: now
        }
      }))

      // Salvar no localStorage
      localStorage.setItem(`bolos_${user.id}`, JSON.stringify(data || []))

    } catch (error) {
      console.error('❌ Erro crítico ao buscar bolos:', error)
      // Usar dados locais
      const localData = JSON.parse(localStorage.getItem(`bolos_${user.id}`) || '[]')
      setBolos(localData)
    } finally {
      setIsLoading(false)
    }
  }, [user, cache, lastDataFetch, FETCH_INTERVAL, makeRequest])

  // Buscar vendas com cache e throttling
  const fetchSales = useCallback(async (forceRefresh = false) => {
    if (!user) return

    // VERIFICAÇÃO RIGOROSA: Se há dados locais, NÃO fazer requisições
    const localData = JSON.parse(localStorage.getItem(`sales_${user.id}`) || '[]')
    if (localData.length > 0 && !forceRefresh) {
      console.log('📱 Dados locais de vendas disponíveis. Usando dados locais.')
      setSales(localData)
      return
    }

    const now = Date.now()
    const cacheKey = `sales_${user.id}`
    
    // Verificar cache
    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < FETCH_INTERVAL) {
      console.log('📦 Usando cache para vendas')
      setSales(cache[cacheKey].data)
      return
    }

    // Verificar throttling
    if (!forceRefresh && (now - lastDataFetch) < FETCH_INTERVAL) {
      console.log('⏳ Throttling: aguardando para buscar vendas')
      return
    }

    try {
      console.log('🔄 Buscando vendas do Supabase...')
      setIsLoading(true)
      setLastDataFetch(now)

      const requestFn = () => optimizedQueries.getSales(user.id, {
        limit: 50
      })

      const { data, error } = await makeRequest(requestFn)

      if (error) {
        console.error('❌ Erro ao buscar vendas:', error)
        // Usar dados locais se houver
        const localData = JSON.parse(localStorage.getItem(`sales_${user.id}`) || '[]')
        setSales(localData)
        return
      }

      console.log('✅ Vendas carregadas:', data?.length || 0)
      setSales(data || [])
      
      // Atualizar cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: data || [],
          timestamp: now
        }
      }))

      // Salvar no localStorage
      localStorage.setItem(`sales_${user.id}`, JSON.stringify(data || []))

    } catch (error) {
      console.error('❌ Erro crítico ao buscar vendas:', error)
      // Usar dados locais
      const localData = JSON.parse(localStorage.getItem(`sales_${user.id}`) || '[]')
      setSales(localData)
    } finally {
      setIsLoading(false)
    }
  }, [user, cache, lastDataFetch, FETCH_INTERVAL, makeRequest])

  // Controle de requisições em andamento
  const [pendingRequests, setPendingRequests] = useState(new Set())
  const [refreshTimeout, setRefreshTimeout] = useState(null)
  
  // Operações em lote para reduzir requisições
  const batchOperations = useCallback(async (operations) => {
    if (!user || operations.length === 0) return { success: true, results: [] }

    try {
      console.log(`🔄 Executando ${operations.length} operações em lote...`)
      
      const results = []
      const batchSize = 5 // Processar 5 operações por vez
      
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize)
        
        // Executar operações em paralelo dentro do lote
        const batchPromises = batch.map(async (operation) => {
          try {
            const result = await operation.fn()
            return { success: true, result, operation: operation.type }
          } catch (error) {
            console.error(`❌ Erro na operação ${operation.type}:`, error)
            return { success: false, error: error.message, operation: operation.type }
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
        
        // Pausa entre lotes para evitar sobrecarga
        if (i + batchSize < operations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      console.log(`✅ Lote executado: ${results.filter(r => r.success).length}/${results.length} sucessos`)
      return { success: true, results }
    } catch (error) {
      console.error('❌ Erro ao executar operações em lote:', error)
      return { success: false, error: error.message, results: [] }
    }
  }, [user])

  // Atualizar todos os dados - MODO OFFLINE FIRST
  const refreshAllData = useCallback(async (forceRefresh = false) => {
    if (!user) return

    // Se não for forçado, usar debounce de 30 segundos
    if (!forceRefresh) {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      
      const timeoutId = setTimeout(async () => {
        await executeRefresh(forceRefresh)
      }, 30000) // 30 segundos de debounce
      
      setRefreshTimeout(timeoutId)
      return
    }

    // Se for forçado, executar imediatamente
    await executeRefresh(forceRefresh)
  }, [user])

  // Função interna para executar o refresh
  const executeRefresh = useCallback(async (forceRefresh = false) => {
    if (!user) return

    const now = Date.now()
    
    // Verificar se já há uma requisição similar em andamento
    if (pendingRequests.has('refresh') && !forceRefresh) {
      console.log('⏳ Já há uma requisição de refresh em andamento, ignorando')
      return
    }

    // Verificar se já fez uma requisição recentemente (aumentado para 5 minutos)
    if (!forceRefresh && (now - lastDataFetch) < SYNC_INTERVAL) {
      console.log('⏰ Aguardando intervalo entre requisições (5 minutos)')
      return
    }

    // Verificar se há requisição em andamento
    if (isLoading) {
      console.log('⏳ Já há uma requisição em andamento, ignorando')
      return
    }

    // Marcar requisição como em andamento
    setPendingRequests(prev => new Set([...prev, 'refresh']))
    setIsLoading(true)
    setLastDataFetch(now)

    try {
      console.log('🔄 Iniciando busca de dados ULTRA otimizada...')
      
      // Buscar dados SEQUENCIALMENTE para evitar sobrecarga
      await fetchProducts(forceRefresh)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Pausa de 3s
      
      await fetchMovements(forceRefresh)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Pausa de 3s
      
      await fetchSales(forceRefresh)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Pausa de 3s
      
      await fetchBolos(forceRefresh)
      
      console.log('✅ Todos os dados carregados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      // Em caso de erro, usar dados locais
      loadLocalData()
    } finally {
      setIsLoading(false)
      setPendingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete('refresh')
        return newSet
      })
    }
  }, [user, lastDataFetch, isLoading, fetchProducts, fetchMovements, fetchSales, fetchBolos, loadLocalData, pendingRequests])
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a

  // Adicionar produto
  const addProduct = async (productData) => {
    try {
      console.log('📝 Adicionando produto:', productData)
      
      const { data, error } = await supabase
        .from('produtos')
        .insert([productData])
        .select()

      if (error) {
        console.error('❌ Erro ao adicionar produto:', error)
        return { error: error.message }
      }

      console.log('✅ Produto adicionado:', data[0])
      setProducts(prev => [data[0], ...prev])
      
      return { data: data[0], error: null }
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error)
      return { error: error.message }
    }
  }

  // Atualizar produto
  const updateProduct = async (id, productData) => {
    try {
      console.log('📝 Atualizando produto:', id, productData)
      
      const { data, error } = await supabase
        .from('produtos')
        .update(productData)
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ Erro ao atualizar produto:', error)
        return { error: error.message }
      }

      console.log('✅ Produto atualizado:', data[0])
      setProducts(prev => prev.map(p => p.id === id ? data[0] : p))
      
      return { data: data[0], error: null }
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      return { error: error.message }
    }
  }

  // Deletar produto
  const deleteProduct = async (id) => {
    try {
      console.log('🗑️ Deletando produto:', id)
      
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao deletar produto:', error)
        return { error: error.message }
      }

      console.log('✅ Produto deletado')
      setProducts(prev => prev.filter(p => p.id !== id))
      
      return { error: null }
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error)
      return { error: error.message }
    }
  }

  // Funções vazias para outras operações
  const addSale = async () => {
    console.log('⚠️ Adicionar venda desabilitado - tabela não existe')
    return { error: 'Funcionalidade não disponível' }
  }

  const addMovement = async () => {
    console.log('⚠️ Adicionar movimentação desabilitado - tabela não existe')
    return { error: 'Funcionalidade não disponível' }
  }

<<<<<<< HEAD
  const addBolo = async () => {
    console.log('⚠️ Adicionar bolo desabilitado - tabela não existe')
    return { error: 'Funcionalidade não disponível' }
  }

  const deleteSale = async () => {
    console.log('⚠️ Deletar venda desabilitado - tabela não existe')
    return { error: 'Funcionalidade não disponível' }
  }

  // Sincronizar dados
=======
  // Sincronização delta inteligente
  const deltaSync = useCallback(async () => {
    if (!user) return

    try {
      console.log('🔄 Iniciando sincronização delta...')
      
      const lastSync = localStorage.getItem(`last_sync_${user.id}`)
      const lastSyncTime = lastSync ? new Date(lastSync) : new Date(0)
      const now = new Date()
      
      // Sincronizar apenas dados modificados desde a última sincronização
      const syncOperations = []
      
      // 1. Sincronizar produtos modificados
      const localProducts = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
      const modifiedProducts = localProducts.filter(p => 
        new Date(p.updated_at || p.created_at) > lastSyncTime
      )
      
      if (modifiedProducts.length > 0) {
        syncOperations.push({
          type: 'products',
          data: modifiedProducts,
          fn: () => supabase.from('produtos').upsert(modifiedProducts)
        })
      }
      
      // 2. Sincronizar movimentações modificadas
      const localMovements = JSON.parse(localStorage.getItem(`movements_${user.id}`) || '[]')
      const modifiedMovements = localMovements.filter(m => 
        new Date(m.created_at) > lastSyncTime
      )
      
      if (modifiedMovements.length > 0) {
        syncOperations.push({
          type: 'movements',
          data: modifiedMovements,
          fn: () => supabase.from('movimentacoes').insert(modifiedMovements)
        })
      }
      
      // 3. Sincronizar vendas modificadas
      const localSales = JSON.parse(localStorage.getItem(`sales_${user.id}`) || '[]')
      const modifiedSales = localSales.filter(s => 
        new Date(s.updated_at || s.created_at) > lastSyncTime
      )
      
      if (modifiedSales.length > 0) {
        syncOperations.push({
          type: 'sales',
          data: modifiedSales,
          fn: () => supabase.from('vendas').upsert(modifiedSales)
        })
      }
      
      // 4. Sincronizar bolos modificados
      const localBolos = JSON.parse(localStorage.getItem(`bolos_${user.id}`) || '[]')
      const modifiedBolos = localBolos.filter(b => 
        new Date(b.updated_at || b.created_at) > lastSyncTime
      )
      
      if (modifiedBolos.length > 0) {
        syncOperations.push({
          type: 'bolos',
          data: modifiedBolos,
          fn: () => supabase.from('bolos').upsert(modifiedBolos)
        })
      }
      
      // Executar sincronização em lote
      if (syncOperations.length > 0) {
        const result = await batchOperations(syncOperations)
        
        if (result.success) {
          // Atualizar timestamp da última sincronização
          localStorage.setItem(`last_sync_${user.id}`, now.toISOString())
          
          console.log(`✅ Sincronização delta concluída: ${syncOperations.length} operações`)
          
          if (window.showNotification) {
            window.showNotification('✅ Dados sincronizados com sucesso!', 'success')
          }
        } else {
          throw new Error('Falha na sincronização em lote')
        }
      } else {
        console.log('📱 Nenhum dado para sincronizar')
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização delta:', error)
      
      if (window.showNotification) {
        window.showNotification('❌ Erro ao sincronizar dados', 'error')
      }
    }
  }, [user, batchOperations])

  // Sincronizar dados locais com Supabase (método tradicional)
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a
  const syncLocalData = async () => {
    try {
<<<<<<< HEAD
      console.log('🔄 Sincronizando dados...')
      await refreshAllData()
      
      if (window.showNotification) {
        window.showNotification('✅ Dados sincronizados com sucesso!', 'success')
      }
=======
      // Usar sincronização delta se disponível
      await deltaSync()
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a
    } catch (error) {
      console.error('❌ Erro ao sincronizar dados:', error)
      
      if (window.showNotification) {
        window.showNotification('❌ Erro ao sincronizar dados', 'error')
      }
    }
  }

<<<<<<< HEAD
  // Limpar todos os dados
  const clearAllData = () => {
    setProducts([])
    setMovements([])
    setSales([])
    setBolos([])
  }
=======
  // Função para arquivamento inteligente de dados antigos
  const archiveOldData = useCallback(async () => {
    if (!user) return

    try {
      console.log('🗄️ Iniciando arquivamento de dados antigos...')
      
      const now = new Date()
      const archiveThreshold = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)) // 90 dias atrás
      
      // Arquivar movimentações antigas (manter apenas 90 dias)
      const oldMovements = movements.filter(m => 
        new Date(m.created_at) < archiveThreshold
      )
      
      if (oldMovements.length > 0) {
        console.log(`📦 Arquivando ${oldMovements.length} movimentações antigas...`)
        
        // Salvar no localStorage como arquivo
        const archiveData = {
          type: 'movements_archive',
          date: now.toISOString(),
          count: oldMovements.length,
          data: oldMovements
        }
        
        const archiveKey = `archive_movements_${user.id}_${now.getFullYear()}_${now.getMonth() + 1}`
        localStorage.setItem(archiveKey, JSON.stringify(archiveData))
        
        // Remover do estado local
        setMovements(prev => prev.filter(m => 
          new Date(m.created_at) >= archiveThreshold
        ))
        
        // Atualizar localStorage
        const updatedMovements = movements.filter(m => 
          new Date(m.created_at) >= archiveThreshold
        )
        localStorage.setItem(`movements_${user.id}`, JSON.stringify(updatedMovements))
        
        console.log(`✅ ${oldMovements.length} movimentações arquivadas`)
      }
      
      // Arquivar vendas antigas (manter apenas 6 meses)
      const salesThreshold = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)) // 180 dias
      const oldSales = sales.filter(s => 
        new Date(s.created_at) < salesThreshold
      )
      
      if (oldSales.length > 0) {
        console.log(`📦 Arquivando ${oldSales.length} vendas antigas...`)
        
        const archiveData = {
          type: 'sales_archive',
          date: now.toISOString(),
          count: oldSales.length,
          data: oldSales
        }
        
        const archiveKey = `archive_sales_${user.id}_${now.getFullYear()}_${now.getMonth() + 1}`
        localStorage.setItem(archiveKey, JSON.stringify(archiveData))
        
        // Remover do estado local
        setSales(prev => prev.filter(s => 
          new Date(s.created_at) >= salesThreshold
        ))
        
        // Atualizar localStorage
        const updatedSales = sales.filter(s => 
          new Date(s.created_at) >= salesThreshold
        )
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))
        
        console.log(`✅ ${oldSales.length} vendas arquivadas`)
      }
      
      // Limpar cache antigo
      const cacheKeys = Object.keys(cache)
      const oldCacheKeys = cacheKeys.filter(key => {
        const cacheItem = cache[key]
        return cacheItem && (now - cacheItem.timestamp) > (7 * 24 * 60 * 60 * 1000) // 7 dias
      })
      
      if (oldCacheKeys.length > 0) {
        console.log(`🧹 Limpando ${oldCacheKeys.length} itens de cache antigos...`)
        setCache(prev => {
          const newCache = { ...prev }
          oldCacheKeys.forEach(key => delete newCache[key])
          return newCache
        })
      }
      
      console.log('✅ Arquivamento concluído com sucesso')
      
    } catch (error) {
      console.error('❌ Erro ao arquivar dados antigos:', error)
    }
  }, [user, movements, sales, cache])

  // Função para limpeza automática de dados antigos - OTIMIZADA
  const cleanupOldData = useCallback(() => {
    // Executar arquivamento apenas uma vez por dia
    const lastCleanup = localStorage.getItem(`last_cleanup_${user?.id}`)
    const now = new Date()
    const lastCleanupDate = lastCleanup ? new Date(lastCleanup) : null
    
    if (!lastCleanupDate || (now - lastCleanupDate) > (24 * 60 * 60 * 1000)) {
      console.log('📱 Executando limpeza diária de dados...')
      archiveOldData()
      localStorage.setItem(`last_cleanup_${user?.id}`, now.toISOString())
    } else {
      console.log('📱 Limpeza já executada hoje')
    }
  }, [user, archiveOldData])
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    console.log('🔄 Carregando dados iniciais...')
    refreshAllData()
  }, [refreshAllData])

  const value = {
    products,
    movements,
    sales,
    bolos,
    isLoading,
    fetchProducts,
    fetchMovements,
    fetchSales,
    fetchBolos,
<<<<<<< HEAD
    refreshAllData,
    addProduct,
    addSale,
    addMovement,
    addBolo,
    updateProduct,
    deleteProduct,
    deleteSale,
    syncLocalData,
    clearAllData
=======
    batchOperations
>>>>>>> 0d0feb11a1c1cb08b71e6bfaafc7de416002537a
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}