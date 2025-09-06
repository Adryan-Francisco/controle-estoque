# 🔧 Configuração de Variáveis de Ambiente

## ⚠️ PROBLEMA IDENTIFICADO
O sistema está cadastrando apenas localmente porque as variáveis de ambiente do Supabase não estão configuradas para produção.

## 🛠️ SOLUÇÃO

### 1. Configurar Variáveis no GitHub

1. **Acesse seu repositório no GitHub:**
   https://github.com/Adryan-Francisco/controle-estoque-vendas

2. **Vá em Settings > Secrets and variables > Actions**

3. **Adicione as seguintes variáveis:**

#### Variável 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://mfwnbkothjrjtjnvsrbg.supabase.co`

#### Variável 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1md25ia290aGpyanRqbnZzcmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDIwNzIsImV4cCI6MjA3MTkxODA3Mn0.7dy0FD5xhNvCff4YGCRFMC2TpTcyyuYh4X9evqX63TE`

### 2. Ativar GitHub Pages

1. **No repositório, vá em Settings > Pages**
2. **Em Source, selecione "GitHub Actions"**
3. **Salve as configurações**

### 3. Fazer Deploy

1. **Faça commit das alterações:**
   ```bash
   git add .
   git commit -m "Fix: Configurar variáveis de ambiente para produção"
   git push
   ```

2. **Vá na aba "Actions" do repositório**
3. **Aguarde o workflow "Deploy to GitHub Pages" ser executado**
4. **Verifique se foi bem-sucedido (ícone verde ✅)**

## 🌐 Após configurar:
Seu site estará em: **https://adryan-francisco.github.io/controle-estoque-vendas/**

## ✅ O que foi corrigido:

1. **Arquivo `supabase.js`**: Agora usa variáveis de ambiente
2. **GitHub Actions**: Criado workflow para deploy automático
3. **Configuração do Vite**: Corrigida base URL para o repositório correto
4. **Package.json**: Atualizada homepage para o repositório correto

## 🔍 Verificação:

Após o deploy, o sistema deve:
- ✅ Cadastrar produtos no Supabase (não apenas localmente)
- ✅ Cadastrar vendas no Supabase
- ✅ Cadastrar bolos no Supabase
- ✅ Sincronizar dados entre dispositivos
