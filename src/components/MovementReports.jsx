import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Filter, 
  BarChart3, 
  FileDown,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const MovementReports = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('7') // 7, 30, 90 dias
  const [typeFilter, setTypeFilter] = useState('all') // all, entrada, saida
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date') // date, product, quantity
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('table') // table, grid

  const { movements, loading, refreshAllData } = useData()

  useEffect(() => {
    if (movements.length === 0) {
      refreshAllData()
    }
  }, [dateFilter, typeFilter])

  const filteredAndSortedMovements = movements
    .filter(movement => {
      const matchesSearch = movement.produtos?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.motivo?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at)
          break
        case 'product':
          comparison = (a.produtos?.nome || '').localeCompare(b.produtos?.nome || '')
          break
        case 'quantity':
          comparison = a.quantidade - b.quantidade
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const fetchMovements = async () => {
    setIsLoading(true)
    try {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter))

      let query = supabase
        .from('movimentacoes')
        .select(`
          *,
          produtos (
            nome,
            quantidade
          )
        `)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (typeFilter !== 'all') {
        query = query.eq('tipo', typeFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setMovements(data || [])
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshAllData()
    setRefreshing(false)
  }

  const getMovementStats = () => {
    const entrada = filteredAndSortedMovements.filter(m => m.tipo === 'entrada')
    const saida = filteredAndSortedMovements.filter(m => m.tipo === 'saida')
    
    const totalEntrada = entrada.reduce((sum, m) => sum + m.quantidade, 0)
    const totalSaida = saida.reduce((sum, m) => sum + m.quantidade, 0)
    
    // Calcular tendências (últimos 3 dias vs anteriores)
    const today = new Date()
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    
    const recentMovements = movements.filter(m => new Date(m.created_at) >= threeDaysAgo)
    const olderMovements = movements.filter(m => new Date(m.created_at) < threeDaysAgo)
    
    const recentEntrada = recentMovements.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.quantidade, 0)
    const olderEntrada = olderMovements.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.quantidade, 0)
    
    const entradaTrend = olderEntrada > 0 ? ((recentEntrada - olderEntrada) / olderEntrada) * 100 : 0
    
    return {
      totalMovements: filteredAndSortedMovements.length,
      totalEntrada,
      totalSaida,
      netMovement: totalEntrada - totalSaida,
      entradaTrend,
      recentActivity: recentMovements.length
    }
  }

  const stats = getMovementStats()

  const exportToCSV = () => {
    const headers = ['Data', 'Produto', 'Tipo', 'Quantidade', 'Motivo', 'Usuário']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedMovements.map(movement => [
        new Date(movement.created_at).toLocaleDateString('pt-BR'),
        movement.produtos?.nome || 'N/A',
        movement.tipo,
        movement.quantidade,
        `"${movement.motivo}"`,
        movement.usuario_id || 'N/A'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_movimentacoes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async () => {
    try {
      // Criar um elemento temporário para capturar
      const reportElement = document.getElementById('movement-report')
      if (!reportElement) {
        console.error('Elemento do relatório não encontrado')
        return
      }

      // Configurar html2canvas
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight
      })

      // Criar PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calcular dimensões
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Adicionar cabeçalho personalizado
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Relatório de Movimentações', 20, 20)
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Período: ${getDateRangeText()}`, 20, 30)
      pdf.text(`Total de movimentações: ${filteredAndSortedMovements.length}`, 20, 35)
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 40)

      // Adicionar linha separadora
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, 45, 190, 45)

      // Adicionar imagem do relatório
      pdf.addImage(imgData, 'PNG', 10, 50, imgWidth - 20, imgHeight - 20)

      // Adicionar estatísticas no final
      const finalY = 50 + imgHeight + 10
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Resumo Estatístico', 20, finalY)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`• Total de Entradas: ${stats.totalEntrada} unidades`, 20, finalY + 10)
      pdf.text(`• Total de Saídas: ${stats.totalSaida} unidades`, 20, finalY + 15)
      pdf.text(`• Movimentação Líquida: ${stats.netMovement} unidades`, 20, finalY + 20)
      pdf.text(`• Total de Movimentações: ${stats.totalMovements}`, 20, finalY + 25)

      // Salvar PDF
      const fileName = `relatorio_movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const getDateRangeText = () => {
    const days = parseInt(dateFilter)
    if (days === 7) return 'Últimos 7 dias'
    if (days === 30) return 'Últimos 30 dias'
    if (days === 90) return 'Últimos 90 dias'
    return 'Período personalizado'
  }

  return (
    <div 
      id="movement-report"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background decorativo */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        transform: 'translate(50%, -50%)'
      }}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '2px solid var(--gray-100)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '4px',
                height: '2.5rem',
                background: 'linear-gradient(to bottom, var(--primary-500), var(--secondary-500))',
                borderRadius: 'var(--radius-sm)'
              }}></div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '2rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, var(--gray-800) 0%, var(--gray-600) 50%, var(--primary-600) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.02em'
                }}>
                  Relatório de Movimentações
                </h3>
                <p style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '1.125rem',
                  color: 'var(--gray-600)',
                  fontWeight: '500'
                }}>
                  Histórico de entradas e saídas
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {/* Botão de Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  padding: '0.75rem',
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--gray-600)',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) {
                    e.target.style.background = 'var(--gray-200)'
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--gray-100)'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                <RefreshCw 
                  size={20} 
                  style={{
                    animation: refreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </button>

              {/* Botões de Exportação */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={exportToCSV}
                  disabled={filteredAndSortedMovements.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: filteredAndSortedMovements.length === 0 
                      ? 'var(--gray-200)' 
                      : 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                    color: filteredAndSortedMovements.length === 0 ? 'var(--gray-500)' : 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    cursor: filteredAndSortedMovements.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-normal)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  onMouseEnter={(e) => {
                    if (filteredAndSortedMovements.length > 0) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = 'var(--shadow-lg)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'var(--shadow-md)'
                  }}
                >
                  <Download size={16} />
                  Exportar CSV
                </button>

                <button
                  onClick={exportToPDF}
                  disabled={filteredAndSortedMovements.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: filteredAndSortedMovements.length === 0 
                      ? 'var(--gray-200)' 
                      : 'linear-gradient(135deg, var(--error-500), var(--error-600))',
                    color: filteredAndSortedMovements.length === 0 ? 'var(--gray-500)' : 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    cursor: filteredAndSortedMovements.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-normal)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  onMouseEnter={(e) => {
                    if (filteredAndSortedMovements.length > 0) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = 'var(--shadow-lg)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'var(--shadow-md)'
                  }}
                >
                  <FileDown size={16} />
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Controles Avançados */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {/* Busca */}
            <div style={{
              position: 'relative',
              flex: '1',
              minWidth: '300px'
            }}>
              <Search 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)'
                }}
              />
              <input
                type="text"
                placeholder="Buscar por produto ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: '0.875rem',
                  background: 'white',
                  transition: 'var(--transition-normal)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-500)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--gray-200)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Filtros */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--gray-500)" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--gray-200)',
                    background: 'white',
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-500)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--gray-200)'
                  }}
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} color="var(--gray-500)" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--gray-200)',
                    background: 'white',
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-500)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--gray-200)'
                  }}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="entrada">Apenas entradas</option>
                  <option value="saida">Apenas saídas</option>
                </select>
              </div>

              {/* Ordenação */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowUpDown size={16} color="var(--gray-500)" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-')
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--gray-200)',
                    background: 'white',
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    outline: 'none'
                  }}
                >
                  <option value="date-desc">Data (Mais recente)</option>
                  <option value="date-asc">Data (Mais antiga)</option>
                  <option value="product-asc">Produto (A-Z)</option>
                  <option value="product-desc">Produto (Z-A)</option>
                  <option value="quantity-desc">Quantidade (Maior)</option>
                  <option value="quantity-asc">Quantidade (Menor)</option>
                </select>
              </div>

              {/* Modo de Visualização */}
              <div style={{
                display: 'flex',
                background: 'var(--gray-100)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.25rem'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: viewMode === 'table' ? 'white' : 'transparent',
                    color: viewMode === 'table' ? 'var(--gray-800)' : 'var(--gray-500)',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: viewMode === 'grid' ? 'white' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--gray-800)' : 'var(--gray-500)',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Package size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Avançadas */}
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)',
          borderBottom: '2px solid var(--gray-100)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Total de Movimentações */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--gray-200)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                borderRadius: '50%',
                opacity: 0.3
              }}></div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Total de Movimentações
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: 'var(--primary-600)',
                    lineHeight: 1
                  }}>
                    {stats.totalMovements}
                  </p>
                </div>
                <div style={{
                  padding: '1rem',
                  background: 'var(--primary-100)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={24} color="var(--primary-600)" />
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--gray-600)'
              }}>
                <Clock size={14} />
                <span>Período: {getDateRangeText()}</span>
              </div>
            </div>

            {/* Total Entradas */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--success-200)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--success-100), var(--success-200))',
                borderRadius: '50%',
                opacity: 0.3
              }}></div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Total Entradas
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: 'var(--success-600)',
                    lineHeight: 1
                  }}>
                    {stats.totalEntrada}
                  </p>
                </div>
                <div style={{
                  padding: '1rem',
                  background: 'var(--success-100)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={24} color="var(--success-600)" />
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--success-600)',
                fontWeight: '600'
              }}>
                <Zap size={14} />
                <span>
                  {stats.entradaTrend > 0 ? '+' : ''}{stats.entradaTrend.toFixed(1)}% vs período anterior
                </span>
              </div>
            </div>

            {/* Total Saídas */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--error-200)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--error-100), var(--error-200))',
                borderRadius: '50%',
                opacity: 0.3
              }}></div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Total Saídas
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: 'var(--error-600)',
                    lineHeight: 1
                  }}>
                    {stats.totalSaida}
                  </p>
                </div>
                <div style={{
                  padding: '1rem',
                  background: 'var(--error-100)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingDown size={24} color="var(--error-600)" />
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--error-600)',
                fontWeight: '600'
              }}>
                <AlertTriangle size={14} />
                <span>Movimentações de saída</span>
              </div>
            </div>

            {/* Saldo Líquido */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: `1px solid ${stats.netMovement >= 0 ? 'var(--success-200)' : 'var(--error-200)'}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${stats.netMovement >= 0 ? 'var(--success-100)' : 'var(--error-100)'}, ${stats.netMovement >= 0 ? 'var(--success-200)' : 'var(--error-200)'})`,
                borderRadius: '50%',
                opacity: 0.3
              }}></div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Saldo Líquido
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: stats.netMovement >= 0 ? 'var(--success-600)' : 'var(--error-600)',
                    lineHeight: 1
                  }}>
                    {stats.netMovement >= 0 ? '+' : ''}{stats.netMovement}
                  </p>
                </div>
                <div style={{
                  padding: '1rem',
                  background: stats.netMovement >= 0 ? 'var(--success-100)' : 'var(--error-100)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stats.netMovement >= 0 ? (
                    <CheckCircle size={24} color="var(--success-600)" />
                  ) : (
                    <XCircle size={24} color="var(--error-600)" />
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: stats.netMovement >= 0 ? 'var(--success-600)' : 'var(--error-600)',
                fontWeight: '600'
              }}>
                <Package size={14} />
                <span>
                  {stats.netMovement >= 0 ? 'Estoque cresceu' : 'Estoque diminuiu'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Movimentações */}
        <div style={{ padding: '2rem' }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4rem',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-xl)',
              border: '2px dashed var(--gray-200)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid var(--gray-200)',
                  borderTop: '4px solid var(--primary-500)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  color: 'var(--gray-600)',
                  fontWeight: '500'
                }}>
                  Carregando movimentações...
                </p>
              </div>
            </div>
          ) : filteredAndSortedMovements.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-xl)',
              border: '2px dashed var(--gray-200)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '2rem',
                  background: 'var(--gray-100)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={48} color="var(--gray-400)" />
                </div>
                <div>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)'
                  }}>
                    Nenhuma movimentação encontrada
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: 'var(--gray-500)'
                  }}>
                    {searchTerm ? 'Tente ajustar os filtros de busca' : 'No período selecionado não há movimentações registradas'}
                  </p>
                </div>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--gray-200)',
              overflow: 'hidden'
            }}>
              <div style={{
                maxHeight: '500px',
                overflow: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead style={{
                    background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <tr>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: 'var(--gray-700)',
                        borderBottom: '2px solid var(--gray-200)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Data
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: 'var(--gray-700)',
                        borderBottom: '2px solid var(--gray-200)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Produto
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: 'var(--gray-700)',
                        borderBottom: '2px solid var(--gray-200)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Tipo
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: 'var(--gray-700)',
                        borderBottom: '2px solid var(--gray-200)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Quantidade
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: 'var(--gray-700)',
                        borderBottom: '2px solid var(--gray-200)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedMovements.map((movement, index) => (
                      <tr
                        key={movement.id}
                        style={{
                          borderBottom: '1px solid var(--gray-100)',
                          transition: 'var(--transition-normal)',
                          background: index % 2 === 0 ? 'white' : 'var(--gray-50)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--primary-50)'
                          e.target.style.transform = 'scale(1.01)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = index % 2 === 0 ? 'white' : 'var(--gray-50)'
                          e.target.style.transform = 'scale(1)'
                        }}
                      >
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--gray-600)',
                          fontWeight: '500'
                        }}>
                          {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--gray-800)',
                          fontWeight: '600'
                        }}>
                          {movement.produtos?.nome || 'Produto não encontrado'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: movement.tipo === 'entrada' 
                              ? 'linear-gradient(135deg, var(--success-100), var(--success-200))' 
                              : 'linear-gradient(135deg, var(--error-100), var(--error-200))',
                            color: movement.tipo === 'entrada' ? 'var(--success-700)' : 'var(--error-700)',
                            border: `1px solid ${movement.tipo === 'entrada' ? 'var(--success-300)' : 'var(--error-300)'}`,
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            {movement.tipo === 'entrada' ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {movement.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: movement.tipo === 'entrada' ? 'var(--success-600)' : 'var(--error-600)'
                        }}>
                          {movement.quantidade}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--gray-600)',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {movement.motivo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredAndSortedMovements.map((movement) => (
                <div
                  key={movement.id}
                  style={{
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--gray-200)',
                    transition: 'var(--transition-normal)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)'
                    e.target.style.boxShadow = 'var(--shadow-lg)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'var(--shadow-md)'
                  }}
                >
                  {/* Indicador de tipo */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: movement.tipo === 'entrada' 
                      ? 'linear-gradient(90deg, var(--success-500), var(--success-600))' 
                      : 'linear-gradient(90deg, var(--error-500), var(--error-600))'
                  }}></div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        background: movement.tipo === 'entrada' ? 'var(--success-100)' : 'var(--error-100)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {movement.tipo === 'entrada' ? (
                          <TrendingUp size={20} color="var(--success-600)" />
                        ) : (
                          <TrendingDown size={20} color="var(--error-600)" />
                        )}
                      </div>
                      <div>
                        <h4 style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: 'var(--gray-800)'
                        }}>
                          {movement.produtos?.nome || 'Produto não encontrado'}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          color: 'var(--gray-500)'
                        }}>
                          {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: movement.tipo === 'entrada' ? 'var(--success-100)' : 'var(--error-100)',
                      color: movement.tipo === 'entrada' ? 'var(--success-700)' : 'var(--error-700)'
                    }}>
                      {movement.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <p style={{
                        margin: '0 0 0.25rem 0',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--gray-600)'
                      }}>
                        Quantidade
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: movement.tipo === 'entrada' ? 'var(--success-600)' : 'var(--error-600)'
                      }}>
                        {movement.quantidade}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--gray-600)'
                    }}>
                      Motivo
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--gray-700)',
                      lineHeight: 1.5
                    }}>
                      {movement.motivo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovementReports
