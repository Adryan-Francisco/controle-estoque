-- =============================================
-- TABELA DE VENDAS
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
-- TABELA DE ITENS DE VENDA
-- =============================================
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade DECIMAL(10,2) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA DE PARCELAS (PARA VENDAS À PRAZO)
-- =============================================
CREATE TABLE IF NOT EXISTS venda_parcelas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status_pagamento VARCHAR(20) NOT NULL CHECK (status_pagamento IN ('pendente', 'pago', 'atrasado')),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_metodo_pagamento ON vendas(metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_vendas_status_pagamento ON vendas(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON vendas(created_at);
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda_id ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_produto_id ON venda_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_venda_parcelas_venda_id ON venda_parcelas(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_parcelas_data_vencimento ON venda_parcelas(data_vencimento);

-- =============================================
-- TRIGGER PARA ATUALIZAR TIMESTAMP
-- =============================================
CREATE TRIGGER trigger_update_vendas_updated_at
    BEFORE UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_venda_parcelas_updated_at
    BEFORE UPDATE ON venda_parcelas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA ATUALIZAR ESTOQUE APÓS VENDA
-- =============================================
CREATE OR REPLACE FUNCTION atualizar_estoque_venda()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estoque do produto
    UPDATE produtos 
    SET 
        quantidade = quantidade - NEW.quantidade,
        estoque = estoque - NEW.quantidade,
        saida = saida + NEW.quantidade,
        valor_total = (quantidade - NEW.quantidade) * valor_unit,
        updated_at = NOW()
    WHERE id = NEW.produto_id;
    
    -- Registrar movimentação de saída
    INSERT INTO movimentacoes (
        produto_id,
        usuario_id,
        tipo,
        quantidade,
        motivo
    ) VALUES (
        NEW.produto_id,
        (SELECT user_id FROM vendas WHERE id = NEW.venda_id),
        'saida',
        NEW.quantidade,
        'Venda - ' || (SELECT cliente_nome FROM vendas WHERE id = NEW.venda_id)
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGER PARA ATUALIZAR ESTOQUE
-- =============================================
CREATE TRIGGER trigger_atualizar_estoque_venda
    AFTER INSERT ON venda_itens
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_estoque_venda();

-- =============================================
-- FUNÇÃO PARA GERAR PARCELAS
-- =============================================
CREATE OR REPLACE FUNCTION gerar_parcelas_venda()
RETURNS TRIGGER AS $$
DECLARE
    parcela_atual INTEGER := 1;
    valor_parcela DECIMAL(10,2);
    data_vencimento DATE;
    total_parcelas INTEGER;
BEGIN
    -- Só gerar parcelas para vendas à prazo
    IF NEW.metodo_pagamento = 'prazo' AND NEW.data_vencimento IS NOT NULL THEN
        -- Calcular número de parcelas (assumindo parcelas mensais)
        total_parcelas := EXTRACT(DAY FROM (NEW.data_vencimento - NEW.created_at::DATE)) / 30;
        IF total_parcelas < 1 THEN
            total_parcelas := 1;
        END IF;
        
        valor_parcela := NEW.valor_final / total_parcelas;
        data_vencimento := NEW.created_at::DATE + INTERVAL '1 month';
        
        -- Gerar parcelas
        WHILE parcela_atual <= total_parcelas LOOP
            INSERT INTO venda_parcelas (
                venda_id,
                numero_parcela,
                valor_parcela,
                data_vencimento,
                status_pagamento
            ) VALUES (
                NEW.id,
                parcela_atual,
                valor_parcela,
                data_vencimento,
                'pendente'
            );
            
            parcela_atual := parcela_atual + 1;
            data_vencimento := data_vencimento + INTERVAL '1 month';
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGER PARA GERAR PARCELAS
-- =============================================
CREATE TRIGGER trigger_gerar_parcelas_venda
    AFTER INSERT ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION gerar_parcelas_venda();

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas para vendas
CREATE POLICY "Usuários podem ver apenas suas próprias vendas" 
    ON vendas FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias vendas" 
    ON vendas FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias vendas" 
    ON vendas FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias vendas" 
    ON vendas FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para itens de venda
CREATE POLICY "Usuários podem ver itens de suas vendas" 
    ON venda_itens FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = venda_itens.venda_id 
        AND vendas.user_id = auth.uid()
    ));

CREATE POLICY "Usuários podem inserir itens em suas vendas" 
    ON venda_itens FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = venda_itens.venda_id 
        AND vendas.user_id = auth.uid()
    ));

-- Políticas para parcelas
CREATE POLICY "Usuários podem ver parcelas de suas vendas" 
    ON venda_parcelas FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = venda_parcelas.venda_id 
        AND vendas.user_id = auth.uid()
    ));

CREATE POLICY "Usuários podem atualizar parcelas de suas vendas" 
    ON venda_parcelas FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = venda_parcelas.venda_id 
        AND vendas.user_id = auth.uid()
    ));

-- =============================================
-- VIEW PARA RELATÓRIOS DE VENDAS
-- =============================================
CREATE OR REPLACE VIEW relatorio_vendas AS
SELECT 
    v.id,
    v.cliente_nome,
    v.cliente_email,
    v.cliente_telefone,
    v.metodo_pagamento,
    v.status_pagamento,
    v.data_vencimento,
    v.valor_total,
    v.desconto,
    v.valor_final,
    v.observacoes,
    v.created_at,
    v.updated_at,
    COUNT(vi.id) as total_itens,
    STRING_AGG(p.nome, ', ') as produtos,
    CASE 
        WHEN v.metodo_pagamento = 'vista' THEN 'À Vista'
        WHEN v.metodo_pagamento = 'prazo' THEN 'À Prazo'
    END as metodo_pagamento_texto,
    CASE 
        WHEN v.status_pagamento = 'pendente' THEN 'Pendente'
        WHEN v.status_pagamento = 'pago' THEN 'Pago'
        WHEN v.status_pagamento = 'atrasado' THEN 'Atrasado'
        WHEN v.status_pagamento = 'cancelado' THEN 'Cancelado'
    END as status_pagamento_texto
FROM vendas v
LEFT JOIN venda_itens vi ON v.id = vi.venda_id
LEFT JOIN produtos p ON vi.produto_id = p.id
WHERE v.user_id = auth.uid()
GROUP BY v.id, v.cliente_nome, v.cliente_email, v.cliente_telefone, 
         v.metodo_pagamento, v.status_pagamento, v.data_vencimento, 
         v.valor_total, v.desconto, v.valor_final, v.observacoes, 
         v.created_at, v.updated_at
ORDER BY v.created_at DESC;
