-- =============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Sistema de Controle de Estoque
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA DE PRODUTOS
-- =============================================
CREATE TABLE IF NOT EXISTS produtos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    entrada DECIMAL(10,2) NOT NULL DEFAULT 0,
    saida DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque DECIMAL(10,2) NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- =============================================
CREATE TABLE IF NOT EXISTS movimentacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    quantidade DECIMAL(10,2) NOT NULL,
    motivo TEXT NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque ON produtos(estoque);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_id ON movimentacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON movimentacoes(created_at);

-- =============================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGER PARA ATUALIZAR TIMESTAMP AUTOMATICAMENTE
-- =============================================
CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA CALCULAR ESTOQUE AUTOMATICAMENTE
-- =============================================
CREATE OR REPLACE FUNCTION calcular_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estoque do produto
    UPDATE produtos 
    SET estoque = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN tipo = 'entrada' THEN quantidade 
                WHEN tipo = 'saida' THEN -quantidade 
            END
        ), 0)
        FROM movimentacoes 
        WHERE produto_id = NEW.produto_id
    )
    WHERE id = NEW.produto_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGER PARA CALCULAR ESTOQUE AUTOMATICAMENTE
-- =============================================
CREATE TRIGGER trigger_calcular_estoque
    AFTER INSERT OR UPDATE OR DELETE ON movimentacoes
    FOR EACH ROW
    EXECUTE FUNCTION calcular_estoque();

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela produtos
CREATE POLICY "Usuários podem ver apenas seus próprios produtos" 
    ON produtos FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios produtos" 
    ON produtos FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios produtos" 
    ON produtos FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios produtos" 
    ON produtos FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para tabela movimentacoes
CREATE POLICY "Usuários podem ver apenas suas próprias movimentações" 
    ON movimentacoes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias movimentações" 
    ON movimentacoes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias movimentações" 
    ON movimentacoes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias movimentações" 
    ON movimentacoes FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- FUNÇÃO PARA REGISTRAR MOVIMENTAÇÃO
-- =============================================
CREATE OR REPLACE FUNCTION registrar_movimentacao(
    p_produto_id UUID,
    p_tipo VARCHAR(20),
    p_quantidade DECIMAL(10,2),
    p_valor_unit DECIMAL(10,2),
    p_observacao TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_movimentacao_id UUID;
    v_valor_total DECIMAL(10,2);
BEGIN
    -- Calcular valor total
    v_valor_total := p_quantidade * p_valor_unit;
    
    -- Inserir movimentação
    INSERT INTO movimentacoes (
        produto_id,
        tipo,
        quantidade,
        valor_unit,
        valor_total,
        observacao,
        user_id
    ) VALUES (
        p_produto_id,
        p_tipo,
        p_quantidade,
        p_valor_unit,
        v_valor_total,
        p_observacao,
        auth.uid()
    ) RETURNING id INTO v_movimentacao_id;
    
    RETURN v_movimentacao_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =============================================
-- VIEW PARA RELATÓRIOS
-- =============================================
CREATE OR REPLACE VIEW relatorio_estoque AS
SELECT 
    p.id,
    p.nome,
    p.quantidade,
    p.valor_unit,
    p.valor_total,
    p.entrada,
    p.saida,
    p.estoque,
    CASE 
        WHEN p.estoque <= 0 THEN 'Sem Estoque'
        WHEN p.estoque <= 10 THEN 'Estoque Baixo'
        ELSE 'Estoque Normal'
    END as status_estoque,
    p.created_at,
    p.updated_at
FROM produtos p
WHERE p.user_id = auth.uid()
ORDER BY p.nome;

-- =============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =============================================
-- Descomente as linhas abaixo para inserir dados de exemplo

/*
-- Inserir produtos de exemplo (apenas para usuários autenticados)
INSERT INTO produtos (nome, quantidade, valor_unit, valor_total, entrada, saida, estoque, user_id) VALUES
('Produto A', 100, 10.50, 1050.00, 100, 0, 100, auth.uid()),
('Produto B', 50, 25.00, 1250.00, 50, 0, 50, auth.uid()),
('Produto C', 200, 5.75, 1150.00, 200, 0, 200, auth.uid()),
('Produto D', 75, 15.00, 1125.00, 75, 0, 75, auth.uid()),
('Produto E', 30, 40.00, 1200.00, 30, 0, 30, auth.uid());
*/

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================
/*
INSTRUÇÕES DE USO:

1. Execute este script no SQL Editor do Supabase
2. Configure as variáveis de ambiente no seu projeto:
   - VITE_SUPABASE_URL=sua_url_do_supabase
   - VITE_SUPABASE_ANON_KEY=sua_chave_anonima

3. O sistema inclui:
   - Autenticação completa com RLS
   - Cálculo automático de estoque
   - Histórico de movimentações
   - Relatórios e estatísticas
   - Segurança por usuário

4. Para testar, crie uma conta no sistema e comece a adicionar produtos.

ESTRUTURA DAS TABELAS:
- produtos: Armazena informações dos produtos
- movimentacoes: Histórico de entradas e saídas
- relatorio_estoque: View para relatórios

FUNCIONALIDADES:
- CRUD completo de produtos
- Controle de estoque automático
- Autenticação e autorização
- Relatórios em tempo real
- Interface responsiva e moderna
*/
