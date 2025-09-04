import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, XCircle, CheckCircle, Bell, Package, TrendingDown } from 'lucide-react'

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchStockAlerts()
  }, [])

  const fetchStockAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('quantidade', { ascending: true })

      if (error) throw error

      const stockAlerts = data.map(product => {
        let alertType = 'good'
        let message = ''
        let icon = <CheckCircle size={16} />
        let color = '#10b981'

        if (product.quantidade === 0) {
          alertType = 'critical'
          message = 'Produto sem estoque'
          icon = <XCircle size={16} />
          color = '#ef4444'
        } else if (product.quantidade <= 5) {
          alertType = 'warning'
          message = 'Estoque muito baixo'
          icon = <AlertTriangle size={16} />
          color = '#f59e0b'
        } else if (product.quantidade <= 10) {
          alertType = 'info'
          message = 'Estoque baixo'
          icon = <TrendingDown size={16} />
          color = '#3b82f6'
        }

        return {
          ...product,
          alertType,
          message,
          icon,
          color
        }
      }).filter(product => product.alertType !== 'good')

      setAlerts(stockAlerts)
    } catch (error) {
      console.error('Erro ao buscar alertas de estoque:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertCounts = () => {
    const critical = alerts.filter(a => a.alertType === 'critical').length
    const warning = alerts.filter(a => a.alertType === 'warning').length
    const info = alerts.filter(a => a.alertType === 'info').length
    return { critical, warning, info, total: alerts.length }
  }

  const counts = getAlertCounts()
  const displayAlerts = showAll ? alerts : alerts.slice(0, 3)

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: '#fef3c7',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} color="#f59e0b" />
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            Alertas de Estoque
          </h3>
        </div>
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
            borderTop: '3px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: '#d1fae5',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={20} color="#10b981" />
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            Alertas de Estoque
          </h3>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          color: '#10b981'
        }}>
          <CheckCircle size={48} style={{ marginBottom: '0.5rem', opacity: 0.7 }} />
          <p style={{ margin: 0, fontWeight: '500' }}>
            Todos os produtos estão com estoque adequado!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: counts.critical > 0 ? '#fef2f2' : '#fef3c7',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} color={counts.critical > 0 ? '#ef4444' : '#f59e0b'} />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Alertas de Estoque
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {counts.total} produto{counts.total !== 1 ? 's' : ''} com atenção
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          {counts.critical > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {counts.critical} crítico{counts.critical !== 1 ? 's' : ''}
            </span>
          )}
          {counts.warning > 0 && (
            <span style={{
              background: '#f59e0b',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {counts.warning} baixo{counts.warning !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Lista de Alertas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#f8fafc',
              borderRadius: '0.75rem',
              border: `1px solid ${alert.color}20`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f1f5f9'
              e.target.style.borderColor = `${alert.color}40`
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8fafc'
              e.target.style.borderColor = `${alert.color}20`
            }}
          >
            <div style={{ color: alert.color }}>
              {alert.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.875rem'
              }}>
                {alert.nome}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                {alert.message} • {alert.quantidade} unidades
              </p>
            </div>
            <div style={{
              background: alert.color,
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {alert.quantidade}
            </div>
          </div>
        ))}
      </div>

      {/* Botão para mostrar mais */}
      {alerts.length > 3 && (
        <div style={{
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
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
            {showAll ? 'Mostrar menos' : `Ver mais ${alerts.length - 3} alertas`}
          </button>
        </div>
      )}
    </div>
  )
}

export default StockAlerts
