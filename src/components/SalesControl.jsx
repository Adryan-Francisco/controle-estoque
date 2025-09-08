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
  Package,
  Edit,
  Save
} from 'lucide-react'

const SalesControl = ({ onShowHistory }) => {
  const { user } = useAuth()
  const { sales, loading, addSale, addBolo, refreshAllData } = useData()
  const [cart, setCart] = useState([])
  const [showBoloForm, setShowBoloForm] = useState(false)
  const [editingBolo, setEditingBolo] = useState(null)
  const [bolos, setBolos] = useState([])
  const [saleData, setSaleData] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    metodo_pagamento: 'vista',
    observacoes: ''
  })
  const [boloForm, setBoloForm] = useState({
    nome: '',
    descricao: '',
    preco_por_kg: '',
    categoria: 'Tradicional'
  })

  // Categorias de bolos
  const categorias = [
    'Tradicional',
    'Chocolate', 
    'Frutas',
    'Especial',
    'Cítrico',
    'Red Velvet',
    'Naked Cake',
    'Cupcake',
    'Torta',
    'Pudim'
  ]

  // Carregar bolos do localStorage
  useEffect(() => {
    const savedBolos = JSON.parse(localStorage.getItem(`bolos_${user?.id}`) || '[]')
    setBolos(savedBolos)
  }, [user])

  // Carregar bolos do Supabase
  // Removido useEffect que causava requisições excessivas
  // O DataContext já carrega os dados automaticamente

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleAddBolo = async (e) => {
    e.preventDefault()
    
    if (!boloForm.nome || !boloForm.preco_por_kg) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const boloData = {
        ...boloForm,
        preco_por_kg: Number(boloForm.preco_por_kg),
        disponivel: true
      }

      // Tentar salvar no Supabase primeiro
      const result = await addBolo(boloData)
      
      if (result.error) {
        console.error('Erro ao salvar bolo:', result.error)
        // Salvar localmente se der erro
        const newBolo = {
          id: Date.now(),
          ...boloData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        
        const updatedBolos = [newBolo, ...bolos]
        setBolos(updatedBolos)
        localStorage.setItem(`bolos_${user.id}`, JSON.stringify(updatedBolos))
      } else {
        // Atualizar lista local com o bolo do Supabase
        const updatedBolos = [result.data, ...bolos]
        setBolos(updatedBolos)
        localStorage.setItem(`bolos_${user.id}`, JSON.stringify(updatedBolos))
      }

      // Limpar formulário
      setBoloForm({
        nome: '',
        descricao: '',
        preco_por_kg: '',
        categoria: 'Tradicional'
      })
      
      setShowBoloForm(false)
      setEditingBolo(null)
      
    } catch (error) {
      console.error('Erro ao adicionar bolo:', error)
      alert('Erro ao adicionar bolo. Tente novamente.')
    }
  }

  const handleEditBolo = (bolo) => {
    setEditingBolo(bolo)
    setBoloForm({
      nome: bolo.nome,
      descricao: bolo.descricao || '',
      preco_por_kg: bolo.preco_por_kg.toString(),
      categoria: bolo.categoria || 'Tradicional'
    })
    setShowBoloForm(true)
  }

  const handleDeleteBolo = (boloId) => {
    if (window.confirm('Tem certeza que deseja excluir este bolo?')) {
      const updatedBolos = bolos.filter(b => b.id !== boloId)
      setBolos(updatedBolos)
      localStorage.setItem(`bolos_${user.id}`, JSON.stringify(updatedBolos))
    }
  }

  const addToCart = (bolo) => {
    const existingItem = cart.find(item => item.id === bolo.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === bolo.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        ...bolo,
        quantidade: 1,
        peso: 1 // Peso padrão
      }])
    }
  }

  const updateCartItem = (boloId, field, value) => {
    setCart(cart.map(item => 
      item.id === boloId 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const removeFromCart = (boloId) => {
    setCart(cart.filter(item => item.id !== boloId))
  }

  const getTotalValue = () => {
    return cart.reduce((total, item) => {
      return total + (item.preco_por_kg * item.peso * item.quantidade)
    }, 0)
  }

  const handleFinalizeSale = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Adicione pelo menos um item ao carrinho')
      return
    }

    if (!saleData.cliente_nome) {
      alert('Informe o nome do cliente')
      return
    }

    try {
      const saleDataToSave = {
        ...saleData,
        valor_total: getTotalValue(),
        itens: cart.map(item => ({
          produto_id: item.id,
          nome: item.nome,
          peso: item.peso,
          preco_por_kg: item.preco_por_kg,
          preco_total: item.preco_por_kg * item.peso * item.quantidade,
          quantidade: item.quantidade
        }))
      }

      const result = await addSale(saleDataToSave)
      
      if (result.error) {
        console.error('Erro ao salvar venda:', result.error)
        alert('Erro ao salvar venda. Tente novamente.')
        return
      }

      // Limpar carrinho e formulário
      setCart([])
      setSaleData({
        cliente_nome: '',
        cliente_email: '',
        cliente_telefone: '',
        metodo_pagamento: 'vista',
        observacoes: ''
      })

      alert('Venda realizada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert('Erro ao finalizar venda. Tente novamente.')
    }
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
      padding: '20px'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Vendas</h1>
          <p className="text-gray-600">Gerencie suas vendas de bolos e acompanhe o histórico</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cardápio de Bolos */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Cardápio de Bolos
              </h2>
              <button
                onClick={() => setShowBoloForm(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <Plus size={16} />
                Adicionar Bolo
              </button>
            </div>

            {bolos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#64748b'
              }}>
                <Cake size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Nenhum bolo cadastrado ainda.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Clique em "Adicionar Bolo" para começar.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {bolos.map(bolo => (
                  <div key={bolo.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: '#f8fafc',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          color: '#1e293b',
                          fontWeight: '600'
                        }}>
                          {bolo.nome}
                        </h3>
                        {bolo.descricao && (
                          <p style={{
                            margin: '0.25rem 0 0 0',
                            color: '#64748b',
                            fontSize: '0.9rem'
                          }}>
                            {bolo.descricao}
                          </p>
                        )}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            background: '#e0f2fe',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px'
                          }}>
                            {bolo.categoria}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        textAlign: 'right',
                        minWidth: '100px'
                      }}>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: '#059669',
                          marginBottom: '0.5rem'
                        }}>
                          {formatCurrency(bolo.preco_por_kg)}/kg
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => addToCart(bolo)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Plus size={12} />
                            Adicionar
                          </button>
                          <button
                            onClick={() => handleEditBolo(bolo)}
                            style={{
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteBolo(bolo.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carrinho de Compras */}
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
              margin: '0 0 1.5rem 0'
            }}>
              Carrinho de Compras
            </h2>

            {cart.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#64748b'
              }}>
                <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Seu carrinho está vazio.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Adicione bolos do cardápio para começar.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
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
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: '#1e293b',
                            fontWeight: '600'
                          }}>
                            {item.nome}
                          </h3>
                          <p style={{
                            margin: '0.25rem 0 0 0',
                            color: '#64748b',
                            fontSize: '0.9rem'
                          }}>
                            {formatCurrency(item.preco_por_kg)}/kg
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <div>
                          <label style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            marginBottom: '0.25rem',
                            display: 'block'
                          }}>
                            Peso (kg):
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.peso}
                            onChange={(e) => updateCartItem(item.id, 'peso', Number(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.9rem'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            marginBottom: '0.25rem',
                            display: 'block'
                          }}>
                            Quantidade:
                          </label>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <button
                              onClick={() => updateCartItem(item.id, 'quantidade', Math.max(1, item.quantidade - 1))}
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => updateCartItem(item.id, 'quantidade', Number(e.target.value))}
                              style={{
                                width: '60px',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                              }}
                            />
                            <button
                              onClick={() => updateCartItem(item.id, 'quantidade', item.quantidade + 1)}
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        marginTop: '0.5rem',
                        textAlign: 'right',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        {formatCurrency(item.preco_por_kg * item.peso * item.quantidade)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Total:
                    </span>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#059669'
                    }}>
                      {formatCurrency(getTotalValue())}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Formulário de Venda */}
        {cart.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            marginTop: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 1.5rem 0'
            }}>
              Dados da Venda
            </h2>

            <form onSubmit={handleFinalizeSale}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Nome do Cliente *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} />
                    <input
                      type="text"
                      value={saleData.cliente_nome}
                      onChange={(e) => setSaleData({...saleData, cliente_nome: e.target.value})}
                      placeholder="Nome completo"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        background: '#f9fafb'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} />
                    <input
                      type="email"
                      value={saleData.cliente_email}
                      onChange={(e) => setSaleData({...saleData, cliente_email: e.target.value})}
                      placeholder="email@exemplo.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        background: '#f9fafb'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Telefone
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} />
                    <input
                      type="tel"
                      value={saleData.cliente_telefone}
                      onChange={(e) => setSaleData({...saleData, cliente_telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        background: '#f9fafb'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Forma de Pagamento
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }} />
                    <select
                      value={saleData.metodo_pagamento}
                      onChange={(e) => setSaleData({...saleData, metodo_pagamento: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        background: '#f9fafb'
                      }}
                    >
                      <option value="vista">À Vista</option>
                      <option value="pix">PIX</option>
                      <option value="cartao">Cartão</option>
                      <option value="debito">Débito</option>
                      <option value="credito">Crédito</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  fontSize: '0.9rem',
                  color: '#374151',
                  marginBottom: '0.5rem',
                  display: 'block',
                  fontWeight: '500'
                }}>
                  Observações
                </label>
                <textarea
                  value={saleData.observacoes}
                  onChange={(e) => setSaleData({...saleData, observacoes: e.target.value})}
                  placeholder="Observações sobre a venda..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    background: '#f9fafb',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  Total: <span style={{ color: '#059669' }}>{formatCurrency(getTotalValue())}</span>
                </div>
                
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    opacity: cart.length === 0 ? 0.6 : 1
                  }}
                  disabled={cart.length === 0}
                  onMouseOver={(e) => {
                    if (cart.length > 0) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <CheckCircle size={20} />
                  Finalizar Venda
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Botão para acessar histórico de vendas */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 1rem 0'
          }}>
            Histórico de Vendas
          </h2>
          
          <p style={{
            color: '#64748b',
            marginBottom: '1.5rem'
          }}>
            Visualize todas as vendas realizadas com filtros e estatísticas detalhadas
          </p>
          
          <button
            onClick={onShowHistory}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <ShoppingCart size={20} />
            Ver Histórico Completo
          </button>
        </div>

        {/* Modal para cadastrar/editar bolo */}
        {showBoloForm && (
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
                  {editingBolo ? 'Editar Bolo' : 'Cadastrar Bolo'}
                </h2>
                <button
                  onClick={() => {
                    setShowBoloForm(false)
                    setEditingBolo(null)
                    setBoloForm({
                      nome: '',
                      descricao: '',
                      preco_por_kg: '',
                      categoria: 'Tradicional'
                    })
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddBolo} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Nome do Bolo *
                  </label>
                  <input
                    type="text"
                    value={boloForm.nome}
                    onChange={(e) => setBoloForm({...boloForm, nome: e.target.value})}
                    placeholder="Ex: Bolo de Chocolate"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Descrição
                  </label>
                  <textarea
                    value={boloForm.descricao}
                    onChange={(e) => setBoloForm({...boloForm, descricao: e.target.value})}
                    placeholder="Descrição do bolo..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Preço por Kg *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={boloForm.preco_por_kg}
                    onChange={(e) => setBoloForm({...boloForm, preco_por_kg: e.target.value})}
                    placeholder="0.00"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Categoria
                  </label>
                  <select
                    value={boloForm.categoria}
                    onChange={(e) => setBoloForm({...boloForm, categoria: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBoloForm(false)
                      setEditingBolo(null)
                      setBoloForm({
                        nome: '',
                        descricao: '',
                        preco_por_kg: '',
                        categoria: 'Tradicional'
                      })
                    }}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
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
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save size={16} />
                    {editingBolo ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesControl