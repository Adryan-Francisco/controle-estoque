import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign,
  CheckCircle,
  User,
  Phone,
  Mail,
  CreditCard,
  Cake,
  Scale,
  Package
} from 'lucide-react'

const SalesControl = () => {
  const { user } = useAuth()
  const { products, sales, loading, addSale, refreshAllData } = useData()
  const [cart, setCart] = useState([])
  const [saleData, setSaleData] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    metodo_pagamento: 'vista',
    observacoes: ''
  })

  useEffect(() => {
    // Carregar dados se não tiver
    if (products.length === 0) {
      refreshAllData()
    }
  }, [])

  // Adicionar produto ao carrinho
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, peso: item.peso + 0.5 }
          : item
      ))
    } else {
      setCart([...cart, { 
        ...product, 
        peso: 0.5,
        preco_total: (product.valor_unit || 0) * 0.5
      }])
    }
  }

  // Remover produto do carrinho
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  // Atualizar peso no carrinho
  const updateCartWeight = (productId, peso) => {
    if (peso <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { 
              ...item, 
              peso,
              preco_total: (item.valor_unit || 0) * peso
            }
          : item
      ))
    }
  }

  // Calcular total do carrinho
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.preco_total, 0)
  }

  // Finalizar venda
  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho antes de finalizar a venda.')
      return
    }

    if (!saleData.cliente_nome.trim()) {
      alert('Nome do cliente é obrigatório.')
      return
    }

    try {
      const saleDataToSave = {
        ...saleData,
        user_id: user.id,
        valor_total: getCartTotal(),
        itens: cart.map(item => ({
          produto_id: item.id,
          nome: item.nome,
          peso: item.peso,
          preco_por_kg: item.valor_unit || 0,
          preco_total: item.preco_total
        })),
        created_at: new Date().toISOString()
      }

      const { error } = await addSale(saleDataToSave)
      
      if (error) {
        throw error
      }

      // Limpar carrinho e dados da venda
      setCart([])
      setSaleData({
        cliente_nome: '',
        cliente_email: '',
        cliente_telefone: '',
        metodo_pagamento: 'vista',
        observacoes: ''
      })

      alert('Venda finalizada com sucesso!')
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert('Erro ao finalizar venda. Tente novamente.')
    }
  }

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
        Carregando produtos...
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
            <Cake size={32} />
            Vendas de Produtos
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Cadastre produtos manualmente e realize vendas
          </p>
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
          <ShoppingCart size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {sales.length}
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
            {formatCurrency(sales.reduce((total, sale) => total + (sale.valor_total || 0), 0))}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Faturamento Total
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
            Produtos Cadastrados
          </div>
        </div>
      </div>

      {/* Dados da Venda */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
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
          <User size={24} />
          Dados da Venda
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={saleData.cliente_nome}
              onChange={(e) => setSaleData({...saleData, cliente_nome: e.target.value})}
              placeholder="Nome completo do cliente"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email do Cliente
            </label>
            <input
              type="email"
              value={saleData.cliente_email}
              onChange={(e) => setSaleData({...saleData, cliente_email: e.target.value})}
              placeholder="email@exemplo.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Telefone do Cliente
            </label>
            <input
              type="tel"
              value={saleData.cliente_telefone}
              onChange={(e) => setSaleData({...saleData, cliente_telefone: e.target.value})}
              placeholder="(11) 99999-9999"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Método de Pagamento
            </label>
            <select
              value={saleData.metodo_pagamento}
              onChange={(e) => setSaleData({...saleData, metodo_pagamento: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="vista">À Vista</option>
              <option value="credito">Cartão de Crédito</option>
              <option value="debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="parcelado">Parcelado</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Observações
          </label>
          <textarea
            value={saleData.observacoes}
            onChange={(e) => setSaleData({...saleData, observacoes: e.target.value})}
            placeholder="Observações sobre a venda (ex: data de entrega, decoração especial)..."
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
      </div>

      {/* Carrinho de Compras */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
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
          <ShoppingCart size={24} />
          Carrinho de Produtos
        </h2>

        {cart.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <Cake size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Carrinho vazio. Escolha produtos do catálogo abaixo.</p>
          </div>
        ) : (
          <div>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                background: '#f8fafc'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                    {item.nome}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    {formatCurrency(item.valor_unit || 0)} por kg
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => updateCartWeight(item.id, item.peso - 0.5)}
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
                      <Minus size={16} />
                    </button>
                    
                    <div style={{
                      minWidth: '80px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {item.peso} kg
                    </div>
                    
                    <button
                      onClick={() => updateCartWeight(item.id, item.peso + 0.5)}
                      style={{
                        background: '#10b981',
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
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div style={{
                    minWidth: '100px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    {formatCurrency(item.preco_total)}
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
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
            ))}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '2px solid #e2e8f0'
            }}>
              <button
                onClick={() => setCart([])}
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Limpar Carrinho
              </button>
              
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                Total: {formatCurrency(getCartTotal())}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Catálogo de Produtos */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
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
          <Package size={24} />
          Catálogo de Produtos
        </h2>
        
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Nenhum produto cadastrado. Vá para a página de produtos para cadastrar.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {products.map(product => (
              <div key={product.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: '#f8fafc',
                transition: 'all 0.2s'
              }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  color: '#1e293b'
                }}>
                  {product.nome}
                </h3>
                
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#64748b',
                  fontSize: '0.9rem'
                }}>
                  Estoque: {product.quantidade || 0} unidades
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#059669'
                  }}>
                    {formatCurrency(product.valor_unit || 0)}/kg
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    background: '#e0f2fe',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    Produto
                  </div>
                </div>
                
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.quantidade || product.quantidade <= 0}
                  style={{
                    width: '100%',
                    background: (!product.quantidade || product.quantidade <= 0) 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: (!product.quantidade || product.quantidade <= 0) 
                      ? 'not-allowed' 
                      : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    opacity: (!product.quantidade || product.quantidade <= 0) ? 0.6 : 1
                  }}
                >
                  <Plus size={16} />
                  {(!product.quantidade || product.quantidade <= 0) 
                    ? 'Sem Estoque' 
                    : 'Adicionar ao Carrinho'
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão Finalizar Venda */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={handleFinalizeSale}
          disabled={cart.length === 0}
          style={{
            background: cart.length === 0 ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            opacity: cart.length === 0 ? 0.6 : 1
          }}
        >
          <CheckCircle size={20} />
          Finalizar Venda
        </button>
      </div>

      {/* Histórico de Vendas */}
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
          Histórico de Vendas
        </h2>
        
        {sales.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Nenhuma venda realizada ainda.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {sales.map(sale => (
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
                      {new Date(sale.created_at).toLocaleDateString('pt-BR')}
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

export default SalesControl