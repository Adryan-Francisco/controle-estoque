import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Package, Plus, ArrowLeft, Search, Filter, Edit, Trash2, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react'

const ProductsPage = ({ onBack }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
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

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Produtos com estoque baixo
  const lowStockProducts = filteredProducts.filter(product => (product.estoque || 0) <= 5)

  // Formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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
        Carregando estoque...
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
            <Package size={32} />
            Controle de Estoque
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Gerencie o estoque de produtos e ingredientes
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
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

          <button
            onClick={refreshAllData}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={18} />
            {refreshing ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
          <Package size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Total de Produtos
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <TrendingUp size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {products.reduce((sum, product) => sum + (product.estoque || 0), 0)}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Total em Estoque
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {lowStockProducts.length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Estoque Baixo
          </div>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <AlertTriangle size={20} style={{ color: '#d97706' }} />
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              color: '#92400e'
            }}>
              Atenção: Produtos com estoque baixo
            </h3>
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#92400e'
          }}>
            {lowStockProducts.map(p => p.nome).join(', ')} - Estoque ≤ 5 unidades
          </p>
        </div>
      )}

      {/* Filtros e Busca */}
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
            Filtros e Busca
          </h2>
          
          <button
            onClick={handleAddProduct}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
            Adicionar Produto
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Buscar Produtos
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou descrição do produto..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
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
          margin: '0 0 1rem 0'
        }}>
          Lista de Produtos em Estoque
        </h2>
        
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Nenhum produto encontrado no estoque.</p>
            <button
              onClick={handleAddProduct}
              style={{
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Adicionar Primeiro Produto
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {filteredProducts.map(product => (
              <div key={product.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: (product.estoque || 0) <= 5 ? '#fef2f2' : '#f8fafc'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        color: '#1e293b'
                      }}>
                        {product.nome}
                      </h3>
                      {(product.estoque || 0) <= 5 && (
                        <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    
                    {product.descricao && (
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: '#64748b',
                        fontSize: '0.9rem'
                      }}>
                        {product.descricao}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      gap: '2rem',
                      marginTop: '0.5rem'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#64748b'
                        }}>
                          Preço: 
                        </span>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#059669'
                        }}>
                          {formatCurrency(product.preco || product.valor_unit || 0)}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#64748b'
                        }}>
                          Estoque: 
                        </span>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: (product.estoque || 0) <= 5 ? '#ef4444' : '#1e293b'
                        }}>
                          {product.estoque || 0} unidades
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => handleEditProduct(product)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário de Produto */}
      {showForm && (
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
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de formulário simples
const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    descricao: product?.descricao || '',
    preco: product?.preco || product?.valor_unit || '',
    estoque: product?.estoque || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      alert('Nome do produto é obrigatório.')
      return
    }

    if (!formData.preco || formData.preco <= 0) {
      alert('Preço deve ser maior que zero.')
      return
    }

    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Nome do Produto *
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Farinha de trigo, Açúcar, Ovos..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Descrição
        </label>
        <textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descrição do produto ou ingrediente..."
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Preço por Unidade *
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.preco}
          onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})}
          placeholder="0.00"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Quantidade em Estoque
        </label>
        <input
          type="number"
          value={formData.estoque}
          onChange={(e) => setFormData({...formData, estoque: parseInt(e.target.value) || 0})}
          placeholder="0"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {product ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

export default ProductsPage