# 🍰 Sistema de Controle de Estoque para Bolos

Um sistema completo de gestão de estoque e vendas desenvolvido com React, Vite e Supabase, especificamente otimizado para confeitarias e padarias.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login seguro com Supabase Auth
- Proteção de rotas
- Gerenciamento de sessão

### 📊 Dashboard
- Visão geral das vendas
- Estatísticas em tempo real
- Cards informativos interativos

### 🍰 Gestão de Produtos
- Cadastro de bolos e produtos
- Controle de estoque
- Categorização de produtos
- Preços fixos e por quilo

### 💰 Controle de Vendas
- Registro de vendas
- Cálculo automático de totais
- Gestão de clientes
- Histórico de vendas

### 📈 Relatórios Avançados
- Análises de vendas por período
- Gráficos interativos
- Exportação para PDF e Excel
- Métricas de performance

### 🔔 Sistema de Notificações
- Alertas de estoque baixo
- Notificações de movimentações
- Avisos de vendas
- Interface responsiva

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite
- **Backend**: Supabase
- **Estilização**: CSS Modules + Tailwind
- **Ícones**: Lucide React
- **Deploy**: GitHub Pages

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Git

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/controle-estoque-vendas.git
cd controle-estoque-vendas
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🗄️ Configuração do Banco de Dados

Execute os scripts SQL no Supabase:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute o script `setup-complete-database-fixed.sql`

### Tabelas Criadas:
- `bolos` - Produtos/bolos
- `vendas` - Registro de vendas
- `venda_itens` - Itens das vendas
- `movimentacoes` - Controle de estoque

## 🌐 Deploy

### GitHub Pages (Automático)

1. **Configure o repositório remoto**
```bash
git remote add origin https://github.com/SEU_USUARIO/controle-estoque-vendas.git
```

2. **Configure as variáveis de ambiente no GitHub**
   - Vá em Settings > Secrets and variables > Actions
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

3. **Ative o GitHub Pages**
   - Vá em Settings > Pages
   - Selecione "GitHub Actions" como source

4. **Faça push**
```bash
git push origin main
```

O deploy será automático! 🚀

## 📱 Interface

### Desktop
- Dashboard completo com métricas
- Tabelas responsivas
- Gráficos interativos
- Navegação intuitiva

### Mobile
- Interface adaptativa
- Menu hambúrguer
- Cards otimizados
- Touch-friendly

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.jsx
│   ├── Header.jsx
│   ├── ProductsPage.jsx
│   ├── SalesControl.jsx
│   └── SalesReports.jsx
├── contexts/            # Contextos React
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
├── lib/                 # Configurações
│   └── supabase.js
└── main.jsx            # Ponto de entrada
```

## 🎯 Funcionalidades Principais

### Sistema de Notificações
- ✅ Alertas de estoque em tempo real
- ✅ Notificações de vendas
- ✅ Avisos de movimentações
- ✅ Interface de notificações interativa

### Relatórios Avançados
- ✅ Gráficos de vendas por período
- ✅ Análise de produtos mais vendidos
- ✅ Métricas de performance
- ✅ Exportação para PDF/Excel

### Gestão de Estoque
- ✅ Controle de entrada e saída
- ✅ Alertas de estoque baixo
- ✅ Histórico de movimentações
- ✅ Cálculos automáticos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se encontrar algum problema:

1. Verifique se todas as dependências estão instaladas
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique se o Supabase está funcionando
4. Abra uma issue no GitHub

## 🌟 Destaques

- **100% Responsivo** - Funciona em qualquer dispositivo
- **Tempo Real** - Dados atualizados automaticamente
- **Seguro** - Autenticação e autorização robustas
- **Escalável** - Arquitetura preparada para crescimento
- **Moderno** - Tecnologias mais recentes do mercado

---

**Desenvolvido com ❤️ para confeitarias e padarias**