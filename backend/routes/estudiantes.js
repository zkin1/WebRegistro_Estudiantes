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

// POST /api/estudiantes/registro-completo - Nuevo registro con especialidades y horarios
router.post('/registro-completo', async (req, res) => {
  let connection;
  
  try {
    const { 
      // Datos básicos
      nombre_completo, 
      email, 
      telefono, 
      anio_carrera: año_carrera,
      casos_necesarios,
      ciudad,
      
      // Especialidades y horarios (array de objetos)
      especialidades_horarios = []
    } = req.body;

    // Validaciones básicas
    if (!nombre_completo || !email || !año_carrera) {
      return res.status(400).json({
        success: false,
        message: 'Nombre completo, email y año de carrera son requeridos'
      });
    }

    if (!especialidades_horarios || especialidades_horarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar al menos una especialidad con su horario'
      });
    }

    const db = await pool.getConnection();
    connection = db;
    
    // Iniciar transacción
    await connection.beginTransaction();

    // 1. Crear estudiante básico
    const codigo_estudiante = await generateUniqueStudentCode();
    
    const [estudianteResult] = await connection.execute(`
      INSERT INTO estudiantes_odontologia (
        codigo_estudiante, 
        nombre_completo, 
        año_carrera, 
        telefono, 
        email, 
        ciudad, 
        estado,
        casos_necesarios,
        casos_activos,
        casos_completados,
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      codigo_estudiante,
      nombre_completo,
      año_carrera,
      telefono || null,
      email.toLowerCase().trim(),
      ciudad,
      'activo',
      casos_necesarios || 10,
      0,
      0
    ]);

    const estudianteId = estudianteResult.insertId;

    // 2. Insertar especialidades y horarios
    for (const especialidad_horario of especialidades_horarios) {
      const {
        especialidad,
        clinica,
        dia_semana,
        hora_inicio,
        hora_fin,
        capacidad_pacientes = 1
      } = especialidad_horario;

      // Validar datos de especialidad
      if (!especialidad || !clinica || !dia_semana || !hora_inicio || !hora_fin) {
        throw new Error(`Datos incompletos para especialidad: ${JSON.stringify(especialidad_horario)}`);
      }

      // Validar clínicas permitidas
      const clinicasPermitidas = ['Clínica para el Niño y Adolescente', 'Clínica Integral Adulto y Gerontología'];
      if (!clinicasPermitidas.includes(clinica)) {
        throw new Error(`Clínica no válida: ${clinica}`);
      }

      // Validar días de la semana
      const diasPermitidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      if (!diasPermitidos.includes(dia_semana.toLowerCase())) {
        throw new Error(`Día de la semana no válido: ${dia_semana}`);
      }

      // Verificar solapamientos de horarios para este estudiante
      const [solapamientos] = await connection.execute(`
        SELECT COUNT(*) as conflictos
        FROM especialidades_estudiante 
        WHERE id_estudiante = ? 
          AND dia_semana = ? 
          AND activo = TRUE
          AND (
            (hora_inicio <= ? AND hora_fin > ?) OR
            (hora_inicio < ? AND hora_fin >= ?) OR
            (hora_inicio >= ? AND hora_fin <= ?)
          )
      `, [
        estudianteId, 
        dia_semana.toLowerCase(),
        hora_inicio, hora_inicio,  // Caso 1: nuevo empieza dentro de existente
        hora_fin, hora_fin,        // Caso 2: nuevo termina dentro de existente  
        hora_inicio, hora_fin      // Caso 3: nuevo contiene completamente a existente
      ]);

      if (solapamientos[0].conflictos > 0) {
        throw new Error(`Conflicto de horarios: ${dia_semana} ${hora_inicio}-${hora_fin} se solapa con otro horario existente`);
      }

      // Insertar especialidad_horario
      await connection.execute(`
        INSERT INTO especialidades_estudiante (
          id_estudiante,
          especialidad,
          clinica,
          dia_semana,
          hora_inicio,
          hora_fin,
          capacidad_pacientes,
          activo,
          fecha_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
      `, [
        estudianteId,
        especialidad,
        clinica,
        dia_semana.toLowerCase(),
        hora_inicio,
        hora_fin,
        capacidad_pacientes
      ]);
    }

    // Confirmar transacción
    await connection.commit();

    // Obtener datos completos del estudiante creado
    const [estudianteCompleto] = await connection.execute(`
      SELECT 
        e.*,
        GROUP_CONCAT(
          CONCAT(ee.especialidad, ' (', ee.clinica, ') - ', ee.dia_semana, ' ', ee.hora_inicio, '-', ee.hora_fin)
          SEPARATOR '; '
        ) as especialidades_detalle
      FROM estudiantes_odontologia e
      LEFT JOIN especialidades_estudiante ee ON e.id = ee.id_estudiante AND ee.activo = TRUE
      WHERE e.id = ?
      GROUP BY e.id
    `, [estudianteId]);

    res.status(201).json({
      success: true,
      message: 'Estudiante registrado exitosamente con especialidades y horarios',
      data: {
        estudiante: estudianteCompleto[0],
        especialidades_registradas: especialidades_horarios.length,
        codigo_estudiante: codigo_estudiante
      }
    });

  } catch (error) {
    // Revertir transacción en caso de error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError);
      }
    }
    
    console.error('Error en registro completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrando estudiante: ' + error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Función auxiliar para generar código único de estudiante
async function generateUniqueStudentCode() {
  const db = await pool.getConnection();
  try {
    let codigo;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Generar código: DENT + 6 dígitos aleatorios
      const randomNum = Math.floor(Math.random() * 900000) + 100000;
      codigo = `DENT${randomNum}`;

      // Verificar si ya existe
      const [existing] = await db.execute(
        'SELECT id FROM estudiantes_odontologia WHERE codigo_estudiante = ?',
        [codigo]
      );

      if (existing.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('No se pudo generar un código único después de múltiples intentos');
    }

    return codigo;
  } finally {
    db.release();
  }
}

module.exports = router;
