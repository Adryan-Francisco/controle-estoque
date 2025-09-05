import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const SupabaseTest = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addTestResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('🔍 Testando conexão com Supabase...', 'info')
      
      // Teste 1: Verificar se está conectado
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        addTestResult(`❌ Erro de autenticação: ${authError.message}`, 'error')
      } else {
        addTestResult(`✅ Usuário autenticado: ${authUser?.email || 'N/A'}`, 'success')
      }

      // Teste 2: Verificar tabela produtos
      addTestResult('🔍 Testando tabela produtos...', 'info')
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select('*')
        .limit(1)

      if (produtosError) {
        addTestResult(`❌ Erro na tabela produtos: ${produtosError.message}`, 'error')
        addTestResult(`❌ Código do erro: ${produtosError.code}`, 'error')
      } else {
        addTestResult(`✅ Tabela produtos OK - ${produtosData?.length || 0} registros encontrados`, 'success')
      }

      // Teste 3: Verificar tabela vendas
      addTestResult('🔍 Testando tabela vendas...', 'info')
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .limit(1)

      if (vendasError) {
        addTestResult(`❌ Erro na tabela vendas: ${vendasError.message}`, 'error')
        addTestResult(`❌ Código do erro: ${vendasError.code}`, 'error')
      } else {
        addTestResult(`✅ Tabela vendas OK - ${vendasData?.length || 0} registros encontrados`, 'success')
      }

      // Teste 4: Tentar inserir um produto de teste
      if (!produtosError) {
        addTestResult('🔍 Testando inserção de produto...', 'info')
        const testProduct = {
          nome: 'Produto Teste',
          valor_unit: 10.00,
          quantidade: 1,
          valor_total: 10.00,
          entrada: 1,
          saida: 0,
          estoque: 1,
          user_id: user?.id || 'test'
        }

        const { data: insertData, error: insertError } = await supabase
          .from('produtos')
          .insert([testProduct])
          .select()

        if (insertError) {
          addTestResult(`❌ Erro ao inserir produto: ${insertError.message}`, 'error')
          addTestResult(`❌ Código do erro: ${insertError.code}`, 'error')
        } else {
          addTestResult(`✅ Produto inserido com sucesso! ID: ${insertData[0]?.id}`, 'success')
          
          // Deletar o produto de teste
          await supabase
            .from('produtos')
            .delete()
            .eq('id', insertData[0].id)
          addTestResult('🗑️ Produto de teste removido', 'info')
        }
      }

      // Teste 5: Verificar autenticação atual
      addTestResult('🔍 Verificando autenticação atual...', 'info')
      const { data: { user: currentUser }, error: currentAuthError } = await supabase.auth.getUser()
      
      if (currentAuthError) {
        addTestResult(`❌ Erro de autenticação: ${currentAuthError.message}`, 'error')
      } else if (!currentUser) {
        addTestResult('❌ Nenhum usuário autenticado', 'error')
        addTestResult('💡 Faça login primeiro para testar inserções', 'info')
      } else {
        addTestResult(`✅ Usuário autenticado: ${currentUser.email}`, 'success')
        addTestResult(`🆔 User ID: ${currentUser.id}`, 'info')
      }

      // Teste 6: Tentar inserir uma venda de teste (apenas se autenticado)
      if (!vendasError && currentUser) {
        addTestResult('🔍 Testando inserção de venda...', 'info')
        const testSale = {
          cliente_nome: 'Cliente Teste',
          cliente_email: 'teste@exemplo.com',
          cliente_telefone: '(11) 99999-9999',
          metodo_pagamento: 'vista',
          valor_total: 50.00,
          status_pagamento: 'pendente',
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          desconto: 0,
          valor_final: 50.00,
          observacoes: 'Teste de inserção'
        }

        try {
          addTestResult('📝 Dados da venda:', 'info')
          addTestResult(JSON.stringify(testSale, null, 2), 'info')
          
          const { data: saleData, error: saleError } = await supabase
            .from('vendas')
            .insert([testSale])
            .select()

          if (saleError) {
            addTestResult(`❌ Erro ao inserir venda: ${saleError.message}`, 'error')
            addTestResult(`❌ Código do erro: ${saleError.code}`, 'error')
            addTestResult(`❌ Detalhes: ${JSON.stringify(saleError, null, 2)}`, 'error')
            
            if (saleError.code === '42501') {
              addTestResult('🔒 Erro de Row Level Security (RLS) detectado', 'error')
              addTestResult('💡 Solução: Verifique as políticas RLS na tabela vendas', 'info')
            } else if (saleError.code === 'PGRST301') {
              addTestResult('🔒 Erro de permissão - usuário não tem acesso', 'error')
              addTestResult('💡 Solução: Verifique se o usuário tem permissão para inserir', 'info')
            }
          } else {
            addTestResult(`✅ Venda inserida com sucesso! ID: ${saleData[0]?.id}`, 'success')
            
            // Deletar a venda de teste
            await supabase
              .from('vendas')
              .delete()
              .eq('id', saleData[0].id)
            addTestResult('🗑️ Venda de teste removida', 'info')
          }
        } catch (networkError) {
          addTestResult(`❌ Erro de rede: ${networkError.message}`, 'error')
        }
      } else if (!currentUser) {
        addTestResult('⏭️ Pulando teste de venda - usuário não autenticado', 'info')
      }

      // Teste 7: Verificar políticas RLS específicas
      if (currentUser) {
        addTestResult('🔍 Verificando políticas RLS...', 'info')
        
        try {
          // Testar SELECT primeiro (geralmente funciona)
          const { data: selectTest, error: selectError } = await supabase
            .from('vendas')
            .select('id')
            .limit(1)
          
          if (selectError) {
            addTestResult(`❌ Erro no SELECT: ${selectError.message}`, 'error')
            addTestResult(`❌ Código: ${selectError.code}`, 'error')
          } else {
            addTestResult('✅ SELECT funcionando - políticas RLS OK', 'success')
          }
        } catch (selectTestError) {
          addTestResult(`❌ Erro no teste SELECT: ${selectTestError.message}`, 'error')
        }
      }

      // Teste 8: Verificar tabela bolos especificamente
      if (currentUser) {
        addTestResult('🔍 Testando tabela bolos...', 'info')
        
        try {
          // Testar SELECT na tabela bolos
          const { data: bolosSelect, error: bolosSelectError } = await supabase
            .from('bolos')
            .select('*')
            .limit(1)
          
          if (bolosSelectError) {
            addTestResult(`❌ Erro no SELECT bolos: ${bolosSelectError.message}`, 'error')
            addTestResult(`❌ Código: ${bolosSelectError.code}`, 'error')
          } else {
            addTestResult('✅ SELECT bolos funcionando', 'success')
          }

          // Testar INSERT na tabela bolos
          addTestResult('🔍 Testando INSERT na tabela bolos...', 'info')
          const testBolo = {
            nome: 'Bolo Teste',
            descricao: 'Teste de inserção',
            preco_por_kg: 25.00,
            categoria: 'Tradicional',
            disponivel: true,
            user_id: currentUser.id
          }

          const { data: boloInsert, error: boloInsertError } = await supabase
            .from('bolos')
            .insert([testBolo])
            .select()

          if (boloInsertError) {
            addTestResult(`❌ Erro no INSERT bolos: ${boloInsertError.message}`, 'error')
            addTestResult(`❌ Código: ${boloInsertError.code}`, 'error')
            
            if (boloInsertError.code === '42501') {
              addTestResult('🔒 Erro de RLS na tabela bolos', 'error')
              addTestResult('💡 Solução: Configure políticas RLS para a tabela bolos', 'info')
            }
          } else {
            addTestResult(`✅ INSERT bolos funcionando! ID: ${boloInsert[0]?.id}`, 'success')
            
            // Deletar o bolo de teste
            await supabase
              .from('bolos')
              .delete()
              .eq('id', boloInsert[0].id)
            addTestResult('🗑️ Bolo de teste removido', 'info')
          }
        } catch (bolosTestError) {
          addTestResult(`❌ Erro no teste bolos: ${bolosTestError.message}`, 'error')
        }
      }

    } catch (error) {
      addTestResult(`❌ Erro crítico: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 1rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🔧 Teste do Supabase
      </h2>
      
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Este teste verifica se a conexão com o Supabase está funcionando e se as tabelas existem.
      </p>

      <button
        onClick={testSupabaseConnection}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '1.5rem',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Testando...' : 'Executar Teste'}
      </button>

      {testResults.length > 0 && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 0.5rem 0'
          }}>
            Resultados do Teste:
          </h3>
          
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {testResults.map((result, index) => (
              <div key={index} style={{
                padding: '0.5rem 0',
                borderBottom: index < testResults.length - 1 ? '1px solid #e2e8f0' : 'none',
                color: result.type === 'error' ? '#dc2626' : 
                       result.type === 'success' ? '#059669' : '#64748b',
                fontSize: '0.9rem',
                fontFamily: 'monospace'
              }}>
                <span style={{ color: '#9ca3af' }}>[{result.timestamp}]</span> {result.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SupabaseTest
