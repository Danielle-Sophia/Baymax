@echo off
REM 🚀 Script de inicio rápido para Dr. Baymax (Windows)
REM Este script inicia un servidor HTTP local para ejecutar la aplicación

echo 🏥 Dr. Baymax - Iniciando servidor local...
echo.

REM Verificar si existe el archivo de configuración
if not exist "utils\supabase\info.tsx" (
    echo ⚠️  ADVERTENCIA: No se encontró el archivo de configuración
    echo.
    echo Por favor, sigue estos pasos:
    echo 1. Copia 'utils\supabase\info.example.tsx' a 'utils\supabase\info.tsx'
    echo 2. Edita 'utils\supabase\info.tsx' con tus credenciales de Supabase
    echo.
    echo Comando rápido:
    echo   copy utils\supabase\info.example.tsx utils\supabase\info.tsx
    echo.
    set /p continuar="¿Deseas continuar de todos modos? (s/n): "
    if /i not "%continuar%"=="s" exit /b 1
)

echo Buscando servidor HTTP disponible...
echo.

REM Intentar con Python 3
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Usando Python
    echo 📡 Servidor ejecutándose en: http://localhost:8000
    echo    Presiona Ctrl+C para detener
    echo.
    python -m http.server 8000
    exit /b 0
)

REM Intentar con Node.js (http-server)
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Usando http-server (Node.js)
    echo 📡 Servidor ejecutándose en: http://localhost:8000
    echo    Presiona Ctrl+C para detener
    echo.
    npx http-server -p 8000
    exit /b 0
)

REM Si no hay ningún servidor disponible
echo ❌ No se encontró ningún servidor HTTP disponible
echo.
echo Por favor, instala uno de los siguientes:
echo   • Python 3: https://www.python.org/
echo   • Node.js: https://nodejs.org/
echo.
echo O abre el archivo index.html directamente en tu navegador
echo (puede tener problemas con CORS)

pause
exit /b 1
