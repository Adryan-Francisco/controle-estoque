import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, UserPlus, Eye, EyeOff, Package, Sparkles, CheckCircle, AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isValid, setIsValid] = useState(false)

  const { signIn, signUp } = useAuth()

  // Validação em tempo real
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmailValid = emailRegex.test(email)
    const isPasswordValid = password.length >= 6

    setEmailError(isEmailValid || email === '' ? '' : 'Email inválido')
    setPasswordError(isPasswordValid || password === '' ? '' : 'Senha deve ter pelo menos 6 caracteres')
    
    setIsValid(isEmailValid && isPasswordValid)
  }, [email, password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValid) {
      setMessage('Por favor, preencha todos os campos corretamente.')
      return
    }

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

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setMessage('')
    setEmailError('')
    setPasswordError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #be185d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Background animado com múltiplas camadas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(88, 28, 135, 0.9) 50%, rgba(190, 24, 93, 0.9) 100%)'
      }}></div>
      
      {/* Padrão geométrico de fundo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>
      
      {/* Elementos decorativos flutuantes com animações */}
      <div style={{
        position: 'absolute',
        top: '2.5rem',
        left: '2.5rem',
        width: '8rem',
        height: '8rem',
        background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))',
        borderRadius: '50%',
        filter: 'blur(2rem)',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '5rem',
        right: '5rem',
        width: '12rem',
        height: '12rem',
        background: 'linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
        borderRadius: '50%',
        filter: 'blur(3rem)',
        animation: 'pulse 4s ease-in-out infinite 1s'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '5rem',
        left: '25%',
        width: '10rem',
        height: '10rem',
        background: 'linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(251, 113, 133, 0.2))',
        borderRadius: '50%',
        filter: 'blur(2rem)',
        animation: 'pulse 4s ease-in-out infinite 2s'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        right: '33%',
        width: '6rem',
        height: '6rem',
        background: 'linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.2))',
        borderRadius: '50%',
        filter: 'blur(1.5rem)',
        animation: 'pulse 4s ease-in-out infinite 3s'
      }}></div>
      
      {/* Ondas de luz */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)',
        animation: 'pulse 3s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(to left, transparent, rgba(255, 255, 255, 0.1), transparent)',
        animation: 'pulse 3s ease-in-out infinite 1s'
      }}></div>
      
      {/* Overlay com gradiente sutil */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent, rgba(0, 0, 0, 0.05))'
      }}></div>

      {/* Card principal */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '32rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2.5rem',
        animation: 'scaleIn 0.3s ease-out'
      }}>
        {/* Efeito de brilho no hover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '1.5rem',
          background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))',
          opacity: 0,
          transition: 'opacity 0.5s ease'
        }}></div>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              {/* Efeito de brilho animado */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                borderRadius: '1.5rem',
                filter: 'blur(1.5rem)',
                opacity: 0.6,
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #3b82f6, #9333ea, #db2777)',
                borderRadius: '1.5rem',
                filter: 'blur(1rem)',
                opacity: 0.4,
                animation: 'pulse 2s ease-in-out infinite 0.5s'
              }}></div>
              
              {/* Ícone principal */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
                padding: '1.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease'
              }}>
                <Package style={{ height: '2.5rem', width: '2.5rem', color: 'white', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }} />
              </div>
              
              {/* Partículas decorativas */}
              <div style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '-0.5rem',
                width: '0.75rem',
                height: '0.75rem',
                background: '#60a5fa',
                borderRadius: '50%',
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-0.25rem',
                left: '-0.25rem',
                width: '0.5rem',
                height: '0.5rem',
                background: '#ec4899',
                borderRadius: '50%',
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 1s'
              }}></div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              background: 'linear-gradient(to right, white, #dbeafe, #e9d5ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
            }}>
              Controle de Estoque
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', fontWeight: '500' }}>
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
            </p>
            <div style={{
              width: '5rem',
              height: '0.25rem',
              background: 'linear-gradient(to right, #60a5fa, #a855f7)',
              margin: '0 auto',
              borderRadius: '9999px'
            }}></div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
          {/* Campo Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '0.025em'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                paddingLeft: '1rem',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Mail style={{ height: '1.25rem', width: '1.25rem', color: 'rgba(255, 255, 255, 0.6)' }} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '3rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${emailError ? 'rgba(248, 113, 113, 0.6)' : email && !emailError ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '1rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  background: emailError ? 'rgba(239, 68, 68, 0.05)' : email && !emailError ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                }}
                placeholder="seu@email.com"
                onFocus={(e) => {
                  e.target.style.borderColor = '#60a5fa'
                  e.target.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.3)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = emailError ? 'rgba(248, 113, 113, 0.6)' : email && !emailError ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255, 255, 255, 0.2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {email && !emailError && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  paddingRight: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CheckCircle style={{ height: '1.25rem', width: '1.25rem', color: '#4ade80', animation: 'pulse 2s ease-in-out infinite' }} />
                </div>
              )}
              {emailError && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  paddingRight: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <AlertCircle style={{ height: '1.25rem', width: '1.25rem', color: '#f87171', animation: 'pulse 2s ease-in-out infinite' }} />
                </div>
              )}
            </div>
            {emailError && (
              <p style={{
                color: '#fca5a5',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <AlertCircle style={{ height: '1rem', width: '1rem' }} />
                {emailError}
              </p>
            )}
          </div>

          {/* Campo Senha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '0.025em'
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                paddingLeft: '1rem',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Lock style={{ height: '1.25rem', width: '1.25rem', color: 'rgba(255, 255, 255, 0.6)' }} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '3.5rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  background: passwordError ? 'rgba(239, 68, 68, 0.05)' : password && !passwordError ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${passwordError ? 'rgba(248, 113, 113, 0.6)' : password && !passwordError ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '1rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                placeholder="Sua senha"
                onFocus={(e) => {
                  e.target.style.borderColor = '#60a5fa'
                  e.target.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.3)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = passwordError ? 'rgba(248, 113, 113, 0.6)' : password && !passwordError ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255, 255, 255, 0.2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  paddingRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white'
                  e.target.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                {showPassword ? <EyeOff style={{ height: '1.25rem', width: '1.25rem' }} /> : <Eye style={{ height: '1.25rem', width: '1.25rem' }} />}
              </button>
            </div>
            {passwordError && (
              <p style={{
                color: '#fca5a5',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <AlertCircle style={{ height: '1rem', width: '1rem' }} />
                {passwordError}
              </p>
            )}
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(10px)',
              border: '2px solid',
              animation: 'fadeIn 0.3s ease-out',
              ...(message.includes('Verifique') 
                ? {
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#bbf7d0',
                    borderColor: 'rgba(74, 222, 128, 0.3)',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
                  } 
                : {
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#fecaca',
                    borderColor: 'rgba(248, 113, 113, 0.3)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                  })
            }}>
              <div style={{
                padding: '0.25rem',
                borderRadius: '50%',
                background: message.includes('Verifique') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
              }}>
                {message.includes('Verifique') ? (
                  <CheckCircle style={{ height: '1rem', width: '1rem', color: '#4ade80' }} />
                ) : (
                  <AlertCircle style={{ height: '1rem', width: '1rem', color: '#f87171' }} />
                )}
              </div>
              {message}
            </div>
          )}

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading || !isValid}
            style={{
              width: '100%',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              color: 'white',
              fontWeight: '700',
              borderRadius: '1rem',
              border: '2px solid',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              overflow: 'hidden',
              cursor: isValid && !loading ? 'pointer' : 'not-allowed',
              ...(isValid && !loading 
                ? {
                    background: 'linear-gradient(to right, #3b82f6, #9333ea, #db2777)',
                    borderColor: 'transparent',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  } 
                : {
                    background: 'rgba(75, 85, 99, 0.5)',
                    borderColor: 'rgba(107, 114, 128, 0.5)',
                    opacity: 0.5
                  })
            }}
            onMouseEnter={(e) => {
              if (isValid && !loading) {
                e.target.style.background = 'linear-gradient(to right, #2563eb, #7c3aed, #be185d)'
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 25px 50px -12px rgba(147, 51, 234, 0.25)'
              }
            }}
            onMouseLeave={(e) => {
              if (isValid && !loading) {
                e.target.style.background = 'linear-gradient(to right, #3b82f6, #9333ea, #db2777)'
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }
            }}
            onMouseDown={(e) => {
              if (isValid && !loading) {
                e.target.style.transform = 'scale(0.95)'
              }
            }}
            onMouseUp={(e) => {
              if (isValid && !loading) {
                e.target.style.transform = 'scale(1.05)'
              }
            }}
          >
            {/* Efeito de brilho animado */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transform: 'translateX(-100%)',
              transition: 'transform 1s ease'
            }}></div>
            
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  border: '3px solid transparent',
                  borderBottom: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>Processando...</span>
              </div>
            ) : (
              <>
                <div style={{
                  padding: '0.25rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  transition: 'background 0.2s ease'
                }}>
                  {isLogin ? <LogIn style={{ height: '1.25rem', width: '1.25rem' }} /> : <UserPlus style={{ height: '1.25rem', width: '1.25rem' }} />}
                </div>
                <span style={{ fontSize: '1.125rem', letterSpacing: '0.025em' }}>
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </span>
                <ArrowRight style={{ height: '1.25rem', width: '1.25rem', transition: 'transform 0.2s ease' }} />
              </>
            )}
          </button>
        </form>

        {/* Toggle entre login e cadastro */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
              borderRadius: '1rem',
              filter: 'blur(4px)'
            }}></div>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                resetForm()
              }}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                margin: '0 auto',
                padding: '0.75rem 1.5rem',
                borderRadius: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'white'
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.8)'
                e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.target.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                padding: '0.25rem',
                borderRadius: '50%',
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
                transition: 'all 0.3s ease'
              }}>
                <Sparkles style={{ height: '1rem', width: '1rem' }} />
              </div>
              <span style={{ letterSpacing: '0.025em' }}>
                {isLogin 
                  ? 'Não tem uma conta? Criar conta' 
                  : 'Já tem uma conta? Fazer login'
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '0.75rem 1.5rem'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            fontWeight: '500',
            letterSpacing: '0.025em'
          }}>
            Sistema seguro e confiável para controle de estoque
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login