
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, SUPABASE_CONFIG, cacheManager, requestCounter } from '../lib/supabase'
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
  
  // Configurações ULTRA conservadoras - Modo Offline First
  const FETCH_INTERVAL = SUPABASE_CONFIG.CACHE_TTL // 2 HORAS
  const REQUEST_TIMEOUT = SUPABASE_CONFIG.REQUEST_TIMEOUT // 60 segundos
  const MAX_RETRIES = SUPABASE_CONFIG.MAX_RETRIES // 2 retries para erros de rede
  const MIN_REQUEST_INTERVAL = 10 * 60 * 1000 // 10 MINUTOS entre requisições
  const MAX_QUEUE_SIZE = 1 // Apenas 1 requisição na fila
  const SYNC_INTERVAL = SUPABASE_CONFIG.SYNC_INTERVAL // 10 minutos
  
  const { user } = useAuth()

  // Sistema de fila de requisições para evitar sobrecarga
  const processQueue = useCallback(async () => {
    if (isProcessingQueue || requestQueue.length === 0) return

    setIsProcessingQueue(true)
    console.log(`🔄 Processando fila: ${requestQueue.length} requisições pendentes`)

    while (requestQueue.length > 0) {
      const { requestFn, resolve, reject } = requestQueue.shift()
      
      try {
        const result = await makeRequestDirect(requestFn)
        resolve(result)
      } catch (error) {
        reject(error)
      }
      
      // Pausa entre requisições para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setIsProcessingQueue(false)
  }, [isProcessingQueue, requestQueue])

  // Função direta para fazer requisições (sem fila)
  const makeRequestDirect = useCallback(async (requestFn, retries = MAX_RETRIES) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
        
        const result = await requestFn()
        clearTimeout(timeoutId)
        
        // Incrementar contador de requisições apenas em caso de sucesso
        requestCounter.increment()
        console.log(`📊 Requisições hoje: ${requestCounter.getToday()}/${SUPABASE_CONFIG.MAX_DAILY_REQUESTS}`)
        
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        
        // Tratamento específico para erros de rede
        if (error.name === 'AbortError' || 
            error.message.includes('Failed to fetch') || 
            error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
            error.message.includes('NetworkError') ||
            error.message.includes('TypeError: Failed to fetch')) {
          
          console.log(`🔄 Tentativa ${i + 1}/${retries + 1} - Erro de rede: ${error.message}`)
          
          if (i < retries) {
            // Delay progressivo mais longo para erros de rede
            const delay = Math.min(5000 * Math.pow(2, i), 30000) // Max 30 segundos
            console.log(`⏳ Aguardando ${delay/1000}s antes de tentar novamente...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          } else {
            console.log('❌ Falha definitiva de rede após todas as tentativas')
            throw new Error('Falha de conectividade com Supabase')
          }
        }
        
        // Para outros erros, tentar novamente se ainda houver tentativas
        if (i < retries) {
          console.log(`🔄 Tentativa ${i + 1}/${retries + 1} - Erro: ${error.message}`)
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
          continue
        }
        
        throw error
      }
    }
  }, [REQUEST_TIMEOUT, MAX_RETRIES])

  // Função para fazer requisições com controle de limite diário e fila
  const makeRequest = useCallback(async (requestFn, retries = MAX_RETRIES) => {
    // VERIFICAÇÃO RIGOROSA: Se há dados locais, NÃO fazer requisições
    const hasLocalData = products.length > 0 || movements.length > 0 || sales.length > 0 || bolos.length > 0
    if (hasLocalData) {
      console.log('📱 Dados locais disponíveis. Bloqueando requisições ao Supabase.')
      throw new Error('Dados locais disponíveis - requisições bloqueadas')
    }

    // Verificar limite diário de requisições
    if (!requestCounter.canMakeRequest()) {
      console.log('🚫 Limite diário de requisições atingido. Usando dados locais.')
      throw new Error('Limite diário de requisições atingido')
    }

    // Verificar se está em modo offline
    if (SUPABASE_CONFIG.OFFLINE_MODE) {
      console.log('📱 Modo offline ativo. Usando dados locais.')
      throw new Error('Modo offline ativo')
    }

    // Se a fila está muito cheia, rejeitar imediatamente
    if (requestQueue.length >= MAX_QUEUE_SIZE) {
      console.log('🚫 Fila de requisições cheia. Usando dados locais.')
      throw new Error('Fila de requisições cheia')
    }

    // Adicionar à fila se não estiver processando
    if (isProcessingQueue) {
      return new Promise((resolve, reject) => {
        requestQueue.push({ requestFn, resolve, reject })
        processQueue()
      })
    }

    // Processar imediatamente se a fila estiver vazia
    return makeRequestDirect(requestFn, retries)
  }, [requestCounter, SUPABASE_CONFIG, requestQueue, isProcessingQueue, MAX_QUEUE_SIZE, processQueue, makeRequestDirect, products, movements, sales, bolos])

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

  // Limpar todos os dados quando o usuário mudar - MODIFICADO para preservar dados
  const clearAllData = useCallback(() => {
    console.log('📱 Preservando dados do usuário - não limpando automaticamente')
    // DESABILITADO: Não limpar dados automaticamente para preservar dados cadastrados
    // setProducts([])
    // setMovements([])
    // setSales([])
    // setBolos([])
    // setCache({})
    // setLastDataFetch(0)
  }, [])

  // Buscar produtos com cache otimizado e paginação
  const fetchProducts = useCallback(async (forceRefresh = false, page = 0) => {
    if (!user) return

    // VERIFICAÇÃO RIGOROSA: Se há dados locais, NÃO fazer requisições
    const localData = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
    if (localData.length > 0 && !forceRefresh) {
      console.log('📱 Dados locais de produtos disponíveis. Usando dados locais.')
      setProducts(localData)
      return
    }

    const now = Date.now()
    const cacheKey = `products_${user.id}_${page}`
    
    // Verificar cache em memória primeiro
    const cachedData = cacheManager.get(cacheKey)
    if (!forceRefresh && cachedData) {
      console.log('📦 Usando cache em memória para produtos')
      setProducts(cachedData)
      return
    }

    // Verificar cache local
    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < FETCH_INTERVAL) {
      console.log('📦 Usando cache local para produtos')
      setProducts(cache[cacheKey].data)
      return
    }

    // Verificar throttling mais rigoroso
    if (!forceRefresh && (now - lastDataFetch) < MIN_REQUEST_INTERVAL) {
      console.log('⏳ Throttling: aguardando para buscar produtos')
      // Usar dados locais se disponíveis
      const localData = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
      if (localData.length > 0) {
        setProducts(localData)
        console.log('📱 Usando dados locais durante throttling')
      }
      return
    }

    try {
      console.log('🔄 Buscando produtos do Supabase (página', page, ')...')
      setIsLoading(true)
      setLastDataFetch(now)

      const requestFn = () => supabase
        .from('produtos')
        .select('id, nome, descricao, preco, estoque_atual, estoque_minimo, categoria, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * SUPABASE_CONFIG.DEFAULT_PAGE_SIZE, (page + 1) * SUPABASE_CONFIG.DEFAULT_PAGE_SIZE - 1)

      const { data, error } = await makeRequest(requestFn)

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        // Usar dados locais se houver
        const localData = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
        if (localData.length > 0) {
          setProducts(localData)
          console.log('📱 Usando dados locais como fallback')
        }
        return
      }

      console.log('✅ Produtos carregados:', data?.length || 0)
      const productsData = data || []
      setProducts(productsData)
      
      // Atualizar cache em memória
      cacheManager.set(cacheKey, productsData)
      
      // Atualizar cache local
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: productsData,
          timestamp: now
        }
      }))

      // Salvar no localStorage (apenas se for página 0)
      if (page === 0) {
        localStorage.setItem(`products_${user.id}`, JSON.stringify(productsData))
      }

    } catch (error) {
      console.error('❌ Erro crítico ao buscar produtos:', error)
      // Usar dados locais se houver
      const localData = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
      if (localData.length > 0) {
        setProducts(localData)
        console.log('📱 Usando dados locais como fallback')
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, cache, lastDataFetch, MIN_REQUEST_INTERVAL, makeRequest])

  // Buscar movimentações com cache e throttling
  const fetchMovements = useCallback(async (forceRefresh = false) => {
    if (!user) return

    // VERIFICAÇÃO RIGOROSA: Se há dados locais, NÃO fazer requisições
    const localData = JSON.parse(localStorage.getItem(`movements_${user.id}`) || '[]')
    if (localData.length > 0 && !forceRefresh) {
      console.log('📱 Dados locais de movimentações disponíveis. Usando dados locais.')
      setMovements(localData)
      return
    }

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

  // Controle de requisições em andamento
  const [pendingRequests, setPendingRequests] = useState(new Set())
  const [refreshTimeout, setRefreshTimeout] = useState(null)
  
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

  // Função para limpeza automática de dados antigos - DESABILITADA
  const cleanupOldData = useCallback(() => {
    // DESABILITADO: Não limpar dados antigos para preservar dados cadastrados
    console.log('📱 Limpeza de dados antigos desabilitada - preservando dados cadastrados')
    return
  }, [])

  // Limpar dados quando o usuário mudar - MODO OFFLINE FIRST
  useEffect(() => {
    if (user) {
      console.log('👤 Usuário logado:', user.email)
      
      // Fazer limpeza de dados antigos primeiro
      cleanupOldData()
      
      // SEMPRE carregar dados locais primeiro
      loadLocalData()
      
      // Só sincronizar com Supabase se NÃO houver dados locais E for primeira vez
      const hasLocalData = products.length > 0 || movements.length > 0 || sales.length > 0 || bolos.length > 0
      const isFirstTime = !localStorage.getItem(`first_sync_${user.id}`)
      
      if (!hasLocalData && isFirstTime) {
        console.log('🔄 Primeira vez - tentando sincronizar com Supabase...')
        // Aguardar 10 segundos antes de tentar Supabase
        const timeoutId = setTimeout(() => {
          refreshAllData()
          localStorage.setItem(`first_sync_${user.id}`, 'true')
        }, 10000)
        
        return () => clearTimeout(timeoutId)
      } else if (hasLocalData) {
        console.log('📱 Usando dados locais - sem requisições ao Supabase')
      } else {
        console.log('📱 Já sincronizado anteriormente - usando dados locais')
      }
    } else {
      console.log('👤 Usuário deslogado - preservando dados cadastrados')
      // DESABILITADO: Não limpar dados no logout para preservar dados cadastrados
      // clearAllData()
      // cacheManager.clear()
    }
  }, [user]) // Removidas dependências que causavam loops

  // Escutar mudanças de usuário - DESABILITADO para preservar dados
  useEffect(() => {
    const handleUserChange = () => {
      console.log('📱 Usuário mudou - preservando dados cadastrados')
      // DESABILITADO: Não limpar dados quando usuário mudar
      // clearAllData()
    }

    window.addEventListener('userChanged', handleUserChange)
    return () => window.removeEventListener('userChanged', handleUserChange)
  }, [])

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
    clearAllData,
    cleanupOldData,
    fetchProducts,
    fetchMovements,
    fetchSales,
    fetchBolos
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}