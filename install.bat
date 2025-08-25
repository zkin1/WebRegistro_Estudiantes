@echo off
echo ========================================
echo Sistema de Registro de Estudiantes de Odontologia
echo ========================================
echo.
echo Este script configurara automaticamente el proyecto
echo.

REM Verificar si Node.js esta instalado
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor, instala Node.js desde https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado: 
node --version
echo.

REM Verificar si npm esta disponible
echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta disponible
    echo.
    pause
    exit /b 1
)

echo npm encontrado:
npm --version
echo.

REM Navegar al directorio del proyecto
cd /d "%~dp0"

REM Instalar dependencias del backend
echo.
echo Instalando dependencias del backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend
    echo.
    pause
    exit /b 1
)

echo Dependencias del backend instaladas correctamente
echo.

REM Crear archivo .env si no existe
if not exist ".env" (
    echo Creando archivo .env...
    copy "env.example" ".env"
    echo.
    echo IMPORTANTE: Edita el archivo .env con tus credenciales de base de datos
    echo.
    echo Presiona cualquier tecla para abrir el archivo .env...
    pause >nul
    notepad ".env"
)

REM Volver al directorio raiz
cd ..

echo.
echo ========================================
echo Instalacion completada exitosamente!
echo ========================================
echo.
echo Para iniciar el proyecto:
echo.
echo 1. Configura las credenciales de base de datos en backend/.env
echo 2. Inicia el backend: cd backend ^& npm run dev
echo 3. Abre frontend/index.html en tu navegador
echo.
echo El servidor estara disponible en: http://localhost:5000
echo.
pause
