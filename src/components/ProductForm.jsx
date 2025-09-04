import { useState, useEffect } from 'react'
import { X, Save, Package, DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    quantidade: product?.quantidade || 0,
    valor_unit: product?.valor_unit || 0,
    valor_total: product?.valor_total || 0,
    entrada: product?.entrada || 0,
    saida: product?.saida || 0,
    estoque: product?.estoque || 0,
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({})

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (formData.quantidade < 0) {
      newErrors.quantidade = 'Quantidade não pode ser negativa'
    }

    if (formData.valor_unit < 0) {
      newErrors.valor_unit = 'Valor unitário não pode ser negativo'
    }

    if (formData.entrada < 0) {
      newErrors.entrada = 'Entrada não pode ser negativa'
    }

    if (formData.saida < 0) {
      newErrors.saida = 'Saída não pode ser negativa'
    }

    if (formData.estoque < 0) {
      newErrors.estoque = 'Estoque não pode ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const numValue = ['quantidade', 'valor_unit', 'valor_total', 'entrada', 'saida', 'estoque'].includes(name) 
      ? parseFloat(value) || 0 
      : value

    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }))

    // Calcular valor total automaticamente
    if (name === 'quantidade' || name === 'valor_unit') {
      const quantidade = name === 'quantidade' ? numValue : formData.quantidade
      const valorUnit = name === 'valor_unit' ? numValue : formData.valor_unit
      setFormData(prev => ({
        ...prev,
        valor_total: quantidade * valorUnit
      }))
    }

    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (validateForm()) {
      try {
        await onSave(formData)
      } catch (error) {
        console.error('Erro ao salvar:', error)
      }
    }
    
    setIsSubmitting(false)
  }

  // Calcular estoque sugerido
  const estoqueSugerido = formData.quantidade + formData.entrada - formData.saida

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 200
    }}>
      <div className="card-glass animate-scale-in" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl)',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          background: 'linear-gradient(to right, #f8fafc, rgba(59, 130, 246, 0.05))'
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
                {product ? 'Editar Produto' : 'Novo Produto'}
              </h2>
            </div>
            <p style={{
              color: '#64748b',
              fontSize: '0.875rem',
              margin: 0,
              marginLeft: '2.75rem'
            }}>
              {product ? 'Atualize as informações do produto' : 'Adicione um novo produto ao estoque'}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#64748b'
              e.target.style.backgroundColor = '#f1f5f9'
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Informações Básicas */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Package size={18} style={{ color: '#3b82f6' }} />
              Informações Básicas
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Nome do Produto *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e)
                    e.target.style.borderColor = errors.nome ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${errors.nome ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: errors.nome ? '#fef2f2' : 'white'
                  }}
                  placeholder="Digite o nome do produto"
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.nome ? '#ef4444' : '#3b82f6'
                    e.target.style.boxShadow = `0 0 0 3px ${errors.nome ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`
                  }}
                />
                {touched.nome && !errors.nome && formData.nome && (
                  <CheckCircle size={20} style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#10b981'
                  }} />
                )}
                {errors.nome && (
                  <AlertCircle size={20} style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ef4444'
                  }} />
                )}
              </div>
              {errors.nome && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <AlertCircle size={12} />
                  {errors.nome}
                </p>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Quantidade *
                </label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e)
                    e.target.style.borderColor = errors.quantidade ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${errors.quantidade ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: errors.quantidade ? '#fef2f2' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.quantidade ? '#ef4444' : '#3b82f6'
                    e.target.style.boxShadow = `0 0 0 3px ${errors.quantidade ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`
                  }}
                />
                {errors.quantidade && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.quantidade}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Valor Unitário (R$) *
                </label>
                <input
                  type="number"
                  name="valor_unit"
                  value={formData.valor_unit}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e)
                    e.target.style.borderColor = errors.valor_unit ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${errors.valor_unit ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: errors.valor_unit ? '#fef2f2' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.valor_unit ? '#ef4444' : '#3b82f6'
                    e.target.style.boxShadow = `0 0 0 3px ${errors.valor_unit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`
                  }}
                />
                {errors.valor_unit && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.valor_unit}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <DollarSign size={18} style={{ color: '#10b981' }} />
              Valor Total
            </h3>
            
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid #bbf7d0'
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '0.5rem'
              }}>
                Valor Total Calculado (R$)
              </label>
              <input
                type="text"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(formData.valor_total)}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #bbf7d0',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Movimentações */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TrendingUp size={18} style={{ color: '#f59e0b' }} />
              Movimentações de Estoque
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Entrada
                </label>
                <input
                  type="number"
                  name="entrada"
                  value={formData.entrada}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e)
                    e.target.style.borderColor = errors.entrada ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${errors.entrada ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: errors.entrada ? '#fef2f2' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.entrada ? '#ef4444' : '#10b981'
                    e.target.style.boxShadow = `0 0 0 3px ${errors.entrada ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`
                  }}
                />
                {errors.entrada && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.entrada}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Saída
                </label>
                <input
                  type="number"
                  name="saida"
                  value={formData.saida}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e)
                    e.target.style.borderColor = errors.saida ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${errors.saida ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: errors.saida ? '#fef2f2' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.saida ? '#ef4444' : '#ef4444'
                    e.target.style.boxShadow = `0 0 0 3px ${errors.saida ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                  }}
                />
                {errors.saida && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.saida}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Estoque Atual
                </label>
                <input
                  type="number"
                  name="estoque"
                  value={formData.estoque}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e)
                    e.target.style.borderColor = errors.estoque ? '#ef4444' : '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${errors.estoque ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: errors.estoque ? '#fef2f2' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.estoque ? '#ef4444' : '#3b82f6'
                    e.target.style.boxShadow = `0 0 0 3px ${errors.estoque ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`
                  }}
                />
                {errors.estoque && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.estoque}
                  </p>
                )}
              </div>
            </div>

            {/* Sugestão de estoque */}
            {estoqueSugerido !== formData.estoque && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #f59e0b',
                borderRadius: '0.75rem'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#92400e',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <TrendingUp size={16} />
                  <strong>Estoque sugerido:</strong> {estoqueSugerido} unidades
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    (Quantidade + Entrada - Saída)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#64748b',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0'
                e.target.style.color = '#475569'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9'
                e.target.style.color = '#64748b'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
