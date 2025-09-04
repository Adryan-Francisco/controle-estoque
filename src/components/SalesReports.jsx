import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  PieChart,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react'

const SalesReports = ({ onBack }) => {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('30') // últimos 30 dias
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('chart') // chart, table
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [dateFilter, startDate, endDate])

  const fetchSales = async () => {
    try {
      setRefreshing(true)
      
      // Buscar vendas sem join primeiro
      let query = supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Aplicar filtros de data
      if (dateFilter === 'custom' && startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59')
      } else if (dateFilter !== 'all') {
        const days = parseInt(dateFilter)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('created_at', startDate.toISOString())
      }

      const { data: vendas, error: vendasError } = await query

      if (vendasError) {
        console.error('Erro ao buscar vendas:', vendasError)
        setSales([])
        return
      }

      // Tentar buscar itens de venda separadamente
      let vendasComItens = []
      try {
        const { data: itens, error: itensError } = await supabase
          .from('venda_itens')
          .select('*')

        if (!itensError && itens) {
          // Mapear itens para vendas
          vendasComItens = vendas.map(venda => ({
            ...venda,
            venda_itens: itens.filter(item => item.venda_id === venda.id)
          }))
        } else {
          // Se não conseguir buscar itens, usar vendas sem itens
          vendasComItens = vendas.map(venda => ({
            ...venda,
            venda_itens: []
          }))
        }
      } catch (itensError) {
        console.warn('Erro ao buscar itens de venda, usando vendas sem itens:', itensError)
        vendasComItens = vendas.map(venda => ({
          ...venda,
          venda_itens: []
        }))
      }

      setSales(vendasComItens)
    } catch (error) {
      console.error('Erro geral ao buscar vendas:', error)
      setSales([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getSalesStats = () => {
    const totalVendas = sales.length
    const totalFaturamento = sales.reduce((sum, sale) => sum + (sale.valor_final || 0), 0)
    const vendasVista = sales.filter(sale => sale.metodo_pagamento === 'vista').length
    const vendasPrazo = sales.filter(sale => sale.metodo_pagamento === 'prazo').length
    const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0

    return {
      totalVendas,
      totalFaturamento,
      vendasVista,
      vendasPrazo,
      ticketMedio
    }
  }

  const getTopBolos = async () => {
    try {
      // Verificar se há vendas primeiro
      if (!sales || sales.length === 0) {
        return []
      }

      // Buscar dados dos bolos separadamente
      const { data: bolos, error: bolosError } = await supabase
        .from('bolos')
        .select('id, nome, categoria')
        .eq('user_id', user.id)

      // Se erro ao buscar bolos, usar fallback
      if (bolosError) {
        console.warn('Erro ao buscar bolos, usando fallback:', bolosError)
        const boloCount = {}
        
        sales.forEach(sale => {
          sale.venda_itens?.forEach(item => {
            const boloNome = `Item ID: ${item.bolo_id || 'Desconhecido'}`
            boloCount[boloNome] = (boloCount[boloNome] || 0) + item.quantidade
          })
        })

        return Object.entries(boloCount)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5)
      }

      const boloMap = {}
      bolos?.forEach(bolo => {
        boloMap[bolo.id] = bolo
      })

      const boloCount = {}
      
      sales.forEach(sale => {
        sale.venda_itens?.forEach(item => {
          const bolo = boloMap[item.bolo_id]
          const boloNome = bolo?.nome || `Bolo ID: ${item.bolo_id || 'Desconhecido'}`
          boloCount[boloNome] = (boloCount[boloNome] || 0) + item.quantidade
        })
      })

      return Object.entries(boloCount)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5)
    } catch (error) {
      console.error('Erro geral ao buscar bolos:', error)
      return []
    }
  }

  const getVendasPorDia = () => {
    const vendasPorDia = {}
    
    sales.forEach(sale => {
      const data = new Date(sale.created_at).toLocaleDateString('pt-BR')
      vendasPorDia[data] = (vendasPorDia[data] || 0) + 1
    })

    return Object.entries(vendasPorDia)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')))
  }

  const exportToPDF = () => {
    // Implementar exportação para PDF
    alert('Funcionalidade de exportação para PDF será implementada em breve!')
  }

  const exportToExcel = () => {
    // Implementar exportação para Excel
    alert('Funcionalidade de exportação para Excel será implementada em breve!')
  }

  const [topBolos, setTopBolos] = useState([])

  useEffect(() => {
    if (sales.length > 0) {
      getTopBolos().then(setTopBolos)
    }
  }, [sales])

  const stats = getSalesStats()
  const vendasPorDia = getVendasPorDia()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '1.125rem',
        color: 'var(--gray-600)'
      }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
        Carregando relatórios...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                📊 Relatórios de Vendas
              </h1>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                color: 'var(--gray-600)'
              }}>
                Análise completa das vendas de bolos
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <Filter size={16} />
                Filtros
              </button>
              
              <button
                onClick={fetchSales}
                disabled={refreshing}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--success-100)',
                  color: 'var(--success-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: refreshing ? 0.7 : 1
                }}
              >
                <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Atualizar
              </button>
              
              <button
                onClick={onBack}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--gray-100)',
                  color: 'var(--gray-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Voltar
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1.5rem',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Período
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    background: 'white'
                  }}
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="365">Último ano</option>
                  <option value="custom">Período personalizado</option>
                  <option value="all">Todos os períodos</option>
                </select>
              </div>
              
              {dateFilter === 'custom' && (
                <>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--gray-700)'
                    }}>
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid var(--gray-200)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--gray-700)'
                    }}>
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid var(--gray-200)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--primary-100)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--primary-600)'
              }}>
                <ShoppingCart size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Total de Vendas
              </span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.25rem'
            }}>
              {stats.totalVendas}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--success-600)',
              fontWeight: '600'
            }}>
              +12% vs período anterior
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--success-100)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--success-600)'
              }}>
                <DollarSign size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Faturamento Total
              </span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.25rem'
            }}>
              R$ {stats.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--success-600)',
              fontWeight: '600'
            }}>
              +8% vs período anterior
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--warning-100)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--warning-600)'
              }}>
                <TrendingUp size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Ticket Médio
              </span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.25rem'
            }}>
              R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--success-600)',
              fontWeight: '600'
            }}>
              +5% vs período anterior
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--info-100)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--info-600)'
              }}>
                <PieChart size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Vistas vs Prazo
              </span>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.5rem'
            }}>
              {stats.vendasVista} / {stats.vendasPrazo}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              À vista / À prazo
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Top Bolos */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--gray-800)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BarChart3 size={20} />
              Bolos Mais Vendidos
            </h3>
            
            {topBolos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topBolos.map((bolo, index) => (
                  <div key={bolo.nome} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                        color: 'white',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </div>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--gray-800)'
                      }}>
                        {bolo.nome}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: 'var(--primary-600)'
                    }}>
                      {bolo.quantidade}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--gray-500)'
              }}>
                Nenhuma venda encontrada no período
              </div>
            )}
          </div>

          {/* Vendas por Dia */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--gray-800)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Calendar size={20} />
              Vendas por Dia
            </h3>
            
            {vendasPorDia.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {vendasPorDia.slice(-7).map((venda, index) => (
                  <div key={venda.data} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--gray-600)',
                      fontWeight: '500'
                    }}>
                      {venda.data}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '4rem',
                        height: '0.5rem',
                        background: 'var(--gray-200)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(venda.quantidade / Math.max(...vendasPorDia.map(v => v.quantidade))) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                          borderRadius: 'var(--radius-sm)'
                        }} />
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--gray-800)',
                        minWidth: '1.5rem',
                        textAlign: 'right'
                      }}>
                        {venda.quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--gray-500)'
              }}>
                Nenhuma venda encontrada no período
              </div>
            )}
          </div>
        </div>

        {/* Botões de Exportação */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={exportToPDF}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, var(--error-500), var(--error-600))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-lg)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-lg)'
            }}
          >
            <FileText size={20} />
            Exportar PDF
          </button>
          
          <button
            onClick={exportToExcel}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, var(--success-500), var(--success-600))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-lg)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-lg)'
            }}
          >
            <Download size={20} />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalesReports
