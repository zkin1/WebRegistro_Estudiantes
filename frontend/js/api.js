/**
 * Manejo de la API para el registro de estudiantes
 */

class StudentAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.endpoints = {
            estudiantes: `${this.baseURL}/estudiantes`,
            verificarEmail: `${this.baseURL}/estudiantes/verificar-email`,
            estadisticas: `${this.baseURL}/estudiantes/estadisticas`
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.log('API inicializada', this.endpoints);
    }

    setupEventListeners() {
        // Escuchar el evento de envío del formulario
        document.addEventListener('formSubmit', (e) => {
            this.log('Evento formSubmit recibido', e.detail);
            this.handleFormSubmission(e.detail.formData);
        });

        // También escuchar el submit directo del formulario como respaldo
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.log('Submit directo del formulario detectado');
                this.handleDirectFormSubmit();
            });
        }
    }

    /**
     * Maneja el envío directo del formulario (respaldo)
     */
    handleDirectFormSubmit() {
        const form = document.getElementById('registrationForm');
        if (!form) {
            this.log('Formulario no encontrado');
            return;
        }

        const formData = new FormData(form);
        const data = {};

        // Procesar datos del formulario
        for (let [key, value] of formData.entries()) {
            if (key === 'especialidades' || key === 'dias_disponibles' || key === 'horarios_disponibles') {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        this.log('Datos del formulario procesados', data);
        this.handleFormSubmission(data);
    }

    /**
     * Maneja el envío del formulario
     */
    async handleFormSubmission(formData) {
        try {
            this.log('Iniciando envío del formulario', formData);
            
            // Mostrar loading
            this.showLoading();
            
            // Validar datos antes del envío
            if (!this.validateFormData(formData)) {
                this.hideLoading();
                this.log('Datos del formulario no válidos, no se envía a la API');
                return;
            }

            this.log('Datos validados correctamente, enviando a la API...');

            // Enviar datos a la API
            const response = await this.registerStudent(formData);
            
            if (response.success) {
                this.log('Registro exitoso', response.data);
                this.showSuccess(response.data);
                this.resetForm();
            } else {
                this.log('Error en la respuesta de la API', response.message);
                // Solo mostrar errores críticos
                if (response.message && !response.message.includes('ya está registrado')) {
                    this.showError(response.message);
                }
            }

        } catch (error) {
            this.log('Error durante el registro', error);
            // Solo mostrar errores de conexión
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                this.showError('Error de conexión. Verifica que el servidor esté funcionando.');
            }
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Valida los datos del formulario antes del envío
     */
    validateFormData(data) {
        this.log('Validando datos del formulario', data);
        
        const required = [
            'nombre_completo', 'email', 'anio_carrera', 'ciudad',
            'especialidades', 'dias_disponibles', 'horarios_disponibles'
        ];

        // Verificar campos requeridos
        for (const field of required) {
            if (!data[field] || 
                (Array.isArray(data[field]) && data[field].length === 0) ||
                (typeof data[field] === 'string' && data[field].trim() === '')) {
                this.log(`Campo requerido faltante o vacío: ${field}`, data[field]);
                return false;
            }
        }

        // Validar arrays
        if (!Array.isArray(data.especialidades) || data.especialidades.length === 0) {
            this.log('Especialidades no válidas', data.especialidades);
            return false;
        }
        if (!Array.isArray(data.dias_disponibles) || data.dias_disponibles.length === 0) {
            this.log('Días disponibles no válidos', data.dias_disponibles);
            return false;
        }
        if (!Array.isArray(data.horarios_disponibles) || data.horarios_disponibles.length === 0) {
            this.log('Horarios disponibles no válidos', data.horarios_disponibles);
            return false;
        }

        this.log('Validación exitosa');
        return true;
    }

    /**
     * Registra un nuevo estudiante
     */
    async registerStudent(studentData) {
        try {
            this.log('Enviando datos a la API', {
                url: this.endpoints.estudiantes,
                data: studentData
            });

            const response = await fetch(this.endpoints.estudiantes, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });

            this.log('Respuesta recibida de la API', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorData = await response.json();
                this.log('Error en la respuesta de la API', errorData);
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            this.log('Respuesta exitosa de la API', responseData);
            return responseData;

        } catch (error) {
            this.log('Error en la API', error);
            throw error;
        }
    }

    /**
     * Verifica la disponibilidad de un email
     */
    async checkEmailAvailability(email) {
        try {
            const response = await fetch(`${this.endpoints.verificarEmail}/${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            this.log('Error verificando email', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del sistema
     */
    async getStatistics() {
        try {
            const response = await fetch(this.endpoints.estadisticas);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            this.log('Error obteniendo estadísticas', error);
            throw error;
        }
    }

    /**
     * Muestra el overlay de carga
     */
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
        }
    }

    /**
     * Oculta el overlay de carga
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
        }
    }

    /**
     * Muestra el modal de éxito
     */
    showSuccess(data) {
        const modal = document.getElementById('successModal');
        const studentCode = document.getElementById('studentCode');
        
        if (modal && studentCode) {
            // Ya no mostramos código porque se asignará después
            studentCode.textContent = 'Se asignará durante el matching';
            modal.classList.add('show');
            
            // Scroll al modal
            modal.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Muestra el modal de error
     */
    showError(message) {
        this.log('Mostrando error', message);
        const modal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        
        if (modal && errorMessage) {
            errorMessage.textContent = message;
            modal.classList.add('show');
            
            // Scroll al modal
            modal.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Resetea el formulario
     */
    resetForm() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.reset();
            
            // Limpiar errores
            if (window.formValidator) {
                window.formValidator.clearAllErrors();
            }
            
            // Limpiar estado del email
            this.clearEmailStatus();
            
            // Limpiar clases de error
            const errorFields = form.querySelectorAll('.error');
            errorFields.forEach(field => field.classList.remove('error'));
        }
    }

    /**
     * Limpia el estado del email
     */
    clearEmailStatus() {
        const emailStatus = document.querySelector('.email-status');
        if (emailStatus) {
            emailStatus.textContent = '';
            emailStatus.className = 'email-status';
        }
    }

    /**
     * Cierra el modal de éxito
     */
    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Cierra el modal de error
     */
    closeErrorModal() {
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

        // Verificación de conectividad del servidor eliminada

    /**
     * Logging para debugging
     */
    log(message, data = null) {
        const timestamp = new Date().toISOString();
        if (data) {
            console.log(`[${timestamp}] [StudentAPI] ${message}:`, data);
        } else {
            console.log(`[${timestamp}] [StudentAPI] ${message}`);
        }
    }
}

    // Inicializar API cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Inicializando StudentAPI...');
        window.studentAPI = new StudentAPI();
    });

// Funciones globales para los modales
function closeSuccessModal() {
    if (window.studentAPI) {
        window.studentAPI.closeSuccessModal();
    }
}

function closeErrorModal() {
    if (window.studentAPI) {
        window.studentAPI.closeErrorModal();
    }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentAPI;
}
