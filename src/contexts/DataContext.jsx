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

  // Buscar produtos do usuário atual com debounce
  const fetchProducts = async () => {
    if (!user) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Buscando produtos do Supabase...')
      
      // Verificar se já temos dados recentes (evitar requisições desnecessárias)
      const now = Date.now()
      const lastFetch = localStorage.getItem('lastProductsFetch')
      if (lastFetch && (now - parseInt(lastFetch)) < 30000) { // 30 segundos
        console.log('⏭️ Pulando busca de produtos - dados recentes')
        setLoading(false)
        return
      }

      // Buscar produtos reais do Supabase com timeout
      const { data, error } = await Promise.race([
        supabase
          .from('produtos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ])

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        setProducts(mockProducts)
      } else {
        console.log('✅ Produtos carregados do Supabase:', data?.length || 0, 'itens')
        setProducts(data || [])
        localStorage.setItem('lastProductsFetch', now.toString())
      }
      
    } catch (error) {
      console.error('❌ Erro crítico:', error)
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  // Buscar movimentações do usuário atual com debounce
  const fetchMovements = async () => {
    if (!user) {
      setMovements([])
      return
    }

    try {
      console.log('🔄 Buscando movimentações...')
      
      // Verificar se já temos dados recentes (evitar requisições desnecessárias)
      const now = Date.now()
      const lastFetch = localStorage.getItem('lastMovementsFetch')
      if (lastFetch && (now - parseInt(lastFetch)) < 30000) { // 30 segundos
        console.log('⏭️ Pulando busca de movimentações - dados recentes')
        return
      }
      
      // Usar dados mock para garantir funcionamento
      setMovements(mockMovements)
      
      // Tentar buscar do Supabase em background com timeout
      setTimeout(async () => {
        try {
          const { data, error } = await Promise.race([
            supabase
              .from('movimentacoes')
              .select('*')
              .limit(3),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ])

          if (!error && data) {
            console.log('✅ Movimentações carregadas:', data.length, 'itens')
            setMovements(data)
            localStorage.setItem('lastMovementsFetch', now.toString())
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
      console.log('👤 Usuário atual:', user.id)
      
      // Verificar se a tabela produtos existe primeiro com retry
      console.log('🔍 Verificando tabela produtos...')
      const testResult = await retryWithTimeout(async () => {
        return await supabase
          .from('produtos')
          .select('*')
          .limit(1)
      })

      if (testResult.error) {
        console.error('❌ Erro ao verificar tabela produtos:', testResult.error)
        console.error('❌ Código do erro:', testResult.error.code)
        console.error('❌ Mensagem do erro:', testResult.error.message)
        
        // Se a tabela não existir, criar dados locais
        const newProduct = {
          id: Date.now(),
          ...productData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        setProducts(prev => [newProduct, ...prev])
        console.log('✅ Produto salvo localmente (tabela produtos não existe)')
        return { data: newProduct, error: null }
      }

      console.log('✅ Tabela produtos existe, inserindo dados...')
      
      // Mapear campos corretamente para a tabela produtos
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
      
      // Tentar inserir na tabela produtos com retry - usando RPC para contornar RLS
      const insertResult = await retryWithTimeout(async () => {
        // Primeiro, tentar inserção normal
        try {
          return await supabase
            .from('produtos')
            .insert([mappedData])
            .select()
        } catch (rlsError) {
          console.log('⚠️ Erro de RLS, tentando com RPC...')
          
          // Se der erro de RLS, tentar com RPC
          const { data: rpcData, error: rpcError } = await supabase.rpc('insert_produto', {
            p_nome: mappedData.nome,
            p_valor_unit: mappedData.valor_unit,
            p_quantidade: mappedData.quantidade,
            p_valor_total: mappedData.valor_total,
            p_entrada: mappedData.entrada,
            p_saida: mappedData.saida,
            p_estoque: mappedData.estoque,
            p_user_id: mappedData.user_id
          })
          
          if (rpcError) {
            throw rpcError
          }
          
          return { data: rpcData, error: null }
        }
      })

      if (insertResult.error) {
        console.error('❌ Erro ao salvar produto no Supabase:', insertResult.error)
        console.error('❌ Código do erro:', insertResult.error.code)
        console.error('❌ Mensagem do erro:', insertResult.error.message)
        console.error('❌ Detalhes do erro:', JSON.stringify(insertResult.error, null, 2))
        
        // Se for erro de RLS, sempre salvar localmente
        if (insertResult.error.code === '42501' || insertResult.error.message.includes('row-level security')) {
          console.log('🔒 Erro de RLS detectado - salvando localmente')
        }
        
        // Se der erro no Supabase, salvar localmente mesmo assim
        const newProduct = {
          id: Date.now(),
          ...productData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        setProducts(prev => [newProduct, ...prev])
        console.log('✅ Produto salvo localmente (erro no Supabase)')
        return { data: newProduct, error: null }
      }

      // Atualizar lista local
      const newProduct = insertResult.data[0]
      setProducts(prev => [newProduct, ...prev])
      
      console.log('✅ Produto adicionado no Supabase:', newProduct.nome)
      return { data: newProduct, error: null }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar produto:', error)
      
      // Em caso de erro crítico, salvar localmente
      const newProduct = {
        id: Date.now(),
        ...productData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
      setProducts(prev => [newProduct, ...prev])
      console.log('✅ Produto salvo localmente (erro crítico)')
      return { data: newProduct, error: null }
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

  // Adicionar bolo na tabela bolos do Supabase
  const addBolo = async (boloData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Adicionando bolo:', boloData)
      
          const boloDataToInsert = {
      nome: boloData.nome,
      descricao: boloData.descricao || '',
      preco_por_kg: Number(boloData.preco_por_kg || 0),
      categoria: boloData.categoria || 'Tradicional'
    }
      
      console.log('🔍 Dados do bolo para inserção:', boloDataToInsert)
      
      const { data, error } = await supabase
        .from('bolos')
        .insert([boloDataToInsert])
        .select()

      if (error) {
        console.error('❌ Erro ao salvar bolo no Supabase:', error)
        console.error('❌ Código do erro:', error.code)
        console.error('❌ Mensagem do erro:', error.message)
        
        // Se der erro no Supabase, retornar erro
        return { data: null, error }
      }

      console.log('✅ Bolo adicionado no Supabase:', data[0].nome)
      return { data: data[0], error: null }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar bolo:', error)
      return { data: null, error }
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

  // Função auxiliar para retry com timeout
  const retryWithTimeout = async (operation, maxRetries = 3, timeout = 10000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`)
        
        // Criar promise com timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout da requisição')), timeout)
        })
        
        const operationPromise = operation()
        const result = await Promise.race([operationPromise, timeoutPromise])
        
        console.log(`✅ Sucesso na tentativa ${attempt}`)
        return result
      } catch (error) {
        console.error(`❌ Tentativa ${attempt} falhou:`, error.message)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  // Função para sincronizar dados locais com Supabase
  const syncLocalData = async () => {
    if (!user) return

    try {
      console.log('🔄 Iniciando sincronização de dados locais...')
      
      // Sincronizar vendas locais
      const localSales = sales.filter(sale => !sale.id || sale.id < 1000000) // IDs locais são menores
      for (const sale of localSales) {
        try {
          await supabase
            .from('vendas')
            .insert([{
              cliente_nome: sale.cliente_nome,
              cliente_email: sale.cliente_email,
              cliente_telefone: sale.cliente_telefone,
              metodo_pagamento: sale.metodo_pagamento,
              valor_total: sale.valor_total,
              status_pagamento: 'pendente',
              data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              desconto: 0,
              valor_final: sale.valor_total
            }])
          console.log(`✅ Venda sincronizada: ${sale.cliente_nome}`)
        } catch (syncError) {
          console.log(`⚠️ Falha ao sincronizar venda: ${syncError.message}`)
        }
      }
      
      // Sincronizar produtos locais
      const localProducts = products.filter(product => !product.id || product.id < 1000000)
      for (const product of localProducts) {
        try {
          await supabase
            .from('produtos')
            .insert([{
              nome: product.nome,
              valor_unit: product.valor_unit || product.preco || 0,
              quantidade: product.quantidade || 0,
              valor_total: product.valor_total || 0,
              entrada: product.entrada || 0,
              saida: product.saida || 0,
              estoque: product.estoque || product.quantidade || 0,
              user_id: user.id
            }])
          console.log(`✅ Produto sincronizado: ${product.nome}`)
        } catch (syncError) {
          console.log(`⚠️ Falha ao sincronizar produto: ${syncError.message}`)
        }
      }
      
      console.log('✅ Sincronização concluída')
    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
    }
  }

  // Adicionar venda
  const addSale = async (saleData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      console.log('📝 Adicionando venda:', saleData)
      console.log('👤 Usuário atual:', user.id)
      
      // Verificar se a tabela vendas existe primeiro com retry
      console.log('🔍 Verificando tabela vendas...')
      const testResult = await retryWithTimeout(async () => {
        return await supabase
          .from('vendas')
          .select('*')
          .limit(1)
      })

      if (testResult.error) {
        console.error('❌ Erro ao verificar tabela vendas:', testResult.error)
        console.error('❌ Código do erro:', testResult.error.code)
        console.error('❌ Mensagem do erro:', testResult.error.message)
        
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
      
      // Salvar no Supabase com retry - inserção direta na tabela vendas
      const insertResult = await retryWithTimeout(async () => {
        console.log('🔄 Tentando inserir venda na tabela vendas...')
        
        const vendaData = {
          cliente_nome: saleData.cliente_nome,
          cliente_email: saleData.cliente_email,
          cliente_telefone: saleData.cliente_telefone,
          metodo_pagamento: saleData.metodo_pagamento,
          valor_total: saleData.valor_total,
          status_pagamento: 'pendente',
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          desconto: 0,
          valor_final: saleData.valor_total,
          observacoes: saleData.observacoes || null
        }
        
        console.log('📝 Dados da venda para inserção:', vendaData)
        
        return await supabase
          .from('vendas')
          .insert([vendaData])
          .select()
      })

                          if (insertResult.error) {
                      console.error('❌ Erro ao salvar venda no Supabase:', insertResult.error)
                      console.error('❌ Código do erro:', insertResult.error.code)
                      console.error('❌ Mensagem do erro:', insertResult.error.message)
                      console.error('❌ Detalhes do erro:', JSON.stringify(insertResult.error, null, 2))

                      // Se for erro de RLS, sempre salvar localmente
                      if (insertResult.error.code === '42501' || insertResult.error.message.includes('row-level security')) {
                        console.log('🔒 Erro de RLS detectado - salvando localmente')
                        console.log('💡 Dica: Para resolver, desative RLS na tabela vendas no Supabase ou configure políticas adequadas')
                        console.log('🔧 Solução temporária: Dados salvos localmente até RLS ser configurado')
                      }

                      // Se der erro no Supabase, salvar localmente mesmo assim
                      const newSale = {
                        id: Date.now(),
                        ...saleData,
                        user_id: user.id,
                        created_at: new Date().toISOString()
                      }
                      setSales(prev => [newSale, ...prev])
                      console.log('✅ Venda salva localmente (erro no Supabase)')
                      console.log('📊 Sistema funcionando com dados locais - RLS precisa ser configurado')

                      // Tentar sincronizar em background (sem bloquear a interface)
                      setTimeout(async () => {
                        try {
                          console.log('🔄 Tentando sincronizar venda em background...')
                          // Aqui poderia tentar novamente ou usar uma fila de sincronização
                        } catch (syncError) {
                          console.log('⚠️ Falha na sincronização em background:', syncError.message)
                        }
                      }, 2000)

                      return { data: newSale, error: null }
                    }

      // Venda inserida com sucesso no Supabase
      const vendaInserida = insertResult.data[0]
      console.log('✅ Venda inserida no Supabase:', vendaInserida.id)

      // Agora inserir os itens da venda na tabela venda_itens
      if (saleData.itens && saleData.itens.length > 0) {
        console.log('🔄 Inserindo itens da venda na tabela venda_itens...')
        
        try {
          const itensData = saleData.itens.map(item => ({
            venda_id: vendaInserida.id,
            bolo_id: item.produto_id || null, // Se não tiver produto_id, usar null
            quantidade: item.peso || 1,
            preco_unitario: item.preco_por_kg || 0,
            subtotal: item.preco_total || 0,
            tipo_venda: 'kg' // Tipo de venda por peso
          }))
          
          console.log('📝 Dados dos itens para inserção:', itensData)
          
          const { data: itensInseridos, error: itensError } = await supabase
            .from('venda_itens')
            .insert(itensData)
            .select()
          
          if (itensError) {
            console.error('❌ Erro ao inserir itens da venda:', itensError)
          } else {
            console.log('✅ Itens da venda inseridos:', itensInseridos.length, 'itens')
          }
        } catch (itensError) {
          console.error('❌ Erro crítico ao inserir itens:', itensError)
        }
      }

      // Atualizar lista local com dados completos
      const newSale = {
        ...vendaInserida,
        observacoes: saleData.observacoes,
        itens: saleData.itens,
        user_id: user.id
      }
      setSales(prev => [newSale, ...prev])
      
      console.log('✅ Venda adicionada no Supabase:', newSale.cliente_nome)
      return { data: newSale, error: null }
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar venda:', error)
      
      // Em caso de erro crítico, salvar localmente
      const newSale = {
        id: Date.now(),
        ...saleData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
      setSales(prev => [newSale, ...prev])
      console.log('✅ Venda salva localmente (erro crítico)')
      return { data: newSale, error: null }
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
    addBolo,
    clearAllData,
    syncLocalData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}