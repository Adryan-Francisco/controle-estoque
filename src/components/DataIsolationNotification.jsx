import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

const DataIsolationNotification = () => {
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const handleUserChange = (event) => {
      const { previousUser, newUser, action } = event.detail
      
      if (action === 'logout') {
        setNotification({
          type: 'success',
          title: 'Dados Limpos',
          message: 'Todos os dados foram limpos com sucesso. O sistema está pronto para o próximo usuário.',
          icon: CheckCircle
        })
      } else if (action === 'login' && previousUser) {
        setNotification({
          type: 'info',
          title: 'Novo Usuário',
          message: `Bem-vindo! Os dados do usuário anterior foram limpos e seus dados estão sendo carregados.`,
          icon: Info
        })
      }
    }

    const handleUserLogout = (event) => {
      setNotification({
        type: 'warning',
        title: 'Logout Realizado',
        message: 'Você foi deslogado e todos os dados foram limpos para proteger sua privacidade.',
        icon: AlertTriangle
      })
    }

    window.addEventListener('userChanged', handleUserChange)
    window.addEventListener('userLogout', handleUserLogout)

    return () => {
      window.removeEventListener('userChanged', handleUserChange)
      window.removeEventListener('userLogout', handleUserLogout)
    }
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification])

  if (!notification) return null

  const getNotificationStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      maxWidth: '400px',
      animation: 'slideInRight 0.3s ease-out'
    }

    switch (notification.type) {
      case 'success':
        return {
          ...baseStyles,
          background: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          color: '#065f46'
        }
      case 'warning':
        return {
          ...baseStyles,
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          color: '#92400e'
        }
      case 'info':
        return {
          ...baseStyles,
          background: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          color: '#1e40af'
        }
      default:
        return baseStyles
    }
  }

  const IconComponent = notification.icon

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getNotificationStyles()}>
        <IconComponent 
          size={24} 
          style={{ 
            color: notification.type === 'success' ? '#10b981' : 
                   notification.type === 'warning' ? '#f59e0b' : '#3b82f6'
          }} 
        />
        <div>
          <div style={{ 
            fontWeight: '600', 
            fontSize: '0.875rem',
            marginBottom: '0.25rem'
          }}>
            {notification.title}
          </div>
          <div style={{ 
            fontSize: '0.75rem',
            opacity: 0.9
          }}>
            {notification.message}
          </div>
        </div>
        <button
          onClick={() => setNotification(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            opacity: 0.7,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        >
          ×
        </button>
      </div>
    </>
  )
}

export default DataIsolationNotification
