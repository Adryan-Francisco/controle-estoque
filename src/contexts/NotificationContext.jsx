import { createContext, useContext, useState, useEffect } from 'react'



import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Buscar notificações do banco de dados
  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Buscar produtos com estoque baixo ou crítico
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)

      if (produtosError) {
        console.error('Erro ao buscar produtos:', produtosError)
        return
      }

      // Buscar bolos com estoque baixo (simulado)
      const { data: bolos, error: bolosError } = await supabase
        .from('bolos')
        .select('*')

      if (bolosError) {
        console.error('Erro ao buscar bolos:', bolosError)
      }

      // Gerar notificações baseadas nos dados reais
      const newNotifications = []

      // Verificar estoque de produtos
      produtos?.forEach(produto => {
        if (produto.estoque <= 0) {
          newNotifications.push({
            id: `produto-${produto.id}-sem-estoque`,
            title: 'Estoque Crítico',
            message: `Produto "${produto.nome}" está sem estoque`,
            time: 'Agora',
            type: 'critical',
            action: 'Ver produto',
            data: { produtoId: produto.id, tipo: 'produto' }
          })
        } else if (produto.estoque <= 5) {
          newNotifications.push({
            id: `produto-${produto.id}-estoque-baixo`,
            title: 'Estoque Baixo',
            message: `Produto "${produto.nome}" com apenas ${produto.estoque} unidades`,
            time: 'Agora',
            type: 'warning',
            action: 'Repor estoque',
            data: { produtoId: produto.id, tipo: 'produto' }
          })
        }
      })

      // Simular notificações de movimentações recentes
      const { data: movimentacoes, error: movimentacoesError } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          produtos (nome)
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (!movimentacoesError && movimentacoes) {
        movimentacoes.forEach(mov => {
          newNotifications.push({
            id: `movimentacao-${mov.id}`,
            title: 'Movimentação Registrada',
            message: `${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${mov.quantidade} unidades de "${mov.produtos?.nome || 'Produto'}" registrada`,
            time: getTimeAgo(mov.created_at),
            type: 'success',
            action: 'Ver movimentação',
            data: { movimentacaoId: mov.id, tipo: 'movimentacao' }
          })
        })
      }

      // Simular notificações de vendas recentes
      const { data: vendas, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2)

      if (!vendasError && vendas) {
        vendas.forEach(venda => {
          newNotifications.push({
            id: `venda-${venda.id}`,
            title: 'Venda Realizada',
            message: `Venda para "${venda.cliente_nome}" no valor de R$ ${venda.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            time: getTimeAgo(venda.created_at),
            type: 'success',
            action: 'Ver venda',
            data: { vendaId: venda.id, tipo: 'venda' }
          })
        })
      }

      // Adicionar notificação de relatório disponível (simulada)
      if (newNotifications.length > 0) {
        newNotifications.push({
          id: 'relatorio-disponivel',
          title: 'Relatório Disponível',
          message: 'Relatório mensal de movimentações gerado automaticamente',
          time: '2 horas',
          type: 'info',
          action: 'Baixar relatório',
          data: { tipo: 'relatorio' }
        })
      }

      setNotifications(newNotifications)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para calcular tempo relativo
  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes} min`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas`
    return `${Math.floor(diffInMinutes / 1440)} dias`
  }

  // Executar ação da notificação
  const executeNotificationAction = async (notification) => {
    const { data, action } = notification

    try {
      switch (data.tipo) {
        case 'produto':
          // Navegar para página de produtos e destacar o produto
          window.location.href = '/products'
          break
        case 'movimentacao':
          // Navegar para página de movimentações
          window.location.href = '/movements'
          break
        case 'venda':
          // Navegar para página de vendas
          window.location.href = '/sales'
          break
        case 'relatorio':
          // Gerar e baixar relatório
          await generateReport()
          break
        default:
          console.log(`Ação não implementada: ${action}`)
      }
    } catch (error) {
      console.error('Erro ao executar ação da notificação:', error)
    }
  }

  // Gerar relatório
  const generateReport = async () => {
    try {
      // Buscar dados para o relatório
      const { data: vendas } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: movimentacoes } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          produtos (nome)
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      // Criar conteúdo do relatório
      const reportContent = `
        <html>
          <head>
            <title>Relatório do Sistema - ${new Date().toLocaleDateString('pt-BR')}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
              .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório do Sistema</h1>
              <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div class="section">
              <h2>Resumo de Vendas</h2>
              <div class="metric">Total de Vendas: ${vendas?.length || 0}</div>
              <div class="metric">Faturamento Total: R$ ${vendas?.reduce((sum, v) => sum + (v.valor_final || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</div>
            </div>
            
            <div class="section">
              <h2>Movimentações Recentes</h2>
              <table class="table">
                <tr><th>Data</th><th>Tipo</th><th>Produto</th><th>Quantidade</th><th>Motivo</th></tr>
                ${movimentacoes?.map(mov => 
                  `<tr><td>${new Date(mov.created_at).toLocaleDateString('pt-BR')}</td><td>${mov.tipo}</td><td>${mov.produtos?.nome || 'N/A'}</td><td>${mov.quantidade}</td><td>${mov.motivo}</td></tr>`
                ).join('') || '<tr><td colspan="5">Nenhuma movimentação encontrada</td></tr>'}
              </table>
            </div>
          </body>
        </html>
      `

      // Baixar relatório
      const blob = new Blob([reportContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-sistema-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    }
  }

  // Marcar notificação como lida
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications([])
  }

  // Atualizar notificações periodicamente
  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const value = {
    notifications,
    loading,
    fetchNotifications,
    executeNotificationAction,
    markAsRead,
    markAllAsRead
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
