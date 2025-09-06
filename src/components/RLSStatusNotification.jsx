import React, { useState, useEffect } from 'react'

const RLSStatusNotification = () => {
  const [show, setShow] = useState(false)
  const [rlsError, setRlsError] = useState(false)

  useEffect(() => {
    // Escutar erros de RLS no console
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('42501') || message.includes('row-level security')) {
        setRlsError(true)
        setShow(true)
      }
      originalError.apply(console, args)
    }

    // Auto-hide após 10 segundos
    if (show) {
      const timer = setTimeout(() => setShow(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              ⚠️ Configuração RLS Necessária
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                O sistema está funcionando com dados locais devido a políticas RLS no Supabase.
              </p>
              <p className="mt-1 font-medium">
                Para salvar no banco de dados, configure as políticas RLS na tabela "vendas".
              </p>
            </div>
            <div className="mt-3">
              <button
                onClick={() => setShow(false)}
                className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-300"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RLSStatusNotification

