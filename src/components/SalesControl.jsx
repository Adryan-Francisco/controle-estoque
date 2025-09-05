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
  Scale
} from 'lucide-react'

const SalesControl = () => {
  const { user } = useAuth()
  const { sales, loading, addSale, refreshAllData } = useData()
  const [cart, setCart] = useState([])
  const [saleData, setSaleData] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    metodo_pagamento: 'vista',
    observacoes: ''
  })

  // Cardápio de bolos com preços por kg
  const bolosCardapio = [
    {
      id: 1,
      nome: 'Bolo de Chocolate',
      descricao: 'Delicioso bolo de chocolate com cobertura de ganache',
      preco_por_kg: 28.00,
      categoria: 'Chocolate',
      disponivel: true
    },
    {
      id: 2,
      nome: 'Bolo de Morango',
      descricao: 'Bolo de morango com creme e frutas frescas',
      preco_por_kg: 32.00,
      categoria: 'Frutas',
      disponivel: true
    },
    {
      id: 3,
      nome: 'Bolo de Cenoura',
      descricao: 'Bolo de cenoura com cobertura de chocolate',
      preco_por_kg: 26.00,
      categoria: 'Tradicional',
      disponivel: true
    },
    {
      id: 4,
      nome: 'Bolo de Limão',
      descricao: 'Bolo de limão com glacê de limão siciliano',
      preco_por_kg: 30.00,
      categoria: 'Cítrico',
      disponivel: true
    },
    {
      id: 5,
      nome: 'Bolo de Red Velvet',
      descricao: 'Bolo vermelho com cream cheese e frutas vermelhas',
      preco_por_kg: 35.00,
      categoria: 'Especial',
      disponivel: true
    },
    {
      id: 6,
      nome: 'Bolo de Coco',
      descricao: 'Bolo de coco com leite condensado e coco ralado',
      preco_por_kg: 24.00,
      categoria: 'Tradicional',
      disponivel: true
    }
  ]

  useEffect(() => {
    // Carregar dados se não tiver
    if (sales.length === 0) {
      refreshAllData()
    }
  }, [])

  // Adicionar bolo ao carrinho
  const addToCart = (bolo) => {
    const existingItem = cart.find(item => item.id === bolo.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === bolo.id 
          ? { ...item, peso: item.peso + 0.5 }
          : item
      ))
    } else {
      setCart([...cart, { 
        ...bolo, 
        peso: 0.5,
        preco_total: bolo.preco_por_kg * 0.5
      }])
    }
  }

  // Remover bolo do carrinho
  const removeFromCart = (boloId) => {
    setCart(cart.filter(item => item.id !== boloId))
  }

  // Atualizar peso no carrinho
  const updateCartWeight = (boloId, peso) => {
    if (peso <= 0) {
      removeFromCart(boloId)
    } else {
      setCart(cart.map(item => 
        item.id === boloId 
          ? { 
              ...item, 
              peso,
              preco_total: item.preco_por_kg * peso
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
      alert('Adicione bolos ao carrinho antes de finalizar a venda.')
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
          preco_por_kg: item.preco_por_kg,
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
        Carregando vendas...
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
            Vendas de Bolos
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Cardápio de bolos com preço por kg
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
          Carrinho de Bolos
        </h2>

        {cart.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <Cake size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Carrinho vazio. Escolha bolos do cardápio abaixo.</p>
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
                    {formatCurrency(item.preco_por_kg)} por kg
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

      {/* Cardápio de Bolos */}
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
          <Cake size={24} />
          Cardápio de Bolos
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {bolosCardapio.map(bolo => (
            <div key={bolo.id} style={{
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
                {bolo.nome}
              </h3>
              
              <p style={{
                margin: '0 0 0.5rem 0',
                color: '#64748b',
                fontSize: '0.9rem'
              }}>
                {bolo.descricao}
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
                  {formatCurrency(bolo.preco_por_kg)}/kg
                </div>
                
                <div style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  background: '#e0f2fe',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {bolo.categoria}
                </div>
              </div>
              
              <button
                onClick={() => addToCart(bolo)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={16} />
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
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