import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })

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

  // Atualizar dados - APENAS PRODUTOS
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Atualizando dados (apenas produtos)...')
    await fetchProducts()
    setMovements([])
    setSales([])
    setBolos([])
  }, [fetchProducts])

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

  const addBolo = async () => {
    console.log('⚠️ Adicionar bolo desabilitado - tabela não existe')
    return { error: 'Funcionalidade não disponível' }
  }

  const deleteSale = async () => {
    console.log('⚠️ Deletar venda desabilitado - tabela não existe')
    return { error: 'Funcionalidade não disponível' }
  }

  // Sincronizar dados
  const syncLocalData = async () => {
    try {
      console.log('🔄 Sincronizando dados...')
      await refreshAllData()
      
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

  // Limpar todos os dados
  const clearAllData = () => {
    setProducts([])
    setMovements([])
    setSales([])
    setBolos([])
  }

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
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}