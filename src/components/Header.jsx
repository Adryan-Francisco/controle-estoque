import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Package, User, Settings, Bell, Search, Menu, X, Home, BarChart3, FileText, HelpCircle, Moon, Sun, Shield, ShoppingCart } from 'lucide-react'

const Header = ({ currentPage, onNavigateToDashboard, onNavigateToProducts, onNavigateToSales, onNavigateToReports }) => {
  const { user, signOut } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const notifications = [
    { 
      id: 1, 
      title: 'Estoque Crítico', 
      message: 'Produto "Leite Condensado" está sem estoque', 
      time: '2 min', 
      type: 'critical',
      action: 'Ver produto'
    },
    { 
      id: 2, 
      title: 'Estoque Baixo', 
      message: 'Produto "Café Premium" com apenas 3 unidades', 
      time: '15 min', 
      type: 'warning',
      action: 'Repor estoque'
    },
    { 
      id: 3, 
      title: 'Movimentação Registrada', 
      message: 'Entrada de 50 unidades de "Açúcar" registrada', 
      time: '1 hora', 
      type: 'success',
      action: 'Ver movimentação'
    },
    { 
      id: 4, 
      title: 'Relatório Disponível', 
      message: 'Relatório mensal de movimentações gerado', 
      time: '2 horas', 
      type: 'info',
      action: 'Baixar relatório'
    },
    { 
      id: 5, 
      title: 'Produto Adicionado', 
      message: 'Novo produto "Óleo de Soja" cadastrado', 
      time: '3 horas', 
      type: 'success',
      action: 'Ver produto'
    }
  ]

  const userMenuItems = [
    { icon: User, label: 'Meu Perfil', action: () => console.log('Abrir perfil') },
    { icon: Settings, label: 'Configurações', action: () => console.log('Abrir configurações') },
    { icon: Shield, label: 'Segurança', action: () => console.log('Abrir segurança') },
    { icon: HelpCircle, label: 'Ajuda & Suporte', action: () => console.log('Abrir ajuda') },
    { icon: LogOut, label: 'Sair do Sistema', action: handleSignOut, isDestructive: true }
  ]

  return (
    <header style={{
      position: 'relative',
      background: 'linear-gradient(135deg, var(--gray-800) 0%, var(--gray-700) 50%, var(--gray-600) 100%)',
      boxShadow: 'var(--shadow-xl)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      zIndex: 1000
    }}>
      {/* Background decorativo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '5rem'
        }}>
          {/* Logo e título */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '1rem',
                filter: 'blur(12px)',
                opacity: 0.6,
                transition: 'opacity 0.3s ease'
              }}></div>
              <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                padding: '0.75rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <Package size={24} style={{ color: 'white' }} />
              </div>
            </div>
            
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: 0
              }}>
                Sistema de Gestão
              </h1>
              <p style={{
                color: 'rgba(226, 232, 240, 0.7)',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Controle de Estoque
              </p>
            </div>
          </div>
          
          {/* Barra de busca (desktop) */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
            flex: '1',
            maxWidth: '400px',
            margin: '0 2rem'
          }} className="hidden md:flex">
            <div style={{
              position: 'relative',
              flex: '1'
            }}>
              <input
                type="text"
                placeholder="Buscar produtos, relatórios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
              />
              <Search size={16} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.6)'
              }} />
            </div>
          </div>
          
          {/* Menu do usuário */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {/* Botão de navegação */}
            {currentPage === 'products' && (
              <button
                onClick={onNavigateToDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
                title="Voltar ao Dashboard"
              >
                <Home size={16} />
                Dashboard
              </button>
            )}

            {currentPage === 'sales' && (
              <button
                onClick={onNavigateToDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
                title="Voltar ao Dashboard"
              >
                <Home size={16} />
                Dashboard
              </button>
            )}

            {currentPage === 'reports' && (
              <button
                onClick={onNavigateToDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
                title="Voltar ao Dashboard"
              >
                <Home size={16} />
                Dashboard
              </button>
            )}
            
            {currentPage === 'dashboard' && (
              <button
                onClick={onNavigateToProducts}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
                title="Gerenciar Produtos"
              >
                <Package size={16} />
                Produtos
              </button>
            )}

            {currentPage === 'dashboard' && (
              <button
                onClick={onNavigateToSales}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
                title="Controle de Vendas"
              >
                <ShoppingCart size={16} />
                Vendas
              </button>
            )}

            {currentPage === 'dashboard' && (
              <button
                onClick={onNavigateToReports}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
                title="Relatórios de Vendas"
              >
                <BarChart3 size={16} />
                Relatórios
              </button>
            )}

            {/* Botão de notificações */}
            <div style={{ position: 'relative' }} ref={notificationsRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Notificações clicado, estado atual:', isNotificationsOpen)
                  setIsNotificationsOpen(!isNotificationsOpen)
                }}
                style={{
                  position: 'relative',
                  padding: '0.5rem',
                  color: isNotificationsOpen ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  background: isNotificationsOpen ? 'rgba(255, 255, 255, 0.15)' : 'none',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isNotificationsOpen) {
                    e.target.style.color = 'white'
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNotificationsOpen) {
                    e.target.style.color = 'rgba(255, 255, 255, 0.7)'
                    e.target.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid #1e293b'
                  }}></div>
                )}
              </button>

              {/* Dropdown de notificações */}
              {isNotificationsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '320px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  zIndex: 99999,
                  transform: 'translateY(0)',
                  opacity: 1,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      Notificações do Sistema
                    </h3>
                    <span style={{
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem'
                    }}>
                      {notifications.length}
                    </span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(226, 232, 240, 0.3)',
                          borderLeft: `4px solid ${
                            notification.type === 'critical' ? '#ef4444' :
                            notification.type === 'warning' ? '#f59e0b' :
                            notification.type === 'success' ? '#10b981' : '#3b82f6'
                          }`,
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: notification.type === 'critical' ? '#ef4444' :
                                        notification.type === 'warning' ? '#f59e0b' :
                                        notification.type === 'success' ? '#10b981' : '#3b82f6'
                            }}></div>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#1e293b',
                              margin: 0
                            }}>
                              {notification.title}
                            </h4>
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            background: '#f1f5f9',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {notification.time}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          margin: '0 0 0.75rem 0',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <button
                          onClick={() => {
                            console.log(`Ação: ${notification.action}`)
                            setIsNotificationsOpen(false)
                          }}
                          style={{
                            background: notification.type === 'critical' ? '#ef4444' :
                                      notification.type === 'warning' ? '#f59e0b' :
                                      notification.type === 'success' ? '#10b981' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = 'none'
                          }}
                        >
                          {notification.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botão de tema */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                padding: '0.5rem',
                color: 'rgba(255, 255, 255, 0.7)',
                background: 'none',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'white'
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.7)'
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Avatar do usuário */}
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Menu do usuário clicado, estado atual:', isUserMenuOpen)
                  setIsUserMenuOpen(!isUserMenuOpen)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  background: isUserMenuOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1rem',
                  border: isUserMenuOpen ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isUserMenuOpen) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUserMenuOpen) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={16} style={{ color: 'white' }} />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '0.75rem',
                    height: '0.75rem',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    border: '2px solid #1e293b'
                  }}></div>
                </div>
                
                <div style={{ display: 'none' }} className="hidden sm:block">
                  <p style={{
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p style={{
                    color: 'rgba(226, 232, 240, 0.7)',
                    fontSize: '0.75rem',
                    margin: 0
                  }}>
                    {user?.email}
                  </p>
                </div>
              </button>

              {/* Dropdown do usuário */}
              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '200px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  zIndex: 99999,
                  transform: 'translateY(0)',
                  opacity: 1,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ padding: '0.5rem' }}>
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action()
                          setIsUserMenuOpen(false)
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: item.isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'none',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: item.isDestructive ? '#ef4444' : '#64748b',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          marginBottom: item.isDestructive ? '0.5rem' : '0'
                        }}
                        onMouseEnter={(e) => {
                          if (item.isDestructive) {
                            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                            e.target.style.color = '#dc2626'
                          } else {
                            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                            e.target.style.color = '#1e293b'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = item.isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                          e.target.style.color = item.isDestructive ? '#ef4444' : '#64748b'
                        }}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                    
                    <div style={{
                      height: '1px',
                      backgroundColor: 'rgba(226, 232, 240, 0.5)',
                      margin: '0.5rem 0'
                    }}></div>
                    
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'none',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botão mobile menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'flex',
                padding: '0.5rem',
                color: 'rgba(255, 255, 255, 0.7)',
                background: 'none',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="md:hidden"
              onMouseEnter={(e) => {
                e.target.style.color = 'white'
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.7)'
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progresso decorativa */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)',
        opacity: 0.6
      }}></div>
    </header>
  )
}

export default Header
