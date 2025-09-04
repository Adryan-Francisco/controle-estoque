# 🍰 Sistema de Controle de Estoque - Bolos

Sistema completo de controle de estoque e vendas para confeitarias, desenvolvido com React + Vite e Supabase.

## 🚀 Funcionalidades

- **Autenticação**: Login seguro com Supabase
- **Gestão de Produtos**: Cadastro e controle de bolos
- **Controle de Estoque**: Entrada e saída de produtos
- **Sistema de Vendas**: Vendas à vista e à prazo
- **Relatórios**: Relatórios de vendas e produtos mais vendidos
- **Interface Moderna**: Design responsivo e intuitivo

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Estilização**: CSS Custom Properties + Inline Styles
- **Ícones**: Lucide React
- **Deploy**: GitHub Pages

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/controle-estoque.git
cd controle-estoque
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure o Supabase:
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute os scripts SQL fornecidos
   - Configure as variáveis de ambiente

5. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Configuração do Banco de Dados

Execute os seguintes scripts SQL no Supabase:

1. `supabase-schema.sql` - Schema principal
2. `create-bolos-table.sql` - Tabela de bolos
3. `create-venda-itens-table.sql` - Tabela de itens de venda
4. `setup-complete-database.sql` - Setup completo

## 🚀 Deploy

O projeto está configurado para deploy automático no GitHub Pages:

1. Faça push para a branch `main`
2. O GitHub Actions fará o build e deploy automaticamente
3. Acesse: `https://seu-usuario.github.io/controle-estoque`

## 📱 Screenshots

- Dashboard com visão geral
- Gestão de produtos e estoque
- Sistema de vendas completo
- Relatórios e análises

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ para confeitarias e padarias.