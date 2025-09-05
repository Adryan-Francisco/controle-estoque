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

      // Gerar notificações baseadas nos dados reais
      const newNotifications = []

      // Verificar estoque de produtos
      produtos?.forEach(produto => {
        const estoque = produto.quantidade || 0
        if (estoque <= 0) {
          newNotifications.push({
            id: `produto-${produto.id}-sem-estoque`,
            title: 'Estoque Crítico',
            message: `Produto "${produto.nome}" está sem estoque`,
            time: 'Agora',
            type: 'critical',
            action: 'Ver produto',
            data: { produtoId: produto.id, tipo: 'produto' }
          })
        } else if (estoque <= 5) {
          newNotifications.push({
            id: `produto-${produto.id}-estoque-baixo`,
            title: 'Estoque Baixo',
            message: `Produto "${produto.nome}" com apenas ${estoque} unidades`,
            time: 'Agora',
            type: 'warning',
            action: 'Repor estoque',
            data: { produtoId: produto.id, tipo: 'produto' }
          })
        }
      })

      // Simular notificações de movimentações recentes
      try {
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
      } catch (movError) {
        console.log('Movimentações não disponíveis:', movError)
      }

      // Adicionar notificações de sistema
      if (newNotifications.length === 0) {
        newNotifications.push({
          id: 'sistema-sem-notificacoes',
          title: 'Sistema Atualizado',
          message: 'Nenhuma notificação pendente no momento',
          time: 'Agora',
          type: 'info',
          action: 'Ver dashboard',
          data: { tipo: 'sistema' }
        })
      }

      // Adicionar notificação de relatório semanal
      const today = new Date()
      const dayOfWeek = today.getDay()
      if (dayOfWeek === 1) { // Segunda-feira
        newNotifications.push({
          id: 'relatorio-semanal',
          title: 'Relatório Semanal',
          message: 'Relatório de movimentações da semana passada está disponível',
          time: 'Agora',
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
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  // Marcar notificação como lida
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  // Remover notificação
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  // Executar ação da notificação
  const executeAction = (notification) => {
    markAsRead(notification.id)
    
    switch (notification.data?.tipo) {
      case 'produto':
        // Navegar para página de produtos
        console.log('Navegando para produto:', notification.data.produtoId)
        break
      case 'movimentacao':
        // Navegar para página de movimentações
        console.log('Navegando para movimentação:', notification.data.movimentacaoId)
        break
      case 'relatorio':
        // Baixar relatório
        console.log('Baixando relatório')
        break
      case 'sistema':
        // Navegar para dashboard
        console.log('Navegando para dashboard')
        break
      default:
        console.log('Ação não implementada:', notification.action)
    }
  }

  // Buscar notificações quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
    }
  }, [user])

  // Atualizar notificações a cada 5 minutos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [user])

  const value = {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    executeAction
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext