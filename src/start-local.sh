#!/bin/bash

# 🚀 Script de inicio rápido para Dr. Baymax
# Este script inicia un servidor HTTP local para ejecutar la aplicación

echo "🏥 Dr. Baymax - Iniciando servidor local..."
echo ""

# Verificar si existe el archivo de configuración
if [ ! -f "utils/supabase/info.tsx" ]; then
    echo "⚠️  ADVERTENCIA: No se encontró el archivo de configuración"
    echo ""
    echo "Por favor, sigue estos pasos:"
    echo "1. Copia 'utils/supabase/info.example.tsx' a 'utils/supabase/info.tsx'"
    echo "2. Edita 'utils/supabase/info.tsx' con tus credenciales de Supabase"
    echo ""
    echo "Comando rápido:"
    echo "  cp utils/supabase/info.example.tsx utils/supabase/info.tsx"
    echo ""
    read -p "¿Deseas continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Buscando servidor HTTP disponible..."
echo ""

# Intentar con Python 3
if command -v python3 &> /dev/null; then
    echo "✅ Usando Python 3"
    echo "📡 Servidor ejecutándose en: http://localhost:8000"
    echo "   Presiona Ctrl+C para detener"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# Intentar con Python 2
if command -v python &> /dev/null; then
    echo "✅ Usando Python"
    echo "📡 Servidor ejecutándose en: http://localhost:8000"
    echo "   Presiona Ctrl+C para detener"
    echo ""
    python -m SimpleHTTPServer 8000
    exit 0
fi

# Intentar con Node.js (http-server)
if command -v npx &> /dev/null; then
    echo "✅ Usando http-server (Node.js)"
    echo "📡 Servidor ejecutándose en: http://localhost:8000"
    echo "   Presiona Ctrl+C para detener"
    echo ""
    npx http-server -p 8000
    exit 0
fi

# Si no hay ningún servidor disponible
echo "❌ No se encontró ningún servidor HTTP disponible"
echo ""
echo "Por favor, instala uno de los siguientes:"
echo "  • Python 3: https://www.python.org/"
echo "  • Node.js: https://nodejs.org/"
echo ""
echo "O abre el archivo index.html directamente en tu navegador"
echo "(puede tener problemas con CORS)"

exit 1
