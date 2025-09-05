import { createContext, useContext, useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Limpar todos os dados quando o usuário mudar
  const clearAllData = () => {
    console.log('🧹 Limpando todos os dados do usuário anterior')
    setProducts([])
    setMovements([])
    setSales([])
  }

  // Buscar produtos do usuário atual
  const fetchProducts = async () => {
    if (!user) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      // Buscar todos os dados da tabela bolos para debug
      const { data: allData, error: allError } = await supabase
        .from('bolos')
        .select('*')

      if (allError) {
        console.error('Erro ao buscar todos os bolos:', allError)
      } else {
        console.log('🔍 Todos os bolos na tabela:', allData)
        console.log('👤 Usuário atual:', user.email, user.id)
        
        // Verificar se há coluna de usuário
        if (allData && allData.length > 0) {
          console.log('📋 Colunas disponíveis:', Object.keys(allData[0]))
        }
      }

      // Por enquanto, não filtrar por usuário até descobrirmos a estrutura correta
      const { data, error } = await supabase
        .from('bolos')
        .select('*')
        .limit(10)

      if (error) throw error
      
      console.log('📊 Dados que serão exibidos:', data)
      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar movimentações do usuário atual
  const fetchMovements = async () => {
    if (!user) {
      setMovements([])
      return
    }

    try {
      setLoading(true)
      // Tentar buscar movimentações sem filtro primeiro
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .limit(10)

      if (error) throw error
      setMovements(data || [])
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar vendas do usuário atual
  const fetchSales = async () => {
    if (!user) {
      setSales([])
      return
    }

    try {
      setLoading(true)
      // Usar user_id que confirmamos que existe
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Erro ao buscar vendas:', error)
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  // Adicionar produto
  const addProduct = async (productData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('bolos')
        .insert([{
          ...productData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      
      // Atualizar lista local
      setProducts(prev => [data[0], ...prev])
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      return { data: null, error }
    }
  }

  // Atualizar produto
  const updateProduct = async (id, productData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('bolos')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      
      // Atualizar lista local
      setProducts(prev => prev.map(p => p.id === id ? data[0] : p))
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      return { data: null, error }
    }
  }

  // Deletar produto
  const deleteProduct = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('bolos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      // Atualizar lista local
      setProducts(prev => prev.filter(p => p.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      return { error }
    }
  }

  // Adicionar movimentação
  const addMovement = async (movementData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([{
          ...movementData,
          usuario_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      
      // Atualizar lista local
      setMovements(prev => [data[0], ...prev])
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error)
      return { data: null, error }
    }
  }

  // Adicionar venda
  const addSale = async (saleData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('vendas')
        .insert([{
          ...saleData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      
      // Atualizar lista local
      setSales(prev => [data[0], ...prev])
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
      return { data: null, error }
    }
  }

  // Recarregar todos os dados
  const refreshAllData = async () => {
    if (!user) {
      clearAllData()
      return
    }

    await Promise.all([
      fetchProducts(),
      fetchMovements(),
      fetchSales()
    ])
  }

  // Escutar eventos de mudança de usuário
  useEffect(() => {
    const handleUserChange = (event) => {
      const { previousUser, newUser, action } = event.detail
      console.log(`🔄 Usuário mudou: ${previousUser?.email || 'Nenhum'} → ${newUser?.email || 'Nenhum'} (${action})`)
      
      if (action === 'logout') {
        console.log('🧹 Limpando dados devido ao logout')
        clearAllData()
      } else if (action === 'login') {
        console.log('👤 Novo usuário logado, carregando dados')
        refreshAllData()
      }
    }

    const handleUserLogout = (event) => {
      console.log('🚪 Logout detectado, limpando dados imediatamente')
      clearAllData()
    }

    // Escutar eventos customizados
    window.addEventListener('userChanged', handleUserChange)
    window.addEventListener('userLogout', handleUserLogout)

    return () => {
      window.removeEventListener('userChanged', handleUserChange)
      window.removeEventListener('userLogout', handleUserLogout)
    }
  }, [])

  // Limpar dados quando usuário mudar
  useEffect(() => {
    if (user) {
      // Só carregar dados se não tiver produtos carregados
      if (products.length === 0) {
        refreshAllData()
      }
    } else {
      clearAllData()
    }
  }, [user?.id]) // Usar apenas user.id para evitar loops

  const value = {
    // Estados
    products,
    movements,
    sales,
    loading,
    
    // Ações
    fetchProducts,
    fetchMovements,
    fetchSales,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    addSale,
    refreshAllData,
    clearAllData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
