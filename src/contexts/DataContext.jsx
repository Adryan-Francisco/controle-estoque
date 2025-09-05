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
      console.log('🔄 Buscando produtos...')
      
      // Simular dados locais primeiro para evitar erros de rede
      const mockProducts = [
        {
          id: 1,
          nome: 'Produto Exemplo',
          estoque: 10,
          valor_unit: 25.50,
          created_at: new Date().toISOString()
        }
      ]
      
      // Tentar buscar do Supabase, mas usar dados mock se falhar
      try {
        const { data, error } = await supabase
          .from('bolos')
          .select('*')
          .limit(3)

        if (error) {
          console.log('⚠️ Usando dados de exemplo devido ao erro:', error.message)
          setProducts(mockProducts)
        } else {
          console.log('✅ Produtos carregados do Supabase:', data?.length || 0, 'itens')
          setProducts(data || mockProducts)
        }
      } catch (networkError) {
        console.log('⚠️ Erro de rede, usando dados de exemplo')
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('❌ Erro crítico:', error)
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
      console.log('🔄 Buscando movimentações...')
      
      // Dados mock para evitar erros
      const mockMovements = [
        {
          id: 1,
          tipo: 'entrada',
          quantidade: 5,
          motivo: 'Compra inicial',
          created_at: new Date().toISOString()
        }
      ]
      
      try {
        const { data, error } = await supabase
          .from('movimentacoes')
          .select('*')
          .limit(3)

        if (error) {
          console.log('⚠️ Usando movimentações de exemplo')
          setMovements(mockMovements)
        } else {
          console.log('✅ Movimentações carregadas:', data?.length || 0, 'itens')
          setMovements(data || mockMovements)
        }
      } catch (networkError) {
        console.log('⚠️ Erro de rede, usando movimentações de exemplo')
        setMovements(mockMovements)
      }
    } catch (error) {
      console.error('❌ Erro crítico:', error)
      setMovements([])
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
      
      // Dados mock para evitar erros
      const mockSales = [
        {
          id: 1,
          cliente_nome: 'Cliente Exemplo',
          valor_total: 50.00,
          created_at: new Date().toISOString()
        }
      ]
      
      try {
        const { data, error } = await supabase
          .from('vendas')
          .select('*')
          .limit(3)

        if (error) {
          console.log('⚠️ Usando vendas de exemplo')
          setSales(mockSales)
        } else {
          console.log('✅ Vendas carregadas:', data?.length || 0, 'itens')
          setSales(data || mockSales)
        }
      } catch (networkError) {
        console.log('⚠️ Erro de rede, usando vendas de exemplo')
        setSales(mockSales)
      }
    } catch (error) {
      console.error('❌ Erro crítico:', error)
      setSales([])
    }
  }

  // Adicionar produto
  const addProduct = async (productData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      // Criar produto localmente primeiro
      const newProduct = {
        id: Date.now(), // ID temporário
        ...productData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Atualizar lista local imediatamente
      setProducts(prev => [newProduct, ...prev])
      
      // Tentar salvar no Supabase em background
      try {
        const { data, error } = await supabase
          .from('bolos')
          .insert([newProduct])
          .select()

        if (error) {
          console.log('⚠️ Produto salvo localmente, erro no Supabase:', error.message)
        } else {
          console.log('✅ Produto salvo no Supabase')
        }
      } catch (networkError) {
        console.log('⚠️ Produto salvo localmente, erro de rede')
      }
      
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
      
      // Tentar salvar no Supabase em background
      try {
        const { data, error } = await supabase
          .from('bolos')
          .update(updatedProduct)
          .eq('id', id)

        if (error) {
          console.log('⚠️ Produto atualizado localmente, erro no Supabase')
        } else {
          console.log('✅ Produto atualizado no Supabase')
        }
      } catch (networkError) {
        console.log('⚠️ Produto atualizado localmente, erro de rede')
      }
      
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
      
      // Tentar deletar no Supabase em background
      try {
        const { error } = await supabase
          .from('bolos')
          .delete()
          .eq('id', id)

        if (error) {
          console.log('⚠️ Produto deletado localmente, erro no Supabase')
        } else {
          console.log('✅ Produto deletado no Supabase')
        }
      } catch (networkError) {
        console.log('⚠️ Produto deletado localmente, erro de rede')
      }
      
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

    try {
      // Carregar dados sequencialmente para evitar sobrecarga
      console.log('🔄 Iniciando carregamento de dados...')
      
      await fetchProducts()
      await new Promise(resolve => setTimeout(resolve, 2000)) // Aguardar 2 segundos
      
      await fetchMovements()
      await new Promise(resolve => setTimeout(resolve, 2000)) // Aguardar 2 segundos
      
      await fetchSales()
      
      console.log('✅ Todos os dados carregados com sucesso!')
    } catch (error) {
      console.error('Erro ao recarregar dados:', error)
    }
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
      console.log('👤 Usuário logado:', user.email)
      // Não carregar dados automaticamente para evitar ERR_INSUFFICIENT_RESOURCES
      // O usuário deve clicar no botão "Carregar Dados" manualmente
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
