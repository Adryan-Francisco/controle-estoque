-- =====================================================
-- SCHEMA OTIMIZADO PARA CONTROLE DE ESTOQUE - SUPABASE
-- =====================================================
-- Este schema foi otimizado para máxima performance e mínimo consumo de dados
-- Data: 2024
-- Versão: 2.0 - Ultra Otimizada

-- =====================================================
-- 1. CONFIGURAÇÕES INICIAIS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto otimizada

-- =====================================================
-- 2. TABELA DE USUÁRIOS (Simplificada)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

-- =====================================================
-- 3. TABELA DE PRODUTOS (Ultra Otimizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Campos essenciais (não nulos)
    nome VARCHAR(200) NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    
    -- Campos opcionais (podem ser nulos para economizar espaço)
    descricao TEXT,
    categoria VARCHAR(50) DEFAULT 'Geral',
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_movement TIMESTAMP WITH TIME ZONE,
    
    -- Campos calculados (para evitar joins desnecessários)
    valor_total DECIMAL(12,2) GENERATED ALWAYS AS (preco * estoque_atual) STORED,
    status VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN estoque_atual <= 0 THEN 'out_of_stock'
            WHEN estoque_atual <= estoque_minimo THEN 'low_stock'
            ELSE 'in_stock'
        END
    ) STORED
);

-- Índices otimizados para produtos
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_user_created ON produtos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_produtos_user_status ON produtos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_produtos_user_estoque ON produtos(user_id, estoque_atual);
CREATE INDEX IF NOT EXISTS idx_produtos_nome_trgm ON produtos USING gin(nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria) WHERE categoria IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_last_movement ON produtos(last_movement) WHERE last_movement IS NOT NULL;

-- =====================================================
-- 4. TABELA DE MOVIMENTAÇÕES (Otimizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    
    -- Campos essenciais
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
    quantidade INTEGER NOT NULL,
    motivo VARCHAR(200),
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos calculados
    valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_total DECIMAL(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED
);

-- Índices para movimentações
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_id ON movimentacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_created ON movimentacoes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_tipo ON movimentacoes(user_id, tipo);

-- =====================================================
-- 5. TABELA DE VENDAS (Simplificada)
-- =====================================================

CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados do cliente (campos essenciais)
    cliente_nome VARCHAR(200) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefone VARCHAR(20),
    
    -- Dados da venda
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    metodo_pagamento VARCHAR(20) NOT NULL DEFAULT 'vista',
    observacoes TEXT,
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status da venda
    status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada'))
);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_user_created ON vendas(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_nome ON vendas USING gin(cliente_nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vendas_valor_total ON vendas(valor_total);

-- =====================================================
-- 6. TABELA DE ITENS DE VENDA (Normalizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    
    -- Dados do item
    nome VARCHAR(200) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    peso DECIMAL(8,3) DEFAULT 1.0,
    preco_unitario DECIMAL(10,2) NOT NULL,
    preco_total DECIMAL(12,2) GENERATED ALWAYS AS (quantidade * peso * preco_unitario) STORED,
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para itens de venda
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda_id ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_produto_id ON venda_itens(produto_id);

-- =====================================================
-- 7. TABELA DE BOLOS (Otimizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS bolos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Campos essenciais
    nome VARCHAR(200) NOT NULL,
    preco_por_kg DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Tradicional',
    
    -- Campos opcionais
    descricao TEXT,
    disponivel BOOLEAN DEFAULT true,
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para bolos
CREATE INDEX IF NOT EXISTS idx_bolos_user_id ON bolos(user_id);
CREATE INDEX IF NOT EXISTS idx_bolos_user_created ON bolos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bolos_categoria ON bolos(categoria);
CREATE INDEX IF NOT EXISTS idx_bolos_disponivel ON bolos(disponivel) WHERE disponivel = true;
CREATE INDEX IF NOT EXISTS idx_bolos_nome_trgm ON bolos USING gin(nome gin_trgm_ops);

-- =====================================================
-- 8. TABELA DE CONFIGURAÇÕES (Para otimizações)
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracao_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configurações de cache
    cache_ttl_minutes INTEGER DEFAULT 120, -- 2 horas
    max_cache_size INTEGER DEFAULT 100,
    
    -- Configurações de sincronização
    sync_interval_minutes INTEGER DEFAULT 30,
    auto_sync BOOLEAN DEFAULT true,
    
    -- Configurações de notificação
    low_stock_threshold INTEGER DEFAULT 5,
    email_notifications BOOLEAN DEFAULT false,
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para configurações
CREATE INDEX IF NOT EXISTS idx_config_user_id ON configuracao_sistema(user_id);

-- =====================================================
-- 9. TABELA DE LOGS DE PERFORMANCE (Para monitoramento)
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados da requisição
    endpoint VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INTEGER NOT NULL,
    data_size_bytes INTEGER,
    
    -- Dados de cache
    cache_hit BOOLEAN DEFAULT false,
    cache_size INTEGER,
    
    -- Campos de controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs de performance
CREATE INDEX IF NOT EXISTS idx_performance_logs_user_id ON performance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_logs_created ON performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_logs_endpoint ON performance_logs(endpoint);

-- =====================================================
-- 10. TRIGGERS PARA AUTOMATIZAÇÃO
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas necessárias
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bolos_updated_at BEFORE UPDATE ON bolos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON configuracao_sistema
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. TRIGGER PARA ATUALIZAR ESTOQUE AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_estoque_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estoque do produto
    IF NEW.tipo = 'entrada' THEN
        UPDATE produtos 
        SET estoque_atual = estoque_atual + NEW.quantidade,
            last_movement = NEW.created_at
        WHERE id = NEW.produto_id;
    ELSIF NEW.tipo = 'saida' THEN
        UPDATE produtos 
        SET estoque_atual = estoque_atual - NEW.quantidade,
            last_movement = NEW.created_at
        WHERE id = NEW.produto_id;
    ELSIF NEW.tipo = 'ajuste' THEN
        UPDATE produtos 
        SET estoque_atual = NEW.quantidade,
            last_movement = NEW.created_at
        WHERE id = NEW.produto_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas movimentações
CREATE TRIGGER update_estoque_trigger AFTER INSERT ON movimentacoes
    FOR EACH ROW EXECUTE FUNCTION update_estoque_on_movement();

-- =====================================================
-- 12. VIEWS OTIMIZADAS PARA CONSULTAS FREQUENTES
-- =====================================================

-- View para produtos com status
CREATE OR REPLACE VIEW produtos_status AS
SELECT 
    p.id,
    p.user_id,
    p.nome,
    p.preco,
    p.estoque_atual,
    p.estoque_minimo,
    p.categoria,
    p.status,
    p.valor_total,
    p.created_at,
    p.last_movement,
    CASE 
        WHEN p.estoque_atual <= 0 THEN 'Sem Estoque'
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'Estoque Baixo'
        ELSE 'Em Estoque'
    END as status_texto
FROM produtos p;

-- View para vendas com totais
CREATE OR REPLACE VIEW vendas_completas AS
SELECT 
    v.id,
    v.user_id,
    v.cliente_nome,
    v.cliente_email,
    v.cliente_telefone,
    v.valor_total,
    v.metodo_pagamento,
    v.status,
    v.created_at,
    COUNT(vi.id) as total_itens,
    SUM(vi.quantidade) as total_quantidade
FROM vendas v
LEFT JOIN venda_itens vi ON v.id = vi.venda_id
GROUP BY v.id, v.user_id, v.cliente_nome, v.cliente_email, v.cliente_telefone, 
         v.valor_total, v.metodo_pagamento, v.status, v.created_at;

-- =====================================================
-- 13. FUNÇÕES DE LIMPEZA AUTOMÁTICA
-- =====================================================

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Deletar logs de performance com mais de 30 dias
    DELETE FROM performance_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Deletar movimentações com mais de 1 ano (opcional)
    -- DELETE FROM movimentacoes 
    -- WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ language 'plpgsql';

-- =====================================================
-- 14. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para produtos
CREATE POLICY "Users can manage own products" ON produtos
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para movimentações
CREATE POLICY "Users can manage own movements" ON movimentacoes
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para vendas
CREATE POLICY "Users can manage own sales" ON vendas
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para itens de venda
CREATE POLICY "Users can manage own sale items" ON venda_itens
    FOR ALL USING (auth.uid() = (SELECT user_id FROM vendas WHERE id = venda_id));

-- Políticas RLS para bolos
CREATE POLICY "Users can manage own bolos" ON bolos
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para configurações
CREATE POLICY "Users can manage own config" ON configuracao_sistema
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para logs de performance
CREATE POLICY "Users can view own performance logs" ON performance_logs
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 15. ÍNDICES COMPOSTOS OTIMIZADOS
-- =====================================================

-- Índices compostos para consultas mais comuns
CREATE INDEX IF NOT EXISTS idx_produtos_user_status_estoque 
ON produtos(user_id, status, estoque_atual) 
WHERE status IN ('low_stock', 'out_of_stock');

CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_tipo_created 
ON movimentacoes(user_id, tipo, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendas_user_status_created 
ON vendas(user_id, status, created_at DESC);

-- =====================================================
-- 16. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Configurações para otimizar performance
ALTER TABLE produtos SET (fillfactor = 90);
ALTER TABLE movimentacoes SET (fillfactor = 85);
ALTER TABLE vendas SET (fillfactor = 90);
ALTER TABLE venda_itens SET (fillfactor = 85);

-- =====================================================
-- 17. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE produtos IS 'Tabela de produtos com campos calculados para performance';
COMMENT ON TABLE movimentacoes IS 'Movimentações de estoque com triggers automáticos';
COMMENT ON TABLE vendas IS 'Vendas com status e dados do cliente';
COMMENT ON TABLE venda_itens IS 'Itens de venda normalizados';
COMMENT ON TABLE bolos IS 'Cardápio de bolos para vendas';
COMMENT ON TABLE configuracao_sistema IS 'Configurações personalizadas por usuário';
COMMENT ON TABLE performance_logs IS 'Logs para monitoramento de performance';

-- =====================================================
-- 18. SCRIPT DE INICIALIZAÇÃO
-- =====================================================

-- Função para criar configuração padrão para novo usuário
CREATE OR REPLACE FUNCTION create_default_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuracao_sistema (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar configuração padrão
CREATE TRIGGER create_user_config AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_config();

-- =====================================================
-- FIM DO SCHEMA OTIMIZADO
-- =====================================================

-- Para aplicar este schema, execute:
-- 1. Conecte-se ao seu projeto Supabase
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute o script

-- BENEFÍCIOS DESTE SCHEMA:
-- ✅ Campos calculados (STORED) para evitar cálculos em tempo real
-- ✅ Índices otimizados para consultas mais comuns
-- ✅ Triggers automáticos para manter consistência
-- ✅ RLS configurado para segurança
-- ✅ Views otimizadas para relatórios
-- ✅ Limpeza automática de dados antigos
-- ✅ Configurações personalizáveis por usuário
-- ✅ Logs de performance para monitoramento
-- ✅ Campos opcionais para economizar espaço
-- ✅ Índices de texto para busca rápida