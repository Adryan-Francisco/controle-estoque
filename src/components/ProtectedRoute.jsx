import { useAuth } from '../contexts/AuthContext'
import Login from './Login'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  console.log('ProtectedRoute - loading:', loading, 'user:', user?.email || 'Nenhum usuário')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return children
}

export default ProtectedRoute
