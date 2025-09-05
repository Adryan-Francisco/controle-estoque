# 🔧 Configurar Variáveis de Ambiente no GitHub

## ⚠️ PROBLEMA ATUAL
O site está dando erro 404 porque as variáveis de ambiente do Supabase não estão configuradas no GitHub.

## 🛠️ SOLUÇÃO

### 1. Acesse seu repositório no GitHub:
https://github.com/Adryan-Francisco/controle-estoque-vendas

### 2. Configure as variáveis de ambiente:
1. Vá em **Settings** (aba superior)
2. Role para baixo até **Secrets and variables** > **Actions**
3. Clique em **"New repository secret"**
4. Adicione as seguintes variáveis:

#### Variável 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Sua URL do Supabase (ex: `https://xxxxx.supabase.co`)

#### Variável 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Sua chave anônima do Supabase

### 3. Como encontrar essas credenciais:
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** > **API**
4. Copie a **URL** e a **anon public** key

### 4. Ativar GitHub Pages:
1. No repositório, vá em **Settings** > **Pages**
2. Em **Source**, selecione **"GitHub Actions"**
3. Salve as configurações

### 5. Executar o deploy:
1. Vá na aba **"Actions"** do repositório
2. Clique em **"Deploy to GitHub Pages"**
3. Clique em **"Run workflow"**
4. Aguarde a conclusão (ícone verde ✅)

## 🌐 Após configurar:
Seu site estará em: **https://adryan-francisco.github.io/controle-estoque-vendas/**

## ❌ Se ainda não funcionar:
1. Verifique se as variáveis estão corretas
2. Confirme se o Supabase está funcionando
3. Verifique os logs na aba Actions
