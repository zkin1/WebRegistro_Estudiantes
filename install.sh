#!/bin/bash

echo "========================================"
echo "Sistema de Registro de Estudiantes de Odontología"
echo "========================================"
echo ""
echo "Este script configurará automáticamente el proyecto"
echo ""

# Verificar si Node.js está instalado
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor, instala Node.js desde https://nodejs.org/"
    echo ""
    read -p "Presiona Enter para continuar..."
    exit 1
fi

echo "Node.js encontrado: $(node --version)"
echo ""

# Verificar si npm está disponible
echo "Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está disponible"
    echo ""
    read -p "Presiona Enter para continuar..."
    exit 1
fi

echo "npm encontrado: $(npm --version)"
echo ""

# Navegar al directorio del proyecto
cd "$(dirname "$0")"

# Instalar dependencias del backend
echo ""
echo "Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al instalar dependencias del backend"
    echo ""
    read -p "Presiona Enter para continuar..."
    exit 1
fi

echo "Dependencias del backend instaladas correctamente"
echo ""

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "Creando archivo .env..."
    cp "env.example" ".env"
    echo ""
    echo "IMPORTANTE: Edita el archivo .env con tus credenciales de base de datos"
    echo ""
    
    # Detectar editor disponible
    if command -v code &> /dev/null; then
        echo "Abriendo con VS Code..."
        code ".env"
    elif command -v nano &> /dev/null; then
        echo "Abriendo con nano..."
        nano ".env"
    elif command -v vim &> /dev/null; then
        echo "Abriendo con vim..."
        vim ".env"
    else
        echo "Por favor, edita manualmente el archivo backend/.env"
    fi
fi

# Volver al directorio raíz
cd ..

echo ""
echo "========================================"
echo "¡Instalación completada exitosamente!"
echo "========================================"
echo ""
echo "Para iniciar el proyecto:"
echo ""
echo "1. Configura las credenciales de base de datos en backend/.env"
echo "2. Inicia el backend: cd backend && npm run dev"
echo "3. Abre frontend/index.html en tu navegador"
echo ""
echo "El servidor estará disponible en: http://localhost:5000"
echo ""

# Hacer el script ejecutable
chmod +x install.sh

read -p "Presiona Enter para continuar..."
