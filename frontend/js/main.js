/**
 * SISTEMA DENTAL MATCHING - JAVASCRIPT PRINCIPAL
 * Maneja la lógica del formulario de registro con especialidades y horarios
 */

class DentalRegistrationSystem {
    constructor() {
        this.currentStep = 1;
        this.especialidadesSeleccionadas = new Set();
        this.especialidadesConfiguradas = [];
        this.especialidadCounter = 0;
        
        this.initializeEventListeners();
        this.updateUI();
    }

    /**
     * Inicializa todos los event listeners
     */
    initializeEventListeners() {
        // Navegación entre pasos
        document.getElementById('nextToEspecialidades').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('backToDatos').addEventListener('click', () => {
            this.previousStep();
        });

        // Checkboxes de especialidades
        document.querySelectorAll('input[name="especialidades_disponibles"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleEspecialidadChange(e);
            });
        });

        // Botón para agregar especialidad
        document.getElementById('addEspecialidadBtn').addEventListener('click', () => {
            this.agregarEspecialidad();
        });

        // Submit del formulario
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Validación en tiempo real
        this.setupRealTimeValidation();
    }

    /**
     * Maneja el cambio en la selección de especialidades
     */
    handleEspecialidadChange(event) {
        const especialidad = event.target.value;
        const isChecked = event.target.checked;

        if (isChecked) {
            this.especialidadesSeleccionadas.add(especialidad);
        } else {
            this.especialidadesSeleccionadas.delete(especialidad);
            // Remover especialidad configurada si existe
            this.removerEspecialidadConfigurada(especialidad);
        }

        this.updateEspecialidadesUI();
        this.updateButtons();
    }

    /**
     * Actualiza la UI de especialidades
     */
    updateEspecialidadesUI() {
        const container = document.getElementById('especialidadesConfiguradas');
        const noEspecialidades = container.querySelector('.no-especialidades');

        if (this.especialidadesSeleccionadas.size === 0) {
            container.innerHTML = `
                <div class="no-especialidades">
                    <i class="fas fa-info-circle"></i>
                    <p>Selecciona al menos una especialidad para configurar tus horarios</p>
                </div>
            `;
        } else {
            // Filtrar especialidades configuradas que ya no están seleccionadas
            this.especialidadesConfiguradas = this.especialidadesConfiguradas.filter(
                esp => this.especialidadesSeleccionadas.has(esp.especialidad)
            );

            if (this.especialidadesConfiguradas.length === 0) {
                container.innerHTML = `
                    <div class="no-especialidades">
                        <i class="fas fa-info-circle"></i>
                        <p>Selecciona al menos una especialidad para configurar tus horarios</p>
                    </div>
                `;
            } else {
                this.renderEspecialidadesConfiguradas();
            }
        }
    }

    /**
     * Renderiza las especialidades configuradas
     */
    renderEspecialidadesConfiguradas() {
        const container = document.getElementById('especialidadesConfiguradas');
        
        container.innerHTML = this.especialidadesConfiguradas.map(esp => {
            const horariosHTML = esp.horarios.map(horario => `
                <div class="horario-item">
                    <select class="clinica-select" data-especialidad="${esp.especialidad}" data-horario-id="${horario.id}">
                        <option value="Clínica para el Niño y Adolescente" ${horario.clinica === 'Clínica para el Niño y Adolescente' ? 'selected' : ''}>
                            Clínica para el Niño y Adolescente
                        </option>
                        <option value="Clínica Integral Adulto y Gerontología" ${horario.clinica === 'Clínica Integral Adulto y Gerontología' ? 'selected' : ''}>
                            Clínica Integral Adulto y Gerontología
                        </option>
                    </select>
                    
                    <select class="dia-select" data-especialidad="${esp.especialidad}" data-horario-id="${horario.id}">
                        <option value="lunes" ${horario.dia_semana === 'lunes' ? 'selected' : ''}>Lunes</option>
                        <option value="martes" ${horario.dia_semana === 'martes' ? 'selected' : ''}>Martes</option>
                        <option value="miercoles" ${horario.dia_semana === 'miercoles' ? 'selected' : ''}>Miércoles</option>
                        <option value="jueves" ${horario.dia_semana === 'jueves' ? 'selected' : ''}>Jueves</option>
                        <option value="viernes" ${horario.dia_semana === 'viernes' ? 'selected' : ''}>Viernes</option>
                        <option value="sabado" ${horario.dia_semana === 'sabado' ? 'selected' : ''}>Sábado</option>
                    </select>
                    
                    <input type="time" class="hora-inicio" value="${horario.hora_inicio}" 
                           data-especialidad="${esp.especialidad}" data-horario-id="${horario.id}">
                    
                    <input type="time" class="hora-fin" value="${horario.hora_fin}" 
                           data-especialidad="${esp.especialidad}" data-horario-id="${horario.id}">
                    
                    <input type="number" class="capacidad" value="${horario.capacidad_pacientes}" 
                           min="1" max="5" data-especialidad="${esp.especialidad}" data-horario-id="${horario.id}">
                    
                    <button type="button" class="remove-horario" 
                            onclick="dentalSystem.removerHorario('${esp.especialidad}', '${horario.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            return `
                <div class="especialidad-configurada" data-especialidad="${esp.especialidad}">
                    <div class="especialidad-header">
                        <h4 class="especialidad-title">${esp.especialidad}</h4>
                        <button type="button" class="remove-especialidad" 
                                onclick="dentalSystem.removerEspecialidad('${esp.especialidad}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="horarios-container">
                        ${horariosHTML}
                    </div>
                    
                    <button type="button" class="add-horario-btn" 
                            onclick="dentalSystem.agregarHorario('${esp.especialidad}')">
                        <i class="fas fa-plus"></i> Agregar Horario
                    </button>
                </div>
            `;
        }).join('');

        // Agregar event listeners a los nuevos elementos
        this.setupHorarioEventListeners();
    }

    /**
     * Configura los event listeners para los campos de horarios
     */
    setupHorarioEventListeners() {
        // Clínicas
        document.querySelectorAll('.clinica-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.actualizarHorario(
                    e.target.dataset.especialidad,
                    e.target.dataset.horarioId,
                    'clinica',
                    e.target.value
                );
            });
        });

        // Días
        document.querySelectorAll('.dia-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.actualizarHorario(
                    e.target.dataset.especialidad,
                    e.target.dataset.horarioId,
                    'dia_semana',
                    e.target.value
                );
            });
        });

        // Horas
        document.querySelectorAll('.hora-inicio').forEach(input => {
            input.addEventListener('change', (e) => {
                this.actualizarHorario(
                    e.target.dataset.especialidad,
                    e.target.dataset.horarioId,
                    'hora_inicio',
                    e.target.value
                );
            });
        });

        document.querySelectorAll('.hora-fin').forEach(input => {
            input.addEventListener('change', (e) => {
                this.actualizarHorario(
                    e.target.dataset.especialidad,
                    e.target.dataset.horarioId,
                    'hora_fin',
                    e.target.value
                );
            });
        });

        // Capacidad
        document.querySelectorAll('.capacidad').forEach(input => {
            input.addEventListener('change', (e) => {
                this.actualizarHorario(
                    e.target.dataset.especialidad,
                    e.target.dataset.horarioId,
                    'capacidad_pacientes',
                    parseInt(e.target.value)
                );
            });
        });
    }

    /**
     * Actualiza un campo específico de un horario
     */
    actualizarHorario(especialidad, horarioId, campo, valor) {
        const especialidadConfig = this.especialidadesConfiguradas.find(
            esp => esp.especialidad === especialidad
        );

        if (especialidadConfig) {
            const horario = especialidadConfig.horarios.find(h => h.id === horarioId);
            if (horario) {
                horario[campo] = valor;
            }
        }
    }

    /**
     * Agrega una nueva especialidad configurada
     */
    agregarEspecialidad() {
        if (this.especialidadesSeleccionadas.size === 0) return;

        // Tomar la primera especialidad no configurada
        const especialidadesDisponibles = Array.from(this.especialidadesSeleccionadas).filter(
            esp => !this.especialidadesConfiguradas.some(espConfig => espConfig.especialidad === esp)
        );

        if (especialidadesDisponibles.length === 0) return;

        const nuevaEspecialidad = especialidadesDisponibles[0];
        
        this.especialidadesConfiguradas.push({
            especialidad: nuevaEspecialidad,
            horarios: [this.crearHorarioDefault()]
        });

        this.updateEspecialidadesUI();
        this.updateButtons();
    }

    /**
     * Crea un horario por defecto
     */
    crearHorarioDefault() {
        return {
            id: `horario_${++this.especialidadCounter}`,
            clinica: 'Clínica para el Niño y Adolescente',
            dia_semana: 'lunes',
            hora_inicio: '08:00',
            hora_fin: '12:00',
            capacidad_pacientes: 1
        };
    }

    /**
     * Agrega un horario a una especialidad específica
     */
    agregarHorario(especialidad) {
        const especialidadConfig = this.especialidadesConfiguradas.find(
            esp => esp.especialidad === especialidad
        );

        if (especialidadConfig) {
            especialidadConfig.horarios.push(this.crearHorarioDefault());
            this.updateEspecialidadesUI();
        }
    }

    /**
     * Remueve una especialidad completa
     */
    removerEspecialidad(especialidad) {
        this.especialidadesConfiguradas = this.especialidadesConfiguradas.filter(
            esp => esp.especialidad !== especialidad
        );
        
        // Desmarcar el checkbox
        const checkbox = document.querySelector(`input[name="especialidades_disponibles"][value="${especialidad}"]`);
        if (checkbox) {
            checkbox.checked = false;
            this.especialidadesSeleccionadas.delete(especialidad);
        }

        this.updateEspecialidadesUI();
        this.updateButtons();
    }

    /**
     * Remueve un horario específico
     */
    removerHorario(especialidad, horarioId) {
        const especialidadConfig = this.especialidadesConfiguradas.find(
            esp => esp.especialidad === especialidad
        );

        if (especialidadConfig) {
            especialidadConfig.horarios = especialidadConfig.horarios.filter(
                h => h.id !== horarioId
            );

            // Si no quedan horarios, remover la especialidad
            if (especialidadConfig.horarios.length === 0) {
                this.removerEspecialidad(especialidad);
            } else {
                this.updateEspecialidadesUI();
            }
        }
    }

    /**
     * Remueve una especialidad configurada (cuando se desmarca el checkbox)
     */
    removerEspecialidadConfigurada(especialidad) {
        this.especialidadesConfiguradas = this.especialidadesConfiguradas.filter(
            esp => esp.especialidad !== especialidad
        );
    }

    /**
     * Actualiza el estado de los botones
     */
    updateButtons() {
        const addEspecialidadBtn = document.getElementById('addEspecialidadBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Botón agregar especialidad
        addEspecialidadBtn.disabled = this.especialidadesSeleccionadas.size === 0 || 
                                     this.especialidadesConfiguradas.length >= this.especialidadesSeleccionadas.size;

        // Botón submit
        submitBtn.disabled = this.especialidadesConfiguradas.length === 0;
    }

    /**
     * Avanza al siguiente paso
     */
    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep = 2;
            this.updateUI();
        }
    }

    /**
     * Retrocede al paso anterior
     */
    previousStep() {
        this.currentStep = 1;
        this.updateUI();
    }

    /**
     * Actualiza la UI según el paso actual
     */
    updateUI() {
        const datosBasicos = document.getElementById('datosBasicos');
        const especialidadesHorarios = document.getElementById('especialidadesHorarios');

        if (this.currentStep === 1) {
            datosBasicos.classList.remove('hidden');
            especialidadesHorarios.classList.add('hidden');
        } else {
            datosBasicos.classList.add('hidden');
            especialidadesHorarios.classList.remove('hidden');
        }
    }

    /**
     * Valida el paso actual
     */
    validateCurrentStep() {
        if (this.currentStep === 1) {
            return this.validateDatosBasicos();
        }
        return true;
    }

    /**
     * Valida los datos básicos
     */
    validateDatosBasicos() {
        const requiredFields = ['nombre_completo', 'email', 'anio_carrera', 'ciudad'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorSpan = field.parentNode.querySelector('.error-message');
            
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Validación específica del email
        const email = document.getElementById('email');
        if (email.value.trim() && !this.isValidEmail(email.value)) {
            this.showFieldError(email, 'Ingresa un email válido');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Valida formato de email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
    }

    /**
     * Configura validación en tiempo real
     */
    setupRealTimeValidation() {
        const fields = ['nombre_completo', 'email', 'anio_carrera', 'ciudad'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
                
                field.addEventListener('input', () => {
                    this.clearFieldError(field);
                });
            }
        });
    }

    /**
     * Valida un campo específico
     */
    validateField(field) {
        const value = field.value.trim();
        
        if (!value) {
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }

        // Validaciones específicas
        if (field.id === 'email' && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Ingresa un email válido');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    /**
     * Maneja el envío del formulario
     */
    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.showLoading();

        try {
            const formData = this.prepareFormData();
            const response = await this.submitForm(formData);
            
            if (response.success) {
                this.showSuccessModal(response.data);
            } else {
                this.showErrorModal(response.message);
            }
        } catch (error) {
            console.error('Error en el envío:', error);
            this.showErrorModal('Error de conexión. Por favor, inténtalo nuevamente.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Valida el formulario completo
     */
    validateForm() {
        // Validar datos básicos
        if (!this.validateDatosBasicos()) {
            this.currentStep = 1;
            this.updateUI();
            return false;
        }

        // Validar especialidades
        if (this.especialidadesConfiguradas.length === 0) {
            this.showErrorModal('Debes configurar al menos una especialidad con horarios');
            return false;
        }

        // Validar horarios
        for (const esp of this.especialidadesConfiguradas) {
            if (esp.horarios.length === 0) {
                this.showErrorModal(`La especialidad "${esp.especialidad}" debe tener al menos un horario`);
                return false;
            }

            for (const horario of esp.horarios) {
                if (!this.validateHorario(horario)) {
                    this.showErrorModal(`Horario inválido en ${esp.especialidad}: ${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Valida un horario específico
     */
    validateHorario(horario) {
        if (!horario.clinica || !horario.dia_semana || !horario.hora_inicio || !horario.hora_fin) {
            return false;
        }

        if (horario.hora_inicio >= horario.hora_fin) {
            return false;
        }

        if (horario.capacidad_pacientes < 1 || horario.capacidad_pacientes > 5) {
            return false;
        }

        return true;
    }

    /**
     * Prepara los datos del formulario
     */
    prepareFormData() {
        const formData = {
            nombre_completo: document.getElementById('nombre_completo').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            anio_carrera: document.getElementById('anio_carrera').value,
            casos_necesarios: parseInt(document.getElementById('casos_necesarios').value) || 10,
            ciudad: document.getElementById('ciudad').value,
            especialidades_horarios: []
        };

        // Convertir especialidades configuradas al formato esperado por la API
        this.especialidadesConfiguradas.forEach(esp => {
            esp.horarios.forEach(horario => {
                formData.especialidades_horarios.push({
                    especialidad: esp.especialidad,
                    clinica: horario.clinica,
                    dia_semana: horario.dia_semana,
                    hora_inicio: horario.hora_inicio,
                    hora_fin: horario.hora_fin,
                    capacidad_pacientes: horario.capacidad_pacientes
                });
            });
        });

        return formData;
    }

    /**
     * Envía el formulario a la API
     */
    async submitForm(formData) {
        const response = await fetch('/api/estudiantes/registro-completo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el servidor');
        }

        return await response.json();
    }

    /**
     * Muestra el modal de éxito
     */
    showSuccessModal(data) {
        const modal = document.getElementById('successModal');
        const studentCode = document.getElementById('studentCode');
        
        if (data.codigo_estudiante) {
            studentCode.textContent = data.codigo_estudiante;
        } else {
            studentCode.textContent = 'Se asignará desde otra API';
        }
        
        modal.classList.add('show');
    }

    /**
     * Muestra el modal de error
     */
    showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        modal.classList.add('show');
    }

    /**
     * Muestra el overlay de carga
     */
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    /**
     * Oculta el overlay de carga
     */
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}

// Funciones globales para los modales
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dentalSystem = new DentalRegistrationSystem();
});

// Cerrar modales al hacer clic fuera de ellos
window.addEventListener('click', (event) => {
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    
    if (event.target === successModal) {
        successModal.classList.remove('show');
    }
    
    if (event.target === errorModal) {
        errorModal.classList.remove('show');
    }
});
