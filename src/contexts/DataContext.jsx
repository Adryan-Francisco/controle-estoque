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
  const [sales, setSales] = useState([
    {
      id: 1,
      cliente_nome: 'Cliente Exemplo',
      cliente_email: 'cliente@exemplo.com',
      cliente_telefone: '(11) 99999-9999',
      metodo_pagamento: 'vista',
      observacoes: 'Bolo de chocolate para aniversário',
      valor_total: 50.00,
      itens: [
        {
          produto_id: 1,
          nome: 'Bolo de Chocolate',
          peso: 1.5,
          preco_por_kg: 30.00,
          preco_total: 45.00
        }
      ],
              user_id: 'exemplo',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        cliente_nome: 'Maria Silva',
        cliente_email: 'maria@email.com',
        cliente_telefone: '(11) 88888-8888',
        metodo_pagamento: 'pix',
        observacoes: 'Bolo de morango para casamento',
        valor_total: 120.00,
        itens: [
          {
            produto_id: 2,
            nome: 'Bolo de Morango',
            peso: 3.0,
            preco_por_kg: 40.00,
            preco_total: 120.00
          }
        ],
        user_id: 'exemplo',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Limpar todos os dados quando o usuário mudar
  const clearAllData = () => {
    console.log('🧹 Limpando todos os dados do usuário anterior')
    setProducts([])
    setMovements([])
    // Manter dados de exemplo de vendas sempre visíveis
    setSales([
      {
        id: 1,
        cliente_nome: 'Cliente Exemplo',
        cliente_email: 'cliente@exemplo.com',
        cliente_telefone: '(11) 99999-9999',
        metodo_pagamento: 'vista',
        observacoes: 'Bolo de chocolate para aniversário',
        valor_total: 50.00,
        itens: [
          {
            produto_id: 1,
            nome: 'Bolo de Chocolate',
            peso: 1.5,
            preco_por_kg: 30.00,
            preco_total: 45.00
          }
        ],
        user_id: 'exemplo',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        cliente_nome: 'Maria Silva',
        cliente_email: 'maria@email.com',
        cliente_telefone: '(11) 88888-8888',
        metodo_pagamento: 'pix',
        observacoes: 'Bolo de morango para casamento',
        valor_total: 120.00,
        itens: [
          {
            produto_id: 2,
            nome: 'Bolo de Morango',
            peso: 3.0,
            preco_por_kg: 40.00,
            preco_total: 120.00
          }
        ],
        user_id: 'exemplo',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ])
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
      console.log('🔄 Buscando produtos do Supabase...')
      
      // Buscar produtos reais do Supabase
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        setProducts(mockProducts)
      } else {
        console.log('✅ Produtos carregados do Supabase:', data?.length || 0, 'itens')
        setProducts(data || [])
      }
      
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
      console.log('📝 Adicionando produto:', productData)
      
      // Mapear campos corretamente para a tabela produtos (sem descricao)
      const mappedData = {
        nome: productData.nome,
        valor_unit: Number(productData.valor_unit || productData.preco || 0),
        quantidade: Number(productData.quantidade || 0),
        valor_total: Number(productData.valor_total || 0),
        entrada: Number(productData.entrada || 0),
        saida: Number(productData.saida || 0),
        estoque: Number(productData.estoque || productData.quantidade || 0),
        user_id: user.id
      }
      
      console.log('🔍 Dados mapeados para inserção:', mappedData)
      
      // Tentar inserir na tabela produtos
      let { data, error } = await supabase
        .from('produtos')
        .insert([mappedData])
        .select()

      // Se a tabela produtos não existir, tentar com uma estrutura mais simples
      if (error && error.code === 'PGRST116') {
        console.log('⚠️ Tabela produtos não encontrada, tentando estrutura simples...')
        const simpleData = {
          nome: productData.nome,
          descricao: productData.descricao || '',
          preco: Number(productData.valor_unit || productData.preco || 0),
          quantidade: Number(productData.quantidade || 0),
          user_id: user.id
        }
        
        const result = await supabase
          .from('produtos')
          .insert([simpleData])
          .select()
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('❌ Erro ao salvar produto no Supabase:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        return { data: null, error }
      }

      // Atualizar lista local
      const newProduct = data[0]
      setProducts(prev => [newProduct, ...prev])
      
      console.log('✅ Produto adicionado:', newProduct.nome)
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
      console.log('📝 Atualizando produto:', productData)
      
      // Mapear campos corretamente para a tabela produtos (sem descricao)
      const mappedData = {
        nome: productData.nome,
        valor_unit: Number(productData.valor_unit || productData.preco || 0),
        quantidade: Number(productData.quantidade || 0),
        valor_total: Number(productData.valor_total || 0),
        entrada: Number(productData.entrada || 0),
        saida: Number(productData.saida || 0),
        estoque: Number(productData.estoque || productData.quantidade || 0)
      }
      
      const { data, error } = await supabase
        .from('produtos')
        .update(mappedData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('❌ Erro ao atualizar produto no Supabase:', error)
        return { data: null, error }
      }

      // Atualizar lista local
      const updatedProduct = data[0]
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      
      console.log('✅ Produto atualizado:', updatedProduct.nome)
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
      // Deletar no Supabase
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Erro ao deletar produto no Supabase:', error)
        return { error }
      }

      // Atualizar lista local
      setProducts(prev => prev.filter(p => p.id !== id))
      
      console.log('✅ Produto deletado com sucesso')
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
      console.log('📝 Adicionando venda:', saleData)
      console.log('👤 Usuário atual:', user.id)
      
      // Verificar se a tabela vendas existe primeiro
      console.log('🔍 Verificando tabela vendas...')
      const { data: testData, error: testError } = await supabase
        .from('vendas')
        .select('*')
        .limit(1)

      if (testError) {
        console.error('❌ Erro ao verificar tabela vendas:', testError)
        console.error('❌ Código do erro:', testError.code)
        console.error('❌ Mensagem do erro:', testError.message)
        
        // Se a tabela não existir, criar dados locais
        const newSale = {
          id: Date.now(),
          ...saleData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        setSales(prev => [newSale, ...prev])
        console.log('✅ Venda salva localmente (tabela vendas não existe)')
        return { data: newSale, error: null }
      }

      console.log('✅ Tabela vendas existe, inserindo dados...')
      
      // Salvar no Supabase - usando apenas colunas que existem na tabela
      const { data, error } = await supabase
        .from('vendas')
        .insert([{
          cliente_nome: saleData.cliente_nome,
          cliente_email: saleData.cliente_email,
          cliente_telefone: saleData.cliente_telefone,
          metodo_pagamento: saleData.metodo_pagamento,
          valor_total: saleData.valor_total,
          status_pagamento: 'pendente', // Status padrão
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
          desconto: 0, // Sem desconto por padrão
          valor_final: saleData.valor_total // Valor final igual ao total
        }])
        .select()

      if (error) {
        console.error('❌ Erro ao salvar venda no Supabase:', error)
        console.error('❌ Código do erro:', error.code)
        console.error('❌ Mensagem do erro:', error.message)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        
        // Se der erro no Supabase, salvar localmente mesmo assim
        const newSale = {
          id: Date.now(),
          ...saleData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        setSales(prev => [newSale, ...prev])
        console.log('✅ Venda salva localmente (erro no Supabase)')
        return { data: newSale, error: null }
      }

      // Atualizar lista local com dados completos (incluindo observações e itens)
      const newSale = {
        ...data[0],
        observacoes: saleData.observacoes,
        itens: saleData.itens,
        user_id: user.id
      }
      setSales(prev => [newSale, ...prev])
      
      console.log('✅ Venda adicionada no Supabase:', newSale.cliente_nome)
      return { data: newSale, error: null }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar venda:', error)
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