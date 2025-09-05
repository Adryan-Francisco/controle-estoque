
# 🚀 Guia de Configuração - Sistema de Controle de Estoque

## Passo a Passo Completo

### 1. Configuração do Supabase

#### 1.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Preencha:
   - **Name**: `controle-estoque`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

#### 1.2 Configurar Banco de Dados
1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (deve mostrar "Success")

#### 1.3 Obter Credenciais
1. No painel do Supabase, vá para **Settings** → **API**
2. Copie:
   - **Project URL** (exemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa)

### 2. Configuração do Projeto React

#### 2.1 Instalar Dependências
```bash
npm install
```

#### 2.2 Configurar Variáveis de Ambiente
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione suas credenciais:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

#### 2.3 Executar o Projeto
```bash
npm run dev
```

### 3. Testando o Sistema

#### 3.1 Primeiro Acesso
1. Abra o navegador em `http://localhost:5173`
2. Clique em "Criar Conta"
3. Digite um email e senha
4. Clique em "Criar Conta"
5. Verifique seu email e clique no link de confirmação

#### 3.2 Login
1. Volte ao sistema
2. Faça login com suas credenciais
3. Você deve ver o dashboard vazio

#### 3.3 Adicionar Primeiro Produto
1. Clique em "Novo Produto"
2. Preencha:
   - **Nome**: "Produto Teste"
   - **Quantidade**: 100
   - **Valor Unitário**: 10.50
3. Clique em "Salvar"
4. O produto deve aparecer na tabela

### 4. Estrutura do Banco de Dados

#### Tabelas Criadas:
- **produtos**: Armazena os produtos
- **movimentacoes**: Histórico de entradas/saídas

#### Funcionalidades Automáticas:
- ✅ Cálculo automático de estoque
- ✅ Segurança por usuário (RLS)
- ✅ Timestamps automáticos
- ✅ Triggers para atualizações

### 5. Solução de Problemas

#### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas
- Confirme se copiou a chave completa do Supabase

#### Erro: "relation does not exist"
- Execute novamente o script SQL no Supabase
- Verifique se todas as tabelas foram criadas

#### Erro: "permission denied"
- Verifique se o RLS está configurado corretamente
- Confirme se o usuário está autenticado

#### Produtos não aparecem
- Verifique se está logado
- Confirme se os produtos foram inseridos com o user_id correto

### 6. Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificar linting
npm run lint
```

### 7. Estrutura de Arquivos

```
controle-estoque/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Tela de login/cadastro
│   │   ├── ProtectedRoute.jsx # Proteção de rotas
│   │   ├── Header.jsx         # Cabeçalho do sistema
│   │   ├── Dashboard.jsx      # Dashboard principal
│   │   ├── ProductTable.jsx   # Tabela de produtos
│   │   └── ProductForm.jsx    # Formulário de produtos
│   ├── contexts/
│   │   └── AuthContext.jsx    # Contexto de autenticação
│   ├── lib/
│   │   └── supabase.js        # Configuração do Supabase
│   ├── App.jsx                # Componente principal
│   └── main.jsx               # Ponto de entrada
├── supabase-schema.sql        # Script do banco de dados
├── README.md                  # Documentação principal
└── SETUP.md                   # Este guia
```

### 8. Próximos Passos

Após a configuração inicial:

1. **Personalize** os produtos conforme sua necessidade
2. **Configure** notificações de estoque baixo
3. **Adicione** mais campos se necessário
4. **Faça backup** regular dos dados
5. **Monitore** o uso e performance

### 9. Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Confirme se o Supabase está funcionando
3. Teste com dados simples primeiro
4. Consulte a documentação do Supabase

---

🎉 **Parabéns!** Seu sistema de controle de estoque está funcionando!
