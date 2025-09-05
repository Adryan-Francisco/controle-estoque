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

const SalesControl = () => {
  const { user } = useAuth()
  const { sales, loading, addSale, refreshAllData } = useData()
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
    'Coco',
    'Cenoura'
  ]

  useEffect(() => {
    // Carregar dados se não tiver
    if (sales.length === 0) {
      refreshAllData()
    }
    
    // Carregar bolos do localStorage
    const savedBolos = localStorage.getItem('bolos')
    if (savedBolos) {
      setBolos(JSON.parse(savedBolos))
    }
  }, [])

  // Salvar bolos no localStorage
  const saveBolos = (newBolos) => {
    setBolos(newBolos)
    localStorage.setItem('bolos', JSON.stringify(newBolos))
  }

  // Adicionar bolo ao cardápio
  const handleAddBolo = (e) => {
    e.preventDefault()
    
    if (!boloForm.nome.trim()) {
      alert('Nome do bolo é obrigatório.')
        return
      }

    if (!boloForm.preco_por_kg || boloForm.preco_por_kg <= 0) {
      alert('Preço por kg deve ser maior que zero.')
      return
    }

    const newBolo = {
      id: Date.now(),
      ...boloForm,
      preco_por_kg: Number(boloForm.preco_por_kg),
      disponivel: true,
      created_at: new Date().toISOString()
    }

    if (editingBolo) {
      // Editar bolo existente
      const updatedBolos = bolos.map(b => b.id === editingBolo.id ? newBolo : b)
      saveBolos(updatedBolos)
      setEditingBolo(null)
        } else {
      // Adicionar novo bolo
      saveBolos([...bolos, newBolo])
    }

    // Limpar formulário
    setBoloForm({
      nome: '',
      descricao: '',
      preco_por_kg: '',
      categoria: 'Tradicional'
    })
    setShowBoloForm(false)
  }

  // Editar bolo
  const handleEditBolo = (bolo) => {
    setBoloForm({
      nome: bolo.nome,
      descricao: bolo.descricao,
      preco_por_kg: bolo.preco_por_kg,
      categoria: bolo.categoria
    })
    setEditingBolo(bolo)
    setShowBoloForm(true)
  }

  // Excluir bolo
  const handleDeleteBolo = (boloId) => {
    if (confirm('Tem certeza que deseja excluir este bolo?')) {
      const updatedBolos = bolos.filter(b => b.id !== boloId)
      saveBolos(updatedBolos)
    }
  }

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
            Cadastre bolos e realize vendas por peso
          </p>
        </div>

          <button
          onClick={() => setShowBoloForm(true)}
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
          Cadastrar Bolo
          </button>
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
          <Cake size={24} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {bolos.length}
              </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Bolos Cadastrados
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
        
        {bolos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b'
          }}>
            <Cake size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Nenhum bolo cadastrado. Clique em "Cadastrar Bolo" para começar.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
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
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    color: '#1e293b',
                    flex: 1
                  }}>
                    {bolo.nome}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEditBolo(bolo)}
                              style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Editar bolo"
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBolo(bolo.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Excluir bolo"
                    >
                      <Trash2 size={14} />
                    </button>
                        </div>
                      </div>
                
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
                      {sale.cliente_nome || 'Cliente não informado'}
                    </h3>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      color: '#64748b',
                      fontSize: '0.9rem'
                    }}>
                      {new Date(sale.created_at).toLocaleDateString('pt-BR')} às {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {sale.cliente_email && (
                      <p style={{
                        margin: '0.25rem 0 0 0',
                        color: '#64748b',
                        fontSize: '0.8rem'
                      }}>
                        📧 {sale.cliente_email}
                      </p>
                    )}
                    {sale.cliente_telefone && (
                      <p style={{
                        margin: '0.25rem 0 0 0',
                        color: '#64748b',
                        fontSize: '0.8rem'
                      }}>
                        📞 {sale.cliente_telefone}
                      </p>
                    )}
                  </div>
                  
                  <div style={{
                    textAlign: 'right',
                    minWidth: '120px'
                  }}>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: '#059669',
                      marginBottom: '0.25rem'
                    }}>
                      {formatCurrency(sale.valor_total || 0)}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      textTransform: 'capitalize',
                      background: '#e0f2fe',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {sale.metodo_pagamento === 'vista' ? 'À Vista' : 
                       sale.metodo_pagamento === 'pix' ? 'PIX' :
                       sale.metodo_pagamento === 'credito' ? 'Cartão Crédito' :
                       sale.metodo_pagamento === 'debito' ? 'Cartão Débito' :
                       sale.metodo_pagamento === 'parcelado' ? 'Parcelado' :
                       sale.metodo_pagamento}
                    </div>
                  </div>
                </div>
                
                {/* Itens da venda */}
                {sale.itens && sale.itens.length > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.9rem',
                      color: '#374151',
                      fontWeight: '600'
                    }}>
                      Itens vendidos:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {sale.itens.map((item, index) => (
                        <div key={index} style={{
                          background: '#e0f2fe',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#1e293b'
                        }}>
                          {item.nome} - {item.peso}kg ({formatCurrency(item.preco_total)})
                  </div>
                ))}
                    </div>
              </div>
            )}
                
                {sale.observacoes && (
                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      background: '#f1f5f9',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}>
                      💬 {sale.observacoes}
                    </p>
          </div>
                )}
        </div>
            ))}
      </div>
        )}
      </div>

      {/* Modal de Cadastro de Bolo */}
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
            
            <form onSubmit={handleAddBolo} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nome do Bolo *
                </label>
                <input
                  type="text"
                  value={boloForm.nome}
                  onChange={(e) => setBoloForm({...boloForm, nome: e.target.value})}
                  placeholder="Ex: Bolo de Chocolate"
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
                  value={boloForm.descricao}
                  onChange={(e) => setBoloForm({...boloForm, descricao: e.target.value})}
                  placeholder="Descrição do bolo..."
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
                  Preço por Kg *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={boloForm.preco_por_kg}
                  onChange={(e) => setBoloForm({...boloForm, preco_por_kg: e.target.value})}
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
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
            </div>
            
            <div style={{
              display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
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
  )
}

export default SalesControl
