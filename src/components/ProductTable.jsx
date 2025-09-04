import { useState } from 'react'
import { Edit, Trash2, Plus, TrendingUp, TrendingDown, Package, Search, Filter, Download, Eye, MoreVertical, AlertTriangle, CheckCircle, XCircle, Warehouse } from 'lucide-react'
import SimpleStockMovement from './SimpleStockMovement'

const ProductTable = ({ products, onEdit, onDelete, onAdd, onStockMovement }) => {
  const [sortField, setSortField] = useState('nome')
  const [sortDirection, setSortDirection] = useState('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('table') // table ou grid
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showStockMovement, setShowStockMovement] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredAndSortedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredAndSortedProducts.map(p => p.id))
    }
  }

  const handleStockMovementClick = (product) => {
    console.log('Controle de estoque clicado para produto:', product.nome)
    if (onStockMovement) {
      onStockMovement(product)
    } else {
      setSelectedProduct(product)
      setShowStockMovement(true)
    }
  }

  const handleStockMovementClose = () => {
    setShowStockMovement(false)
    setSelectedProduct(null)
  }

  const handleStockMovementUpdate = () => {
    // Recarregar produtos ou notificar componente pai
    window.location.reload() // Temporário - depois implementar callback
  }

  const getProductStatus = (product) => {
    if (product.estoque <= 0) return 'out-of-stock'
    if (product.estoque <= 10) return 'low-stock'
    return 'in-stock'
  }

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || getProductStatus(product) === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStockStatus = (estoque) => {
    if (estoque <= 0) return { 
      color: 'text-red-600', 
      bgColor: 'bg-red-100', 
      icon: XCircle,
      label: 'Sem Estoque'
    }
    if (estoque <= 10) return { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100', 
      icon: AlertTriangle,
      label: 'Estoque Baixo'
    }
    return { 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      icon: CheckCircle,
      label: 'Em Estoque'
    }
  }

  const getStats = () => {
    const total = products.length
    const inStock = products.filter(p => p.estoque > 10).length
    const lowStock = products.filter(p => p.estoque > 0 && p.estoque <= 10).length
    const outOfStock = products.filter(p => p.estoque <= 0).length
    const totalValue = products.reduce((sum, p) => sum + p.valor_total, 0)
    
    return { total, inStock, lowStock, outOfStock, totalValue }
  }

  const stats = getStats()

  return (
    <div className="card-glass animate-fade-in" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-2xl)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden'
    }}>
      {/* Header com estatísticas */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        background: 'linear-gradient(to right, #f8fafc, rgba(59, 130, 246, 0.05))'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                padding: '0.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <Package size={20} style={{ color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                background: 'linear-gradient(to right, #1e293b, #475569)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: 0
              }}>
                Gerenciar Produtos
              </h2>
            </div>
            <p style={{
              color: '#64748b',
              fontSize: '0.875rem',
              margin: 0,
              marginLeft: '2.75rem'
            }}>
              {filteredAndSortedProducts.length} de {stats.total} produtos
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                borderRadius: '0.75rem',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)'
                e.target.style.color = '#1e293b'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)'
                e.target.style.color = '#64748b'
              }}
            >
              <Eye size={16} />
              {viewMode === 'table' ? 'Grade' : 'Tabela'}
            </button>

            <button
              onClick={onAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Plus size={16} />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              {stats.total}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Total
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '0.25rem'
            }}>
              {stats.inStock}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#059669',
              fontWeight: '500'
            }}>
              Em Estoque
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#d97706',
              marginBottom: '0.25rem'
            }}>
              {stats.lowStock}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#d97706',
              fontWeight: '500'
            }}>
              Estoque Baixo
            </div>
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '0.25rem'
            }}>
              {stats.outOfStock}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '500'
            }}>
              Sem Estoque
            </div>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#2563eb',
              marginBottom: '0.25rem'
            }}>
              {formatCurrency(stats.totalValue)}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#2563eb',
              fontWeight: '500'
            }}>
              Valor Total
            </div>
          </div>
        </div>

        {/* Barra de busca e filtros */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(226, 232, 240, 0.5)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <Search size={16} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(226, 232, 240, 0.5)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="all">Todos os Status</option>
            <option value="in-stock">Em Estoque</option>
            <option value="low-stock">Estoque Baixo</option>
            <option value="out-of-stock">Sem Estoque</option>
          </select>

          {selectedProducts.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              color: '#2563eb',
              fontWeight: '500'
            }}>
              <CheckCircle size={16} />
              {selectedProducts.length} selecionado{selectedProducts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          minWidth: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0
        }}>
          <thead style={{
            background: 'linear-gradient(to right, #f8fafc, rgba(59, 130, 246, 0.05))'
          }}>
            <tr>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '50px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(241, 245, 249, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
              }}
              onClick={handleSelectAll}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                    onChange={handleSelectAll}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </th>
              <th 
                style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(241, 245, 249, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
                onClick={() => handleSort('nome')}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Nome do Produto
                  {sortField === 'nome' && (
                    <span style={{
                      color: '#3b82f6',
                      fontWeight: '700',
                      fontSize: '0.875rem'
                    }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                  {sortField !== 'nome' && (
                    <span style={{
                      color: '#cbd5e1',
                      fontSize: '0.875rem'
                    }}>
                      ↕
                    </span>
                  )}
                </div>
              </th>
              {['quantidade', 'valor_unit', 'valor_total', 'entrada', 'saida', 'estoque'].map(field => (
                <th 
                  key={field}
                  style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(241, 245, 249, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                  }}
                  onClick={() => handleSort(field)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {field === 'valor_unit' ? 'Valor Unit.' :
                     field === 'valor_total' ? 'Valor Total' :
                     field === 'quantidade' ? 'Quantidade' :
                     field === 'entrada' ? 'Entrada' :
                     field === 'saida' ? 'Saída' :
                     'Estoque'}
                    {sortField === field && (
                      <span style={{
                        color: '#3b82f6',
                        fontWeight: '700',
                        fontSize: '0.875rem'
                      }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                    {sortField !== field && (
                      <span style={{
                        color: '#cbd5e1',
                        fontSize: '0.875rem'
                      }}>
                        ↕
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
              }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody style={{
            background: 'rgba(255, 255, 255, 0.5)'
          }}>
            {filteredAndSortedProducts.map((product, index) => {
              const stockStatus = getStockStatus(product.estoque)
              const StockIcon = stockStatus.icon
              const isSelected = selectedProducts.includes(product.id)
              
              return (
                <tr 
                  key={product.id} 
                  style={{
                    transition: 'all 0.2s ease',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.3)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'rgba(255, 255, 255, 0.8)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected 
                      ? 'rgba(59, 130, 246, 0.05)' 
                      : 'transparent'
                  }}
                >
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectProduct(product.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#1e293b'
                        }}>
                          {product.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '0.25rem'
                        }}>
                          {product.nome}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748b'
                        }}>
                          ID: {product.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1e293b',
                      background: '#f1f5f9',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      display: 'inline-block'
                    }}>
                      {product.quantidade}
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1e293b'
                    }}>
                      {formatCurrency(product.valor_unit)}
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#059669',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      display: 'inline-block'
                    }}>
                      {formatCurrency(product.valor_total)}
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%'
                      }}></div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#059669'
                      }}>
                        {product.entrada}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                      }}></div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#dc2626'
                      }}>
                        {product.saida}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <StockIcon size={16} style={{ color: stockStatus.color.replace('text-', '#').replace('-600', '') }} />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        display: 'inline-block',
                        ...(product.estoque <= 0 
                          ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }
                          : product.estoque <= 10 
                          ? { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }
                          : { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }
                        )
                      }}>
                        {product.estoque}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => handleStockMovementClick(product)}
                        style={{
                          padding: '0.5rem',
                          color: '#8b5cf6',
                          background: 'none',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'white'
                          e.target.style.backgroundColor = '#8b5cf6'
                          e.target.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#8b5cf6'
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.transform = 'scale(1)'
                        }}
                        title="Controle de Estoque"
                      >
                        <Warehouse size={16} />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Botão editar clicado para produto:', product.nome)
                          onEdit(product)
                        }}
                        style={{
                          padding: '0.5rem',
                          color: '#3b82f6',
                          background: 'none',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'white'
                          e.target.style.backgroundColor = '#3b82f6'
                          e.target.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#3b82f6'
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.transform = 'scale(1)'
                        }}
                        title="Editar Produto"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        style={{
                          padding: '0.5rem',
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'white'
                          e.target.style.backgroundColor = '#ef4444'
                          e.target.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#ef4444'
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.transform = 'scale(1)'
                        }}
                        title="Excluir Produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {filteredAndSortedProducts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem'
          }}>
            <div style={{
              width: '6rem',
              height: '6rem',
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <Package size={48} style={{ color: '#94a3b8' }} />
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '0.5rem'
            }}>
              {searchTerm || filterStatus !== 'all' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '2rem',
              fontSize: '0.875rem'
            }}>
              {searchTerm || filterStatus !== 'all'
                ? 'Tente ajustar os termos de busca ou filtros' 
                : 'Comece adicionando seu primeiro produto'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={onAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Plus size={18} />
                Adicionar Primeiro Produto
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Controle de Estoque */}
      {showStockMovement && (
        <SimpleStockMovement
          product={selectedProduct}
          onClose={handleStockMovementClose}
          onUpdate={handleStockMovementUpdate}
        />
      )}
    </div>
  )
}

export default ProductTable
