-- Script simples para corrigir a tabela venda_itens
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos dropar a tabela venda_itens se ela existir
DROP TABLE IF EXISTS venda_itens CASCADE;

-- Criar a tabela venda_itens corretamente
CREATE TABLE venda_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    bolo_id UUID REFERENCES bolos(id) ON DELETE CASCADE,
    quantidade DECIMAL(10,2) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tipo_venda VARCHAR(20) NOT NULL CHECK (tipo_venda IN ('unidade', 'kg')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
