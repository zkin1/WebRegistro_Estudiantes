const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { validateStudentRegistration, handleValidationErrors } = require('../middleware/validation');
const { registrationLimiter } = require('../middleware/security');

// GET /api/estudiantes - Listar todos los estudiantes
router.get('/', async (req, res) => {
  try {
    const [estudiantes] = await pool.execute(
      'SELECT id, codigo_estudiante, nombre_completo, año_carrera, ciudad, estado, fecha_registro FROM estudiantes_odontologia ORDER BY fecha_registro DESC'
    );

    res.json({
      success: true,
      data: estudiantes,
      total: estudiantes.length
    });

  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/estudiantes - Registrar nuevo estudiante
router.post('/', 
  registrationLimiter,
  validateStudentRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        nombre_completo,
        anio_carrera: año_carrera,
        telefono,
        email,
        universidad,
        ciudad,
        especialidades,
        dias_disponibles,
        horarios_disponibles
      } = req.body;

      // Normalizar el email (convertir a minúsculas y trim)
      const normalizedEmail = email.toLowerCase().trim();
      console.log('🔍 Email recibido:', email);
      console.log('🔍 Email normalizado:', normalizedEmail);

      // Verificar si el email ya existe (usando email normalizado)
      const [existingEmails] = await pool.execute(
        'SELECT id, nombre_completo FROM estudiantes_odontologia WHERE LOWER(TRIM(email)) = ?',
        [normalizedEmail]
      );

      if (existingEmails.length > 0) {
        console.log('❌ Email ya registrado:', {
          email: normalizedEmail,
          existingId: existingEmails[0].id,
          existingName: existingEmails[0].nombre_completo
        });
        
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado en el sistema',
          existingStudent: {
            id: existingEmails[0].id,
            nombre_completo: existingEmails[0].nombre_completo
          }
        });
      }

      // NO generar código aquí - se asignará desde otra API durante el matching
      console.log('🔍 Registrando estudiante sin código (se asignará después)');

      // Insertar estudiante en la base de datos (sin código)
      const [result] = await pool.execute(
        `INSERT INTO estudiantes_odontologia (
          nombre_completo, año_carrera, telefono, email,
          universidad, ciudad, especialidades, dias_disponibles, horarios_disponibles
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre_completo,
          año_carrera,
          telefono || null,
          normalizedEmail,
          universidad || null,
          ciudad,
          JSON.stringify(especialidades),
          JSON.stringify(dias_disponibles),
          JSON.stringify(horarios_disponibles)
        ]
      );

      // Obtener el estudiante recién creado
      const [newStudent] = await pool.execute(
        'SELECT * FROM estudiantes_odontologia WHERE id = ?',
        [result.insertId]
      );

      // Log del registro exitoso
      console.log(`✅ Estudiante registrado exitosamente:`, {
        id: result.insertId,
        nombre_completo,
        email: normalizedEmail,
        ciudad,
        fecha_registro: new Date().toISOString(),
        nota: 'Código se asignará desde otra API durante el matching'
      });

      res.status(201).json({
        success: true,
        message: 'Estudiante registrado exitosamente. El código se asignará durante el matching.',
        data: {
          id: result.insertId,
          nombre_completo,
          email: normalizedEmail,
          estado: 'activo',
          fecha_registro: new Date().toISOString(),
          codigo_estudiante: null, // Se asignará después
          nota: 'El código de estudiante se asignará desde otra API durante el proceso de matching'
        }
      });

    } catch (error) {
      console.error('❌ Error registrando estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
);

// GET /api/estudiantes/verificar-email/:email - Verificar si email existe
router.get('/verificar-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('🔍 Verificando disponibilidad de email:', email);
    
    if (!email || !email.includes('@')) {
      console.log('❌ Email inválido recibido:', email);
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Normalizar el email (convertir a minúsculas y trim)
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Email normalizado:', normalizedEmail);

    // Verificar si el email existe en la base de datos
    const [rows] = await pool.execute(
      'SELECT id, nombre_completo, codigo_estudiante, fecha_registro FROM estudiantes_odontologia WHERE LOWER(TRIM(email)) = ?',
      [normalizedEmail]
    );

    const isAvailable = rows.length === 0;
    const message = isAvailable ? 'Email disponible' : 'Email ya registrado';
    
    console.log(`🔍 Resultado verificación: ${isAvailable ? 'Disponible' : 'No disponible'}`);
    if (!isAvailable && rows.length > 0) {
      console.log(`🔍 Email encontrado en registro ID: ${rows[0].id}, Nombre: ${rows[0].nombre_completo}, Código: ${rows[0].codigo_estudiante}, Fecha: ${rows[0].fecha_registro}`);
    }

    res.json({
      success: true,
      disponible: isAvailable,
      message: message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error verificando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// GET /api/estudiantes/estadisticas - Estadísticas del sistema
router.get('/estadisticas', async (req, res) => {
  try {
    const [totalEstudiantes] = await pool.execute(
      'SELECT COUNT(*) as total FROM estudiantes_odontologia'
    );

    const [estudiantesPorCiudad] = await pool.execute(
      'SELECT ciudad, COUNT(*) as cantidad FROM estudiantes_odontologia GROUP BY ciudad'
    );

    const [estudiantesPorAño] = await pool.execute(
      'SELECT año_carrera, COUNT(*) as cantidad FROM estudiantes_odontologia GROUP BY año_carrera'
    );

    res.json({
      success: true,
      data: {
        total_estudiantes: totalEstudiantes[0].total,
        por_ciudad: estudiantesPorCiudad,
        por_año: estudiantesPorAño
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
