import { useState, useEffect, useCallback } from 'react'
import { cacheManager, requestCounter, SUPABASE_CONFIG } from '../lib/supabase'

const PerformanceMonitor = () => {
  const [stats, setStats] = useState({
    cacheSize: 0,
    memoryUsage: 0,
    requestCount: 0,
    dailyRequests: 0,
    maxDailyRequests: 0,
    offlineMode: false,
    errorCount: 0,
    lastUpdate: new Date().toLocaleTimeString()
  })

  const updateStats = useCallback(() => {
    try {
      // Obter estatísticas do cache
      const cacheSize = cacheManager.size()
      
      // Estimar uso de memória (aproximado)
      const memoryUsage = performance.memory ? 
        Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0
      
      // Contar requisições (baseado no localStorage)
      const requestCount = Object.keys(localStorage)
        .filter(key => key.includes('_request_')).length
      
      // Contar erros (baseado no localStorage)
      const errorCount = Object.keys(localStorage)
        .filter(key => key.includes('_error_')).length
      
      // Obter estatísticas de requisições diárias
      const dailyRequests = requestCounter.getToday()
      const maxDailyRequests = SUPABASE_CONFIG.MAX_DAILY_REQUESTS
      const offlineMode = SUPABASE_CONFIG.OFFLINE_MODE
      
      setStats({
        cacheSize,
        memoryUsage,
        requestCount,
        dailyRequests,
        maxDailyRequests,
        offlineMode,
        errorCount,
        lastUpdate: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error)
    }
  }, [])

  useEffect(() => {
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(updateStats, 30000)
    updateStats() // Atualizar imediatamente
    
    return () => clearInterval(interval)
  }, [updateStats])

  // Limpar cache quando estiver muito grande
  const clearCache = useCallback(() => {
    cacheManager.clear()
    updateStats()
    console.log('🧹 Cache limpo manualmente')
  }, [updateStats])

  // Limpar dados antigos do localStorage
  const clearOldData = useCallback(() => {
    const now = Date.now()
    const CLEANUP_THRESHOLD = 7 * 24 * 60 * 60 * 1000 // 7 dias
    
    Object.keys(localStorage).forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        if (data && data.created_at) {
          const dataAge = now - new Date(data.created_at).getTime()
          if (dataAge > CLEANUP_THRESHOLD) {
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        // Ignorar erros de parsing
      }
    })
    
    updateStats()
    console.log('🧹 Dados antigos removidos')
  }, [updateStats])

  // Sempre mostrar o monitor de requisições
  const shouldShow = stats.dailyRequests > 0 || stats.offlineMode || stats.cacheSize > 5 || stats.memoryUsage > 30 || stats.errorCount > 0
  
  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg max-w-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-yellow-800">📊 Performance</h3>
        <button
          onClick={updateStats}
          className="text-xs text-yellow-600 hover:text-yellow-800"
        >
          🔄
        </button>
      </div>
      
      <div className="space-y-1 text-xs text-yellow-700">
        <div className="flex justify-between">
          <span>Requisições hoje:</span>
          <span className={stats.dailyRequests >= stats.maxDailyRequests * 0.8 ? 'text-red-600 font-bold' : 'text-green-600'}>
            {stats.dailyRequests}/{stats.maxDailyRequests}
          </span>
        </div>
        {stats.offlineMode && (
          <div className="text-blue-600 font-bold">📱 Modo Offline Ativo</div>
        )}
        <div>Cache: {stats.cacheSize} itens</div>
        <div>Memória: {stats.memoryUsage}MB</div>
        <div>Requisições: {stats.requestCount}</div>
        {stats.errorCount > 0 && (
          <div className="text-red-600">Erros: {stats.errorCount}</div>
        )}
        <div className="text-gray-500">Atualizado: {stats.lastUpdate}</div>
      </div>
      
      <div className="flex gap-2 mt-2">
        <button
          onClick={clearCache}
          className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
        >
          Limpar Cache
        </button>
        <button
          onClick={clearOldData}
          className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
        >
          Limpar Dados
        </button>
      </div>
    </div>
  )
}

export default PerformanceMonitor
