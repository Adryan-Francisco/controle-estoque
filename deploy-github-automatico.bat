@echo off
echo ========================================
echo   DEPLOY AUTOMATICO PARA GITHUB PAGES
echo ========================================
echo.

echo 1. Verificando status do Git...
git status
echo.

echo 2. Adicionando arquivos...
git add .
echo.

echo 3. Fazendo commit...
git commit -m "Deploy: Sistema completo com notificações funcionais"
echo.

echo 4. Verificando se existe repositório remoto...
git remote -v
echo.

if %errorlevel% neq 0 (
    echo ERRO: Nenhum repositório remoto configurado!
    echo.
    echo Para configurar, execute:
    echo git remote add origin https://github.com/Adryan-Francisco/controle-estoque-vendas.git
    echo.
    echo Substitua SEU_USUARIO pelo seu username do GitHub
    echo.
    pause
    exit /b 1
)

echo 5. Fazendo push para GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo   DEPLOY CONCLUIDO COM SUCESSO!
    echo ========================================
    echo.
    echo Próximos passos:
    echo 1. Acesse seu repositório no GitHub
    echo 2. Vá em Settings ^> Pages
    echo 3. Selecione "GitHub Actions" como source
    echo 4. Configure as variáveis de ambiente em Settings ^> Secrets
    echo 5. Aguarde o deploy automático
    echo.
    echo Seu site estará em: https://SEU_USUARIO.github.io/controle-estoque-vendas/
    echo.
) else (
    echo ========================================
    echo   ERRO NO DEPLOY!
    echo ========================================
    echo.
    echo Verifique se:
    echo 1. O repositório remoto está configurado
    echo 2. Você tem permissão para fazer push
    echo 3. A conexão com o GitHub está funcionando
    echo.
)

pause
