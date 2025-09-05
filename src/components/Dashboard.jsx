import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import ProductForm from './ProductForm'
import StatCard from './StatCard'
import MovementReports from './MovementReports'
import SimpleStockMovement from './SimpleStockMovement'
import { Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Settings, ArrowRight } from 'lucide-react'

const Dashboard = ({ onNavigateToProducts }) => {
  const [showForm, setShowForm] = useState(false)
  const [showStockMovement, setShowStockMovement] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [testProduct, setTestProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const { user } = useAuth()
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshAllData } = useData()

  useEffect(() => {
    // Não precisa chamar refreshAllData aqui pois o DataContext já faz isso automaticamente
  }, [])

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Atualizar produto existente
        const { error } = await updateProduct(editingProduct.id, productData)
        if (error) throw error
      } else {
        // Criar novo produto
        const { error } = await addProduct(productData)
        if (error) throw error
      }

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

  // Calcular estatísticas
  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.valor_total, 0),
    lowStock: products.filter(p => p.estoque <= 10 && p.estoque > 0).length,
    outOfStock: products.filter(p => p.estoque <= 0).length,
    totalEntries: products.reduce((sum, p) => sum + p.entrada, 0),
    totalExits: products.reduce((sum, p) => sum + p.saida, 0),
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
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
            title="Valor Total"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            color="#10b981"
            description="Valor em estoque"
            gradient="linear-gradient(135deg, #10b981, #059669)"
          />

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
            icon={TrendingDown}
            color="#ef4444"
            description="Fora de estoque"
            gradient="linear-gradient(135deg, #ef4444, #dc2626)"
          />
        </div>

        {/* Relatório de Movimentações */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <MovementReports />
        </div>

        {/* Movimentações */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Total de Entradas"
            value={stats.totalEntries}
            icon={TrendingUp}
            color="#10b981"
            description="Produtos recebidos"
            gradient="linear-gradient(135deg, #10b981, #059669)"
          />

          <StatCard
            title="Total de Saídas"
            value={stats.totalExits}
            icon={TrendingDown}
            color="#ef4444"
            description="Produtos vendidos"
            gradient="linear-gradient(135deg, #ef4444, #dc2626)"
          />
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
    </div>
  )
}

export default Dashboard
