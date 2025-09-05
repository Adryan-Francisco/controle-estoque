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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-white hover:text-gray-200 mb-6 transition-all duration-300 group"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: 'fit-content'
            }}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Voltar</span>
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Histórico de Vendas
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Acompanhe todas as vendas realizadas com análises detalhadas e insights valiosos
            </p>
          </div>
        </div>

        {/* Filtros e Estatísticas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'Todas', icon: '📊' },
                { key: 'today', label: 'Hoje', icon: '📅' },
                { key: 'week', label: 'Última Semana', icon: '📈' },
                { key: 'month', label: 'Último Mês', icon: '📆' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    filter === key 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  minWidth: '140px',
                  color: 'white'
                }}>
                  <p className="text-sm font-medium opacity-90 mb-1">Total de Vendas</p>
                  <p className="text-3xl font-bold">{filteredSales.length}</p>
                </div>
              </div>
              <div className="text-center">
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  minWidth: '140px',
                  color: 'white'
                }}>
                  <p className="text-sm font-medium opacity-90 mb-1">Valor Total</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Vendas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {filteredSales.length === 0 ? (
            <div className="text-center py-16">
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
              }}>
                <Calendar size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhuma venda encontrada</h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {filter === 'all' 
                  ? 'Ainda não há vendas cadastradas no sistema. Comece realizando sua primeira venda!'
                  : `Não há vendas no período selecionado. Tente outro filtro.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSales.map((sale, index) => (
                <div 
                  key={sale.id} 
                  className="group relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Badge de número da venda */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Informações do Cliente */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          padding: '8px',
                          color: 'white'
                        }}>
                          <User size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{sale.cliente_nome}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <div style={{
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '8px',
                            padding: '6px',
                            color: '#667eea'
                          }}>
                            <Calendar size={16} />
                          </div>
                          <span className="font-medium">{formatDate(sale.created_at)}</span>
                        </div>
                        
                        {sale.cliente_email && (
                          <div className="flex items-center gap-2">
                            <div style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              borderRadius: '8px',
                              padding: '6px',
                              color: '#10b981'
                            }}>
                              <Mail size={16} />
                            </div>
                            <span className="font-medium">{sale.cliente_email}</span>
                          </div>
                        )}
                        
                        {sale.cliente_telefone && (
                          <div className="flex items-center gap-2">
                            <div style={{
                              background: 'rgba(245, 158, 11, 0.1)',
                              borderRadius: '8px',
                              padding: '6px',
                              color: '#f59e0b'
                            }}>
                              <Phone size={16} />
                            </div>
                            <span className="font-medium">{sale.cliente_telefone}</span>
                          </div>
                        )}
                      </div>
                      
                      {sale.observacoes && (
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                          borderRadius: '12px',
                          padding: '1rem',
                          marginTop: '1rem'
                        }}>
                          <p className="text-sm text-gray-700 italic">
                            💬 "{sale.observacoes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Valor e Pagamento */}
                    <div className="flex flex-col items-end gap-4">
                      <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        color: 'white',
                        textAlign: 'center',
                        minWidth: '160px',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                      }}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <DollarSign size={20} />
                          <span className="text-sm font-medium opacity-90">Valor Total</span>
                        </div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(sale.valor_total || 0)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-500" />
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentMethodColor(sale.metodo_pagamento)}`}>
                          {getPaymentMethodLabel(sale.metodo_pagamento)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Itens da Venda */}
                  {sale.itens && sale.itens.length > 0 && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: 'rgba(248, 250, 252, 0.8)',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.5)'
                    }}>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Package size={20} className="text-blue-600" />
                        Itens da Venda
                      </h4>
                      <div className="grid gap-3">
                        {sale.itens.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '8px',
                                padding: '6px',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                minWidth: '24px',
                                textAlign: 'center'
                              }}>
                                {itemIndex + 1}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900">{item.nome}</span>
                                <span className="text-sm text-gray-600 ml-2">({item.peso}kg)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {formatCurrency(item.preco_total || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(item.preco_por_kg)}/kg
                              </div>
                            </div>
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
        <div className="mt-8 text-center">
          <button
            onClick={() => refreshAllData(true)}
            className="group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)'
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg 
                className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span>Atualizar Dados</span>
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.5s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.left = '100%'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.left = '-100%'
            }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalesHistory
