-- =============================================
-- SCRIPT DE ATUALIZAÇÃO DA TABELA MOVIMENTAÇÕES
-- Sistema de Controle de Estoque
-- =============================================

-- Adicionar coluna 'motivo' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'movimentacoes' AND column_name = 'motivo') THEN
        ALTER TABLE movimentacoes ADD COLUMN motivo TEXT;
    END IF;
END $$;

-- Renomear coluna 'user_id' para 'usuario_id' se necessário
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movimentacoes' AND column_name = 'user_id') THEN
        ALTER TABLE movimentacoes RENAME COLUMN user_id TO usuario_id;
    END IF;
END $$;

-- Remover colunas desnecessárias se existirem
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movimentacoes' AND column_name = 'valor_unit') THEN
        ALTER TABLE movimentacoes DROP COLUMN valor_unit;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movimentacoes' AND column_name = 'valor_total') THEN
        ALTER TABLE movimentacoes DROP COLUMN valor_total;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movimentacoes' AND column_name = 'observacao') THEN
        ALTER TABLE movimentacoes DROP COLUMN observacao;
    END IF;
END $$;

-- Tornar a coluna 'motivo' obrigatória
ALTER TABLE movimentacoes ALTER COLUMN motivo SET NOT NULL;

-- Recriar índices se necessário
DROP INDEX IF EXISTS idx_movimentacoes_user_id;
CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_id ON movimentacoes(usuario_id);

-- Comentários para documentação
COMMENT ON TABLE movimentacoes IS 'Tabela para registrar movimentações de entrada e saída de produtos';
COMMENT ON COLUMN movimentacoes.produto_id IS 'ID do produto que foi movimentado';
COMMENT ON COLUMN movimentacoes.tipo IS 'Tipo de movimentação: entrada ou saida';
COMMENT ON COLUMN movimentacoes.quantidade IS 'Quantidade movimentada';
COMMENT ON COLUMN movimentacoes.motivo IS 'Motivo da movimentação';
COMMENT ON COLUMN movimentacoes.usuario_id IS 'ID do usuário que fez a movimentação';
COMMENT ON COLUMN movimentacoes.created_at IS 'Data e hora da movimentação';
