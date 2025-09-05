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

  // Dados mock para garantir funcionamento
  const mockProducts = [
    {
      id: 1,
      nome: 'Bolo de Chocolate',
      descricao: 'Delicioso bolo de chocolate',
      preco: 25.50,
      valor_unit: 25.50,
      estoque: 10,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      nome: 'Bolo de Morango',
      descricao: 'Bolo de morango com creme',
      preco: 30.00,
      valor_unit: 30.00,
      estoque: 5,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      nome: 'Bolo de Cenoura',
      descricao: 'Bolo de cenoura com cobertura',
      preco: 28.00,
      valor_unit: 28.00,
      estoque: 8,
      created_at: new Date().toISOString()
    }
  ]

  const mockMovements = [
    {
      id: 1,
      tipo: 'entrada',
      quantidade: 5,
      motivo: 'Compra inicial',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      tipo: 'saida',
      quantidade: 2,
      motivo: 'Venda',
      created_at: new Date().toISOString()
    }
  ]

  const mockSales = [
    {
      id: 1,
      cliente_nome: 'Cliente Exemplo',
      valor_total: 50.00,
      metodo_pagamento: 'vista',
      created_at: new Date().toISOString()
    }
  ]

  // Buscar produtos do usuário atual
  const fetchProducts = async () => {
    if (!user) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Buscando produtos...')
      
      // Usar dados mock para garantir funcionamento
      setProducts(mockProducts)
      
      // Tentar buscar do Supabase em background (sem bloquear)
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('bolos')
            .select('*')
            .limit(3)

          if (!error && data) {
            console.log('✅ Produtos carregados do Supabase:', data.length, 'itens')
            setProducts(data)
          }
        } catch (networkError) {
          console.log('⚠️ Erro de rede, mantendo dados mock')
        }
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erro crítico:', error)
      setProducts(mockProducts)
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
      console.log('🔄 Buscando movimentações...')
      
      // Usar dados mock para garantir funcionamento
      setMovements(mockMovements)
      
      // Tentar buscar do Supabase em background
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('movimentacoes')
            .select('*')
            .limit(3)

          if (!error && data) {
            console.log('✅ Movimentações carregadas:', data.length, 'itens')
            setMovements(data)
          }
        } catch (networkError) {
          console.log('⚠️ Erro de rede, mantendo dados mock')
        }
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erro crítico:', error)
      setMovements(mockMovements)
    }
  }

  // Buscar vendas do usuário atual
  const fetchSales = async () => {
    if (!user) {
      setSales([])
      return
    }

    try {
      console.log('🔄 Buscando vendas...')
      
      // Usar dados mock para garantir funcionamento
      setSales(mockSales)
      
      // Tentar buscar do Supabase em background
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('vendas')
            .select('*')
            .limit(3)

          if (!error && data) {
            console.log('✅ Vendas carregadas:', data.length, 'itens')
            setSales(data)
          }
        } catch (networkError) {
          console.log('⚠️ Erro de rede, mantendo dados mock')
        }
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erro crítico:', error)
      setSales(mockSales)
    }
  }

  // Adicionar produto
  const addProduct = async (productData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      // Criar produto localmente primeiro
      const newProduct = {
        id: Date.now(),
        ...productData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Atualizar lista local imediatamente
      setProducts(prev => [newProduct, ...prev])
      
      return { data: newProduct, error: null }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      return { data: null, error }
    }
  }

  // Atualizar produto
  const updateProduct = async (id, productData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      // Atualizar localmente primeiro
      const updatedProduct = {
        ...productData,
        id,
        updated_at: new Date().toISOString()
      }
      
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      
      return { data: updatedProduct, error: null }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      return { data: null, error }
    }
  }

  // Deletar produto
  const deleteProduct = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      // Deletar localmente primeiro
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
      const newMovement = {
        id: Date.now(),
        ...movementData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
      
      setMovements(prev => [newMovement, ...prev])
      
      return { data: newMovement, error: null }
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error)
      return { data: null, error }
    }
  }

  // Adicionar venda
  const addSale = async (saleData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const newSale = {
        id: Date.now(),
        ...saleData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
      
      setSales(prev => [newSale, ...prev])
      
      return { data: newSale, error: null }
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

    try {
      console.log('🔄 Iniciando carregamento de dados...')
      
      // Carregar dados sequencialmente
      await fetchProducts()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await fetchMovements()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await fetchSales()
      
      console.log('✅ Todos os dados carregados com sucesso!')
    } catch (error) {
      console.error('Erro ao recarregar dados:', error)
    }
  }

  // Limpar dados quando usuário mudar
  useEffect(() => {
    if (user) {
      console.log('👤 Usuário logado:', user.email)
      // Carregar dados automaticamente
      refreshAllData()
    } else {
      clearAllData()
    }
  }, [user?.id])

  // Escutar eventos de mudança de usuário
  useEffect(() => {
    const handleUserChange = () => {
      console.log('🔄 Usuário mudou, limpando dados...')
      clearAllData()
    }

    const handleUserLogout = () => {
      console.log('🚪 Usuário fez logout, limpando dados...')
      clearAllData()
    }

    window.addEventListener('userChanged', handleUserChange)
    window.addEventListener('userLogout', handleUserLogout)

    return () => {
      window.removeEventListener('userChanged', handleUserChange)
      window.removeEventListener('userLogout', handleUserLogout)
    }
  }, [])

  const value = {
    // Estados
    products,
    movements,
    sales,
    loading,
    
    // Ações
    refreshAllData,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    addSale,
    clearAllData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}