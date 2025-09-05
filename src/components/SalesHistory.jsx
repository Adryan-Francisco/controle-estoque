import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Calendar, DollarSign, CreditCard, User, Phone, Mail } from 'lucide-react'

const SalesHistory = ({ onBack }) => {
  const { sales, isLoading, refreshAllData } = useData()
  const { user } = useAuth()
  const [filteredSales, setFilteredSales] = useState([])
  const [filter, setFilter] = useState('all') // all, today, week, month

  useEffect(() => {
    if (sales && sales.length > 0) {
      let filtered = [...sales]
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (filter) {
        case 'today':
          filtered = sales.filter(sale => {
            const saleDate = new Date(sale.created_at)
            return saleDate >= today
          })
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = sales.filter(sale => {
            const saleDate = new Date(sale.created_at)
            return saleDate >= weekAgo
          })
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = sales.filter(sale => {
            const saleDate = new Date(sale.created_at)
            return saleDate >= monthAgo
          })
          break
        default:
          filtered = sales
      }
      
      // Ordenar por data mais recente
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setFilteredSales(filtered)
    } else {
      setFilteredSales([])
    }
  }, [sales, filter])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodColor = (method) => {
    const colors = {
      'vista': 'bg-blue-100 text-blue-800',
      'pix': 'bg-green-100 text-green-800',
      'cartao': 'bg-purple-100 text-purple-800',
      'debito': 'bg-orange-100 text-orange-800',
      'credito': 'bg-red-100 text-red-800'
    }
    return colors[method] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'vista': 'À Vista',
      'pix': 'PIX',
      'cartao': 'Cartão',
      'debito': 'Débito',
      'credito': 'Crédito'
    }
    return labels[method] || method
  }

  const totalValue = filteredSales.reduce((sum, sale) => sum + (sale.valor_total || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--gray-50) 100%)',
      padding: '20px'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Vendas</h1>
          <p className="text-gray-600">Acompanhe todas as vendas realizadas</p>
        </div>

        {/* Filtros e Estatísticas */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'today' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Última Semana
              </button>
              <button
                onClick={() => setFilter('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Último Mês
              </button>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Vendas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Ainda não há vendas cadastradas no sistema.'
                  : `Não há vendas no período selecionado.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Informações do Cliente */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User size={16} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-900">{sale.cliente_nome}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(sale.created_at)}</span>
                        </div>
                        
                        {sale.cliente_email && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{sale.cliente_email}</span>
                          </div>
                        )}
                        
                        {sale.cliente_telefone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{sale.cliente_telefone}</span>
                          </div>
                        )}
                      </div>
                      
                      {sale.observacoes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{sale.observacoes}"
                        </p>
                      )}
                    </div>

                    {/* Valor e Pagamento */}
                    <div className="flex flex-col lg:items-end gap-2">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(sale.valor_total || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-gray-500" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(sale.metodo_pagamento)}`}>
                          {getPaymentMethodLabel(sale.metodo_pagamento)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Itens da Venda */}
                  {sale.itens && sale.itens.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Itens:</h4>
                      <div className="space-y-1">
                        {sale.itens.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm text-gray-600">
                            <span>{item.nome} ({item.peso}kg)</span>
                            <span>{formatCurrency(item.preco_total || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Atualizar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => refreshAllData(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalesHistory
