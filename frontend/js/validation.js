/**
 * SISTEMA DENTAL MATCHING - VALIDACIONES
 * Maneja todas las validaciones del formulario de registro
 */

class FormValidator {
    constructor() {
        this.errors = new Map();
        this.setupValidation();
    }

    /**
     * Configura las validaciones del formulario
     */
    setupValidation() {
        // Validación en tiempo real para campos requeridos
        this.setupRealTimeValidation();
        
        // Validación de email
        this.setupEmailValidation();
        
        // Validación de teléfono
        this.setupPhoneValidation();
        
        // Validación de casos necesarios
        this.setupCasesValidation();
    }

    /**
     * Configura validación en tiempo real para campos requeridos
     */
    setupRealTimeValidation() {
        const requiredFields = ['nombre_completo', 'email', 'anio_carrera', 'ciudad'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateRequiredField(field);
                });
                
                field.addEventListener('input', () => {
                    this.clearFieldError(field);
                });
            }
        });
    }

    /**
     * Configura validación de email
     */
    setupEmailValidation() {
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                this.validateEmail(emailField);
            });
            
            emailField.addEventListener('input', () => {
                this.clearFieldError(emailField);
                this.clearEmailStatus();
            });
        }
    }

    /**
     * Configura validación de teléfono
     */
    setupPhoneValidation() {
        const phoneField = document.getElementById('telefono');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
            
            phoneField.addEventListener('blur', () => {
                this.validatePhone(phoneField);
            });
        }
    }

    /**
     * Configura validación de casos necesarios
     */
    setupCasesValidation() {
        const casesField = document.getElementById('casos_necesarios');
        if (casesField) {
            casesField.addEventListener('input', (e) => {
                this.validateCasesInput(e.target);
            });
            
            casesField.addEventListener('blur', () => {
                this.validateCasesField(casesField);
            });
        }
    }

    /**
     * Valida un campo requerido
     */
    validateRequiredField(field) {
        const value = field.value.trim();
        
        if (!value) {
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    /**
     * Valida formato de email
     */
    validateEmail(field) {
        const value = field.value.trim();
        
        if (!value) {
            this.showFieldError(field, 'El email es requerido');
            return false;
        }
        
        if (!this.isValidEmailFormat(value)) {
            this.showFieldError(field, 'Ingresa un email válido');
            return false;
        }
        
        // Verificar disponibilidad del email
        this.checkEmailAvailability(value);
        
        this.clearFieldError(field);
        return true;
    }

    /**
     * Verifica si el formato del email es válido
     */
    isValidEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Verifica la disponibilidad del email
     */
    async checkEmailAvailability(email) {
        const emailStatus = document.querySelector('.email-status');
        if (!emailStatus) return;
        
        try {
            emailStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            emailStatus.className = 'email-status checking';
            
            const response = await fetch(`http://localhost:5000/api/estudiantes/verificar-email/${encodeURIComponent(email)}`);
            const data = await response.json();
            
            if (data.success && data.disponible) {
                emailStatus.innerHTML = '<i class="fas fa-check-circle"></i> Email disponible';
                emailStatus.className = 'email-status available';
            } else {
                emailStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Email ya registrado';
                emailStatus.className = 'email-status unavailable';
            }
        } catch (error) {
            emailStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al verificar';
            emailStatus.className = 'email-status error';
        }
    }

    /**
     * Formatea el número de teléfono
     */
    formatPhoneNumber(field) {
        let value = field.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.startsWith('56')) {
                value = '+' + value;
            } else if (value.startsWith('9')) {
                value = '+56' + value;
            } else if (value.length === 9) {
                value = '+56' + value;
            }
        }
        
        field.value = value;
    }

    /**
     * Valida el campo de teléfono
     */
    validatePhone(field) {
        const value = field.value.trim();
        
        if (value && !this.isValidPhoneFormat(value)) {
            this.showFieldError(field, 'Ingresa un teléfono válido (ej: +56912345678)');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    /**
     * Verifica si el formato del teléfono es válido
     */
    isValidPhoneFormat(phone) {
        const phoneRegex = /^\+56[9][0-9]{8}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Valida la entrada de casos necesarios
     */
    validateCasesInput(field) {
        let value = parseInt(field.value);
        
        if (isNaN(value) || value < 1) {
            field.value = 1;
        } else if (value > 50) {
            field.value = 50;
        }
    }

    /**
     * Valida el campo de casos necesarios
     */
    validateCasesField(field) {
        const value = parseInt(field.value);
        
        if (isNaN(value) || value < 1 || value > 50) {
            this.showFieldError(field, 'Debe ser un número entre 1 y 50');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    /**
     * Valida el año de carrera
     */
    validateYear(field) {
        const value = field.value;
        
        if (!value) {
            this.showFieldError(field, 'Debes seleccionar tu año de carrera');
            return false;
        }
        
        if (!['4to', '5to'].includes(value)) {
            this.showFieldError(field, 'Año de carrera no válido');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    /**
     * Valida la ciudad
     */
    validateCity(field) {
        const value = field.value;
        
        if (!value) {
            this.showFieldError(field, 'Debes seleccionar una ciudad');
            return false;
        }
        
        const ciudadesValidas = ['Metropolitana', 'Valparaíso', 'Concepción'];
        if (!ciudadesValidas.includes(value)) {
            this.showFieldError(field, 'Ciudad no válida');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    /**
     * Valida las especialidades seleccionadas
     */
    validateEspecialidades(especialidadesSeleccionadas) {
        if (especialidadesSeleccionadas.size === 0) {
            return {
                isValid: false,
                message: 'Debes seleccionar al menos una especialidad'
            };
        }
        
        return { isValid: true };
    }

    /**
     * Valida los horarios configurados
     */
    validateHorarios(especialidadesConfiguradas) {
        if (especialidadesConfiguradas.length === 0) {
            return {
                isValid: false,
                message: 'Debes configurar al menos una especialidad con horarios'
            };
        }
        
        for (const esp of especialidadesConfiguradas) {
            if (esp.horarios.length === 0) {
                return {
                    isValid: false,
                    message: `La especialidad "${esp.especialidad}" debe tener al menos un horario`
                };
            }
            
            for (const horario of esp.horarios) {
                const horarioValidation = this.validateSingleHorario(horario);
                if (!horarioValidation.isValid) {
                    return {
                        isValid: false,
                        message: `Error en ${esp.especialidad}: ${horarioValidation.message}`
                    };
                }
            }
        }
        
        return { isValid: true };
    }

    /**
     * Valida un horario individual
     */
    validateSingleHorario(horario) {
        // Validar campos requeridos
        if (!horario.clinica || !horario.dia_semana || !horario.hora_inicio || !horario.hora_fin) {
            return {
                isValid: false,
                message: 'Todos los campos del horario son requeridos'
            };
        }
        
        // Validar clínica
        const clinicasValidas = ['Clínica para el Niño y Adolescente', 'Clínica Integral Adulto y Gerontología'];
        if (!clinicasValidas.includes(horario.clinica)) {
            return {
                isValid: false,
                message: 'Clínica no válida'
            };
        }
        
        // Validar día de la semana
        const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        if (!diasValidos.includes(horario.dia_semana.toLowerCase())) {
            return {
                isValid: false,
                message: 'Día de la semana no válido'
            };
        }
        
        // Validar horarios
        if (horario.hora_inicio >= horario.hora_fin) {
            return {
                isValid: false,
                message: 'La hora de inicio debe ser anterior a la hora de fin'
            };
        }
        
        // Validar capacidad
        if (horario.capacidad_pacientes < 1 || horario.capacidad_pacientes > 5) {
            return {
                isValid: false,
                message: 'La capacidad debe ser entre 1 y 5 pacientes'
            };
        }
        
        return { isValid: true };
    }

    /**
     * Valida el formulario completo
     */
    validateForm() {
        this.errors.clear();
        
        // Validar datos básicos
        const basicValidation = this.validateBasicData();
        if (!basicValidation.isValid) {
            return basicValidation;
        }
        
        // Validar especialidades
        const especialidadesValidation = this.validateEspecialidades(window.dentalSystem?.especialidadesSeleccionadas || new Set());
        if (!especialidadesValidation.isValid) {
            return especialidadesValidation;
        }
        
        // Validar horarios
        const horariosValidation = this.validateHorarios(window.dentalSystem?.especialidadesConfiguradas || []);
        if (!horariosValidation.isValid) {
            return horariosValidation;
        }
        
        return { isValid: true };
    }

    /**
     * Valida los datos básicos del formulario
     */
    validateBasicData() {
        const fields = [
            { id: 'nombre_completo', validator: this.validateRequiredField.bind(this) },
            { id: 'email', validator: this.validateEmail.bind(this) },
            { id: 'anio_carrera', validator: this.validateYear.bind(this) },
            { id: 'ciudad', validator: this.validateCity.bind(this) },
            { id: 'casos_necesarios', validator: this.validateCasesField.bind(this) }
        ];
        
        for (const field of fields) {
            const element = document.getElementById(field.id);
            if (element && !field.validator(element)) {
                return {
                    isValid: false,
                    message: `Error en el campo ${field.id}`
                };
            }
        }
        
        return { isValid: true };
    }

    /**
     * Muestra error en un campo
     */
    showFieldError(field, message) {
        const errorSpan = field.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            field.classList.add('error');
        }
        
        this.errors.set(field.id, message);
    }

    /**
     * Limpia error de un campo
     */
    clearFieldError(field) {
        const errorSpan = field.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
            field.classList.remove('error');
        }
        
        this.errors.delete(field.id);
    }

    /**
     * Limpia el estado del email
     */
    clearEmailStatus() {
        const emailStatus = document.querySelector('.email-status');
        if (emailStatus) {
            emailStatus.innerHTML = '';
            emailStatus.className = 'email-status';
        }
    }

    /**
     * Obtiene todos los errores actuales
     */
    getErrors() {
        return Array.from(this.errors.values());
    }

    /**
     * Verifica si hay errores
     */
    hasErrors() {
        return this.errors.size > 0;
    }

    /**
     * Limpia todos los errores
     */
    clearAllErrors() {
        this.errors.clear();
        document.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
        });
        document.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
    }
}

// Inicializar validador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.formValidator = new FormValidator();
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
