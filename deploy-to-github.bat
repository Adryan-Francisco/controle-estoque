@echo off
echo ========================================
echo   DEPLOY PARA GITHUB E GITHUB PAGES
echo ========================================
echo.

echo 1. Verificando status do Git...
git status
echo.

echo 2. Adicionando arquivos...
git add .
echo.

echo 3. Fazendo commit...
git commit -m "Deploy: Configuração para GitHub Pages"
echo.

echo 4. Configurando branch main...
git branch -M main
echo.

echo 5. Adicionando repositório remoto...
echo IMPORTANTE: Substitua SEU_USUARIO pelo seu username do GitHub
set /p USERNAME="Digite seu username do GitHub: "
git remote add origin https://github.com/%USERNAME%/controle-estoque.git
echo.

echo 6. Fazendo push para GitHub...
git push -u origin main
echo.

echo ========================================
echo   DEPLOY CONCLUÍDO!
echo ========================================
echo.
echo Próximos passos:
echo 1. Acesse: https://github.com/%USERNAME%/controle-estoque
echo 2. Vá em Settings > Pages
echo 3. Selecione "GitHub Actions" como source
echo 4. Configure as variáveis de ambiente em Settings > Secrets
echo 5. Aguarde o deploy automático
echo.
echo Seu site estará em: https://%USERNAME%.github.io/controle-estoque/
echo.
pause
