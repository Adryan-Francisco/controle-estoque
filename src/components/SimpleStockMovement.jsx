import { useState } from 'react'
import { XCircle, ArrowUp, ArrowDown, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const SimpleStockMovement = ({ product, onClose, onUpdate }) => {
  const { user } = useAuth()
  const [movementType, setMovementType] = useState('entrada')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (!quantity || quantity <= 0) {
      setMessage('Quantidade deve ser maior que zero')
      return
    }

    if (movementType === 'saida' && quantity > product.quantidade) {
      setMessage('Quantidade não pode ser maior que o estoque atual')
      return
    }

    if (!reason.trim()) {
      setMessage('Motivo é obrigatório')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Calcular nova quantidade
      const quantityNum = parseInt(quantity)
      const newQuantity = movementType === 'entrada' 
        ? product.quantidade + quantityNum 
        : product.quantidade - quantityNum

      // Atualizar produto no banco
      const { error: productError } = await supabase
        .from('produtos')
        .update({
          quantidade: newQuantity,
          estoque: newQuantity,
          valor_total: newQuantity * product.valor_unit,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (productError) throw productError

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('movimentacoes')
        .insert([{
          produto_id: product.id,
          usuario_id: user.id,
          tipo: movementType,
          quantidade: quantityNum,
          motivo: reason.trim(),
          created_at: new Date().toISOString()
        }])

      if (movementError) throw movementError

      setMessage('Movimentação registrada com sucesso!')
      
      // Atualizar callback e fechar modal
      setTimeout(() => {
        onUpdate && onUpdate()
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      setMessage('Erro ao registrar movimentação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!product) return null

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
      zIndex: 100,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '1rem 1rem 0 0'
        }}>
          <div style={{
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
            <div>
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

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Status do Estoque */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '2px solid #10b98120'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ color: '#10b981' }}>
                <Package size={16} />
              </div>
              <span style={{
                fontWeight: '600',
                color: '#10b981'
              }}>
                Em estoque
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
                color: '#10b981'
              }}>
                {product.quantidade} unidades
              </span>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
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
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Digite a quantidade"
              />
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
                  border: '2px solid #e2e8f0',
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
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Descreva o motivo da movimentação..."
              />
            </div>

            {/* Mensagem de feedback */}
            {message && (
              <div style={{
                background: message.includes('sucesso') ? '#f0fdf4' : '#fef2f2',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${message.includes('sucesso') ? '#bbf7d0' : '#fecaca'}`,
                marginBottom: '1rem'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: message.includes('sucesso') ? '#15803d' : '#dc2626',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {message}
                </p>
              </div>
            )}

            {/* Instrução */}
            {!message && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#f0f9ff',
                borderRadius: '0.5rem',
                border: '1px solid #bae6fd'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#0369a1',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Preencha os dados acima e clique em "Registrar" para atualizar o estoque
                </p>
              </div>
            )}

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '1rem'
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
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
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
          </form>
        </div>
      </div>
    </div>
  )
}

export default SimpleStockMovement
