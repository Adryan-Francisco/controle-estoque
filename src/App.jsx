import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProductsPage from './components/ProductsPage'
import SalesControl from './components/SalesControl'
import SalesReports from './components/SalesReports'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const navigateToProducts = () => {
    setCurrentPage('products')
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
  }

  const navigateToSales = () => {
    setCurrentPage('sales')
  }

  const navigateToReports = () => {
    setCurrentPage('reports')
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--gray-50) 100%)'
        }}>
          <Header 
            currentPage={currentPage}
            onNavigateToDashboard={navigateToDashboard}
            onNavigateToProducts={navigateToProducts}
            onNavigateToSales={navigateToSales}
            onNavigateToReports={navigateToReports}
          />
          {currentPage === 'dashboard' ? (
            <Dashboard 
              onNavigateToProducts={navigateToProducts}
              onNavigateToSales={navigateToSales}
            />
          ) : currentPage === 'products' ? (
            <ProductsPage onBack={navigateToDashboard} />
          ) : currentPage === 'sales' ? (
            <SalesControl onBack={navigateToDashboard} />
          ) : currentPage === 'reports' ? (
            <SalesReports onBack={navigateToDashboard} />
          ) : (
            <Dashboard 
              onNavigateToProducts={navigateToProducts}
              onNavigateToSales={navigateToSales}
            />
          )}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
