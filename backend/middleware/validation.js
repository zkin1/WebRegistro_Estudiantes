const { body, validationResult } = require('express-validator');

// Validaciones para el registro de estudiantes
const validateStudentRegistration = [
  // Nombre completo
  body('nombre_completo')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre completo debe tener entre 3 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  // Email
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  // Año de carrera
  body('anio_carrera')
    .custom((value) => {
      console.log('🔍 Año de carrera recibido:', value, 'Tipo:', typeof value);
      console.log('🔍 Valor exacto:', JSON.stringify(value));
      const validYears = ['4to', '5to'];
      if (!validYears.includes(value)) {
        throw new Error(`El año de carrera debe ser 4to o 5to. Recibido: "${value}"`);
      }
      return true;
    }),
  
  // Teléfono (opcional)
  body('telefono')
    .optional()
    .matches(/^\+569\d{8}$/)
    .withMessage('El teléfono debe tener formato +569XXXXXXXX'),
  
  // Universidad
  body('universidad')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La universidad no puede exceder 100 caracteres'),
  
  // Ciudad
  body('ciudad')
    .custom((value) => {
      const validCities = [
        'Metropolitana', 
        'Valparaíso', 
        'Concepción',
        'Otros'
      ];
      if (!validCities.includes(value)) {
        throw new Error(`Debe seleccionar una ciudad válida. Recibido: "${value}"`);
      }
      return true;
    }),
  
  // Especialidades
  body('especialidades')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una especialidad')
    .custom((value) => {
      const validSpecialties = [
        'Endodoncia', 'Resina Simple', 'Resina Compuesta', 'Corona',
        'Exodoncia Simple', 'Incrustación', 'Prótesis', 'Destartraje',
        'Pulido Radicular'
      ];
      
      const invalidSpecialties = value.filter(specialty => !validSpecialties.includes(specialty));
      if (invalidSpecialties.length > 0) {
        throw new Error(`Especialidades inválidas: ${invalidSpecialties.join(', ')}`);
      }
      return true;
    }),
  
  // Días disponibles
  body('dias_disponibles')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un día disponible')
    .custom((value) => {
      const validDays = [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
      ];
      const invalidDays = value.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        throw new Error(`Días inválidos: ${invalidDays.join(', ')}`);
      }
      return true;
    }),
  
  // Horarios disponibles
  body('horarios_disponibles')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un horario disponible')
    .custom((value) => {
      const validHours = [
        'Manana', 'Tarde'
      ];
      const invalidHours = value.filter(hour => !validHours.includes(hour));
      if (invalidHours.length > 0) {
        throw new Error(`Horarios inválidos: ${invalidHours.join(', ')}`);
      }
      return true;
    })
];

// Middleware para verificar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación encontrados:');
    errors.array().forEach(error => {
      console.log(`  - ${error.param}: ${error.msg}`);
    });
    console.log('📋 Datos recibidos:', req.body);
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  
  console.log('✅ Validación exitosa para todos los campos');
  console.log('📋 Datos validados:', req.body);
  next();
};

module.exports = {
  validateStudentRegistration,
  handleValidationErrors
};
