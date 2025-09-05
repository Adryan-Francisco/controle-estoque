import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Package, Plus, ArrowLeft, Search, Filter, Edit, Trash2, RefreshCw, Eye, TrendingUp, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'

const ProductsPage = ({ onBack }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('nome')
  const [sortDirection, setSortDirection] = useState('asc')
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

  const handleViewProduct = (product) => {
    setViewingProduct(product)
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

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Produtos com estoque baixo
  const lowStockProducts = filteredProducts.filter(product => (product.quantidade || 0) <= 5)

  // Formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para ordenar
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Função para obter ícone de ordenação
  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUp size={16} style={{ opacity: 0.3 }} />
    return sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
  }

  // Função para obter inicial do nome
  const getInitial = (name) => {
    return name.charAt(0).toUpperCase()
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
        Carregando produtos...
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
            {products.reduce((sum, product) => sum + (product.quantidade || 0), 0)}
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
                placeholder="Buscar produtos..."
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
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                minWidth: '150px'
              }}
            >
              <option value="all">Todos os Status</option>
              <option value="in_stock">Em Estoque</option>
              <option value="low_stock">Estoque Baixo</option>
              <option value="out_of_stock">Sem Estoque</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'auto'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0 0 1rem 0'
        }}>
          Lista de Produtos
        </h2>
        
        {sortedProducts.length === 0 ? (
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
          <div style={{ overflow: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #e2e8f0',
                  background: '#f8fafc'
                }}>
                  <th style={{
                    padding: '1rem 0.5rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#374151',
                    width: '40px'
                  }}>
                    <input type="checkbox" />
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('nome')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      NOME DO PRODUTO
                      {getSortIcon('nome')}
                    </div>
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('quantidade')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      QUANTIDADE
                      {getSortIcon('quantidade')}
                    </div>
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('valor_unit')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      VALOR UNIT.
                      {getSortIcon('valor_unit')}
                    </div>
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('valor_total')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      VALOR TOTAL
                      {getSortIcon('valor_total')}
                    </div>
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('entrada')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ENTRADA
                      {getSortIcon('entrada')}
                    </div>
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('saida')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      SAÍDA
                      {getSortIcon('saida')}
                    </div>
                  </th>
                  
                  <th 
                    style={{
                      padding: '1rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('estoque')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ESTOQUE
                      {getSortIcon('estoque')}
                    </div>
                  </th>
                  
                  <th style={{
                    padding: '1rem 0.5rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    AÇÕES
                  </th>
                </tr>
              </thead>
              
              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <input type="checkbox" />
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {getInitial(product.nome)}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '500',
                            color: '#1e293b',
                            marginBottom: '0.25rem'
                          }}>
                            {product.nome}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#64748b'
                          }}>
                            ID: {product.id.toString().substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem', color: '#1e293b' }}>
                      {product.quantidade || 0}
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem', color: '#1e293b' }}>
                      {formatCurrency(product.valor_unit || 0)}
                    </td>
                    
                    <td style={{ 
                      padding: '1rem 0.5rem', 
                      color: '#1e293b',
                      background: '#f0fdf4'
                    }}>
                      {formatCurrency(product.valor_total || 0)}
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10b981'
                        }}></div>
                        <span style={{ color: '#1e293b' }}>{product.entrada || 0}</span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444'
                        }}></div>
                        <span style={{ color: '#1e293b' }}>{product.saida || 0}</span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: (product.estoque || 0) > 0 ? '#10b981' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          {(product.estoque || 0) > 0 ? '✓' : '✕'}
                        </div>
                        <span style={{ color: '#1e293b' }}>{product.estoque || 0}</span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleViewProduct(product)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title="Visualizar produto"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleEditProduct(product)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title="Editar produto"
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
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title="Excluir produto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Modal de Visualização */}
      {viewingProduct && (
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
            maxWidth: '600px',
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
                Detalhes do Produto
              </h2>
              <button
                onClick={() => setViewingProduct(null)}
                style={{
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
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}>
                  {getInitial(viewingProduct.nome)}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {viewingProduct.nome}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    margin: 0,
                    fontSize: '0.9rem'
                  }}>
                    ID: {viewingProduct.id}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#64748b',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Quantidade
                  </h4>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    {viewingProduct.quantidade || 0}
                  </p>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#64748b',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Valor Unitário
                  </h4>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    {formatCurrency(viewingProduct.valor_unit || 0)}
                  </p>
                </div>

                <div style={{
                  background: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#166534',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Valor Total
                  </h4>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#166534',
                    margin: 0
                  }}>
                    {formatCurrency(viewingProduct.valor_total || 0)}
                  </p>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#64748b',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Estoque
                  </h4>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    {viewingProduct.estoque || 0}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
              }}>
                <button
                  onClick={() => setViewingProduct(null)}
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
                  Fechar
                </button>
                
                <button
                  onClick={() => {
                    setViewingProduct(null)
                    handleEditProduct(viewingProduct)
                  }}
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
                  Editar Produto
                </button>
              </div>
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
    preco: product?.preco || product?.valor_unit || '',
    estoque: product?.estoque || '',
    quantidade: product?.quantidade || ''
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

    // Calcular valor total
    const valor_total = (formData.preco || 0) * (formData.quantidade || 0)
    const productData = {
      nome: formData.nome,
      valor_unit: formData.preco,
      quantidade: formData.quantidade,
      valor_total,
      entrada: 0,
      saida: 0,
      estoque: formData.estoque || formData.quantidade
    }

    onSave(productData)
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
          placeholder="Ex: BANDEJA ULTRAFEST 5 PRATA"
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
          Preço Unitário *
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
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Quantidade *
        </label>
        <input
          type="number"
          value={formData.quantidade}
          onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 0})}
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
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Estoque Inicial
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