import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  DollarSign,
  ShoppingCart,
  Package,
  Edit,
  Save,
  Cake
} from 'lucide-react'

const SaleForm = ({
  products,
  cart,
  saleData,
  setSaleData,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  updateCartItemType,
  getCartTotal,
  getFinalTotal,
  onClose,
  onSubmit,
  editingSale = null
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [bolos, setBolos] = useState([])
  const [showBoloForm, setShowBoloForm] = useState(false)
  const [editingBolo, setEditingBolo] = useState(null)

  // Buscar bolos do banco de dados
  useEffect(() => {
    fetchBolos()
  }, [])

  const fetchBolos = async () => {
    try {
      const { data, error } = await supabase
        .from('bolos')
        .select('*')
        .order('nome')

      if (error) {
        // Tratar diferentes tipos de erro
        if (error.code === 'PGRST205' || 
            error.code === 'PGRST200' || 
            error.message.includes('Could not find the table') || 
            error.message.includes('bolos') ||
            error.message.includes('relation "bolos" does not exist')) {
          console.warn('⚠️ Tabela "bolos" não encontrada no banco de dados.')
          console.warn('📋 Execute o script SQL: create-bolos-table.sql')
          setBolos([])
          return
        }
        throw error
      }
      setBolos(data || [])
    } catch (error) {
      console.error('Erro ao buscar bolos:', error)
      // Se for erro 400, provavelmente é tabela não encontrada
      if (error.message && error.message.includes('400')) {
        console.warn('⚠️ Erro 400 - Tabela "bolos" pode não existir.')
        console.warn('📋 Execute o script SQL: create-bolos-table.sql')
      }
      setBolos([])
    }
  }

  const filteredProducts = bolos.filter(bolo =>
    bolo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bolo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bolo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveBolo = async (boloData) => {
    try {
      if (editingBolo) {
        // Atualizar bolo existente
        const { error } = await supabase
          .from('bolos')
          .update({
            ...boloData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBolo.id)

        if (error) {
          if (error.code === 'PGRST205' || error.message.includes('Could not find the table') || error.message.includes('bolos')) {
            alert('Tabela "bolos" não encontrada. Execute o script SQL primeiro.')
            return
          }
          throw error
        }
      } else {
        // Criar novo bolo
        const { error } = await supabase
          .from('bolos')
          .insert([{
            ...boloData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) {
          if (error.code === 'PGRST205' || error.message.includes('Could not find the table') || error.message.includes('bolos')) {
            alert('Tabela "bolos" não encontrada. Execute o script SQL primeiro.')
            return
          }
          throw error
        }
      }

      await fetchBolos()
      setShowBoloForm(false)
      setEditingBolo(null)
    } catch (error) {
      console.error('Erro ao salvar bolo:', error)
      alert('Erro ao salvar bolo. Tente novamente.')
    }
  }

  const handleEditBolo = (bolo) => {
    setEditingBolo(bolo)
    setShowBoloForm(true)
  }

  const handleDeleteBolo = async (boloId) => {
    if (!confirm('Tem certeza que deseja excluir este bolo?')) return

    try {
      const { error } = await supabase
        .from('bolos')
        .delete()
        .eq('id', boloId)

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "bolos" does not exist')) {
          alert('Tabela "bolos" não encontrada. Execute o script SQL primeiro.')
          return
        }
        throw error
      }
      await fetchBolos()
    } catch (error) {
      console.error('Erro ao excluir bolo:', error)
      alert('Erro ao excluir bolo. Tente novamente.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
      zIndex: 200,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl)',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'grid',
        gridTemplateColumns: '1fr 400px'
      }}>
        {/* Produtos */}
        <div style={{
          padding: '1.5rem',
          borderRight: '1px solid var(--gray-200)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{
                margin: '0 0 0.25rem 0',
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--gray-800)'
              }}>
                {editingSale ? '✏️ Editar Venda' : '🍰 Cardápio de Bolos'}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--gray-600)'
              }}>
                {editingSale ? 'Modifique os dados da venda' : 'Escolha os bolos para sua venda'}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setShowBoloForm(true)}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
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
                <Cake size={16} />
                Novo Bolo
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '0.5rem',
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--gray-600)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Busca */}
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Buscar bolos por nome, sabor ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-xl)',
                fontSize: '0.875rem',
                transition: 'var(--transition-normal)',
                outline: 'none',
                background: 'var(--gray-50)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-500)'
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                e.target.style.background = 'white'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-200)'
                e.target.style.boxShadow = 'none'
                e.target.style.background = 'var(--gray-50)'
              }}
            />
          </div>

          {/* Cardápio de Bolos */}
          <div style={{
            display: 'grid',
            gap: '1rem',
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                border: '2px dashed var(--gray-200)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  🍰
                </div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--gray-700)'
                }}>
                  Nenhum bolo cadastrado
                </h3>
                <p style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '0.875rem',
                  color: 'var(--gray-500)'
                }}>
                  Clique em "Novo Bolo" para adicionar o primeiro bolo ao cardápio
                </p>
                <button
                  onClick={() => setShowBoloForm(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: '0 auto'
                  }}
                >
                  <Cake size={16} />
                  Adicionar Primeiro Bolo
                </button>
              </div>
            ) : (
              filteredProducts.map(bolo => (
              <div
                key={bolo.id}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  border: '2px solid var(--gray-200)',
                  transition: 'var(--transition-normal)',
                  position: 'relative',
                  overflow: 'visible',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
                  e.target.style.borderColor = 'var(--primary-300)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                  e.target.style.borderColor = 'var(--gray-200)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {/* Header com Categoria e Ações */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: bolo.categoria === 'Especiais' 
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap'
                  }}>
                    {bolo.categoria}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem'
                  }}>
                    <button
                      onClick={() => handleEditBolo(bolo)}
                      style={{
                        padding: '0.5rem',
                        background: 'var(--primary-100)',
                        color: 'var(--primary-600)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition-normal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--primary-200)'
                        e.target.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--primary-100)'
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBolo(bolo.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'var(--error-100)',
                        color: 'var(--error-600)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition-normal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--error-200)'
                        e.target.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--error-100)'
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Conteúdo Principal */}
                <div style={{ flex: 1, marginBottom: '1rem' }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--gray-800)',
                    lineHeight: 1.2
                  }}>
                    {bolo.nome}
                  </h4>
                  <p style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '0.875rem',
                    color: 'var(--gray-600)',
                    lineHeight: 1.4
                  }}>
                    {bolo.descricao}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--success-600)',
                    fontWeight: '500'
                  }}>
                    <span>✅</span>
                    <span>Disponível</span>
                  </div>
                </div>
                {/* Preços */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {bolo.preco && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      background: 'var(--primary-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--primary-200)'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-600)',
                        fontWeight: '500'
                      }}>
                        Preço Unitário:
                      </span>
                      <span style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: 'var(--primary-600)'
                      }}>
                        R$ {bolo.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {bolo.preco_por_kg && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      background: 'var(--success-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success-200)'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-600)',
                        fontWeight: '500'
                      }}>
                        Preço por KG:
                      </span>
                      <span style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: 'var(--success-600)'
                      }}>
                        R$ {bolo.preco_por_kg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botão de Adicionar */}
                <button
                  onClick={() => addToCart(bolo)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
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
                  <Plus size={16} />
                  Adicionar ao Carrinho
                </button>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Carrinho e Formulário */}
        <div style={{
          padding: '1.5rem',
          background: 'var(--gray-50)'
        }}>
          <h3 style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--gray-800)'
          }}>
            🛒 Carrinho de Bolos
          </h3>

          {/* Carrinho */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1.5rem',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {cart.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--gray-500)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem'
                }}>🍰</div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>
                  Nenhum bolo selecionado
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  Escolha bolos do cardápio
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {cart.map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-200)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <h5 style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--gray-800)'
                      }}>
                        {item.nome}
                      </h5>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          padding: '0.25rem',
                          background: 'var(--error-100)',
                          color: 'var(--error-600)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'var(--transition-normal)'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {/* Tipo de Venda */}
                    <div style={{
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <button
                          onClick={() => updateCartItemType(item.id, 'unidade')}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: item.tipo_venda === 'unidade' ? 'var(--primary-500)' : 'var(--gray-200)',
                            color: item.tipo_venda === 'unidade' ? 'white' : 'var(--gray-700)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'var(--transition-normal)',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}
                        >
                          Unidade
                        </button>
                        {item.preco_por_kg && (
                          <button
                            onClick={() => updateCartItemType(item.id, 'kg')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: item.tipo_venda === 'kg' ? 'var(--success-500)' : 'var(--gray-200)',
                              color: item.tipo_venda === 'kg' ? 'white' : 'var(--gray-700)',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              transition: 'var(--transition-normal)',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            Por KG
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Controles de Quantidade */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantidade - 0.1)}
                          style={{
                            padding: '0.25rem',
                            background: 'var(--gray-200)',
                            color: 'var(--gray-700)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'var(--transition-normal)'
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => updateCartQuantity(item.id, parseFloat(e.target.value) || 0)}
                          min="0"
                          step={item.tipo_venda === 'kg' ? "0.1" : "1"}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid var(--gray-300)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            textAlign: 'center'
                          }}
                        />
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantidade + (item.tipo_venda === 'kg' ? 0.1 : 1))}
                          style={{
                            padding: '0.25rem',
                            background: 'var(--gray-200)',
                            color: 'var(--gray-700)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'var(--transition-normal)'
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--gray-600)',
                        fontWeight: '500'
                      }}>
                        {item.tipo_venda === 'kg' ? 'KG' : 'Unid.'}
                      </span>
                    </div>

                    {/* Preço */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--gray-600)'
                      }}>
                        {item.tipo_venda === 'kg' ? 'R$ ' + item.preco_por_kg.toFixed(2) + '/kg' : 'R$ ' + item.preco.toFixed(2) + '/unid'}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--primary-600)'
                      }}>
                        R$ {((item.tipo_venda === 'kg' ? item.preco_por_kg : item.preco) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totais */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Subtotal:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-800)' }}>
                R$ {getCartTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Desconto:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--error-600)' }}>
                -R$ {(parseFloat(saleData.desconto) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              borderTop: '2px solid var(--gray-200)'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--gray-800)' }}>
                Total:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-600)' }}>
                R$ {getFinalTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Dados do Cliente */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={saleData.cliente_nome}
                  onChange={(e) => setSaleData({...saleData, cliente_nome: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={saleData.cliente_email}
                  onChange={(e) => setSaleData({...saleData, cliente_email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    transition: 'var(--transition-normal)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  value={saleData.cliente_telefone}
                  onChange={(e) => setSaleData({...saleData, cliente_telefone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    transition: 'var(--transition-normal)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Método de Pagamento */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Método de Pagamento *
                </label>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  background: 'var(--gray-100)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.25rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setSaleData({...saleData, metodo_pagamento: 'vista'})}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: saleData.metodo_pagamento === 'vista' ? 'var(--success-500)' : 'transparent',
                      color: saleData.metodo_pagamento === 'vista' ? 'white' : 'var(--gray-600)',
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
                    <CreditCard size={16} />
                    À Vista
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleData({...saleData, metodo_pagamento: 'prazo'})}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: saleData.metodo_pagamento === 'prazo' ? 'var(--warning-500)' : 'transparent',
                      color: saleData.metodo_pagamento === 'prazo' ? 'white' : 'var(--gray-600)',
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
                    <Calendar size={16} />
                    À Prazo
                  </button>
                </div>
              </div>

              {/* Data de Vencimento (apenas para à prazo) */}
              {saleData.metodo_pagamento === 'prazo' && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)'
                  }}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={saleData.data_vencimento}
                    onChange={(e) => setSaleData({...saleData, data_vencimento: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--gray-200)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.875rem',
                      transition: 'var(--transition-normal)',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {/* Desconto */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={saleData.desconto}
                  onChange={(e) => setSaleData({...saleData, desconto: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    transition: 'var(--transition-normal)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Observações */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Observações
                </label>
                <textarea
                  value={saleData.observacoes}
                  onChange={(e) => setSaleData({...saleData, observacoes: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    transition: 'var(--transition-normal)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1rem'
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
                    fontSize: '0.875rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0 || isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: cart.length === 0 || isSubmitting 
                      ? 'var(--gray-300)' 
                      : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                    color: cart.length === 0 || isSubmitting ? 'var(--gray-500)' : 'white',
                    cursor: cart.length === 0 || isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-normal)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      {editingSale ? 'Atualizar Venda' : 'Finalizar Venda'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Formulário de Bolo */}
      {showBoloForm && (
        <BoloForm
          bolo={editingBolo}
          onSave={handleSaveBolo}
          onClose={() => {
            setShowBoloForm(false)
            setEditingBolo(null)
          }}
        />
      )}
    </div>
  )
}

// Componente de Formulário de Bolo
const BoloForm = ({ bolo, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nome: bolo?.nome || '',
    descricao: bolo?.descricao || '',
    preco: bolo?.preco || '',
    preco_por_kg: bolo?.preco_por_kg || '',
    categoria: bolo?.categoria || 'Tradicionais',
    disponivel: bolo?.disponivel !== false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nome.trim() || !formData.descricao.trim() || (!formData.preco && !formData.preco_por_kg)) {
      alert('Preencha o nome, descrição e pelo menos um preço (unitário ou por kg)')
      return
    }
    onSave(formData)
  }

  return (
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
      zIndex: 300,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'var(--gray-800)'
          }}>
            {bolo ? 'Editar Bolo' : 'Novo Bolo'}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              background: 'var(--gray-100)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--gray-600)',
              cursor: 'pointer',
              transition: 'var(--transition-normal)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-700)'
              }}>
                Nome do Bolo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-700)'
              }}>
                Descrição *
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  transition: 'var(--transition-normal)',
                  outline: 'none',
                  resize: 'vertical'
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Preço Unitário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={(e) => setFormData({...formData, preco: e.target.value})}
                  placeholder="Ex: 45.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)'
                }}>
                  Preço por KG (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_por_kg}
                  onChange={(e) => setFormData({...formData, preco_por_kg: e.target.value})}
                  placeholder="Ex: 25.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
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
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-700)'
              }}>
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  transition: 'var(--transition-normal)',
                  outline: 'none',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-500)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--gray-200)'
                }}
              >
                <option value="Tradicionais">Tradicionais</option>
                <option value="Especiais">Especiais</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                id="disponivel"
                checked={formData.disponivel}
                onChange={(e) => setFormData({...formData, disponivel: e.target.checked})}
                style={{
                  width: '1rem',
                  height: '1rem',
                  accentColor: 'var(--primary-500)'
                }}
              />
              <label htmlFor="disponivel" style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--gray-700)',
                cursor: 'pointer'
              }}>
                Disponível para venda
              </label>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem'
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
                  fontSize: '0.875rem'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Save size={16} />
                {bolo ? 'Atualizar' : 'Criar'} Bolo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SaleForm
