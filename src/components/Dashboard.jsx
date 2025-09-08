import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import ProductForm from './ProductForm'
import StatCard from './StatCard'
import SimpleStockMovement from './SimpleStockMovement'
import SupabaseTest from './SupabaseTest'
import RLSStatusNotification from './RLSStatusNotification'
import PerformanceMonitor from './PerformanceMonitor'
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  ArrowRight,
  Cake,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

const Dashboard = ({ onNavigateToProducts }) => {
  const [showForm, setShowForm] = useState(false)
  const [showStockMovement, setShowStockMovement] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showSupabaseTest, setShowSupabaseTest] = useState(false)
  const [testProduct, setTestProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const { user } = useAuth()
  const { products, movements, sales, bolos, isLoading, addProduct, deleteProduct, refreshAllData, syncLocalData } = useData()

  useEffect(() => {
    // Não precisa chamar refreshAllData aqui pois o DataContext já faz isso automaticamente
  }, [])

  const handleSaveProduct = async (productData) => {
    try {
      // Criar novo produto
      const { error } = await addProduct(productData)
      if (error) throw error

      setShowForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto. Tente novamente.')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const { error } = await deleteProduct(productId)
      if (error) throw error
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto. Tente novamente.')
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleTestStockMovement = () => {
    setShowProductSelector(true)
  }

  const handleProductSelect = (product) => {
    setTestProduct(product)
    setShowProductSelector(false)
    setShowStockMovement(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  // Calcular estatísticas otimizadas
  const stats = {
    totalProducts: products.length,
    totalBolos: bolos.length,
    totalValue: products.reduce((sum, p) => sum + ((p.preco || 0) * (p.estoque_atual || 0)), 0),
    lowStock: products.filter(p => (p.estoque_atual || 0) <= (p.estoque_minimo || 0) && (p.estoque_atual || 0) > 0).length,
    outOfStock: products.filter(p => (p.estoque_atual || 0) <= 0).length,
    totalSales: sales.length,
    totalSalesValue: sales.reduce((sum, s) => sum + (s.valor_total || 0), 0),
    totalMovements: movements.length,
    recentMovements: movements.filter(m => {
      const movementDate = new Date(m.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return movementDate >= weekAgo
    }).length
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--gray-50) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorativo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-160px',
          right: '-160px',
          width: '320px',
          height: '320px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-160px',
          left: '-160px',
          width: '320px',
          height: '320px',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>


        {/* Botão de carregar dados */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => {
              console.log('🔄 Carregando dados manualmente...')
              refreshAllData()
            }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            🔄 Carregar Dados
          </button>
        </div>

        {/* Header com ações rápidas */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1e293b',
              margin: 0,
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎂 Controle de Estoque
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              margin: '0.5rem 0 0 0'
            }}>
              Gestão completa para sua confeitaria
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleAddProduct}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={18} />
              Novo Produto
            </button>
            
            <button
              onClick={() => refreshAllData(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={18} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Estatísticas principais */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={Package}
            color="#3b82f6"
            description="Produtos cadastrados"
            gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)"
          />

          <StatCard
            title="Total de Bolos"
            value={stats.totalBolos}
            icon={Cake}
            color="#8b5cf6"
            description="Bolos disponíveis"
            gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
          />

          <StatCard
            title="Valor em Estoque"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            color="#10b981"
            description="Valor total do estoque"
            gradient="linear-gradient(135deg, #10b981, #059669)"
          />

          <StatCard
            title="Vendas Realizadas"
            value={stats.totalSales}
            icon={ShoppingCart}
            color="#f59e0b"
            description="Total de vendas"
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          />
        </div>

        {/* Estatísticas de alertas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Estoque Baixo"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="#f59e0b"
            description="Precisa reposição"
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          />

          <StatCard
            title="Sem Estoque"
            value={stats.outOfStock}
            icon={XCircle}
            color="#ef4444"
            description="Fora de estoque"
            gradient="linear-gradient(135deg, #ef4444, #dc2626)"
          />

          <StatCard
            title="Faturamento"
            value={formatCurrency(stats.totalSalesValue)}
            icon={BarChart3}
            color="#06b6d4"
            description="Total vendido"
            gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
          />

          <StatCard
            title="Movimentações"
            value={stats.recentMovements}
            icon={Clock}
            color="#6366f1"
            description="Últimos 7 dias"
            gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
          />
        </div>


        {/* Produtos Recentes */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Package size={24} />
              Produtos Recentes
            </h2>
            <button
              onClick={onNavigateToProducts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Eye size={16} />
              Ver Todos
            </button>
          </div>

          {products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b'
            }}>
              <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Nenhum produto cadastrado</p>
              <button
                onClick={handleAddProduct}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cadastrar Primeiro Produto
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    background: '#f8fafc',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#8b5cf6'
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {product.nome.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditProduct(product)
                        }}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          color: '#64748b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProduct(product.id)
                        }}
                        style={{
                          background: '#fef2f2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          color: '#ef4444',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {product.nome}
                  </h3>

                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.4'
                  }}>
                    {product.descricao || 'Sem descrição'}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b'
                    }}>
                      Estoque: {product.estoque_atual || 0}
                    </span>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b'
                    }}>
                      Mín: {product.estoque_minimo || 0}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      {formatCurrency(product.preco || 0)}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      textTransform: 'capitalize'
                    }}>
                      {product.categoria || 'Geral'}
                    </span>
                  </div>

                  {/* Indicador de status do estoque */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    background: (product.estoque_atual || 0) <= 0 ? '#fef2f2' : 
                              (product.estoque_atual || 0) <= (product.estoque_minimo || 0) ? '#fef3c7' : '#f0fdf4',
                    color: (product.estoque_atual || 0) <= 0 ? '#dc2626' : 
                          (product.estoque_atual || 0) <= (product.estoque_minimo || 0) ? '#d97706' : '#059669'
                  }}>
                    {(product.estoque_atual || 0) <= 0 ? '❌ Sem Estoque' : 
                     (product.estoque_atual || 0) <= (product.estoque_minimo || 0) ? '⚠️ Estoque Baixo' : '✅ Em Estoque'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancelForm}
        />
      )}

      {/* Modal de Seleção de Produtos */}
      {showProductSelector && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                <Package size={20} color="white" />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0
                }}>
                  Selecionar Produto
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  Escolha um produto para controlar o estoque
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#64748b'
              }}>
                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Nenhum produto cadastrado</p>
                <button
                  onClick={() => {
                    setShowProductSelector(false)
                    setShowForm(true)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  Cadastrar Primeiro Produto
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '0.75rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#8b5cf6'
                      e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {product.nome.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {product.nome}
                      </h3>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        <span>Estoque: {product.estoque}</span>
                        <span>Valor: R$ {product.valor_unit.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{
                      color: '#8b5cf6',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      Selecionar →
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => setShowProductSelector(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e2e8f0'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f1f5f9'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Teste de Controle de Estoque */}
      {showStockMovement && testProduct && (
        <SimpleStockMovement
          product={testProduct}
          onClose={() => {
            setShowStockMovement(false)
            setTestProduct(null)
          }}
          onUpdate={() => {
            console.log('Movimentação de teste atualizada')
            // Não precisa chamar fetchProducts pois o DataContext já atualiza automaticamente
          }}
        />
      )}

      {/* Botões de Ação Rápida */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button
          onClick={syncLocalData}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            minWidth: '140px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)'
            e.target.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)'
          }}
        >
          <RefreshCw size={18} />
          Sincronizar
        </button>
        
        <button
          onClick={() => setShowSupabaseTest(true)}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            minWidth: '140px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)'
            e.target.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)'
          }}
        >
          <Settings size={18} />
          Teste Sistema
        </button>

        <button
          onClick={handleAddProduct}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '1.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.1)'
            e.target.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modal de Teste do Supabase */}
      {showSupabaseTest && (
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
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowSupabaseTest(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1.2rem',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <SupabaseTest />
          </div>
        </div>
      )}

      {/* Notificação de status RLS */}
      <RLSStatusNotification />
    </div>
  )
}

export default Dashboard
