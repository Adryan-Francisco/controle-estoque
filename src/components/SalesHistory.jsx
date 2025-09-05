import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Calendar, DollarSign, CreditCard, User, Phone, Mail, Edit, Trash2, Save, X, ShoppingCart, TrendingUp, Package } from 'lucide-react'

const SalesHistory = ({ onBack }) => {
  const { sales, isLoading, refreshAllData, updateSale, deleteSale } = useData()
  const { user } = useAuth()
  const [filteredSales, setFilteredSales] = useState([])
  const [filter, setFilter] = useState('all') // all, today, week, month
  const [editingSale, setEditingSale] = useState(null)
  const [editForm, setEditForm] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    metodo_pagamento: 'vista',
    observacoes: ''
  })

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

  const handleEditSale = (sale) => {
    setEditingSale(sale.id)
    setEditForm({
      cliente_nome: sale.cliente_nome || '',
      cliente_email: sale.cliente_email || '',
      cliente_telefone: sale.cliente_telefone || '',
      metodo_pagamento: sale.metodo_pagamento || 'vista',
      observacoes: sale.observacoes || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingSale) return

    try {
      const { error } = await updateSale(editingSale, editForm)
      if (error) {
        console.error('Erro ao atualizar venda:', error)
        alert('Erro ao atualizar venda. Tente novamente.')
        return
      }

      setEditingSale(null)
      setEditForm({
        cliente_nome: '',
        cliente_email: '',
        cliente_telefone: '',
        metodo_pagamento: 'vista',
        observacoes: ''
      })
    } catch (error) {
      console.error('Erro ao salvar venda:', error)
      alert('Erro ao salvar venda. Tente novamente.')
    }
  }

  const handleCancelEdit = () => {
    setEditingSale(null)
    setEditForm({
      cliente_nome: '',
      cliente_email: '',
      cliente_telefone: '',
      metodo_pagamento: 'vista',
      observacoes: ''
    })
  }

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await deleteSale(saleId)
      if (error) {
        console.error('Erro ao deletar venda:', error)
        alert('Erro ao deletar venda. Tente novamente.')
        return
      }
    } catch (error) {
      console.error('Erro ao deletar venda:', error)
      alert('Erro ao deletar venda. Tente novamente.')
    }
  }

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
      padding: '20px',
      position: 'relative'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: '0 0 50px 50px'
      }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-white hover:text-gray-200 mb-8 transition-all duration-300 group"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '14px 24px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              width: 'fit-content',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Voltar ao Dashboard</span>
          </button>
          
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4" style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Histórico de Vendas
            </h1>
            <p className="text-xl text-white/90 font-medium" style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
              Acompanhe todas as vendas realizadas em tempo real
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Decorative gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '0 20px 0 100px',
              opacity: 0.1
            }} />
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total de Vendas</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">{filteredSales.length}</p>
                <p className="text-sm text-blue-600 font-medium">• Vendas realizadas</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}>
                <ShoppingCart size={28} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Decorative gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '0 20px 0 100px',
              opacity: 0.1
            }} />
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Valor Total</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-green-600 font-medium">• Faturamento</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
              }}>
                <DollarSign size={28} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Decorative gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '0 20px 0 100px',
              opacity: 0.1
            }} />
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Ticket Médio</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {filteredSales.length > 0 ? formatCurrency(totalValue / filteredSales.length) : 'R$ 0,00'}
                </p>
                <p className="text-sm text-orange-600 font-medium">• Por venda</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
              }}>
                <TrendingUp size={28} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Decorative gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '0 20px 0 100px',
              opacity: 0.1
            }} />
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Período</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {filter === 'all' ? 'Todas' : 
                   filter === 'today' ? 'Hoje' :
                   filter === 'week' ? 'Última Semana' : 'Último Mês'}
                </p>
                <p className="text-sm text-purple-600 font-medium">• Filtro ativo</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white',
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}>
                <Calendar size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '8px',
              color: 'white'
            }}>
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Filtros de Período</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'all', label: 'Todas', icon: '📊' },
              { key: 'today', label: 'Hoje', icon: '📅' },
              { key: 'week', label: 'Última Semana', icon: '📈' },
              { key: 'month', label: 'Último Mês', icon: '🗓️' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
                }`}
                style={{
                  boxShadow: filter === key 
                    ? '0 10px 25px rgba(59, 130, 246, 0.3)' 
                    : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Vendas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Vendas</h2>
              <p className="text-lg text-gray-600">Lista detalhada de todas as vendas realizadas</p>
            </div>
            <button
              onClick={() => refreshAllData(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar Dados
            </button>
          </div>

          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white'
              }}>
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Ainda não há vendas cadastradas no sistema.'
                  : `Não há vendas no período selecionado.`
                }
              </p>
            </div>
          ) : (
                                  <div className="space-y-6">
                        {filteredSales.map((sale, index) => (
                          <div
                            key={sale.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '16px',
                              padding: '1.5rem',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)'
                              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)'
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                            }}
                          >
                            {/* Decorative gradient */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '0 16px 0 60px',
                              opacity: 0.1
                            }} />
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Informações do Cliente */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div style={{
                            background: '#3b82f6',
                            borderRadius: '8px',
                            padding: '6px',
                            color: 'white'
                          }}>
                            <User size={16} />
                          </div>
                          <h3 className="font-semibold text-gray-900">{sale.cliente_nome}</h3>
                          <span style={{
                            background: '#e5e7eb',
                            color: '#374151',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            #{index + 1}
                          </span>
                        </div>
                        
                        {/* Botões de Ação */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 hover:shadow-md hover:scale-105 border border-blue-200"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 hover:shadow-md hover:scale-105 border border-red-200"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(sale.created_at)}</span>
                        </div>
                        
                        {sale.cliente_email && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} className="text-gray-400" />
                            <span>{sale.cliente_email}</span>
                          </div>
                        )}
                        
                        {sale.cliente_telefone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" />
                            <span>{sale.cliente_telefone}</span>
                          </div>
                        )}
                      </div>
                      
                      {sale.observacoes && (
                        <div style={{
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          borderRadius: '6px',
                          padding: '0.75rem',
                          marginTop: '0.75rem'
                        }}>
                          <p className="text-sm text-gray-700 italic">
                            "{sale.observacoes}"
                          </p>
                        </div>
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
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Package size={16} className="text-blue-600" />
                        Itens da Venda
                      </h4>
                      <div className="space-y-2">
                        {sale.itens.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span style={{
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                minWidth: '20px',
                                textAlign: 'center'
                              }}>
                                {itemIndex + 1}
                              </span>
                              <span className="font-medium text-gray-900">{item.nome}</span>
                              <span className="text-gray-500">({item.peso}kg)</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-green-600">
                                {formatCurrency(item.preco_total || 0)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatCurrency(item.preco_por_kg)}/kg
                              </span>
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

        {/* Modal de Edição de Venda */}
        {editingSale && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  Editar Venda
                </h2>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={editForm.cliente_nome}
                    onChange={(e) => setEditForm({...editForm, cliente_nome: e.target.value})}
                    placeholder="Nome completo"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.cliente_email}
                    onChange={(e) => setEditForm({...editForm, cliente_email: e.target.value})}
                    placeholder="email@exemplo.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editForm.cliente_telefone}
                    onChange={(e) => setEditForm({...editForm, cliente_telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Forma de Pagamento
                  </label>
                  <select
                    value={editForm.metodo_pagamento}
                    onChange={(e) => setEditForm({...editForm, metodo_pagamento: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="vista">À Vista</option>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Observações
                  </label>
                  <textarea
                    value={editForm.observacoes}
                    onChange={(e) => setEditForm({...editForm, observacoes: e.target.value})}
                    placeholder="Observações sobre a venda..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save size={16} />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default SalesHistory
