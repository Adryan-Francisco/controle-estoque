import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  ArrowLeft
} from 'lucide-react'

const SalesReports = ({ onBack }) => {
  const { user } = useAuth()
  const { sales, loading, refreshAllData } = useData()
  const [dateFilter, setDateFilter] = useState('7')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (sales.length === 0) {
      refreshAllData()
    }
  }, [])

  // Filtrar vendas por período
  const getFilteredSales = () => {
    if (!sales || sales.length === 0) return []
    
    const now = new Date()
        const days = parseInt(dateFilter)
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at)
      return saleDate >= startDate
    })
  }

  const filteredSales = getFilteredSales()

  // Calcular estatísticas
  const getStats = () => {
    const totalVendas = filteredSales.length
    const totalFaturamento = filteredSales.reduce((sum, sale) => sum + (sale.valor_total || 0), 0)
    const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0

    return {
      totalVendas,
      totalFaturamento,
      ticketMedio
    }
  }

  const stats = getStats()

  // Formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Carregando relatórios...
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b',
                margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BarChart3 size={32} />
            Relatórios de Vendas
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Análise de vendas e performance
              </p>
            </div>
            
              <button
          onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#1e293b',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
                  cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
        >
          <ArrowLeft size={18} />
          Voltar ao Dashboard
              </button>
          </div>

          {/* Filtros */}
            <div style={{
        background: 'white',
        borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0,
                  display: 'flex',
                  alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Filter size={20} />
            Filtros
          </h2>
              
              <button
            onClick={refreshAllData}
            disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
                  border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
                  cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} />
            Atualizar
              </button>
            </div>

            <div style={{
              display: 'flex',
          gap: '1rem',
              alignItems: 'center'
            }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Período
            </label>
              <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
                style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                  background: 'white'
                }}
              >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div style={{
          display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
            padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <ShoppingCart size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.totalVendas}
              </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Total de Vendas
            </div>
          </div>

          <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
            padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <DollarSign size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {formatCurrency(stats.totalFaturamento)}
              </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Faturamento Total
            </div>
          </div>

          <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
            padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <TrendingUp size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {formatCurrency(stats.ticketMedio)}
              </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Ticket Médio
            </div>
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
        <h2 style={{
              fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Calendar size={24} />
          Vendas Recentes
        </h2>
        
        {filteredSales.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Nenhuma venda encontrada no período selecionado.</p>
              </div>
        ) : (
            <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {filteredSales.map(sale => (
              <div key={sale.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: '#f8fafc'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <div>
            <h3 style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      color: '#1e293b'
                    }}>
                      {sale.cliente_nome || 'Cliente não informado'}
            </h3>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      color: '#64748b',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(sale.created_at)}
                    </p>
              </div>

                        <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                        fontWeight: '600',
                      color: '#059669'
                      }}>
                      {formatCurrency(sale.valor_total || 0)}
                    </div>
                      <div style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      textTransform: 'capitalize'
                    }}>
                      {sale.metodo_pagamento}
                        </div>
                      </div>
                    </div>
                
                {sale.observacoes && (
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                  }}>
                    {sale.observacoes}
                  </p>
                )}
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  )
}

export default SalesReports
