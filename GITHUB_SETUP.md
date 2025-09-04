# 🚀 Configuração do GitHub e GitHub Pages

## Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em "New repository" (botão verde)
3. Configure o repositório:
   - **Repository name**: `controle-estoque`
   - **Description**: `Sistema de Controle de Estoque para Bolos - React + Vite + Supabase`
   - **Visibility**: Public (para GitHub Pages gratuito)
   - **NÃO** marque "Add a README file" (já temos um)
   - **NÃO** marque "Add .gitignore" (já temos um)
   - **NÃO** marque "Choose a license" (opcional)

4. Clique em "Create repository"

## Passo 2: Conectar Repositório Local

Após criar o repositório, execute os comandos abaixo no terminal:

```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/controle-estoque.git

# Fazer push do código
git branch -M main
git push -u origin main
```

## Passo 3: Configurar GitHub Pages

1. No repositório GitHub, vá em **Settings**
2. Role para baixo até **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. O GitHub Actions já está configurado no arquivo `.github/workflows/deploy.yml`

## Passo 4: Configurar Variáveis de Ambiente

1. No repositório GitHub, vá em **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`: Sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: Sua chave anônima do Supabase

## Passo 5: Ativar GitHub Actions

1. Vá na aba **Actions** do repositório
2. O workflow será executado automaticamente após o push
3. Aguarde a conclusão do build e deploy

## 🌐 Acesso ao Site

Após o deploy, seu site estará disponível em:
`https://SEU_USUARIO.github.io/controle-estoque/`

## 📝 Próximos Passos

1. Configure o Supabase com as tabelas necessárias
2. Teste todas as funcionalidades no ambiente de produção
3. Configure domínio personalizado (opcional)

## 🔧 Troubleshooting

- Se o deploy falhar, verifique os logs na aba Actions
- Certifique-se de que as variáveis de ambiente estão configuradas
- Verifique se o Supabase está configurado corretamente
