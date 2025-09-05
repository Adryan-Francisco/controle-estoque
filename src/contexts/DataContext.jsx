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
  const [requestQueue, setRequestQueue] = useState([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState(0)
  
  // Configurações de throttling ULTRA restritivas para evitar ERR_INSUFFICIENT_RESOURCES
  const FETCH_INTERVAL = 1800000 // 30 minutos
  const REQUEST_TIMEOUT = 20000 // 20 segundos
  const MAX_RETRIES = 0 // Sem retry para evitar sobrecarga
  const MIN_REQUEST_INTERVAL = 30000 // 30 segundos entre requisições
  const MAX_QUEUE_SIZE = 1 // Apenas 1 requisição na fila
  
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

  // Carregar dados locais como fallback
  const loadLocalData = useCallback(() => {
    if (!user) return

    console.log('📱 Carregando dados locais como fallback')
    
    try {
      // Carregar produtos
      const localProducts = localStorage.getItem(`products_${user.id}`)
      if (localProducts) {
        setProducts(JSON.parse(localProducts))
      }

      // Carregar movimentações
      const localMovements = localStorage.getItem(`movements_${user.id}`)
      if (localMovements) {
        setMovements(JSON.parse(localMovements))
      }

      // Carregar vendas
      const localSales = localStorage.getItem(`sales_${user.id}`)
      if (localSales) {
        setSales(JSON.parse(localSales))
      }

      // Carregar bolos
      const localBolos = localStorage.getItem(`bolos_${user.id}`)
      if (localBolos) {
        setBolos(JSON.parse(localBolos))
      }

      console.log('✅ Dados locais carregados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao carregar dados locais:', error)
    }
  }, [user])

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

  // Atualizar todos os dados - ULTRA conservadora para evitar ERR_INSUFFICIENT_RESOURCES
  const refreshAllData = useCallback(async (forceRefresh = false) => {
    if (!user) return

    const now = Date.now()
    
    // Verificar se já fez uma requisição recentemente
    if (!forceRefresh && (now - lastDataFetch) < FETCH_INTERVAL) {
      console.log('⏰ Aguardando intervalo entre requisições (30 minutos)')
      return
    }

    // Verificar se há requisição em andamento
    if (isLoading) {
      console.log('⏳ Já há uma requisição em andamento, ignorando')
      return
    }

    setIsLoading(true)
    setLastDataFetch(now)

    try {
      console.log('🔄 Iniciando busca de dados ULTRA conservadora...')
      
      // Buscar apenas produtos primeiro (mais crítico)
      await fetchProducts(forceRefresh)
      await new Promise(resolve => setTimeout(resolve, 15000)) // Pausa de 15s
      
      // Buscar movimentações
      await fetchMovements(forceRefresh)
      await new Promise(resolve => setTimeout(resolve, 15000)) // Pausa de 15s
      
      // Buscar vendas
      await fetchSales(forceRefresh)
      await new Promise(resolve => setTimeout(resolve, 15000)) // Pausa de 15s
      
      // Buscar bolos por último
      await fetchBolos(forceRefresh)
      
      console.log('✅ Todos os dados carregados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      // Em caso de erro, usar dados locais
      loadLocalData()
    } finally {
      setIsLoading(false)
    }
  }, [user, lastDataFetch, FETCH_INTERVAL, isLoading, fetchProducts, fetchMovements, fetchSales, fetchBolos])

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

  // Atualizar venda
  const updateSale = async (saleId, saleData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Atualizando venda:', saleId, saleData)
      
      // Verificar se o usuário está autenticado no Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.log('❌ Usuário não autenticado no Supabase, atualizando localmente')
        
        // Atualizar localmente
        const updatedSales = sales.map(sale => 
          sale.id === saleId 
            ? { ...sale, ...saleData, updated_at: new Date().toISOString() }
            : sale
        )
        
        setSales(updatedSales)
        
        // Salvar no localStorage
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))
        
        if (window.showNotification) {
          window.showNotification('✅ Venda atualizada localmente!', 'success')
        }
        
        return { data: { id: saleId, ...saleData }, error: null }
      }

      const saleToUpdate = {
        cliente_nome: saleData.cliente_nome,
        cliente_email: saleData.cliente_email || '',
        cliente_telefone: saleData.cliente_telefone || '',
        metodo_pagamento: saleData.metodo_pagamento,
        valor_total: Number(saleData.valor_total || 0),
        observacoes: saleData.observacoes || ''
      }

      // Tentar atualizar no Supabase primeiro
      try {
        const { data, error } = await supabase
          .from('vendas')
          .update(saleToUpdate)
          .eq('id', saleId)
          .eq('user_id', authUser.id)
          .select()

        if (error) {
          console.error('❌ Erro ao atualizar venda no Supabase:', error)
          throw error
        }

        console.log('✅ Venda atualizada no Supabase:', data[0].id)
        
        // Atualizar estado local
        const updatedSales = sales.map(sale => 
          sale.id === saleId 
            ? { ...sale, ...saleToUpdate, updated_at: new Date().toISOString() }
            : sale
        )
        
        setSales(updatedSales)
        
        // Atualizar cache
        const cacheKey = `sales_${user.id}`
        setCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: updatedSales,
            timestamp: Date.now()
          }
        }))

        // Salvar no localStorage
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))

        if (window.showNotification) {
          window.showNotification('✅ Venda atualizada com sucesso!', 'success')
        }

        return { data: data[0], error: null }
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, atualizando localmente')
        
        // Atualizar localmente
        const updatedSales = sales.map(sale => 
          sale.id === saleId 
            ? { ...sale, ...saleToUpdate, updated_at: new Date().toISOString() }
            : sale
        )
        
        setSales(updatedSales)
        
        // Salvar no localStorage
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))

        if (window.showNotification) {
          window.showNotification('✅ Venda atualizada localmente!', 'success')
        }

        return { data: { id: saleId, ...saleToUpdate }, error: null }
      }
    } catch (error) {
      console.error('❌ Erro crítico ao atualizar venda:', error)
      return { error: error.message }
    }
  }

  // Deletar venda
  const deleteSale = async (saleId) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('🗑️ Deletando venda:', saleId)
      
      // Verificar se o usuário está autenticado no Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.log('❌ Usuário não autenticado no Supabase, deletando localmente')
        
        // Deletar localmente
        const updatedSales = sales.filter(sale => sale.id !== saleId)
        setSales(updatedSales)
        
        // Salvar no localStorage
        localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))
        
        if (window.showNotification) {
          window.showNotification('✅ Venda deletada localmente!', 'success')
        }
        
        return { error: null }
      }

      // Tentar deletar do Supabase primeiro
      try {
        const { error } = await supabase
          .from('vendas')
          .delete()
          .eq('id', saleId)
          .eq('user_id', authUser.id)

        if (error) {
          console.error('❌ Erro ao deletar venda do Supabase:', error)
          throw error
        }

        console.log('✅ Venda deletada do Supabase:', saleId)
      } catch (supabaseError) {
        console.log('⚠️ Erro no Supabase, deletando localmente')
      }

      // Atualizar estado local
      const updatedSales = sales.filter(sale => sale.id !== saleId)
      setSales(updatedSales)
      
      // Atualizar cache
      const cacheKey = `sales_${user.id}`
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: updatedSales,
          timestamp: Date.now()
        }
      }))

      // Atualizar localStorage
      localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedSales))

      if (window.showNotification) {
        window.showNotification('✅ Venda deletada com sucesso!', 'success')
      }

      return { error: null }
    } catch (error) {
      console.error('❌ Erro ao deletar venda:', error)
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
      // Carregar dados locais primeiro (mais rápido)
      loadLocalData()
      // Depois tentar sincronizar com Supabase (com delay)
      setTimeout(() => {
        refreshAllData()
      }, 5000) // Aguardar 5 segundos antes de tentar Supabase
    } else {
      console.log('👤 Usuário deslogado')
      clearAllData()
    }
  }, [user, clearAllData, loadLocalData, refreshAllData])

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
    updateSale,
    deleteProduct,
    deleteSale,
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