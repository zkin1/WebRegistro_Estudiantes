/**
 * Configuración del Frontend
 * Archivo de configuración centralizada para el sitio web
 */

const CONFIG = {
    // Configuración de la API
    API: {
        // URL base de la API (cambiar según el entorno)
        BASE_URL: process.env.NODE_ENV === 'production' 
            ? 'https://tu-api-produccion.com/api' 
            : 'http://localhost:5000/api',
        
        // Endpoints disponibles
        ENDPOINTS: {
            ESTUDIANTES: '/estudiantes',
            VERIFICAR_EMAIL: '/estudiantes/verificar-email',
            ESTADISTICAS: '/estudiantes/estadisticas'
        },
        
        // Timeout para requests (en milisegundos)
        TIMEOUT: 10000,
        
        // Headers por defecto
        DEFAULT_HEADERS: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },

    // Configuración de la aplicación
    APP: {
        // Nombre de la aplicación
        NAME: 'Sistema de Registro de Estudiantes de Odontología',
        
        // Versión
        VERSION: '1.0.0',
        
        // Descripción
        DESCRIPTION: 'Portal de registro para estudiantes de odontología que se integrará con un sistema de matching automático con pacientes',
        
        // Autor
        AUTHOR: 'Sistema Dental',
        
        // Contacto
        CONTACT: {
            EMAIL: 'info@sistemadental.cl',
            PHONE: '+56 9 1234 5678',
            WEBSITE: 'https://sistemadental.cl'
        }
    },

    // Configuración del formulario
    FORM: {
        // Campos requeridos
        REQUIRED_FIELDS: [
            'nombre_completo',
            'email',
            'anio_carrera',
            'ciudad',
            'especialidades',
            'dias_disponibles',
            'horarios_disponibles'
        ],
        
        // Campos opcionales
        OPTIONAL_FIELDS: [
            'telefono',
            'universidad'
        ],
        
        // Validaciones
        VALIDATION: {
            NOMBRE_MIN_LENGTH: 3,
            NOMBRE_MAX_LENGTH: 100,
            EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            TELEFONO_REGEX: /^\+569\d{8}$/,
            UNIVERSIDAD_MAX_LENGTH: 100
        },
        
        // Opciones disponibles
        OPTIONS: {
            CIUDADES: [
                'Metropolitana',
                'Valparaíso',
                'Concepción',
                'Otros'
            ],
            
            AÑOS_CARRERA: [
                '4to',
                '5to'
            ],
            
            ESPECIALIDADES: [
                'Endodoncia',
                'Resina Simple',
                'Resina Compuesta',
                'Corona',
                'Exodoncia Simple',
                'Incrustación',
                'Prótesis',
                'Destartraje',
                'Pulido Radicular'
            ],
            
            DIAS_SEMANA: [
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes'
            ],
            
                         HORARIOS: [
                 'Manana',
                 'Tarde'
             ]
        }
    },

    // Configuración de la UI
    UI: {
        // Colores del tema
        COLORS: {
            PRIMARY: '#2563eb',
            SECONDARY: '#059669',
            ACCENT: '#f59e0b',
            SUCCESS: '#10b981',
            ERROR: '#ef4444',
            WARNING: '#f59e0b',
            INFO: '#3b82f6'
        },
        
        // Breakpoints para responsive design
        BREAKPOINTS: {
            XS: 576,
            SM: 768,
            MD: 992,
            LG: 1200,
            XL: 1400
        },
        
        // Animaciones
        ANIMATIONS: {
            DURATION: {
                FAST: 150,
                NORMAL: 250,
                SLOW: 350
            },
            EASING: 'ease-in-out'
        }
    },

    // Configuración de localStorage
    STORAGE: {
        // Claves para localStorage
        KEYS: {
            FORM_DATA: 'studentRegistrationData',
            USER_PREFERENCES: 'userPreferences',
            SESSION_DATA: 'sessionData'
        },
        
        // Tiempo de expiración (en milisegundos)
        EXPIRATION: {
            FORM_DATA: 24 * 60 * 60 * 1000, // 24 horas
            SESSION_DATA: 60 * 60 * 1000 // 1 hora
        }
    },

    // Configuración de accesibilidad
    ACCESSIBILITY: {
        // Skip links
        SKIP_LINKS: [
            {
                href: '#registro',
                text: 'Saltar al formulario principal'
            },
            {
                href: '#informacion',
                text: 'Saltar a la información del programa'
            }
        ],
        
        // ARIA labels
        ARIA_LABELS: {
            FORM_PROGRESS: 'Progreso del formulario',
            LOADING: 'Cargando, por favor espere',
            SUCCESS: 'Registro exitoso',
            ERROR: 'Error en el registro'
        }
    },

    // Configuración de mensajes
    MESSAGES: {
        // Mensajes de éxito
        SUCCESS: {
            REGISTRO_COMPLETADO: 'Tu registro ha sido completado exitosamente. Ya eres parte del sistema de matching dental.',
            EMAIL_DISPONIBLE: '✓ Email disponible',
            FORM_GUARDADO: 'Formulario guardado automáticamente'
        },
        
        // Mensajes de error
        ERROR: {
            REGISTRO_FALLIDO: 'Ha ocurrido un error durante el registro. Por favor, inténtalo nuevamente.',
            EMAIL_NO_DISPONIBLE: '✗ Email ya registrado',
            CONEXION_FALLIDA: 'Error de conexión. Verifique que el servidor esté funcionando.',
            VALIDACION_FALLIDA: 'Por favor, corrige los errores en el formulario.'
        },
        
        // Mensajes de validación
        VALIDATION: {
            NOMBRE_REQUERIDO: 'El nombre completo es requerido',
            NOMBRE_LONGITUD: 'El nombre debe tener entre 3 y 100 caracteres',
            NOMBRE_FORMATO: 'El nombre solo puede contener letras y espacios',
            EMAIL_REQUERIDO: 'El email es requerido',
            EMAIL_FORMATO: 'Debe ser un email válido',
            EMAIL_DUPLICADO: 'Este email ya está registrado en el sistema',
            TELEFONO_FORMATO: 'El teléfono debe tener formato +569XXXXXXXX',
            CIUDAD_REQUERIDA: 'Debe seleccionar una ciudad',
            ANIO_CARRERA_REQUERIDO: 'Debe seleccionar un año de carrera',
            ESPECIALIDADES_REQUERIDAS: 'Debe seleccionar al menos una especialidad',
            DIAS_REQUERIDOS: 'Debe seleccionar al menos un día disponible',
            HORARIOS_REQUERIDOS: 'Debe seleccionar al menos un horario disponible'
        },
        
        // Mensajes informativos
        INFO: {
            VERIFICANDO_EMAIL: 'Verificando disponibilidad...',
            PROCESANDO_REGISTRO: 'Procesando registro...',
            FORMULARIO_GUARDANDO: 'Guardando formulario...',
            CARGANDO: 'Cargando...'
        }
    },

    // Configuración de desarrollo
    DEVELOPMENT: {
        // Modo debug
        DEBUG: process.env.NODE_ENV === 'development',
        
        // Logs
        LOGGING: {
            ENABLED: true,
            LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
            CONSOLE: true,
            REMOTE: false
        },
        
        // Mock data para desarrollo
        MOCK_DATA: {
            ENABLED: false,
            STUDENT: {
                nombre_completo: 'Juan Pérez González',
                email: 'juan.perez@test.cl',
                anio_carrera: '5to',
                telefono: '+56912345678',
                universidad: 'Universidad de Chile',
                ciudad: 'Metropolitana',
                especialidades: ['Endodoncia', 'Resina Simple'],
                                 dias_disponibles: ['Lunes', 'Miércoles', 'Viernes'],
                 horarios_disponibles: ['Manana', 'Tarde']
            }
        }
    }
};

// Función para obtener configuración
function getConfig(key) {
    const keys = key.split('.');
    let value = CONFIG;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return undefined;
        }
    }
    
    return value;
}

// Función para establecer configuración
function setConfig(key, value) {
    const keys = key.split('.');
    let config = CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in config) || typeof config[k] !== 'object') {
            config[k] = {};
        }
        config = config[k];
    }
    
    config[keys[keys.length - 1]] = value;
}

// Función para obtener URL completa de la API
function getApiUrl(endpoint) {
    return CONFIG.API.BASE_URL + endpoint;
}

// Función para obtener mensaje por clave
function getMessage(key) {
    const keys = key.split('.');
    let messages = CONFIG.MESSAGES;
    
    for (const k of keys) {
        if (messages && typeof messages === 'object' && k in messages) {
            messages = messages[k];
        } else {
            return key; // Retorna la clave si no encuentra el mensaje
        }
    }
    
    return messages;
}

// Función para validar configuración
function validateConfig() {
    const required = [
        'API.BASE_URL',
        'API.ENDPOINTS.ESTUDIANTES',
        'FORM.REQUIRED_FIELDS',
        'FORM.OPTIONS.CIUDADES'
    ];
    
    const missing = [];
    
    for (const key of required) {
        if (!getConfig(key)) {
            missing.push(key);
        }
    }
    
    if (missing.length > 0) {
        console.error('Configuración incompleta. Faltan:', missing);
        return false;
    }
    
    return true;
}

// Exportar configuración y funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        getConfig,
        setConfig,
        getApiUrl,
        getMessage,
        validateConfig
    };
} else {
    // Para uso en el navegador
    window.CONFIG = CONFIG;
    window.getConfig = getConfig;
    window.setConfig = setConfig;
    window.getApiUrl = getApiUrl;
    window.getMessage = getMessage;
    window.validateConfig = validateConfig;
    
    // Validar configuración al cargar
    document.addEventListener('DOMContentLoaded', () => {
        if (!validateConfig()) {
            console.error('❌ Error en la configuración del frontend');
        } else {
            console.log('✅ Configuración del frontend validada correctamente');
        }
    });
}
