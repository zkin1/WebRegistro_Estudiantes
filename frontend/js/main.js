/**
 * Funcionalidad principal del sitio web de registro de estudiantes
 */

class MainApp {
    constructor() {
        this.currentSection = 'inicio';
        this.universities = [
            { id: 'uchile', name: 'Universidad de Chile', city: 'Metropolitana', color: '#1e40af' },
            { id: 'uv', name: 'Universidad de Valparaíso', city: 'Valparaíso', color: '#059669' },
            { id: 'udec', name: 'Universidad de Concepción', city: 'Concepción', color: '#dc2626' }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupUniversitySelection();
    }

    setupEventListeners() {
        // Navegación suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Scroll para cambiar navegación activa
        window.addEventListener('scroll', () => {
            this.updateActiveNavigation();
        });
    }

    setupSmoothScrolling() {
        // Smooth scroll para navegación interna
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupUniversitySelection() {
        const universidadSelect = document.getElementById('universidad');
        const ciudadSelect = document.getElementById('ciudad');
        
        if (universidadSelect && ciudadSelect) {
            // Agregar opciones de universidades
            this.universities.forEach(uni => {
                const option = document.createElement('option');
                option.value = uni.name;
                option.textContent = uni.name;
                option.dataset.city = uni.city;
                universidadSelect.appendChild(option);
            });

            // Cambiar ciudad automáticamente al seleccionar universidad
            universidadSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                if (selectedOption.dataset.city) {
                    ciudadSelect.value = selectedOption.dataset.city;
                }
            });
        }
    }

    // Métodos de navegación
    scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            this.currentSection = sectionId;
            this.updateActiveNavigation();
        }
    }

    updateActiveNavigation() {
        const sections = ['inicio', 'registro', 'informacion'];
        const scrollPosition = window.scrollY + 100;

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.setActiveNavigation(sectionId);
                }
            }
        });
    }

    setActiveNavigation(activeSection) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mainApp = new MainApp();
    console.log('🚀 Aplicación de Registro de Estudiantes inicializada');
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
