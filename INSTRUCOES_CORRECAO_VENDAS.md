# 🔧 Instruções para Corrigir o Erro de Vendas

## ❌ Problema Identificado
O erro 404 indica que a tabela `venda_itens` não existe no banco de dados do Supabase.

## ✅ Solução

### 1. Acesse o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto

### 2. Execute o Script SQL Corrigido
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Copie e cole o conteúdo do arquivo `setup-complete-database-fixed.sql`
4. Clique em **"Run"** para executar o script

**⚠️ IMPORTANTE:** Use o arquivo `setup-complete-database-fixed.sql` (não o original)!

### 3. Verificar se as Tabelas Foram Criadas
1. No menu lateral, clique em **"Table Editor"**
2. Verifique se as seguintes tabelas existem:
   - ✅ `bolos`
   - ✅ `vendas`
   - ✅ `venda_itens`

### 4. Testar o Sistema
1. Volte para a aplicação
2. Tente criar uma nova venda
3. O erro 404 deve ter sido resolvido

## 📋 O que o Script Faz

O script `setup-complete-database.sql` cria:

1. **Tabela `bolos`** - Para o cardápio de bolos
2. **Tabela `vendas`** - Para registrar as vendas
3. **Tabela `venda_itens`** - Para os itens de cada venda
4. **Índices** - Para melhor performance
5. **Políticas RLS** - Para segurança dos dados
6. **Triggers** - Para atualização automática de timestamps
7. **Dados de exemplo** - Bolos para testar

## 🚨 Importante
- Execute o script completo de uma vez
- Não execute apenas partes do script
- Certifique-se de que todas as tabelas foram criadas antes de testar

## 🔍 Se Ainda Houver Erro
1. Verifique se todas as tabelas foram criadas
2. Verifique se as políticas RLS estão ativas
3. Verifique se o usuário está autenticado
4. Verifique o console do navegador para outros erros
