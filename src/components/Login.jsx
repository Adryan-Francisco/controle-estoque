import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, UserPlus, Eye, EyeOff, Package, Sparkles } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        setMessage(error.message)
      } else if (!isLogin) {
        setMessage('Verifique seu email para confirmar a conta!')
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--secondary-700) 50%, var(--error-600) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Elementos decorativos */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '80px',
        width: '288px',
        height: '288px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '50%',
        filter: 'blur(48px)',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '160px',
        right: '80px',
        width: '384px',
        height: '384px',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderRadius: '50%',
        filter: 'blur(48px)',
        animation: 'pulse 4s ease-in-out infinite 1s'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '33%',
        width: '320px',
        height: '320px',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderRadius: '50%',
        filter: 'blur(48px)',
        animation: 'pulse 4s ease-in-out infinite 2s'
      }}></div>

      {/* Card principal */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(24px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                borderRadius: '1rem',
                filter: 'blur(16px)',
                opacity: 0.75
              }}></div>
              <div style={{
                position: 'relative',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <Package style={{ height: '2rem', width: '2rem', color: 'white' }} />
              </div>
            </div>
          </div>
          
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              background: 'linear-gradient(to right, white, #bfdbfe)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              marginBottom: '0.5rem'
            }}>
              Controle de Estoque
            </h1>
            <p style={{ color: '#dbeafe', fontSize: '0.875rem' }}>
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#dbeafe',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s ease-in-out'
              }}
              placeholder="seu@email.com"
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'
                e.target.style.borderColor = 'transparent'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#dbeafe',
              marginBottom: '0.5rem'
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 3rem 0.75rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
                placeholder="Sua senha"
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.5)'
                  e.target.style.borderColor = 'transparent'
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#bfdbfe',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#bfdbfe'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <div style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '1.5rem',
              backgroundColor: message.includes('Verifique') 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)',
              color: message.includes('Verifique') 
                ? '#bbf7d0' 
                : '#fecaca',
              border: `1px solid ${message.includes('Verifique') 
                ? 'rgba(74, 222, 128, 0.3)' 
                : 'rgba(248, 113, 113, 0.3)'}`
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(to right, #3b82f6, #9333ea)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(to right, #2563eb, #7c3aed)'
                e.target.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(to right, #3b82f6, #9333ea)'
                e.target.style.transform = 'scale(1)'
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(0.98)'
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.02)'
              }
            }}
          >
            {loading ? (
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                border: '2px solid transparent',
                borderBottom: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </>
            )}
          </button>
        </form>

        {/* Toggle entre login e cadastro */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#bfdbfe',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              transition: 'color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = '#bfdbfe'}
          >
            <Sparkles size={16} />
            {isLogin 
              ? 'Não tem uma conta? Criar conta' 
              : 'Já tem uma conta? Fazer login'
            }
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'rgba(191, 219, 254, 0.7)', fontSize: '0.875rem' }}>
          Sistema seguro e confiável para controle de estoque
        </p>
      </div>
    </div>
  )
}

export default Login