# Sistema de Controle de Estoque

Um sistema moderno e responsivo para controle de estoque desenvolvido com React e Supabase.

## 🚀 Funcionalidades

- **Autenticação de Usuários**: Login seguro com Supabase Auth
- **Gestão de Produtos**: Cadastro, edição e exclusão de produtos
- **Controle de Estoque**: Entrada e saída de produtos com histórico
- **Relatórios**: Dashboard com estatísticas e relatórios de movimentação
- **Isolamento de Dados**: Cada usuário vê apenas seus próprios dados
- **Interface Moderna**: Design responsivo com Tailwind CSS

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
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
   - Configure as tabelas necessárias
   - Adicione as credenciais no arquivo `.env.local`

5. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Necessárias:

- **bolos**: Produtos do estoque
- **movimentacoes**: Histórico de entradas e saídas
- **vendas**: Registro de vendas

## 🚀 Deploy

O projeto está configurado para deploy automático no GitHub Pages:

1. Faça push para a branch `main`
2. O GitHub Actions fará o build e deploy automaticamente
3. Acesse: `https://seu-usuario.github.io/controle-estoque`

## 📱 Screenshots

![Dashboard](screenshots/dashboard.png)
![Produtos](screenshots/produtos.png)
![Movimentações](screenshots/movimentacoes.png)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para controle de estoque eficiente.