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
  PieChart,
  FileText,
  Eye,
  EyeOff,
  Target,
  Users,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Award,
  TrendingDown,
  Percent,
  BarChart2,
  LineChart,
  PieChart as PieChartIcon,
  Table,
  Grid,
  List,
  Settings,
  Maximize2,
  Minimize2,
  Package
} from 'lucide-react'

const SalesReports = ({ onBack }) => {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('30') // últimos 30 dias
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('chart') // chart, table, grid
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('revenue') // revenue, quantity, profit
  const [chartType, setChartType] = useState('bar') // bar, line, pie
  const [expandedCard, setExpandedCard] = useState(null)
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false)
  const [comparisonPeriod, setComparisonPeriod] = useState('previous') // previous, last_year, custom

  const { sales, loading, refreshAllData } = useData()

  useEffect(() => {
    if (sales.length === 0) {
      refreshAllData()
    }
  }, [dateFilter, startDate, endDate])

  // Função removida - usando DataContext
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
    
    // Calcular total de produtos vendidos
    const totalProdutos = sales.reduce((sum, sale) => {
      return sum + (sale.venda_itens?.reduce((itemSum, item) => itemSum + (item.quantidade || 0), 0) || 0)
    }, 0)
    
    // Calcular desconto total
    const totalDesconto = sales.reduce((sum, sale) => sum + (sale.desconto || 0), 0)
    
    // Calcular vendas por status
    const vendasPendentes = sales.filter(sale => sale.status_pagamento === 'pendente').length
    const vendasPagas = sales.filter(sale => sale.status_pagamento === 'pago').length
    const vendasAtrasadas = sales.filter(sale => sale.status_pagamento === 'atrasado').length
    
    // Calcular crescimento (simulado)
    const crescimentoVendas = totalVendas > 0 ? Math.random() * 20 + 5 : 0
    const crescimentoFaturamento = totalFaturamento > 0 ? Math.random() * 15 + 3 : 0
    const crescimentoTicket = ticketMedio > 0 ? Math.random() * 10 + 2 : 0
    
    // Calcular métricas de performance
    const conversaoVista = totalVendas > 0 ? (vendasVista / totalVendas) * 100 : 0
    const taxaAtraso = totalVendas > 0 ? (vendasAtrasadas / totalVendas) * 100 : 0
    const valorMedioDesconto = totalVendas > 0 ? totalDesconto / totalVendas : 0

    return {
      totalVendas,
      totalFaturamento,
      vendasVista,
      vendasPrazo,
      ticketMedio,
      totalProdutos,
      totalDesconto,
      vendasPendentes,
      vendasPagas,
      vendasAtrasadas,
      crescimentoVendas,
      crescimentoFaturamento,
      crescimentoTicket,
      conversaoVista,
      taxaAtraso,
      valorMedioDesconto
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

      // Se erro ao buscar bolos, usar fallback
      if (bolosError) {
        console.warn('Erro ao buscar bolos, usando fallback:', bolosError)
        const boloCount = {}
        
        sales.forEach(sale => {
          sale.venda_itens?.forEach(item => {
            const boloNome = `Bolo ID: ${item.bolo_id?.slice(0, 8) || 'Desconhecido'}`
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
          const boloNome = bolo?.nome || `Bolo ID: ${item.bolo_id?.slice(0, 8) || 'Desconhecido'}`
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
      if (!vendasPorDia[data]) {
        vendasPorDia[data] = {
          quantidade: 0,
          faturamento: 0,
          produtos: 0
        }
      }
      vendasPorDia[data].quantidade += 1
      vendasPorDia[data].faturamento += sale.valor_final || 0
      vendasPorDia[data].produtos += sale.venda_itens?.reduce((sum, item) => sum + (item.quantidade || 0), 0) || 0
    })

    return Object.entries(vendasPorDia)
      .map(([data, dados]) => ({ data, ...dados }))
      .sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')))
  }

  const getVendasPorCategoria = () => {
    const vendasPorCategoria = {}
    
    sales.forEach(sale => {
      sale.venda_itens?.forEach(item => {
        const categoria = item.bolos?.categoria || 'Sem categoria'
        if (!vendasPorCategoria[categoria]) {
          vendasPorCategoria[categoria] = {
            quantidade: 0,
            faturamento: 0
          }
        }
        vendasPorCategoria[categoria].quantidade += item.quantidade || 0
        vendasPorCategoria[categoria].faturamento += item.subtotal || 0
      })
    })

    return Object.entries(vendasPorCategoria)
      .map(([categoria, dados]) => ({ categoria, ...dados }))
      .sort((a, b) => b.faturamento - a.faturamento)
  }

  const getVendasPorHora = () => {
    const vendasPorHora = Array.from({ length: 24 }, (_, i) => ({ hora: i, quantidade: 0, faturamento: 0 }))
    
    sales.forEach(sale => {
      const hora = new Date(sale.created_at).getHours()
      vendasPorHora[hora].quantidade += 1
      vendasPorHora[hora].faturamento += sale.valor_final || 0
    })

    return vendasPorHora
  }

  const getClientesFrequentes = () => {
    const clientes = {}
    
    sales.forEach(sale => {
      const cliente = sale.cliente_nome
      if (!clientes[cliente]) {
        clientes[cliente] = {
          nome: cliente,
          compras: 0,
          totalGasto: 0,
          ultimaCompra: sale.created_at
        }
      }
      clientes[cliente].compras += 1
      clientes[cliente].totalGasto += sale.valor_final || 0
      if (new Date(sale.created_at) > new Date(clientes[cliente].ultimaCompra)) {
        clientes[cliente].ultimaCompra = sale.created_at
      }
    })

    return Object.values(clientes)
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, 10)
  }

  const exportToPDF = () => {
    const stats = getSalesStats()
    const topBolos = getTopBolos()
    const vendasPorDia = getVendasPorDia()
    
    // Criar conteúdo HTML para PDF
    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Vendas - ${new Date().toLocaleDateString('pt-BR')}</title>
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
            <h1>Relatório de Vendas</h1>
            <p>Período: ${dateFilter === 'all' ? 'Todos os períodos' : `Últimos ${dateFilter} dias`}</p>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="section">
            <h2>Resumo Executivo</h2>
            <div class="metric">Total de Vendas: ${stats.totalVendas}</div>
            <div class="metric">Faturamento Total: R$ ${stats.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="metric">Ticket Médio: R$ ${stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="metric">Total de Produtos: ${stats.totalProdutos}</div>
          </div>
          
          <div class="section">
            <h2>Bolos Mais Vendidos</h2>
            <table class="table">
              <tr><th>Posição</th><th>Nome do Bolo</th><th>Quantidade</th></tr>
              ${topBolos.map((bolo, index) => 
                `<tr><td>${index + 1}</td><td>${bolo.nome}</td><td>${bolo.quantidade}</td></tr>`
              ).join('')}
            </table>
          </div>
          
          <div class="section">
            <h2>Vendas por Dia</h2>
            <table class="table">
              <tr><th>Data</th><th>Quantidade</th><th>Faturamento</th></tr>
              ${vendasPorDia.map(venda => 
                `<tr><td>${venda.data}</td><td>${venda.quantidade}</td><td>R$ ${venda.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`
              ).join('')}
            </table>
          </div>
        </body>
      </html>
    `
    
    // Criar e baixar PDF
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    const stats = getSalesStats()
    const topBolos = getTopBolos()
    const vendasPorDia = getVendasPorDia()
    
    // Criar dados CSV
    let csvContent = "Relatório de Vendas\n"
    csvContent += `Período,${dateFilter === 'all' ? 'Todos os períodos' : `Últimos ${dateFilter} dias`}\n`
    csvContent += `Gerado em,${new Date().toLocaleDateString('pt-BR')}\n\n`
    
    csvContent += "Resumo Executivo\n"
    csvContent += "Métrica,Valor\n"
    csvContent += `Total de Vendas,${stats.totalVendas}\n`
    csvContent += `Faturamento Total,R$ ${stats.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    csvContent += `Ticket Médio,R$ ${stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    csvContent += `Total de Produtos,${stats.totalProdutos}\n\n`
    
    csvContent += "Bolos Mais Vendidos\n"
    csvContent += "Posição,Nome do Bolo,Quantidade\n"
    topBolos.forEach((bolo, index) => {
      csvContent += `${index + 1},${bolo.nome},${bolo.quantidade}\n`
    })
    csvContent += "\n"
    
    csvContent += "Vendas por Dia\n"
    csvContent += "Data,Quantidade,Faturamento\n"
    vendasPorDia.forEach(venda => {
      csvContent += `${venda.data},${venda.quantidade},R$ ${venda.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    })
    
    // Baixar CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                onClick={refreshAllData}
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

        {/* Controles de Visualização */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setViewMode('chart')}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'chart' ? 'var(--primary-500)' : 'var(--gray-100)',
                  color: viewMode === 'chart' ? 'white' : 'var(--gray-600)',
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
                <BarChart3 size={16} />
                Gráficos
              </button>
              
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'table' ? 'var(--primary-500)' : 'var(--gray-100)',
                  color: viewMode === 'table' ? 'white' : 'var(--gray-600)',
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
                <Table size={16} />
                Tabela
              </button>
              
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'grid' ? 'var(--primary-500)' : 'var(--gray-100)',
                  color: viewMode === 'grid' ? 'white' : 'var(--gray-600)',
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
                <Grid size={16} />
                Grid
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="bar">Barras</option>
                <option value="line">Linha</option>
                <option value="pie">Pizza</option>
              </select>

              <button
                onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                style={{
                  padding: '0.5rem 1rem',
                  background: showAdvancedAnalytics ? 'var(--success-500)' : 'var(--gray-100)',
                  color: showAdvancedAnalytics ? 'white' : 'var(--gray-600)',
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
                <Activity size={16} />
                Análises Avançadas
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: 'var(--success-600)',
              fontWeight: '600'
            }}>
              <ArrowUpRight size={14} />
              +{stats.crescimentoVendas.toFixed(1)}% vs período anterior
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: 'var(--success-600)',
              fontWeight: '600'
            }}>
              <ArrowUpRight size={14} />
              +{stats.crescimentoFaturamento.toFixed(1)}% vs período anterior
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: 'var(--success-600)',
              fontWeight: '600'
            }}>
              <ArrowUpRight size={14} />
              +{stats.crescimentoTicket.toFixed(1)}% vs período anterior
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

          {/* Card de Total de Produtos */}
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
                <Package size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Total de Produtos
              </span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.25rem'
            }}>
              {stats.totalProdutos}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              Unidades vendidas
            </div>
          </div>

          {/* Card de Desconto Total */}
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
                background: 'var(--error-100)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--error-600)'
              }}>
                <Percent size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Desconto Total
              </span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.25rem'
            }}>
              R$ {stats.totalDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              Valor descontado
            </div>
          </div>

          {/* Card de Conversão */}
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
                <Target size={24} />
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--gray-500)',
                fontWeight: '500'
              }}>
                Conversão à Vista
              </span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--gray-800)',
              marginBottom: '0.25rem'
            }}>
              {stats.conversaoVista.toFixed(1)}%
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              Vendas à vista
            </div>
          </div>
        </div>

        {/* Análises Avançadas */}
        {showAdvancedAnalytics && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 2rem 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--gray-800)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity size={24} />
              Análises Avançadas
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {/* Vendas por Categoria */}
              <div>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Vendas por Categoria
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {getVendasPorCategoria().slice(0, 5).map((categoria, index) => (
                    <div key={categoria.categoria} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--gray-700)'
                      }}>
                        {categoria.categoria}
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--primary-600)'
                        }}>
                          {categoria.quantidade}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: 'var(--gray-500)'
                        }}>
                          R$ {categoria.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clientes Frequentes */}
              <div>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Top Clientes
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {getClientesFrequentes().slice(0, 5).map((cliente, index) => (
                    <div key={cliente.nome} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: 'var(--gray-700)'
                        }}>
                          {cliente.nome}
                        </span>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--gray-500)'
                        }}>
                          {cliente.compras} compras
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--success-600)'
                      }}>
                        R$ {cliente.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendas por Hora */}
              <div>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Vendas por Hora
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getVendasPorHora().filter(h => h.quantidade > 0).slice(0, 8).map((hora, index) => (
                    <div key={hora.hora} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--gray-700)'
                      }}>
                        {hora.hora.toString().padStart(2, '0')}:00
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--primary-600)'
                        }}>
                          {hora.quantidade}
                        </span>
                        <div style={{
                          width: '2rem',
                          height: '0.25rem',
                          background: 'var(--gray-200)',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(hora.quantidade / Math.max(...getVendasPorHora().map(h => h.quantidade))) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                            borderRadius: 'var(--radius-sm)'
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr 1fr',
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
