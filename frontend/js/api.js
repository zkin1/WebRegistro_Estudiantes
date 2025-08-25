/**
 * SISTEMA DENTAL MATCHING - API CLIENT
 * Maneja todas las comunicaciones con el backend
 */

class APIClient {
    constructor() {
        // Configurar la URL del backend
        this.baseURL = 'http://localhost:5000';
        this.endpoints = {
            registroCompleto: '/api/estudiantes/registro-completo',
            verificarEmail: '/api/estudiantes/verificar-email',
            estadisticas: '/api/estudiantes/estadisticas'
        };
    }

    /**
     * Realiza una petición HTTP genérica
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en petición a ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Registra un estudiante completo con especialidades y horarios
     */
    async registrarEstudiante(data) {
        return this.request(this.endpoints.registroCompleto, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Verifica la disponibilidad de un email
     */
    async verificarEmail(email) {
        const encodedEmail = encodeURIComponent(email);
        return this.request(`${this.endpoints.verificarEmail}/${encodedEmail}`);
    }

    /**
     * Obtiene estadísticas del sistema
     */
    async obtenerEstadisticas() {
        return this.request(this.endpoints.estadisticas);
    }

    /**
     * Valida la estructura de datos antes del envío
     */
    validateRegistrationData(data) {
        const errors = [];

        // Validar campos requeridos
        if (!data.nombre_completo?.trim()) {
            errors.push('Nombre completo es requerido');
        }

        if (!data.email?.trim()) {
            errors.push('Email es requerido');
        }

        if (!data.anio_carrera) {
            errors.push('Año de carrera es requerido');
        }

        if (!data.ciudad) {
            errors.push('Ciudad es requerida');
        }

        // Validar especialidades y horarios
        if (!data.especialidades_horarios || !Array.isArray(data.especialidades_horarios)) {
            errors.push('Especialidades y horarios son requeridos');
        } else if (data.especialidades_horarios.length === 0) {
            errors.push('Debe especificar al menos una especialidad con horario');
        } else {
            // Validar cada especialidad
            data.especialidades_horarios.forEach((esp, index) => {
                if (!esp.especialidad) {
                    errors.push(`Especialidad ${index + 1}: nombre de especialidad es requerido`);
                }
                if (!esp.clinica) {
                    errors.push(`Especialidad ${index + 1}: clínica es requerida`);
                }
                if (!esp.dia_semana) {
                    errors.push(`Especialidad ${index + 1}: día de la semana es requerido`);
                }
                if (!esp.hora_inicio) {
                    errors.push(`Especialidad ${index + 1}: hora de inicio es requerida`);
                }
                if (!esp.hora_fin) {
                    errors.push(`Especialidad ${index + 1}: hora de fin es requerida`);
                }
                if (!esp.capacidad_pacientes || esp.capacidad_pacientes < 1 || esp.capacidad_pacientes > 5) {
                    errors.push(`Especialidad ${index + 1}: capacidad debe ser entre 1 y 5 pacientes`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Prepara los datos para el envío
     */
    prepareDataForSubmission(formData) {
        // Asegurar que los datos estén en el formato correcto
        const preparedData = {
            nombre_completo: formData.nombre_completo?.trim(),
            email: formData.email?.trim().toLowerCase(),
            telefono: formData.telefono?.trim() || null,
            anio_carrera: formData.anio_carrera,
            casos_necesarios: parseInt(formData.casos_necesarios) || 10,
            ciudad: formData.ciudad,
            especialidades_horarios: formData.especialidades_horarios || []
        };

        // Validar y limpiar especialidades
        if (preparedData.especialidades_horarios.length > 0) {
            preparedData.especialidades_horarios = preparedData.especialidades_horarios.map(esp => ({
                especialidad: esp.especialidad?.trim(),
                clinica: esp.clinica?.trim(),
                dia_semana: esp.dia_semana?.toLowerCase().trim(),
                hora_inicio: esp.hora_inicio,
                hora_fin: esp.hora_fin,
                capacidad_pacientes: parseInt(esp.capacidad_pacientes) || 1
            }));
        }

        return preparedData;
    }

    /**
     * Maneja errores de la API
     */
    handleAPIError(error) {
        console.error('Error de API:', error);

        // Determinar el tipo de error y retornar mensaje apropiado
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Error de conexión. Verifica tu conexión a internet e inténtalo nuevamente.';
        }

        if (error.message.includes('HTTP 400')) {
            return 'Datos inválidos. Por favor, revisa la información ingresada.';
        }

        if (error.message.includes('HTTP 409')) {
            return 'El email ya está registrado en el sistema.';
        }

        if (error.message.includes('HTTP 500')) {
            return 'Error interno del servidor. Por favor, inténtalo más tarde.';
        }

        return error.message || 'Error desconocido. Por favor, inténtalo nuevamente.';
    }

    /**
     * Retorna información de la API
     */
    getAPIInfo() {
        return {
            baseURL: this.baseURL,
            endpoints: this.endpoints,
            version: '1.0.0'
        };
    }
}

// Inicializar cliente API cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.apiClient = new APIClient();
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
