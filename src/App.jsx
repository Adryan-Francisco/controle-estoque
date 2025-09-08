import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProductsPage from './components/ProductsPage'
import SalesControl from './components/SalesControl'
import SalesHistory from './components/SalesHistory'
import SalesReports from './components/SalesReports'
import DataIsolationNotification from './components/DataIsolationNotification'
import PerformanceMonitor from './components/PerformanceMonitor'

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

  const navigateToSalesHistory = () => {
    setCurrentPage('sales-history')
  }

  const navigateBackToSales = () => {
    setCurrentPage('sales')
  }

  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <ProtectedRoute>
            <div style={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)'
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
                <SalesControl onBack={navigateToDashboard} onShowHistory={navigateToSalesHistory} />
              ) : currentPage === 'sales-history' ? (
                <SalesHistory onBack={navigateBackToSales} />
              ) : currentPage === 'reports' ? (
                <SalesReports onBack={navigateToDashboard} />
              ) : (
                <Dashboard 
                  onNavigateToProducts={navigateToProducts}
                  onNavigateToSales={navigateToSales}
                />
              )}
              <DataIsolationNotification />
              <PerformanceMonitor />
            </div>
          </ProtectedRoute>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  )
}

export default App