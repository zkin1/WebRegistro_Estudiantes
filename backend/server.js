const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { corsOptions, securityMiddleware, apiLimiter } = require('./middleware/security');
const estudiantesRoutes = require('./routes/estudiantes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de CORS
app.use(cors(corsOptions));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting general
app.use('/api/', apiLimiter);

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api/estudiantes', estudiantesRoutes);

// Middleware de seguridad (después de las rutas)
app.use(securityMiddleware);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta raíz - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Registro de Estudiantes de Odontología',
    version: '1.0.0',
    description: 'Esta API se encarga únicamente del registro de estudiantes. La asignación de códigos se realiza desde otra API separada.',
    endpoints: {
      'POST /api/estudiantes': 'Registrar nuevo estudiante (formato básico)',
      'POST /api/estudiantes/registro-completo': 'Registrar estudiante con especialidades y horarios',
      'GET /api/estudiantes/verificar-email/:email': 'Verificar disponibilidad de email',
      'GET /api/estudiantes/estadisticas': 'Obtener estadísticas del sistema',
      'GET /health': 'Estado del servidor'
    },
    nota: 'Los códigos de estudiante se asignan desde otra API durante el proceso de matching'
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware para manejo de errores globales
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// Función para abrir el navegador automáticamente
function openBrowser(url) {
  const platform = process.platform;
  let command;

  switch (platform) {
    case 'win32':
      command = `start ${url}`;
      break;
    case 'darwin':
      command = `open ${url}`;
      break;
    case 'linux':
      command = `xdg-open ${url}`;
      break;
    default:
      console.log('⚠️  No se pudo determinar el sistema operativo para abrir el navegador automáticamente');
      return;
  }

  exec(command, (error) => {
    if (error) {
      console.log('⚠️  No se pudo abrir el navegador automáticamente:', error.message);
      console.log(`🌐 Abre manualmente: ${url}`);
    }
  });
}

// Función para iniciar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifique la configuración.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado correctamente');
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log('✅ API de registro lista para recibir estudiantes (sin generación de códigos)');
      
      // Abrir navegador automáticamente
      const url = `http://localhost:${PORT}`;
      console.log(`🌍 Abriendo navegador en: ${url}`);
      openBrowser(url);
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal SIGINT. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM. Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
