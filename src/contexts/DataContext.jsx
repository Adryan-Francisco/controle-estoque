import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

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
  const [lastDataFetch, setLastDataFetch] = useState(0)
  const [cache, setCache] = useState({})
  
  // Configurações de throttling
  const FETCH_INTERVAL = 300000 // 5 minutos
  const REQUEST_TIMEOUT = 20000 // 20 segundos
  const MAX_RETRIES = 2
  
  const { user } = useAuth()

  // Função para fazer requisições com timeout e retry
  const makeRequest = useCallback(async (requestFn, retries = MAX_RETRIES) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
        
        const result = await requestFn()
        clearTimeout(timeoutId)
        
        return result
      } catch (error) {
        console.log(`🔄 Tentativa ${i + 1}/${retries + 1} falhou:`, error.message)
        
        if (i === retries) {
          throw error
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }, [REQUEST_TIMEOUT, MAX_RETRIES])

  // Limpar todos os dados quando o usuário mudar
  const clearAllData = useCallback(() => {
    console.log('🧹 Limpando todos os dados do usuário anterior')
    setProducts([])
    setMovements([])
    setSales([])
    setBolos([])
    setCache({})
    setLastDataFetch(0)
  }, [])

  // Buscar produtos com cache e throttling
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    if (!user) return

    const now = Date.now()
    const cacheKey = `products_${user.id}`
    
    // Verificar cache
    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < FETCH_INTERVAL) {
      console.log('📦 Usando cache para produtos')
      setProducts(cache[cacheKey].data)
      return
    }

    // Verificar throttling
    if (!forceRefresh && (now - lastDataFetch) < FETCH_INTERVAL) {
      console.log('⏳ Throttling: aguardando para buscar produtos')
      return
    }

    try {
      console.log('🔄 Buscando produtos do Supabase...')
      setIsLoading(true)
      setLastDataFetch(now)

      const requestFn = () => supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data, error } = await makeRequest(requestFn)

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        // Usar dados locais se houver
        const localData = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
        setProducts(localData)
        return
      }

      console.log('✅ Produtos carregados:', data?.length || 0)
      setProducts(data || [])
      
      // Atualizar cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: data || [],
          timestamp: now
        }
      }))

      // Salvar no localStorage
      localStorage.setItem(`products_${user.id}`, JSON.stringify(data || []))

    } catch (error) {
      console.error('❌ Erro crítico ao buscar produtos:', error)
      // Usar dados locais
      const localData = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
      setProducts(localData)
    } finally {
      setIsLoading(false)
    }
  }, [user, cache, lastDataFetch, FETCH_INTERVAL, makeRequest])

  // Buscar movimentações com cache e throttling
  const fetchMovements = useCallback(async (forceRefresh = false) => {
    if (!user) return

    const now = Date.now()
    const cacheKey = `movements_${user.id}`
    
    // Verificar cache
    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < FETCH_INTERVAL) {
      console.log('📦 Usando cache para movimentações')
      setMovements(cache[cacheKey].data)
      return
    }

    // Verificar throttling
    if (!forceRefresh && (now - lastDataFetch) < FETCH_INTERVAL) {
      console.log('⏳ Throttling: aguardando para buscar movimentações')
      return
    }

    try {
      console.log('🔄 Buscando movimentações do Supabase...')
      setIsLoading(true)
      setLastDataFetch(now)

      const requestFn = () => supabase
        .from('movimentacoes')
        .select('*, produtos(nome)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

      const requestFn = () => supabase
        .from('bolos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

      const requestFn = () => supabase
        .from('vendas')
        .select('*, venda_itens(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

  // Atualizar todos os dados
  const refreshAllData = useCallback(async (forceRefresh = false) => {
    if (!user) return

    console.log('🔄 Atualizando todos os dados...')
    
    // Executar todas as buscas em paralelo, mas com throttling
    const promises = []
    
    // Adicionar delay entre as requisições para evitar sobrecarga
    promises.push(fetchProducts(forceRefresh))
    
    setTimeout(() => {
      promises.push(fetchMovements(forceRefresh))
    }, 1000)
    
    setTimeout(() => {
      promises.push(fetchBolos(forceRefresh))
    }, 2000)
    
    setTimeout(() => {
      promises.push(fetchSales(forceRefresh))
    }, 3000)

    try {
      await Promise.allSettled(promises)
      console.log('✅ Todos os dados atualizados')
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error)
    }
  }, [user, fetchProducts, fetchMovements, fetchBolos, fetchSales])

  // Adicionar produto
  const addProduct = async (productData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Adicionando produto:', productData)
      
      const productToInsert = {
        nome: productData.nome,
        descricao: productData.descricao || '',
        preco: Number(productData.preco || 0),
        estoque_atual: Number(productData.estoque_atual || 0),
        estoque_minimo: Number(productData.estoque_minimo || 0),
        categoria: productData.categoria || 'Geral',
        user_id: user.id
      }

      // Tentar salvar no Supabase primeiro
      try {
        const { data, error } = await supabase
          .from('produtos')
          .insert([productToInsert])
          .select()

        if (error) {
          console.error('❌ Erro ao salvar produto no Supabase:', error)
          throw error
        }

        console.log('✅ Produto salvo no Supabase:', data[0].id)
        
        // Atualizar estado local
        setProducts(prev => [data[0], ...prev])
        
        // Atualizar cache
        const cacheKey = `products_${user.id}`
        setCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: [data[0], ...(prev[cacheKey]?.data || [])],
            timestamp: Date.now()
          }
        }))

        // Salvar no localStorage
        const updatedProducts = [data[0], ...products]
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))

        if (window.showNotification) {
          window.showNotification('✅ Produto cadastrado com sucesso!', 'success')
        }

        return { data: data[0], error: null }
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, salvando localmente')
        
        // Salvar localmente
        const newProduct = {
          id: Date.now(),
          ...productToInsert,
          created_at: new Date().toISOString()
        }

        setProducts(prev => [newProduct, ...prev])
        
        // Salvar no localStorage
        const updatedProducts = [newProduct, ...products]
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))

        if (window.showNotification) {
          window.showNotification('✅ Produto cadastrado localmente!', 'success')
        }

        return { data: newProduct, error: null }
      }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar produto:', error)
      return { error: error.message }
    }
  }

  // Adicionar bolo
  const addBolo = async (boloData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Adicionando bolo:', boloData)
      
      // Verificar se o usuário está autenticado no Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.log('❌ Usuário não autenticado no Supabase, salvando localmente')
        
        const newBolo = {
          id: Date.now(),
          ...boloData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        
        setBolos(prev => [newBolo, ...prev])
        
        // Salvar no localStorage
        const updatedBolos = [newBolo, ...bolos]
        localStorage.setItem(`bolos_${user.id}`, JSON.stringify(updatedBolos))
        
        if (window.showNotification) {
          window.showNotification('✅ Bolo cadastrado localmente!', 'success')
        }
        
        return { data: newBolo, error: null }
      }

      const boloToInsert = {
        nome: boloData.nome,
        descricao: boloData.descricao || '',
        preco_por_kg: Number(boloData.preco_por_kg || 0),
        categoria: boloData.categoria || 'Tradicional',
        user_id: authUser.id
      }

      // Tentar salvar no Supabase primeiro
      try {
        const { data, error } = await supabase
          .from('bolos')
          .insert([boloToInsert])
          .select()

        if (error) {
          console.error('❌ Erro ao salvar bolo no Supabase:', error)
          throw error
        }

        console.log('✅ Bolo salvo no Supabase:', data[0].id)
        
        // Atualizar estado local
        setBolos(prev => [data[0], ...prev])
        
        // Atualizar cache
        const cacheKey = `bolos_${user.id}`
        setCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: [data[0], ...(prev[cacheKey]?.data || [])],
            timestamp: Date.now()
          }
        }))

        // Salvar no localStorage
        const updatedBolos = [data[0], ...bolos]
        localStorage.setItem(`bolos_${user.id}`, JSON.stringify(updatedBolos))

        if (window.showNotification) {
          window.showNotification('✅ Bolo cadastrado com sucesso!', 'success')
        }

        return { data: data[0], error: null }
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, salvando localmente')
        
        // Salvar localmente
        const newBolo = {
          id: Date.now(),
          ...boloData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }

        setBolos(prev => [newBolo, ...prev])
        
        // Salvar no localStorage
        const updatedBolos = [newBolo, ...bolos]
        localStorage.setItem(`bolos_${user.id}`, JSON.stringify(updatedBolos))

        if (window.showNotification) {
          window.showNotification('✅ Bolo cadastrado localmente!', 'success')
        }

        return { data: newBolo, error: null }
      }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar bolo:', error)
      return { error: error.message }
    }
  }

  // Adicionar venda
  const addSale = async (saleData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Adicionando venda:', saleData)
      
      // Verificar se o usuário está autenticado no Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.log('❌ Usuário não autenticado no Supabase, salvando localmente')
        
        const newSale = {
          id: Date.now(),
          ...saleData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        
        setSales(prev => [newSale, ...prev])
        
        // Salvar no localStorage
        const updatedSales = [newSale, ...sales]
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))
        
        if (window.showNotification) {
          window.showNotification('✅ Venda cadastrada localmente!', 'success')
        }
        
        return { data: newSale, error: null }
      }

      const saleToInsert = {
        cliente_nome: saleData.cliente_nome,
        cliente_email: saleData.cliente_email || '',
        cliente_telefone: saleData.cliente_telefone || '',
        metodo_pagamento: saleData.metodo_pagamento,
        valor_total: Number(saleData.valor_total || 0),
        user_id: authUser.id
      }

      // Tentar salvar no Supabase primeiro
      try {
        const { data, error } = await supabase
          .from('vendas')
          .insert([saleToInsert])
          .select()

        if (error) {
          console.error('❌ Erro ao salvar venda no Supabase:', error)
          throw error
        }

        console.log('✅ Venda salva no Supabase:', data[0].id)
        
        // Atualizar estado local
        setSales(prev => [data[0], ...prev])
        
        // Atualizar cache
        const cacheKey = `sales_${user.id}`
        setCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: [data[0], ...(prev[cacheKey]?.data || [])],
            timestamp: Date.now()
          }
        }))

        // Salvar no localStorage
        const updatedSales = [data[0], ...sales]
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))

        if (window.showNotification) {
          window.showNotification('✅ Venda cadastrada com sucesso!', 'success')
        }

        return { data: data[0], error: null }
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, salvando localmente')
        
        // Salvar localmente
        const newSale = {
          id: Date.now(),
          ...saleData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }

        setSales(prev => [newSale, ...prev])
        
        // Salvar no localStorage
        const updatedSales = [newSale, ...sales]
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))

        if (window.showNotification) {
          window.showNotification('✅ Venda cadastrada localmente!', 'success')
        }

        return { data: newSale, error: null }
      }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar venda:', error)
      return { error: error.message }
    }
  }

  // Adicionar movimentação
  const addMovement = async (movementData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Adicionando movimentação:', movementData)
      
      const movementToInsert = {
        produto_id: movementData.produto_id,
        tipo: movementData.tipo,
        quantidade: Number(movementData.quantidade || 0),
        motivo: movementData.motivo || '',
        user_id: user.id
      }

      // Tentar salvar no Supabase primeiro
      try {
        const { data, error } = await supabase
          .from('movimentacoes')
          .insert([movementToInsert])
          .select()

        if (error) {
          console.error('❌ Erro ao salvar movimentação no Supabase:', error)
          throw error
        }

        console.log('✅ Movimentação salva no Supabase:', data[0].id)
        
        // Atualizar estado local
        setMovements(prev => [data[0], ...prev])
        
        // Atualizar cache
        const cacheKey = `movements_${user.id}`
        setCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: [data[0], ...(prev[cacheKey]?.data || [])],
            timestamp: Date.now()
          }
        }))

        // Salvar no localStorage
        const updatedMovements = [data[0], ...movements]
        localStorage.setItem(`movements_${user.id}`, JSON.stringify(updatedMovements))

        if (window.showNotification) {
          window.showNotification('✅ Movimentação registrada com sucesso!', 'success')
        }

        return { data: data[0], error: null }
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, salvando localmente')
        
        // Salvar localmente
        const newMovement = {
          id: Date.now(),
          ...movementToInsert,
          created_at: new Date().toISOString()
        }

        setMovements(prev => [newMovement, ...prev])
        
        // Salvar no localStorage
        const updatedMovements = [newMovement, ...movements]
        localStorage.setItem(`movements_${user.id}`, JSON.stringify(updatedMovements))

        if (window.showNotification) {
          window.showNotification('✅ Movimentação registrada localmente!', 'success')
        }

        return { data: newMovement, error: null }
      }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar movimentação:', error)
      return { error: error.message }
    }
  }

  // Deletar produto
  const deleteProduct = async (productId) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      // Tentar deletar do Supabase primeiro
      try {
        const { error } = await supabase
          .from('produtos')
          .delete()
          .eq('id', productId)
          .eq('user_id', user.id)

        if (error) {
          console.error('❌ Erro ao deletar produto do Supabase:', error)
          throw error
        }

        console.log('✅ Produto deletado do Supabase:', productId)
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, deletando localmente')
      }

      // Atualizar estado local
      setProducts(prev => prev.filter(p => p.id !== productId))
      
      // Atualizar cache
      const cacheKey = `products_${user.id}`
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: (prev[cacheKey]?.data || []).filter(p => p.id !== productId),
          timestamp: Date.now()
        }
      }))

      // Atualizar localStorage
      const updatedProducts = products.filter(p => p.id !== productId)
      localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))

      if (window.showNotification) {
        window.showNotification('✅ Produto deletado com sucesso!', 'success')
      }

      return { error: null }
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error)
      return { error: error.message }
    }
  }

  // Sincronizar dados locais com Supabase
  const syncLocalData = async () => {
    if (!user) return

    console.log('🔄 Sincronizando dados locais com Supabase...')
    
    try {
      // Buscar dados do Supabase
      await refreshAllData(true)
      
      if (window.showNotification) {
        window.showNotification('✅ Dados sincronizados com sucesso!', 'success')
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar dados:', error)
      
      if (window.showNotification) {
        window.showNotification('❌ Erro ao sincronizar dados', 'error')
      }
    }
  }

  // Limpar dados quando o usuário mudar
  useEffect(() => {
    if (user) {
      console.log('👤 Usuário logado:', user.email)
      // Carregar dados do usuário atual
      refreshAllData()
    } else {
      console.log('👤 Usuário deslogado')
      clearAllData()
    }
  }, [user, clearAllData, refreshAllData])

  // Escutar mudanças de usuário
  useEffect(() => {
    const handleUserChange = () => {
      console.log('🔄 Usuário mudou, limpando dados')
      clearAllData()
    }

    window.addEventListener('userChanged', handleUserChange)
    return () => window.removeEventListener('userChanged', handleUserChange)
  }, [clearAllData])

  const value = {
    products,
    movements,
    sales,
    bolos,
    isLoading,
    addProduct,
    addMovement,
    addSale,
    addBolo,
    deleteProduct,
    refreshAllData,
    syncLocalData,
    clearAllData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}