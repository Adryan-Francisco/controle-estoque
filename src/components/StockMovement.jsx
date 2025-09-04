import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Package, ArrowUp, ArrowDown, AlertTriangle, CheckCircle, XCircle, Calendar, User, FileText } from 'lucide-react'

const StockMovement = ({ product, onClose, onUpdate }) => {
  const [movementType, setMovementType] = useState('entrada') // 'entrada' ou 'saida'
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [movementHistory, setMovementHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (product) {
      fetchMovementHistory()
    }
  }, [product])

  const fetchMovementHistory = async () => {
    if (!product?.id) return
    
    setIsLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('produto_id', product.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setMovementHistory(data || [])
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero'
    }

    if (movementType === 'saida' && quantity > product.quantidade) {
      newErrors.quantity = 'Quantidade não pode ser maior que o estoque atual'
    }

    if (!reason.trim()) {
      newErrors.reason = 'Motivo é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const movementData = {
        produto_id: product.id,
        tipo: movementType,
        quantidade: parseInt(quantity),
        motivo: reason.trim(),
        usuario_id: (await supabase.auth.getUser()).data.user?.id
      }

      const { error } = await supabase
        .from('movimentacoes')
        .insert([movementData])

      if (error) throw error

      // Atualizar quantidade do produto
      const newQuantity = movementType === 'entrada' 
        ? product.quantidade + parseInt(quantity)
        : product.quantidade - parseInt(quantity)

      const { error: updateError } = await supabase
        .from('produtos')
        .update({ quantidade: newQuantity })
        .eq('id', product.id)

      if (updateError) throw updateError

      // Recarregar histórico
      await fetchMovementHistory()
      
      // Notificar componente pai
      onUpdate && onUpdate()

      // Reset form
      setQuantity('')
      setReason('')
      setErrors({})

    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      setErrors({ submit: 'Erro ao registrar movimentação' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMovementIcon = (tipo) => {
    return tipo === 'entrada' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
  }

  const getMovementColor = (tipo) => {
    return tipo === 'entrada' ? '#10b981' : '#ef4444'
  }

  const getStockStatus = (quantidade) => {
    if (quantidade === 0) return { status: 'Sem estoque', color: '#ef4444', icon: <XCircle size={16} /> }
    if (quantidade <= 5) return { status: 'Estoque baixo', color: '#f59e0b', icon: <AlertTriangle size={16} /> }
    return { status: 'Em estoque', color: '#10b981', icon: <CheckCircle size={16} /> }
  }

  if (!product) return null

  const stockStatus = getStockStatus(product.quantidade)

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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.75rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Controle de Estoque
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              opacity: 0.9,
              fontSize: '0.9rem'
            }}>
              {product.nome}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              padding: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <XCircle size={20} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: '600px'
        }}>
          {/* Formulário de Movimentação */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible'
          }}>
            {/* Status do Estoque */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: `2px solid ${stockStatus.color}20`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ color: stockStatus.color }}>
                  {stockStatus.icon}
                </div>
                <span style={{
                  fontWeight: '600',
                  color: stockStatus.color
                }}>
                  {stockStatus.status}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Estoque atual:
                </span>
                <span style={{
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: stockStatus.color
                }}>
                  {product.quantidade} unidades
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: '400px'
            }}>
              {/* Tipo de Movimentação */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Tipo de Movimentação
                </label>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  background: '#f1f5f9',
                  borderRadius: '0.75rem',
                  padding: '0.25rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setMovementType('entrada')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: movementType === 'entrada' ? '#10b981' : 'transparent',
                      color: movementType === 'entrada' ? 'white' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '500'
                    }}
                  >
                    <ArrowUp size={16} />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('saida')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: movementType === 'saida' ? '#ef4444' : 'transparent',
                      color: movementType === 'saida' ? 'white' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '500'
                    }}
                  >
                    <ArrowDown size={16} />
                    Saída
                  </button>
                </div>
              </div>

              {/* Quantidade */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
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
                    borderRadius: '0.75rem',
                    border: `2px solid ${errors.quantity ? '#ef4444' : '#e2e8f0'}`,
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.quantity ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="Digite a quantidade"
                />
                {errors.quantity && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    margin: '0.25rem 0 0 0'
                  }}>
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Motivo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
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
                    borderRadius: '0.75rem',
                    border: `2px solid ${errors.reason ? '#ef4444' : '#e2e8f0'}`,
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    resize: 'vertical',
                    minHeight: '80px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.reason ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="Descreva o motivo da movimentação..."
                />
                {errors.reason && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    margin: '0.25rem 0 0 0'
                  }}>
                    {errors.reason}
                  </p>
                )}
              </div>

              {/* Instrução */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                marginBottom: '0.5rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Preencha os dados acima e clique em "Registrar" para atualizar o estoque
                </p>
              </div>

              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '600',
                    fontSize: '1rem',
                    minHeight: '48px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#cbd5e1'
                    e.target.style.color = '#475569'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.color = '#64748b'
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
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: movementType === 'entrada' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '600',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    minHeight: '48px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
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
                      {movementType === 'entrada' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      {movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
                    </>
                  )}
                </button>
              </div>

              {errors.submit && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  margin: '1rem 0 0 0',
                  textAlign: 'center'
                }}>
                  {errors.submit}
                </p>
              )}
            </form>
          </div>

          {/* Histórico de Movimentações */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            background: '#f8fafc',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileText size={18} />
              Histórico Recente
            </h3>

            {isLoadingHistory ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : movementHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#64748b'
              }}>
                <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Nenhuma movimentação registrada</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {movementHistory.map((movement) => (
                  <div
                    key={movement.id}
                    style={{
                      background: 'white',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#cbd5e1'
                      e.target.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          color: getMovementColor(movement.tipo),
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {getMovementIcon(movement.tipo)}
                        </div>
                        <span style={{
                          fontWeight: '600',
                          color: '#374151',
                          textTransform: 'capitalize'
                        }}>
                          {movement.tipo}
                        </span>
                        <span style={{
                          background: getMovementColor(movement.tipo),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {movement.quantidade} unidades
                        </span>
                      </div>
                      <span style={{
                        color: '#64748b',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Calendar size={12} />
                        {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      {movement.motivo}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockMovement
