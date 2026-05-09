@echo off
title Iniciando Gerador de Curriculo PRO
echo ======================================================
echo    BEM-VINDO AO RESUME PRO - GERADOR DE CURRICULO
echo ======================================================
echo.
echo 1. Instalando bibliotecas necessarias...
echo (Isso pode levar um minuto na primeira vez)
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias. 
    echo Certifique-se de que o Node.js esta instalado em seu computador.
    echo Visite: https://nodejs.org/
    pause
    exit /b
)

echo.
echo 2. Iniciando servidor de desenvolvimento...
echo A aplicacao sera aberta em: http://localhost:5173
echo.

:: Abre o navegador padrao apos um pequeno delay
timeout /t 3 /nobreak > nul
start http://localhost:5173

:: Inicia o Vite
call npm run dev

pause
