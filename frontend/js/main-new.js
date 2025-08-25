/**
 * SISTEMA DENTAL MATCHING - NUEVA INTERFAZ INTUITIVA
 * JavaScript principal para manejar la nueva UI de especialidades y horarios
 */

class DentalRegistrationSystemNew {
    constructor() {
        // Estado del formulario
        this.currentStep = 1;
        this.currentWizardStep = 'especialidades'; // especialidades, horarios, resumen
        
        // Datos de especialidades
        this.especialidadesSeleccionadas = new Set();
        this.especialidadesData = new Map(); // Map para almacenar horarios por especialidad
        
        // Estado del calendario
        this.especialidadActiva = null;
        this.clinicaActual = 'Clínica para el Niño y Adolescente';
        
        // Modal state
        this.currentSlot = null;
        
        // Contadores
        this.horarioCounter = 0;
        
        // Iconos para especialidades
        this.especialidadIcons = {
            'Endodoncia': 'fas fa-tooth',
            'Operatoria Dental': 'fas fa-fill-drip',
            'Periodoncia': 'fas fa-grin',
            'Cirugía Oral': 'fas fa-cut',
            'Prótesis Fija': 'fas fa-crown',
            'Prótesis Removible': 'fas fa-smile'
        };
        
        this.initializeEventListeners();
        this.updateUI();
    }

    /**
     * Inicializa todos los event listeners
     */
    initializeEventListeners() {
        // Navegación entre pasos principales
        document.getElementById('nextToEspecialidades').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('backToDatos').addEventListener('click', () => {
            this.previousStep();
        });

        // Checkboxes de especialidades (nueva interfaz)
        document.querySelectorAll('.especialidad-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.handleEspecialidadChange(checkbox);
                }
            });
        });

        document.querySelectorAll('.especialidad-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleEspecialidadChange(e.target);
            });
        });

        // Navegación del wizard interno
        document.getElementById('nextToHorarios').addEventListener('click', () => {
            this.goToWizardStep('horarios');
        });

        document.getElementById('backToEspecialidades').addEventListener('click', () => {
            this.goToWizardStep('especialidades');
        });

        document.getElementById('nextToResumen').addEventListener('click', () => {
            this.goToWizardStep('resumen');
        });

        document.getElementById('backToHorarios').addEventListener('click', () => {
            this.goToWizardStep('horarios');
        });

        // Selector de clínica
        document.getElementById('clinicaActual').addEventListener('change', (e) => {
            this.clinicaActual = e.target.value;
            this.updateCalendarioState();
        });

        // Slots de tiempo
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.handleTimeSlotClick(slot);
            });
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
    handleEspecialidadChange(checkbox) {
        const especialidad = checkbox.value;
        const card = checkbox.closest('.especialidad-card');
        
        if (checkbox.checked) {
            this.especialidadesSeleccionadas.add(especialidad);
            card.classList.add('selected');
            
            // Inicializar datos para esta especialidad
            if (!this.especialidadesData.has(especialidad)) {
                this.especialidadesData.set(especialidad, {
                    horarios: new Map() // Map por clínica
                });
            }
        } else {
            this.especialidadesSeleccionadas.delete(especialidad);
            card.classList.remove('selected');
            
            // Remover datos de esta especialidad
            this.especialidadesData.delete(especialidad);
        }

        this.updateSelectedEspecialidades();
        this.updateNavigationButtons();
        
        // Si estamos en la vista de horarios, actualizar tabs
        if (this.currentWizardStep === 'horarios') {
            this.updateEspecialidadTabs();
        }
    }

    /**
     * Actualiza la visualización de especialidades seleccionadas
     */
    updateSelectedEspecialidades() {
        const container = document.getElementById('selectedEspecialidades');
        
        if (this.especialidadesSeleccionadas.size === 0) {
            container.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Selecciona al menos una especialidad para continuar</span>
                </div>
            `;
        } else {
            const tags = Array.from(this.especialidadesSeleccionadas).map(esp => `
                <div class="selected-tag">
                    <i class="${this.especialidadIcons[esp]}"></i>
                    <span>${esp}</span>
                    <i class="fas fa-times remove" onclick="dentalSystemNew.removeEspecialidad('${esp}')"></i>
                </div>
            `).join('');
            
            container.innerHTML = tags;
        }
    }

    /**
     * Remueve una especialidad desde el tag
     */
    removeEspecialidad(especialidad) {
        const checkbox = document.querySelector(`input[value="${especialidad}"]`);
        if (checkbox) {
            checkbox.checked = false;
            this.handleEspecialidadChange(checkbox);
        }
    }

    /**
     * Navega a un paso del wizard interno
     */
    goToWizardStep(step) {
        // Validar paso actual
        if (!this.validateCurrentWizardStep()) {
            return;
        }

        // Ocultar contenido actual
        document.querySelectorAll('.wizard-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Actualizar pasos del wizard
        document.querySelectorAll('.wizard-step').forEach(wizardStep => {
            wizardStep.classList.remove('active', 'completed');
        });

        // Mostrar nuevo contenido
        this.currentWizardStep = step;
        document.getElementById(`wizard${step.charAt(0).toUpperCase() + step.slice(1)}`).classList.remove('hidden');

        // Actualizar estado de los pasos
        this.updateWizardSteps();

        // Acciones específicas por paso
        if (step === 'horarios') {
            this.updateEspecialidadTabs();
            this.selectFirstEspecialidad();
        } else if (step === 'resumen') {
            this.updateResumen();
        }
    }

    /**
     * Actualiza el estado visual de los pasos del wizard
     */
    updateWizardSteps() {
        const steps = ['especialidades', 'horarios', 'resumen'];
        const currentIndex = steps.indexOf(this.currentWizardStep);

        steps.forEach((step, index) => {
            const stepElement = document.querySelector(`[data-step="${step}"]`);
            
            if (index < currentIndex) {
                stepElement.classList.add('completed');
            } else if (index === currentIndex) {
                stepElement.classList.add('active');
            }
        });
    }

    /**
     * Valida el paso actual del wizard
     */
    validateCurrentWizardStep() {
        if (this.currentWizardStep === 'especialidades') {
            if (this.especialidadesSeleccionadas.size === 0) {
                this.showErrorModal('Debes seleccionar al menos una especialidad antes de continuar.');
                return false;
            }
        } else if (this.currentWizardStep === 'horarios') {
            if (!this.hasConfiguredHorarios()) {
                this.showErrorModal('Debes configurar al menos un horario para una especialidad antes de continuar.');
                return false;
            }
        }
        
        return true;
    }

    /**
     * Verifica si hay horarios configurados
     */
    hasConfiguredHorarios() {
        for (const [especialidad, data] of this.especialidadesData) {
            for (const [clinica, horarios] of data.horarios) {
                if (horarios.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Actualiza las tabs de especialidades en la vista de horarios
     */
    updateEspecialidadTabs() {
        const container = document.getElementById('especialidadTabs');
        
        if (this.especialidadesSeleccionadas.size === 0) {
            container.innerHTML = '<div class="no-especialidades">No hay especialidades seleccionadas</div>';
            return;
        }

        const tabs = Array.from(this.especialidadesSeleccionadas).map(esp => `
            <div class="especialidad-tab" data-especialidad="${esp}" onclick="dentalSystemNew.selectEspecialidad('${esp}')">
                <i class="${this.especialidadIcons[esp]}"></i>
                ${esp}
            </div>
        `).join('');
        
        container.innerHTML = tabs;
    }

    /**
     * Selecciona la primera especialidad automáticamente
     */
    selectFirstEspecialidad() {
        if (this.especialidadesSeleccionadas.size > 0) {
            const primera = Array.from(this.especialidadesSeleccionadas)[0];
            this.selectEspecialidad(primera);
        }
    }

    /**
     * Selecciona una especialidad activa
     */
    selectEspecialidad(especialidad) {
        this.especialidadActiva = especialidad;
        
        // Actualizar tabs
        document.querySelectorAll('.especialidad-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-especialidad="${especialidad}"]`).classList.add('active');
        
        // Actualizar header
        document.getElementById('especialidadActiva').innerHTML = `
            <i class="${this.especialidadIcons[especialidad]}"></i>
            <span>${especialidad}</span>
        `;
        
        // Actualizar estado del calendario
        this.updateCalendarioState();
        this.updateHorariosConfigurados();
    }

    /**
     * Actualiza el estado del calendario según la especialidad y clínica activa
     */
    updateCalendarioState() {
        if (!this.especialidadActiva) return;
        
        // Resetear todos los slots
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('configured');
            const content = slot.querySelector('.slot-content');
            content.innerHTML = `
                <i class="fas fa-plus"></i>
                <span>Disponible</span>
            `;
        });
        
        // Marcar slots configurados
        const especialidadData = this.especialidadesData.get(this.especialidadActiva);
        if (especialidadData && especialidadData.horarios.has(this.clinicaActual)) {
            const horariosClinica = especialidadData.horarios.get(this.clinicaActual);
            
            horariosClinica.forEach(horario => {
                const slot = document.querySelector(
                    `.time-slot[data-dia="${horario.dia_semana}"][data-periodo="${horario.periodo}"]`
                );
                
                if (slot) {
                    slot.classList.add('configured');
                    const content = slot.querySelector('.slot-content');
                    content.innerHTML = `
                        <i class="fas fa-check"></i>
                        <span>${horario.hora_inicio}-${horario.hora_fin}</span>
                    `;
                }
            });
        }
    }

    /**
     * Maneja el clic en un slot de tiempo
     */
    handleTimeSlotClick(slot) {
        if (!this.especialidadActiva) {
            this.showErrorModal('Primero selecciona una especialidad.');
            return;
        }

        const dia = slot.dataset.dia;
        const periodo = slot.dataset.periodo;
        
        this.currentSlot = {
            dia,
            periodo,
            especialidad: this.especialidadActiva,
            clinica: this.clinicaActual,
            defaultInicio: slot.dataset.inicio,
            defaultFin: slot.dataset.fin
        };

        // Si ya está configurado, mostrar opciones para editar/eliminar
        if (slot.classList.contains('configured')) {
            this.showConfiguredSlotOptions(slot);
        } else {
            // Configurar nuevo horario
            this.showTimeSlotModal();
        }
    }

    /**
     * Muestra el modal para configurar horario
     */
    showTimeSlotModal() {
        const modal = document.getElementById('timeSlotModal');
        const slot = this.currentSlot;
        
        // Actualizar información del modal
        document.getElementById('modalDiaEspecialidad').textContent = 
            `${this.getDiaDisplayName(slot.dia)} - ${slot.especialidad}`;
        document.getElementById('modalClinica').textContent = slot.clinica;
        
        // Establecer valores por defecto
        document.getElementById('customHoraInicio').value = slot.defaultInicio;
        document.getElementById('customHoraFin').value = slot.defaultFin;
        document.getElementById('customCapacidad').value = '1';
        
        modal.classList.add('show');
    }

    /**
     * Muestra opciones para slot ya configurado
     */
    showConfiguredSlotOptions(slot) {
        const horario = this.findHorarioBySlot(this.currentSlot);
        if (!horario) return;

        const confirm = window.confirm(
            `Este horario ya está configurado:\n${horario.hora_inicio} - ${horario.hora_fin} (${horario.capacidad_pacientes} pacientes)\n\n¿Qué deseas hacer?\n\nOK = Editar\nCancelar = Eliminar`
        );

        if (confirm) {
            // Editar
            document.getElementById('customHoraInicio').value = horario.hora_inicio;
            document.getElementById('customHoraFin').value = horario.hora_fin;
            document.getElementById('customCapacidad').value = horario.capacidad_pacientes;
            this.showTimeSlotModal();
        } else {
            // Eliminar
            this.removeHorario(this.currentSlot);
        }
    }

    /**
     * Encuentra un horario por slot
     */
    findHorarioBySlot(slot) {
        const especialidadData = this.especialidadesData.get(slot.especialidad);
        if (!especialidadData || !especialidadData.horarios.has(slot.clinica)) {
            return null;
        }

        const horarios = especialidadData.horarios.get(slot.clinica);
        return horarios.find(h => h.dia_semana === slot.dia && h.periodo === slot.periodo);
    }

    /**
     * Remueve un horario
     */
    removeHorario(slot) {
        const especialidadData = this.especialidadesData.get(slot.especialidad);
        if (!especialidadData || !especialidadData.horarios.has(slot.clinica)) {
            return;
        }

        const horarios = especialidadData.horarios.get(slot.clinica);
        const index = horarios.findIndex(h => h.dia_semana === slot.dia && h.periodo === slot.periodo);
        
        if (index > -1) {
            horarios.splice(index, 1);
            this.updateCalendarioState();
            this.updateHorariosConfigurados();
            this.updateNavigationButtons();
        }
    }

    /**
     * Guarda el horario configurado en el modal
     */
    saveTimeSlot() {
        const horaInicio = document.getElementById('customHoraInicio').value;
        const horaFin = document.getElementById('customHoraFin').value;
        const capacidad = parseInt(document.getElementById('customCapacidad').value);

        // Validaciones
        if (!horaInicio || !horaFin) {
            alert('Por favor completa todos los campos.');
            return;
        }

        if (horaInicio >= horaFin) {
            alert('La hora de inicio debe ser anterior a la hora de fin.');
            return;
        }

        // Crear objeto horario
        const horario = {
            id: `horario_${++this.horarioCounter}`,
            especialidad: this.currentSlot.especialidad,
            clinica: this.currentSlot.clinica,
            dia_semana: this.currentSlot.dia,
            periodo: this.currentSlot.periodo,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            capacidad_pacientes: capacidad
        };

        // Guardar en la estructura de datos
        this.saveHorarioToData(horario);
        
        // Actualizar UI
        this.updateCalendarioState();
        this.updateHorariosConfigurados();
        this.updateNavigationButtons();
        
        // Cerrar modal
        this.closeTimeModal();
    }

    /**
     * Guarda el horario en la estructura de datos
     */
    saveHorarioToData(horario) {
        const especialidadData = this.especialidadesData.get(horario.especialidad);
        
        if (!especialidadData.horarios.has(horario.clinica)) {
            especialidadData.horarios.set(horario.clinica, []);
        }
        
        const horarios = especialidadData.horarios.get(horario.clinica);
        
        // Buscar si ya existe un horario para este slot
        const existingIndex = horarios.findIndex(h => 
            h.dia_semana === horario.dia_semana && h.periodo === horario.periodo
        );
        
        if (existingIndex > -1) {
            // Actualizar existente
            horarios[existingIndex] = horario;
        } else {
            // Agregar nuevo
            horarios.push(horario);
        }
    }

    /**
     * Actualiza la lista de horarios configurados para la especialidad actual
     */
    updateHorariosConfigurados() {
        const container = document.getElementById('horariosList');
        
        if (!this.especialidadActiva) {
            container.innerHTML = '<div class="no-horarios"><i class="fas fa-info-circle"></i><span>Selecciona una especialidad</span></div>';
            return;
        }

        const especialidadData = this.especialidadesData.get(this.especialidadActiva);
        let hasHorarios = false;
        let horariosHTML = '';

        if (especialidadData && especialidadData.horarios.has(this.clinicaActual)) {
            const horarios = especialidadData.horarios.get(this.clinicaActual);
            
            if (horarios.length > 0) {
                hasHorarios = true;
                horariosHTML = horarios.map(horario => `
                    <div class="horario-configured">
                        <div class="horario-info">
                            <div class="day">${this.getDiaDisplayName(horario.dia_semana)} - ${horario.periodo}</div>
                            <div class="time">${horario.hora_inicio} - ${horario.hora_fin}</div>
                            <div class="capacity">${horario.capacidad_pacientes} paciente(s)</div>
                        </div>
                        <button class="remove-horario-btn" onclick="dentalSystemNew.removeHorarioFromList('${horario.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }
        }

        if (!hasHorarios) {
            container.innerHTML = `
                <div class="no-horarios">
                    <i class="fas fa-info-circle"></i>
                    <span>Haz clic en los períodos de arriba para configurar tu disponibilidad</span>
                </div>
            `;
        } else {
            container.innerHTML = horariosHTML;
        }
    }

    /**
     * Remueve un horario desde la lista
     */
    removeHorarioFromList(horarioId) {
        // Buscar y remover el horario
        for (const [especialidad, data] of this.especialidadesData) {
            for (const [clinica, horarios] of data.horarios) {
                const index = horarios.findIndex(h => h.id === horarioId);
                if (index > -1) {
                    horarios.splice(index, 1);
                    this.updateCalendarioState();
                    this.updateHorariosConfigurados();
                    this.updateNavigationButtons();
                    return;
                }
            }
        }
    }

    /**
     * Actualiza el resumen final
     */
    updateResumen() {
        this.updateResumenDatos();
        this.updateResumenEspecialidades();
        this.updateResumenHorarios();
    }

    /**
     * Actualiza los datos básicos en el resumen
     */
    updateResumenDatos() {
        const container = document.getElementById('resumenDatos');
        const datos = [
            { label: 'Nombre', value: document.getElementById('nombre_completo').value },
            { label: 'Email', value: document.getElementById('email').value },
            { label: 'Teléfono', value: document.getElementById('telefono').value || 'No especificado' },
            { label: 'Año de Carrera', value: document.getElementById('anio_carrera').value },
            { label: 'Casos Necesarios', value: document.getElementById('casos_necesarios').value },
            { label: 'Ciudad', value: document.getElementById('ciudad').value }
        ];

        container.innerHTML = datos.map(dato => `
            <div class="resumen-item">
                <span class="resumen-label">${dato.label}:</span>
                <span class="resumen-value">${dato.value}</span>
            </div>
        `).join('');
    }

    /**
     * Actualiza las especialidades en el resumen
     */
    updateResumenEspecialidades() {
        const container = document.getElementById('resumenEspecialidades');
        
        if (this.especialidadesSeleccionadas.size === 0) {
            container.innerHTML = '<div class="no-selection">No hay especialidades seleccionadas</div>';
            return;
        }

        const especialidades = Array.from(this.especialidadesSeleccionadas).map(esp => `
            <div class="resumen-item">
                <span class="resumen-label">
                    <i class="${this.especialidadIcons[esp]}"></i>
                    ${esp}
                </span>
                <span class="resumen-value">
                    <i class="fas fa-check" style="color: var(--accent-color);"></i>
                    Seleccionada
                </span>
            </div>
        `).join('');

        container.innerHTML = especialidades;
    }

    /**
     * Actualiza los horarios en el resumen
     */
    updateResumenHorarios() {
        const container = document.getElementById('resumenHorarios');
        let horariosHTML = '';
        let totalHorarios = 0;

        for (const [especialidad, data] of this.especialidadesData) {
            for (const [clinica, horarios] of data.horarios) {
                if (horarios.length > 0) {
                    const horariosEsp = horarios.map(horario => `
                        <div class="resumen-item">
                            <span class="resumen-label">
                                <i class="${this.especialidadIcons[especialidad]}"></i>
                                ${especialidad} - ${this.getDiaDisplayName(horario.dia_semana)}
                            </span>
                            <span class="resumen-value">
                                ${horario.hora_inicio} - ${horario.hora_fin} (${horario.capacidad_pacientes}p)
                            </span>
                        </div>
                    `).join('');
                    
                    horariosHTML += horariosEsp;
                    totalHorarios += horarios.length;
                }
            }
        }

        if (totalHorarios === 0) {
            container.innerHTML = '<div class="no-selection">No hay horarios configurados</div>';
        } else {
            container.innerHTML = horariosHTML;
        }
    }

    /**
     * Obtiene el nombre de display para un día
     */
    getDiaDisplayName(dia) {
        const dias = {
            'lunes': 'Lunes',
            'martes': 'Martes',
            'miercoles': 'Miércoles',
            'jueves': 'Jueves',
            'viernes': 'Viernes',
            'sabado': 'Sábado'
        };
        return dias[dia] || dia;
    }

    /**
     * Cierra el modal de configuración de tiempo
     */
    closeTimeModal() {
        document.getElementById('timeSlotModal').classList.remove('show');
        this.currentSlot = null;
    }

    /**
     * Actualiza los botones de navegación
     */
    updateNavigationButtons() {
        const nextToHorarios = document.getElementById('nextToHorarios');
        const nextToResumen = document.getElementById('nextToResumen');
        const submitBtn = document.getElementById('submitBtn');

        // Botón para ir a horarios
        nextToHorarios.disabled = this.especialidadesSeleccionadas.size === 0;

        // Botón para ir a resumen
        nextToResumen.disabled = !this.hasConfiguredHorarios();

        // Botón de submit
        submitBtn.disabled = !this.hasConfiguredHorarios();
    }

    /**
     * Avanza al siguiente paso principal
     */
    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep = 2;
            this.updateUI();
        }
    }

    /**
     * Retrocede al paso anterior principal
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
        if (this.especialidadesSeleccionadas.size === 0) {
            this.showErrorModal('Debes seleccionar al menos una especialidad.');
            return false;
        }

        // Validar horarios
        if (!this.hasConfiguredHorarios()) {
            this.showErrorModal('Debes configurar al menos un horario para una especialidad.');
            return false;
        }

        return true;
    }

    /**
     * Prepara los datos del formulario para envío
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

        // Convertir estructura de datos a formato de API
        for (const [especialidad, data] of this.especialidadesData) {
            for (const [clinica, horarios] of data.horarios) {
                horarios.forEach(horario => {
                    formData.especialidades_horarios.push({
                        especialidad: especialidad,
                        clinica: clinica,
                        dia_semana: horario.dia_semana,
                        hora_inicio: horario.hora_inicio,
                        hora_fin: horario.hora_fin,
                        capacidad_pacientes: horario.capacidad_pacientes
                    });
                });
            }
        }

        return formData;
    }

    /**
     * Envía el formulario a la API
     */
    async submitForm(formData) {
        const response = await fetch('http://localhost:5000/api/estudiantes/registro-completo', {
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

// Funciones globales para los modales y eventos
function closeTimeModal() {
    document.getElementById('timeSlotModal').classList.remove('show');
    if (window.dentalSystemNew) {
        window.dentalSystemNew.currentSlot = null;
    }
}

function saveTimeSlot() {
    if (window.dentalSystemNew) {
        window.dentalSystemNew.saveTimeSlot();
    }
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dentalSystemNew = new DentalRegistrationSystemNew();
});

// Cerrar modales al hacer clic fuera de ellos
window.addEventListener('click', (event) => {
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const timeModal = document.getElementById('timeSlotModal');
    
    if (event.target === successModal) {
        successModal.classList.remove('show');
    }
    
    if (event.target === errorModal) {
        errorModal.classList.remove('show');
    }
    
    if (event.target === timeModal) {
        closeTimeModal();
    }
});
