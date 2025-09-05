import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const QuickDebug = () => {
  useEffect(() => {
    const checkBolos = async () => {
      try {
        console.log('🔍 Verificando estrutura da tabela bolos...')
        const { data, error } = await supabase
          .from('bolos')
          .select('*')
          .limit(1)

        if (error) {
          console.error('❌ Erro na tabela bolos:', error)
        } else {
          console.log('✅ Estrutura da tabela bolos:', data)
          if (data && data[0]) {
            console.log('📋 Colunas disponíveis:', Object.keys(data[0]))
            console.log('📊 Exemplo de registro:', data[0])
          } else {
            console.log('⚠️ Tabela bolos está vazia')
          }
        }
      } catch (err) {
        console.error('❌ Erro geral:', err)
      }
    }

    checkBolos()
  }, [])

  return null // Componente invisível
}

export default QuickDebug
