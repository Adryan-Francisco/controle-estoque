-- Script para verificar e criar a tabela de bolos se não existir
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela existe
DO $$
BEGIN
    -- Verificar se a tabela bolos existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bolos') THEN
        -- Criar tabela de bolos
        CREATE TABLE bolos (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT NOT NULL,
            preco DECIMAL(10,2),
            preco_por_kg DECIMAL(10,2),
            categoria VARCHAR(50) NOT NULL DEFAULT 'Tradicionais',
            disponivel BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT check_preco CHECK (preco IS NOT NULL OR preco_por_kg IS NOT NULL)
        );

        -- Criar índices para melhor performance
        CREATE INDEX idx_bolos_nome ON bolos(nome);
        CREATE INDEX idx_bolos_categoria ON bolos(categoria);
        CREATE INDEX idx_bolos_disponivel ON bolos(disponivel);

        -- Habilitar RLS (Row Level Security)
        ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;

        -- Política RLS para permitir que usuários autenticados vejam todos os bolos
        CREATE POLICY "Usuários autenticados podem ver bolos" ON bolos
            FOR SELECT USING (auth.role() = 'authenticated');

        -- Política RLS para permitir que usuários autenticados insiram bolos
        CREATE POLICY "Usuários autenticados podem inserir bolos" ON bolos
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        -- Política RLS para permitir que usuários autenticados atualizem bolos
        CREATE POLICY "Usuários autenticados podem atualizar bolos" ON bolos
            FOR UPDATE USING (auth.role() = 'authenticated');

        -- Política RLS para permitir que usuários autenticados excluam bolos
        CREATE POLICY "Usuários autenticados podem excluir bolos" ON bolos
            FOR DELETE USING (auth.role() = 'authenticated');

        -- Função para atualizar updated_at automaticamente
        CREATE OR REPLACE FUNCTION update_bolos_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger para atualizar updated_at automaticamente
        CREATE TRIGGER update_bolos_updated_at
            BEFORE UPDATE ON bolos
            FOR EACH ROW
            EXECUTE FUNCTION update_bolos_updated_at();

        -- Inserir alguns bolos de exemplo
        INSERT INTO bolos (nome, descricao, preco, preco_por_kg, categoria, disponivel) VALUES
        ('Bolo de Chocolate', 'Bolo de chocolate com cobertura de ganache', 45.00, 25.00, 'Tradicionais', true),
        ('Bolo de Morango', 'Bolo de morango com creme e frutas frescas', 50.00, 28.00, 'Tradicionais', true),
        ('Bolo de Cenoura', 'Bolo de cenoura com cobertura de chocolate', 40.00, 22.00, 'Tradicionais', true),
        ('Red Velvet', 'Bolo red velvet com cream cheese', 65.00, 35.00, 'Especiais', true),
        ('Tres Leches', 'Bolo tres leches com chantilly', 55.00, 30.00, 'Especiais', true),
        ('Bolo de Nutella', 'Bolo de chocolate com recheio de nutella', 60.00, 32.00, 'Especiais', true),
        ('Bolo de Coco', 'Bolo de coco com leite condensado', 42.00, 24.00, 'Tradicionais', true),
        ('Bolo de Limão', 'Bolo de limão com glacê de limão', 38.00, 20.00, 'Tradicionais', true);

        RAISE NOTICE 'Tabela bolos criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela bolos já existe.';
    END IF;
END $$;
