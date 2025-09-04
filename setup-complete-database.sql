-- Script completo para configurar o banco de dados
-- Execute este script no SQL Editor do Supabase

-- =============================================
-- 1. CRIAR TABELA DE BOLOS
-- =============================================
CREATE TABLE IF NOT EXISTS bolos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2),
    preco_por_kg DECIMAL(10,2),
    categoria VARCHAR(100),
    disponivel BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_preco CHECK (preco IS NOT NULL OR preco_por_kg IS NOT NULL)
);

-- =============================================
-- 2. CRIAR TABELA DE VENDAS
-- =============================================
CREATE TABLE IF NOT EXISTS vendas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefone VARCHAR(20),
    metodo_pagamento VARCHAR(20) NOT NULL CHECK (metodo_pagamento IN ('vista', 'prazo')),
    status_pagamento VARCHAR(20) NOT NULL CHECK (status_pagamento IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    data_vencimento DATE,
    valor_total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_final DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. CRIAR TABELA DE ITENS DE VENDA
-- =============================================
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

-- =============================================
-- 4. CRIAR ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bolos_user_id ON bolos(user_id);
CREATE INDEX IF NOT EXISTS idx_bolos_categoria ON bolos(categoria);
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON vendas(created_at);
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda_id ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_bolo_id ON venda_itens(bolo_id);

-- =============================================
-- 5. HABILITAR RLS
-- =============================================
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. POLÍTICAS RLS PARA BOLOS
-- =============================================
CREATE POLICY "Usuários autenticados podem ver bolos" ON bolos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir bolos" ON bolos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar bolos" ON bolos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir bolos" ON bolos
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- 7. POLÍTICAS RLS PARA VENDAS
-- =============================================
CREATE POLICY "Usuários autenticados podem ver vendas" ON vendas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir vendas" ON vendas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar vendas" ON vendas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir vendas" ON vendas
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- 8. POLÍTICAS RLS PARA VENDA_ITENS
-- =============================================
CREATE POLICY "Usuários autenticados podem ver itens de venda" ON venda_itens
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir itens de venda" ON venda_itens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar itens de venda" ON venda_itens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir itens de venda" ON venda_itens
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- 9. CRIAR TRIGGERS PARA UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bolos_updated_at BEFORE UPDATE ON bolos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 10. INSERIR DADOS DE EXEMPLO
-- =============================================
INSERT INTO bolos (nome, descricao, preco, preco_por_kg, categoria, disponivel) VALUES
('Bolo de Chocolate', 'Delicioso bolo de chocolate com cobertura', 25.00, 15.00, 'Chocolate', true),
('Bolo de Morango', 'Bolo de morango com recheio cremoso', 30.00, 18.00, 'Frutas', true),
('Bolo de Limão', 'Bolo de limão com glacê de limão', 22.00, 14.00, 'Cítricos', true),
('Bolo de Cenoura', 'Bolo de cenoura com cobertura de chocolate', 28.00, 16.00, 'Vegetais', true),
('Bolo de Baunilha', 'Bolo de baunilha clássico', 20.00, 12.00, 'Tradicional', true),
('Bolo de Red Velvet', 'Bolo red velvet com cream cheese', 35.00, 20.00, 'Especial', true),
('Bolo de Coco', 'Bolo de coco com leite condensado', 26.00, 15.00, 'Tropical', true),
('Bolo de Nozes', 'Bolo de nozes com mel', 32.00, 19.00, 'Nuts', true)
ON CONFLICT (id) DO NOTHING;
