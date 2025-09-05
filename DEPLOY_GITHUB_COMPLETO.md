# 🚀 Deploy Completo para GitHub e GitHub Pages

## 📋 Pré-requisitos
- Conta no GitHub
- Git configurado no seu computador
- Projeto já commitado localmente ✅

## 🔧 Passo 1: Criar Repositório no GitHub

1. **Acesse [github.com](https://github.com)** e faça login
2. **Clique em "New repository"** (botão verde no canto superior direito)
3. **Configure o repositório:**
   - **Repository name**: `controle-estoque-vendas`
   - **Description**: `Sistema de Controle de Estoque para Bolos - React + Vite + Supabase`
   - **Visibility**: ✅ **Public** (necessário para GitHub Pages gratuito)
   - ❌ **NÃO** marque "Add a README file"
   - ❌ **NÃO** marque "Add .gitignore" 
   - ❌ **NÃO** marque "Choose a license"
4. **Clique em "Create repository"**

## 🔗 Passo 2: Conectar Repositório Local

**Substitua `SEU_USUARIO` pelo seu username do GitHub nos comandos abaixo:**

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/controle-estoque-vendas.git

# Fazer push do código
git push -u origin main
```

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

1. **No repositório GitHub**, vá em **Settings**
2. **Role para baixo** até **Secrets and variables** > **Actions**
3. **Clique em "New repository secret"** e adicione:

### 🔑 Variáveis Obrigatórias:
- **Name**: `VITE_SUPABASE_URL`
  - **Value**: Sua URL do Supabase (ex: `https://xxxxx.supabase.co`)
  
- **Name**: `VITE_SUPABASE_ANON_KEY`
  - **Value**: Sua chave anônima do Supabase

### 📍 Como encontrar essas variáveis:
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em **Settings** > **API**
3. Copie a **URL** e a **anon public** key

## 🌐 Passo 4: Ativar GitHub Pages

1. **No repositório GitHub**, vá em **Settings**
2. **Role para baixo** até **Pages**
3. **Em "Source"**, selecione **GitHub Actions**
4. **Salve as configurações**

## 🚀 Passo 5: Deploy Automático

O GitHub Actions já está configurado! Após fazer o push:

1. **Vá na aba "Actions"** do repositório
2. **Aguarde o workflow "Deploy to GitHub Pages"** ser executado
3. **Verifique se foi bem-sucedido** (ícone verde ✅)

## 🌍 Acesso ao Site

Após o deploy bem-sucedido, seu site estará em:
**`https://SEU_USUARIO.github.io/controle-estoque-vendas/`**

## 🔧 Comandos Rápidos

Execute estes comandos no terminal do seu projeto:

```bash
# 1. Adicionar repositório remoto (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/controle-estoque-vendas.git

# 2. Fazer push
git push -u origin main

# 3. Para futuras atualizações
git add .
git commit -m "Sua mensagem de commit"
git push
```

## 📱 Funcionalidades do Site

✅ **Sistema de Login** com Supabase
✅ **Dashboard** com estatísticas
✅ **Gestão de Produtos** (bolos)
✅ **Controle de Vendas** completo
✅ **Relatórios Avançados** com gráficos
✅ **Sistema de Notificações** funcional
✅ **Interface Responsiva** para mobile
✅ **Tema Escuro/Claro**

## 🛠️ Troubleshooting

### ❌ Deploy falhou?
1. Verifique os logs na aba **Actions**
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique se o Supabase está funcionando

### ❌ Site não carrega?
1. Aguarde alguns minutos após o deploy
2. Verifique se a URL está correta
3. Teste em modo incógnito

### ❌ Erro de autenticação?
1. Verifique se as chaves do Supabase estão corretas
2. Confirme se o RLS está configurado no Supabase

## 🎉 Próximos Passos

1. **Teste todas as funcionalidades** no ambiente de produção
2. **Configure domínio personalizado** (opcional)
3. **Monitore o uso** através do Supabase Dashboard
4. **Faça backup regular** dos dados importantes

---

**🚀 Seu sistema estará online e funcionando perfeitamente!**
