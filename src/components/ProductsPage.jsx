import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import ProductTable from './ProductTable'
import ProductForm from './ProductForm'
import { Package, Plus, ArrowLeft, TrendingUp, DollarSign, BarChart3, Search, Filter, Grid, List, RefreshCw, X, ArrowUp, ArrowDown } from 'lucide-react'

const ProductsPage = ({ onBack }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [refreshing, setRefreshing] = useState(false)
  const [showStockMovement, setShowStockMovement] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { user } = useAuth()
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshAllData } = useData()

  useEffect(() => {
    // Carregar dados se não tiver produtos
    if (products.length === 0) {
      refreshAllData()
    }
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

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleStockMovement = (product) => {
    setSelectedProduct(product)
    setShowStockMovement(true)
  }

  const handleCloseStockMovement = () => {
    setShowStockMovement(false)
    setSelectedProduct(null)
  }

  const handleStockUpdate = () => {
    refreshAllData()
  }

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'in_stock' && product.estoque > 0) ||
                         (statusFilter === 'low_stock' && product.estoque <= 5 && product.estoque > 0) ||
                         (statusFilter === 'out_of_stock' && product.estoque === 0)
    
    return matchesSearch && matchesStatus
  })

  // Calcular estatísticas
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.estoque > 0).length,
    lowStock: products.filter(p => p.estoque <= 5 && p.estoque > 0).length,
    outOfStock: products.filter(p => p.estoque === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.valor_total || 0), 0),
    averageValue: products.length > 0 ? products.reduce((sum, p) => sum + (p.valor_total || 0), 0) / products.length : 0
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
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
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Carregando produtos...</p>
        </div>
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
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Header da página */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-xl)',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)'
                e.target.style.color = '#1e293b'
                e.target.style.transform = 'translateX(-4px)'
                e.target.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                e.target.style.color = '#64748b'
                e.target.style.transform = 'translateX(0)'
                e.target.style.boxShadow = 'var(--shadow-md)'
              }}
            >
              <ArrowLeft size={18} />
              Voltar ao Dashboard
            </button>

            <button
              onClick={refreshAllData}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-xl)',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-normal)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-md)',
                opacity: refreshing ? 0.7 : 1
              }}
            >
              <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: '4px',
              height: '2.5rem',
              background: 'linear-gradient(to bottom, var(--primary-500), var(--secondary-500))',
              borderRadius: 'var(--radius-sm)'
            }}></div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, var(--gray-800) 0%, var(--gray-600) 50%, var(--primary-600) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Gerenciar Produtos
            </h1>
          </div>
          <p style={{
            color: 'var(--gray-600)',
            fontSize: '1.125rem',
            margin: 0,
            marginLeft: '1.25rem',
            fontWeight: '500'
          }}>
            Cadastre, edite e gerencie todos os seus produtos
          </p>
        </div>

        {/* Estatísticas melhoradas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <Package size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>
                  Total de Produtos
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--gray-800)', margin: 0 }}>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <TrendingUp size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>
                  Em Estoque
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--gray-800)', margin: 0 }}>
                  {stats.inStock}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--warning-100), var(--warning-200))',
              borderRadius: '50%',
              opacity: 0.3
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <BarChart3 size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>
                  Estoque Baixo
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--gray-800)', margin: 0 }}>
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, var(--error-500), var(--error-600))',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>
                  Valor Total
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--gray-800)', margin: 0 }}>
                  R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtro e busca */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              flex: 1
            }}>
              {/* Busca */}
              <div style={{ position: 'relative', minWidth: '300px' }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)'
                }} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-xl)',
                    fontSize: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
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

              {/* Filtro de status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: '0.875rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '150px'
                }}
              >
                <option value="all">Todos os Status</option>
                <option value="in_stock">Em Estoque</option>
                <option value="low_stock">Estoque Baixo</option>
                <option value="out_of_stock">Sem Estoque</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              {/* Modo de visualização */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.25rem',
                border: '1px solid var(--gray-200)'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: viewMode === 'table' ? 'var(--primary-500)' : 'transparent',
                    color: viewMode === 'table' ? 'white' : 'var(--gray-600)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: viewMode === 'grid' ? 'var(--primary-500)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'var(--gray-600)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Grid size={16} />
                </button>
              </div>

              {/* Botão adicionar produto */}
              <button
                onClick={handleAddProduct}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'var(--shadow-md)'
                }}
              >
                <Plus size={18} />
                Novo Produto
              </button>
            </div>
          </div>
        </div>

        {/* Layout Principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showStockMovement ? '1fr 400px' : '1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Seção de Produtos */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-2xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            transition: 'var(--transition-normal)'
          }}>
            <ProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAdd={handleAddProduct}
              onStockMovement={handleStockMovement}
              viewMode={viewMode}
            />
          </div>

          {/* Painel de Movimentação de Estoque */}
          {showStockMovement && selectedProduct && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              position: 'sticky',
              top: '2rem',
              maxHeight: 'calc(100vh - 4rem)',
              overflow: 'auto'
            }}>
              <StockMovementPanel
                product={selectedProduct}
                onClose={handleCloseStockMovement}
                onUpdate={handleStockUpdate}
              />
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
    </div>
  )
}

// Componente do Painel de Movimentação de Estoque
const StockMovementPanel = ({ product, onClose, onUpdate }) => {
  const { user } = useAuth()
  const [movementType, setMovementType] = useState('entrada')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (!quantity || quantity <= 0) {
      setMessage('Quantidade deve ser maior que zero')
      return
    }

    if (movementType === 'saida' && quantity > product.quantidade) {
      setMessage('Quantidade não pode ser maior que o estoque atual')
      return
    }

    if (!reason.trim()) {
      setMessage('Motivo é obrigatório')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Calcular nova quantidade
      const quantityNum = parseInt(quantity)
      const newQuantity = movementType === 'entrada' 
        ? product.quantidade + quantityNum 
        : product.quantidade - quantityNum

      // Atualizar produto no banco
      const { error: productError } = await supabase
        .from('produtos')
        .update({
          quantidade: newQuantity,
          estoque: newQuantity,
          valor_total: newQuantity * product.valor_unit,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (productError) throw productError

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('movimentacoes')
        .insert([{
          produto_id: product.id,
          usuario_id: user.id,
          tipo: movementType,
          quantidade: quantityNum,
          motivo: reason.trim()
        }])

      if (movementError) throw movementError

      setMessage('Movimentação registrada com sucesso!')
      
      // Atualizar callback e fechar painel
      setTimeout(() => {
        onUpdate && onUpdate()
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      setMessage('Erro ao registrar movimentação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header do Painel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--gray-100)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            padding: '0.75rem',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Package size={20} color="white" />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--gray-800)'
            }}>
              Controle de Estoque
            </h3>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              {product.nome}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem',
            background: 'var(--gray-100)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--gray-600)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--gray-200)'
            e.target.style.color = 'var(--gray-800)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--gray-100)'
            e.target.style.color = 'var(--gray-600)'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Status do Estoque */}
      <div style={{
        background: 'linear-gradient(135deg, var(--success-50), var(--success-100))',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem',
        marginBottom: '1.5rem',
        border: '2px solid var(--success-200)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <Package size={16} color="var(--success-600)" />
          <span style={{
            fontWeight: '600',
            color: 'var(--success-700)',
            fontSize: '0.875rem'
          }}>
            Em estoque
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            color: 'var(--success-600)', 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Estoque atual:
          </span>
          <span style={{
            fontWeight: '700',
            fontSize: '1.125rem',
            color: 'var(--success-700)'
          }}>
            {product.quantidade} unidades
          </span>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        {/* Tipo de Movimentação */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            fontWeight: '600',
            color: 'var(--gray-700)',
            fontSize: '0.875rem'
          }}>
            Tipo de Movimentação
          </label>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => setMovementType('entrada')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: movementType === 'entrada' ? 'var(--success-500)' : 'transparent',
                color: movementType === 'entrada' ? 'white' : 'var(--gray-600)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              <ArrowUp size={14} />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setMovementType('saida')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: movementType === 'saida' ? 'var(--error-500)' : 'transparent',
                color: movementType === 'saida' ? 'white' : 'var(--gray-600)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              <ArrowDown size={14} />
              Saída
            </button>
          </div>
        </div>

        {/* Quantidade */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            fontWeight: '600',
            color: 'var(--gray-700)',
            fontSize: '0.875rem'
          }}>
            Quantidade
          </label>
          <input
            type="number"
            min="1"
            max={movementType === 'saida' ? product.quantidade : undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--gray-200)',
              fontSize: '0.875rem',
              transition: 'var(--transition-normal)',
              boxSizing: 'border-box',
              background: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-500)'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--gray-200)'
              e.target.style.boxShadow = 'none'
            }}
            placeholder="Digite a quantidade"
          />
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            fontWeight: '600',
            color: 'var(--gray-700)',
            fontSize: '0.875rem'
          }}>
            Motivo
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--gray-200)',
              fontSize: '0.875rem',
              transition: 'var(--transition-normal)',
              resize: 'vertical',
              minHeight: '80px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              background: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-500)'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--gray-200)'
              e.target.style.boxShadow = 'none'
            }}
            placeholder="Descreva o motivo da movimentação..."
          />
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div style={{
            background: message.includes('sucesso') ? 'var(--success-50)' : 'var(--error-50)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${message.includes('sucesso') ? 'var(--success-200)' : 'var(--error-200)'}`,
            marginBottom: '1rem'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: message.includes('sucesso') ? 'var(--success-700)' : 'var(--error-700)',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {message}
            </p>
          </div>
        )}

        {/* Instrução */}
        {!message && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'var(--primary-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--primary-200)'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--primary-700)',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Preencha os dados acima e clique em "Registrar" para atualizar o estoque
            </p>
          </div>
        )}

        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--gray-200)',
              background: 'white',
              color: 'var(--gray-600)',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
              fontWeight: '600',
              fontSize: '0.875rem',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--gray-300)'
              e.target.style.color = 'var(--gray-800)'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--gray-200)'
              e.target.style.color = 'var(--gray-600)'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              background: movementType === 'entrada' 
                ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                : 'linear-gradient(135deg, var(--error-500), var(--error-600))',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-normal)',
              fontWeight: '600',
              opacity: isSubmitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-md)',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = 'var(--shadow-lg)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-md)'
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Processando...
              </>
            ) : (
              <>
                {movementType === 'entrada' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductsPage
