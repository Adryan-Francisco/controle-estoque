-- Script para corrigir a tabela venda_itens para trabalhar com bolos
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se a tabela existe e sua estrutura
-- Se a tabela venda_itens não existir, vamos criá-la
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    bolo_id UUID REFERENCES bolos(id) ON DELETE CASCADE,
    quantidade DECIMAL(10,2) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tipo_venda VARCHAR(20) NOT NULL CHECK (tipo_venda IN ('unidade', 'kg')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Se a tabela já existir com a referência para produtos, vamos alterá-la
-- (Descomente as linhas abaixo se necessário)
-- ALTER TABLE venda_itens DROP CONSTRAINT IF EXISTS venda_itens_produto_id_fkey;
-- ALTER TABLE venda_itens RENAME COLUMN produto_id TO bolo_id;
-- ALTER TABLE venda_itens ADD CONSTRAINT venda_itens_bolo_id_fkey 
--     FOREIGN KEY (bolo_id) REFERENCES bolos(id) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda_id ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_bolo_id ON venda_itens(bolo_id);

-- Habilitar RLS
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários autenticados podem ver itens de venda" ON venda_itens
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir itens de venda" ON venda_itens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar itens de venda" ON venda_itens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir itens de venda" ON venda_itens
    FOR DELETE USING (auth.role() = 'authenticated');
