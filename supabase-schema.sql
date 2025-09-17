-- Script SQL para criar as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  categoria VARCHAR(100) DEFAULT 'Geral',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id BIGSERIAL PRIMARY KEY,
  produto_id BIGINT REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  cliente_nome VARCHAR(255),
  cliente_telefone VARCHAR(20),
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações (histórico de estoque)
CREATE TABLE IF NOT EXISTS movimentacoes (
  id BIGSERIAL PRIMARY KEY,
  produto_id BIGINT REFERENCES produtos(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  quantidade INTEGER NOT NULL,
  motivo VARCHAR(255),
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de bolos
CREATE TABLE IF NOT EXISTS bolos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  categoria VARCHAR(100) DEFAULT 'Bolo',
  sabor VARCHAR(100),
  tamanho VARCHAR(50),
  cobertura VARCHAR(100),
  recheio VARCHAR(100),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_id ON movimentacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_bolos_user_id ON bolos(user_id);

-- Políticas de RLS (Row Level Security)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;

-- Política para produtos
CREATE POLICY "Users can view own produtos" ON produtos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own produtos" ON produtos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own produtos" ON produtos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own produtos" ON produtos
  FOR DELETE USING (auth.uid() = user_id);

-- Política para vendas
CREATE POLICY "Users can view own vendas" ON vendas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendas" ON vendas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendas" ON vendas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendas" ON vendas
  FOR DELETE USING (auth.uid() = user_id);

-- Política para movimentações
CREATE POLICY "Users can view own movimentacoes" ON movimentacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movimentacoes" ON movimentacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movimentacoes" ON movimentacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movimentacoes" ON movimentacoes
  FOR DELETE USING (auth.uid() = user_id);

-- Política para bolos
CREATE POLICY "Users can view own bolos" ON bolos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bolos" ON bolos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bolos" ON bolos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bolos" ON bolos
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bolos_updated_at BEFORE UPDATE ON bolos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

