import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Calendar, DollarSign, CreditCard, User, Phone, Mail, Edit, Trash2, Save, X } from 'lucide-react'

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
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
      padding: '20px'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            style={{
              background: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              width: 'fit-content'
            }}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar</span>
          </button>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Histórico de Vendas</h1>
            <p className="text-gray-600 text-lg">Acompanhe todas as vendas realizadas</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Vendas</p>
                <p className="text-3xl font-bold text-gray-900">{filteredSales.length}</p>
                <p className="text-sm text-blue-600">• Vendas realizadas</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '12px',
                padding: '12px',
                color: 'white'
              }}>
                <ShoppingCart size={24} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-green-600">• Faturamento</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                padding: '12px',
                color: 'white'
              }}>
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredSales.length > 0 ? formatCurrency(totalValue / filteredSales.length) : 'R$ 0,00'}
                </p>
                <p className="text-sm text-orange-600">• Por venda</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                padding: '12px',
                color: 'white'
              }}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Período</p>
                <p className="text-lg font-bold text-gray-900">
                  {filter === 'all' ? 'Todas' : 
                   filter === 'today' ? 'Hoje' :
                   filter === 'week' ? 'Última Semana' : 'Último Mês'}
                </p>
                <p className="text-sm text-purple-600">• Filtro ativo</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '12px',
                padding: '12px',
                color: 'white'
              }}>
                <Calendar size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'today', label: 'Hoje' },
              { key: 'week', label: 'Última Semana' },
              { key: 'month', label: 'Último Mês' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Vendas */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Vendas</h2>
              <p className="text-sm text-gray-600">Lista detalhada de todas as vendas</p>
            </div>
            <button
              onClick={() => refreshAllData(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
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
            <div className="space-y-4">
              {filteredSales.map((sale, index) => (
                <div 
                  key={sale.id} 
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                >
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            <Edit size={12} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={12} />
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
