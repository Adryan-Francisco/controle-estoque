import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import SaleForm from './SaleForm'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Edit,
  CreditCard, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  BarChart3
} from 'lucide-react'

const SalesControl = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [cart, setCart] = useState([])
  const [saleData, setSaleData] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    metodo_pagamento: 'vista',
    data_vencimento: '',
    desconto: 0,
    observacoes: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchSales()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('bolos')
        .select('*')
        .order('nome')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao buscar bolos:', error)
    }
  }

  const fetchSales = async () => {
    try {
      // Primeiro, tentar buscar vendas sem join
      const { data: vendas, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (vendasError) {
        console.error('Erro ao buscar vendas:', vendasError)
        setSales([])
        return
      }

      // Tentar buscar itens de venda com dados dos bolos
      let vendasComItens = []
      try {
        const { data: itens, error: itensError } = await supabase
          .from('venda_itens')
          .select(`
            *,
            bolos (
              id,
              nome,
              descricao,
              preco,
              preco_por_kg,
              categoria
            )
          `)

        if (!itensError && itens) {
          // Mapear itens para vendas
          vendasComItens = vendas.map(venda => ({
            ...venda,
            venda_itens: itens.filter(item => item.venda_id === venda.id)
          }))
        } else {
          // Se não conseguir buscar itens, usar vendas sem itens
          vendasComItens = vendas.map(venda => ({
            ...venda,
            venda_itens: []
          }))
        }
      } catch (itensError) {
        console.warn('Erro ao buscar itens de venda, usando vendas sem itens:', itensError)
        vendasComItens = vendas.map(venda => ({
          ...venda,
          venda_itens: []
        }))
      }

      setSales(vendasComItens)
    } catch (error) {
      console.error('Erro geral ao buscar vendas:', error)
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantidade: item.quantidade + (item.tipo_venda === 'kg' ? 0.1 : 1) }
          : item
      ))
    } else {
      setCart([...cart, {
        ...product,
        quantidade: 1,
        tipo_venda: 'unidade',
        preco_unitario: product.preco || 0
      }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantidade: newQuantity }
          : item
      ))
    }
  }

  const updateCartItemType = (productId, tipoVenda) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { 
            ...item, 
            tipo_venda: tipoVenda,
            quantidade: tipoVenda === 'kg' ? 0.1 : 1
          }
        : item
    ))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const preco = item.tipo_venda === 'kg' ? item.preco_por_kg : item.preco
      return total + (item.quantidade * (preco || 0))
    }, 0)
  }

  const getFinalTotal = () => {
    const subtotal = getCartTotal()
    const desconto = parseFloat(saleData.desconto) || 0
    return subtotal - desconto
  }

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho')
      return
    }

    if (!saleData.cliente_nome.trim()) {
      alert('Nome do cliente é obrigatório')
      return
    }

    if (saleData.metodo_pagamento === 'prazo' && !saleData.data_vencimento) {
      alert('Data de vencimento é obrigatória para vendas à prazo')
      return
    }

    try {
      let vendaId

      if (editingSale) {
        // Atualizar venda existente
        const { error: vendaError } = await supabase
          .from('vendas')
          .update({
            cliente_nome: saleData.cliente_nome,
            cliente_email: saleData.cliente_email,
            cliente_telefone: saleData.cliente_telefone,
            metodo_pagamento: saleData.metodo_pagamento,
            status_pagamento: saleData.metodo_pagamento === 'vista' ? 'pago' : 'pendente',
            data_vencimento: saleData.data_vencimento || null,
            valor_total: getCartTotal(),
            desconto: saleData.desconto,
            valor_final: getFinalTotal(),
            observacoes: saleData.observacoes
          })
          .eq('id', editingSale.id)

        if (vendaError) throw vendaError
        vendaId = editingSale.id

        // Excluir itens antigos
        const { error: deleteItensError } = await supabase
          .from('venda_itens')
          .delete()
          .eq('venda_id', editingSale.id)

        if (deleteItensError) throw deleteItensError
      } else {
        // Criar nova venda
        const { data: venda, error: vendaError } = await supabase
          .from('vendas')
          .insert([{
            cliente_nome: saleData.cliente_nome,
            cliente_email: saleData.cliente_email,
            cliente_telefone: saleData.cliente_telefone,
            metodo_pagamento: saleData.metodo_pagamento,
            status_pagamento: saleData.metodo_pagamento === 'vista' ? 'pago' : 'pendente',
            data_vencimento: saleData.data_vencimento || null,
            valor_total: getCartTotal(),
            desconto: saleData.desconto,
            valor_final: getFinalTotal(),
            observacoes: saleData.observacoes,
            user_id: user.id
          }])
          .select()

        if (vendaError) throw vendaError
        vendaId = venda[0].id
      }

      // Adicionar itens da venda
      const itens = cart.map(item => {
        const preco = item.tipo_venda === 'kg' ? item.preco_por_kg : item.preco
        return {
          venda_id: vendaId,
          bolo_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: preco || 0,
          subtotal: item.quantidade * (preco || 0),
          tipo_venda: item.tipo_venda || 'unidade'
        }
      })

      const { error: itensError } = await supabase
        .from('venda_itens')
        .insert(itens)

      if (itensError) throw itensError

      // Limpar formulário e carrinho
      setCart([])
      setEditingSale(null)
      setSaleData({
        cliente_nome: '',
        cliente_email: '',
        cliente_telefone: '',
        metodo_pagamento: 'vista',
        data_vencimento: '',
        desconto: 0,
        observacoes: ''
      })
      setShowSaleForm(false)
      
      // Atualizar listas
      await fetchProducts()
      await fetchSales()
      
      alert(editingSale ? 'Venda atualizada com sucesso!' : 'Venda registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar venda:', error)
      alert('Erro ao salvar venda. Tente novamente.')
    }
  }

  const handleEditSale = (sale) => {
    setEditingSale(sale)
    setSaleData({
      cliente_nome: sale.cliente_nome || '',
      cliente_email: sale.cliente_email || '',
      cliente_telefone: sale.cliente_telefone || '',
      metodo_pagamento: sale.metodo_pagamento || 'vista',
      data_vencimento: sale.data_vencimento || '',
      desconto: sale.desconto || 0,
      observacoes: sale.observacoes || ''
    })
    setShowSaleForm(true)
  }

  const handleDeleteSale = async (saleId) => {
    try {
      // Primeiro, excluir itens da venda
      const { error: itensError } = await supabase
        .from('venda_itens')
        .delete()
        .eq('venda_id', saleId)

      if (itensError) throw itensError

      // Depois, excluir a venda
      const { error: vendaError } = await supabase
        .from('vendas')
        .delete()
        .eq('id', saleId)

      if (vendaError) throw vendaError

      // Atualizar lista
      await fetchSales()
      setShowDeleteConfirm(null)
      alert('Venda excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir venda:', error)
      alert('Erro ao excluir venda. Tente novamente.')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago':
        return <CheckCircle size={16} color="#10b981" />
      case 'pendente':
        return <Clock size={16} color="#f59e0b" />
      case 'atrasado':
        return <AlertCircle size={16} color="#ef4444" />
      case 'cancelado':
        return <X size={16} color="#6b7280" />
      default:
        return <Clock size={16} color="#6b7280" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return '#10b981'
      case 'pendente':
        return '#f59e0b'
      case 'atrasado':
        return '#ef4444'
      case 'cancelado':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--gray-50) 100%)'
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
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Carregando vendas...</p>
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
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
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
              Controle de Vendas
            </h1>
          </div>
          <p style={{
            color: 'var(--gray-600)',
            fontSize: '1.125rem',
            margin: 0,
            marginLeft: '1.25rem',
            fontWeight: '500'
          }}>
            Gerencie vendas à vista e à prazo
          </p>
        </div>

        {/* Botão Nova Venda */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setShowSaleForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-xl)',
              fontSize: '1rem',
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
            <ShoppingCart size={20} />
            Nova Venda
          </button>
        </div>

        {/* Lista de Vendas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '2px solid var(--gray-100)'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--gray-800)'
            }}>
              Histórico de Vendas
            </h3>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {sales.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--gray-500)'
              }}>
                <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '1.125rem' }}>
                  Nenhuma venda registrada ainda
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                {sales.map(sale => (
                  <div
                    key={sale.id}
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-xl)',
                      padding: '1.5rem',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid var(--gray-200)',
                      transition: 'var(--transition-normal)'
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
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h4 style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: 'var(--gray-800)'
                        }}>
                          {sale.cliente_nome}
                        </h4>
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--gray-600)'
                        }}>
                          {sale.cliente_email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Mail size={14} />
                              {sale.cliente_email}
                            </span>
                          )}
                          {sale.cliente_telefone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={14} />
                              {sale.cliente_telefone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {getStatusIcon(sale.status_pagamento)}
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: getStatusColor(sale.status_pagamento)
                        }}>
                          {sale.status_pagamento.charAt(0).toUpperCase() + sale.status_pagamento.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--gray-500)',
                          fontWeight: '500'
                        }}>
                          Método de Pagamento
                        </span>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--gray-800)'
                        }}>
                          {sale.metodo_pagamento === 'vista' ? 'À Vista' : 'À Prazo'}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--gray-500)',
                          fontWeight: '500'
                        }}>
                          Valor Total
                        </span>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--gray-800)'
                        }}>
                          R$ {sale.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--gray-500)',
                          fontWeight: '500'
                        }}>
                          Data da Venda
                        </span>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--gray-800)'
                        }}>
                          {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {sale.data_vencimento && (
                        <div>
                          <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-500)',
                            fontWeight: '500'
                          }}>
                            Vencimento
                          </span>
                          <p style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'var(--gray-800)'
                          }}>
                            {new Date(sale.data_vencimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {sale.venda_itens && sale.venda_itens.length > 0 && (
                      <div>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--gray-500)',
                          fontWeight: '500'
                        }}>
                          Produtos
                        </span>
                        <div style={{
                          marginTop: '0.5rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          {sale.venda_itens.map((item, index) => (
                            <span
                              key={index}
                              style={{
                                background: 'var(--primary-50)',
                                color: 'var(--primary-700)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                              }}
                            >
                              {item.bolos?.nome || 'Produto'} (x{item.quantidade})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--gray-200)'
                    }}>
                      <button
                        onClick={() => handleEditSale(sale)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: 'var(--primary-50)',
                          color: 'var(--primary-600)',
                          border: '1px solid var(--primary-200)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'var(--transition-normal)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--primary-100)'
                          e.target.style.borderColor = 'var(--primary-300)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--primary-50)'
                          e.target.style.borderColor = 'var(--primary-200)'
                        }}
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(sale.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: 'var(--error-50)',
                          color: 'var(--error-600)',
                          border: '1px solid var(--error-200)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'var(--transition-normal)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--error-100)'
                          e.target.style.borderColor = 'var(--error-300)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--error-50)'
                          e.target.style.borderColor = 'var(--error-200)'
                        }}
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nova Venda */}
      {showSaleForm && (
        <SaleForm
          products={products}
          cart={cart}
          saleData={saleData}
          setSaleData={setSaleData}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          updateCartItemType={updateCartItemType}
          getCartTotal={getCartTotal}
          getFinalTotal={getFinalTotal}
          editingSale={editingSale}
          onClose={() => {
            setShowSaleForm(false)
            setEditingSale(null)
            setCart([])
            setSaleData({
              cliente_nome: '',
              cliente_email: '',
              cliente_telefone: '',
              metodo_pagamento: 'vista',
              data_vencimento: '',
              desconto: 0,
              observacoes: ''
            })
          }}
          onSubmit={handleCreateSale}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
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
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: 'var(--shadow-2xl)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--error-100)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--error-600)'
              }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--gray-800)'
                }}>
                  Confirmar Exclusão
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)'
                }}>
                  Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--gray-100)',
                  color: 'var(--gray-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--gray-200)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--gray-100)'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={() => handleDeleteSale(showDeleteConfirm)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--error-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--error-600)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--error-500)'
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SalesControl
