/**
 * Validación del formulario de registro de estudiantes
 */

class FormValidator {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.errors = {};
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Formulario no encontrado');
            return;
        }
        this.setupEventListeners();
        this.setupRealTimeValidation();
        console.log('✅ FormValidator inicializado');
    }

    setupEventListeners() {
        // Validación en tiempo real
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        // Validación al cambiar selecciones
        this.form.addEventListener('change', (e) => {
            this.validateField(e.target);
        });

        // Validación al enviar
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📝 Submit del formulario detectado');
            if (this.validateForm()) {
                this.submitForm();
            }
        });
    }

    setupRealTimeValidation() {
        // Validación de email en tiempo real
        const emailField = document.getElementById('email');
        if (emailField) {
            let emailTimeout;

            emailField.addEventListener('input', (e) => {
                clearTimeout(emailTimeout);
                const email = e.target.value.trim();
                
                // Solo verificar si el email es válido y no está vacío
                if (email && this.isValidEmail(email)) {
                    // Verificar si el email ya fue verificado recientemente
                    if (emailField.dataset.lastVerified === email) {
                        return; // Ya verificamos este email
                    }
                    
                    emailTimeout = setTimeout(() => {
                        this.checkEmailAvailability(email);
                        // Marcar este email como verificado
                        emailField.dataset.lastVerified = email;
                    }, 500);
                } else {
                    this.clearEmailStatus();
                    // Limpiar el marcador de verificación
                    delete emailField.dataset.lastVerified;
                }
            });
        }
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        // Limpiar error previo
        this.clearFieldError(field);

        // Validaciones específicas según el tipo de campo
        switch (fieldName) {
            case 'nombre_completo':
                isValid = this.validateNombre(value);
                if (!isValid) errorMessage = 'El nombre debe tener entre 3 y 100 caracteres y solo letras';
                break;

            case 'email':
                isValid = this.validateEmail(value);
                if (!isValid) errorMessage = 'Ingresa un email válido';
                break;

            case 'telefono':
                isValid = this.validateTelefono(value);
                if (!isValid) errorMessage = 'El teléfono debe tener formato +56912345678';
                break;

            case 'ciudad':
                isValid = this.validateCiudad(value);
                if (!isValid) errorMessage = 'Selecciona una ciudad válida';
                break;

            case 'universidad':
                isValid = this.validateUniversidad(value);
                if (!isValid) errorMessage = 'La universidad debe tener máximo 100 caracteres';
                break;

            case 'anio_carrera':
                isValid = this.validateAñoCarrera(value);
                if (!isValid) errorMessage = 'Selecciona un año válido';
                break;
        }

        // Solo mostrar errores visuales para campos críticos
        if (!isValid && (fieldName === 'nombre_completo' || fieldName === 'email' || fieldName === 'anio_carrera' || fieldName === 'ciudad')) {
            this.showFieldError(field, errorMessage);
        }

        // Actualizar estado de errores
        if (isValid) {
            delete this.errors[fieldName];
        } else {
            this.errors[fieldName] = errorMessage;
        }

        this.updateSubmitButton();
        return isValid;
    }

    validateForm() {
        console.log('🔍 Validando formulario completo...');
        let isValid = true;
        const fields = this.form.querySelectorAll('input, select');
        
        // Validar campos requeridos específicamente
        const requiredFields = [
            'nombre_completo', 'email', 'anio_carrera', 'ciudad',
            'especialidades', 'dias_disponibles', 'horarios_disponibles'
        ];
        
        console.log('📋 Campos requeridos:', requiredFields);
        
        for (const fieldName of requiredFields) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (!field) {
                console.error(`❌ Campo no encontrado: ${fieldName}`);
                continue;
            }
            
            let fieldValid = true;
            
            if (fieldName === 'especialidades' || fieldName === 'dias_disponibles' || fieldName === 'horarios_disponibles') {
                const checkboxes = this.form.querySelectorAll(`input[name="${fieldName}"]:checked`);
                fieldValid = checkboxes.length > 0;
                console.log(`🔍 ${fieldName}: ${checkboxes.length} seleccionados`, Array.from(checkboxes).map(cb => cb.value));
            } else if (fieldName === 'anio_carrera') {
                const radio = this.form.querySelector(`input[name="${fieldName}"]:checked`);
                fieldValid = radio && ['4to', '5to'].includes(radio.value);
                console.log(`🔍 ${fieldName}: ${radio ? radio.value : 'ninguno seleccionado'}`);
            } else {
                fieldValid = field.value.trim() !== '';
                console.log(`🔍 ${fieldName}: "${field.value.trim()}"`);
            }
            
            if (!fieldValid) {
                console.error(`❌ Campo inválido: ${fieldName}`);
                isValid = false;
                this.showFieldError(field, `El campo ${fieldName} es requerido`);
            }
        }
        
        // Validar campos individuales para mostrar errores específicos
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        console.log('📊 Resultado de validación:', { isValid, errors: this.errors });
        return isValid;
    }

    // Validaciones específicas
    validateNombre(value) {
        const trimmed = value.trim();
        if (trimmed.length < 3 || trimmed.length > 100) return false;
        
        // Solo letras, espacios y acentos
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return regex.test(trimmed);
    }

    validateEmail(value) {
        const trimmed = value.trim();
        if (trimmed.length === 0) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(trimmed);
    }

    validateTelefono(value) {
        const trimmed = value.trim();
        if (trimmed.length === 0) return true; // Opcional
        
        const phoneRegex = /^\+569\d{8}$/;
        return phoneRegex.test(trimmed);
    }

    validateCiudad(value) {
        const validCities = ['Metropolitana', 'Valparaíso', 'Concepción', 'Otros'];
        const isValid = validCities.includes(value);
        console.log(`🔍 Validando ciudad: "${value}" - Válida: ${isValid}`);
        return isValid;
    }

    validateUniversidad(value) {
        const trimmed = value.trim();
        if (trimmed.length === 0) return true; // Opcional
        return trimmed.length <= 100;
    }

    validateAñoCarrera(value) {
        const validYears = ['4to', '5to'];
        const isValid = validYears.includes(value);
        console.log(`🔍 Validando año de carrera: "${value}" - Válido: ${isValid}`);
        return isValid;
    }

    // Verificación de disponibilidad de email
    async checkEmailAvailability(email) {
        const emailStatus = document.querySelector('.email-status');
        const emailField = document.getElementById('email');
        
        if (!emailStatus || !emailField) return;
        
        try {
            // Mostrar estado de verificación
            emailStatus.textContent = 'Verificando disponibilidad...';
            emailStatus.className = 'email-status checking';
            
            // Hacer la petición a la API
            const response = await fetch(`http://localhost:5000/api/estudiantes/verificar-email/${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                if (data.disponible) {
                    emailStatus.textContent = '✓ Email disponible';
                    emailStatus.className = 'email-status available';
                    // Limpiar cualquier error previo
                    this.clearFieldError(emailField);
                } else {
                    emailStatus.textContent = '✗ Email ya registrado';
                    emailStatus.className = 'email-status unavailable';
                    this.showFieldError(emailField, 'Este email ya está registrado en el sistema');
                }
            } else {
                emailStatus.textContent = 'Error verificando email';
                emailStatus.className = 'email-status unavailable';
                console.error('Error en respuesta de verificación:', data);
            }
        } catch (error) {
            console.error('Error verificando email:', error);
            emailStatus.textContent = 'Error de conexión';
            emailStatus.className = 'email-status unavailable';
            
            // No mostrar error en el campo si es un error de conexión
            // Solo mostrar en el estado del email
        }
    }

    clearEmailStatus() {
        const emailStatus = document.querySelector('.email-status');
        const emailField = document.getElementById('email');
        
        if (emailStatus) {
            emailStatus.textContent = '';
            emailStatus.className = 'email-status';
        }
        
        if (emailField) {
            // Limpiar el marcador de verificación
            delete emailField.dataset.lastVerified;
            // Limpiar cualquier error del campo
            this.clearFieldError(emailField);
        }
    }

    // Manejo de errores
    showFieldError(field, message) {
        const errorSpan = field.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            field.classList.add('error');
        }
    }

    clearFieldError(field) {
        const errorSpan = field.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
            field.classList.remove('error');
        }
    }

    // Estado del botón de envío
    updateSubmitButton() {
        const hasErrors = Object.keys(this.errors).length > 0;
        const requiredFields = this.form.querySelectorAll('[required]');
        let allRequiredFilled = true;

        requiredFields.forEach(field => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                const name = field.name;
                const checked = this.form.querySelectorAll(`input[name="${name}"]:checked`);
                if (checked.length === 0) allRequiredFilled = false;
            } else {
                if (!field.value.trim()) allRequiredFilled = false;
            }
        });

        this.submitBtn.disabled = hasErrors || !allRequiredFilled;
        
        if (this.submitBtn.disabled) {
            this.submitBtn.style.opacity = '0.6';
            this.submitBtn.style.cursor = 'not-allowed';
        } else {
            this.submitBtn.style.opacity = '1';
            this.submitBtn.style.cursor = 'pointer';
        }
    }

    // Envío del formulario
    submitForm() {
        if (this.submitBtn.disabled) return;

        console.log('🚀 Enviando formulario...');
        
        const formData = new FormData(this.form);
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

        console.log('📋 Datos procesados del formulario:', data);
        console.log('🔍 Verificando estructura de datos:');
        console.log('  - nombre_completo:', data.nombre_completo);
        console.log('  - email:', data.email);
        console.log('  - anio_carrera:', data.anio_carrera);
        console.log('  - ciudad:', data.ciudad);
        console.log('  - especialidades:', data.especialidades);
        console.log('  - dias_disponibles:', data.dias_disponibles);
        console.log('  - horarios_disponibles:', data.horarios_disponibles);
        console.log('  - telefono:', data.telefono);
        console.log('  - universidad:', data.universidad);

        // Emitir evento para que api.js maneje el envío
        const submitEvent = new CustomEvent('formSubmit', {
            detail: { formData: data }
        });
        document.dispatchEvent(submitEvent);
        
        console.log('📤 Evento formSubmit emitido');
    }

    // Métodos públicos para uso externo
    getErrors() {
        return this.errors;
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    clearAllErrors() {
        this.errors = {};
        const errorSpans = this.form.querySelectorAll('.error-message');
        const errorFields = this.form.querySelectorAll('.error');
        
        errorSpans.forEach(span => span.textContent = '');
        errorFields.forEach(field => field.classList.remove('error'));
        
        this.updateSubmitButton();
    }
}

// Inicializar validador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando FormValidator...');
    window.formValidator = new FormValidator();
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
