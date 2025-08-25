# 🦷 Sistema Dental Matching - Registro de Estudiantes

Un sistema moderno y completo para el registro de estudiantes de odontología con especialidades y horarios específicos, diseñado para facilitar el matching automático con pacientes.

## ✨ Características Principales

### 🎯 **Nuevo Sistema de Matching**
- **Formulario de 2 pasos**: Datos básicos + Especialidades y horarios
- **Selección interactiva** de especialidades disponibles
- **Configuración detallada** de horarios por especialidad
- **Validación en tiempo real** de conflictos de horarios
- **Interfaz moderna y responsiva** para todos los dispositivos

### 🏥 **Especialidades Soportadas**
- Endodoncia
- Operatoria Dental
- Periodoncia
- Cirugía Oral
- Prótesis Fija
- Prótesis Removible

### 🕐 **Sistema de Horarios Avanzado**
- **Clínicas específicas**: Niño y Adolescente / Adulto y Gerontología
- **Días de la semana**: Lunes a Sábado
- **Horarios precisos**: Hora de inicio y fin
- **Capacidad de pacientes**: 1-5 pacientes por horario
- **Prevención de conflictos**: Sin solapamientos de horarios

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- MySQL 8.0+
- NPM o Yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd WEB-E
```

### 2. Configurar la base de datos
```bash
# Importar el esquema completo
mysql -u root -p < database_schema.sql

# O usar el script de configuración
mysql -u root -p < backend/setup-database.sql
```

### 3. Configurar variables de entorno
```bash
cd backend
cp env.example .env
```

Editar `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=dental_matching
PORT=5000
NODE_ENV=development
```

### 4. Instalar dependencias
```bash
# Backend
cd backend
npm install

# Frontend (opcional - archivos estáticos)
cd ../frontend
# Los archivos CSS/JS ya están incluidos
```

### 5. Iniciar el servidor
```bash
cd backend
npm start
```

El sistema estará disponible en: `http://localhost:5000`

## 📱 Uso del Sistema

### **Paso 1: Datos Básicos**
- Nombre completo
- Email institucional
- Teléfono (opcional)
- Año de carrera (4to o 5to)
- Casos necesarios este semestre
- Ciudad de residencia

### **Paso 2: Especialidades y Horarios**
1. **Seleccionar especialidades** disponibles
2. **Configurar horarios** para cada especialidad:
   - Clínica (Niño/Adulto)
   - Día de la semana
   - Hora inicio y fin
   - Capacidad de pacientes
3. **Agregar múltiples horarios** por especialidad
4. **Validación automática** de conflictos

### **Ejemplo de Configuración**
```
✅ Especialidad: Endodoncia
   Clínica: Clínica Integral Adulto y Gerontología
   Día: Lunes
   Horario: 08:00 - 13:00
   Capacidad: 2 pacientes

✅ Especialidad: Operatoria Dental
   Clínica: Clínica para el Niño y Adolescente
   Día: Miércoles
   Horario: 16:00 - 20:00
   Capacidad: 1 paciente
```

## 🏗️ Arquitectura del Sistema

### **Frontend (Archivos estáticos)**
```
frontend/
├── index.html          # Formulario principal
├── css/
│   ├── style.css       # Estilos principales
│   └── responsive.css  # Diseño responsivo
└── js/
    ├── main.js         # Lógica principal
    ├── validation.js   # Validaciones
    └── api.js          # Cliente API
```

### **Backend (Node.js + Express)**
```
backend/
├── server.js           # Servidor principal
├── routes/
│   └── estudiantes.js  # Endpoints de la API
├── config/
│   └── database.js     # Configuración de BD
├── middleware/
│   ├── security.js     # Seguridad y rate limiting
│   └── validation.js   # Validaciones del backend
└── services/
    └── studentCodeService.js  # Generación de códigos
```

### **Base de Datos (MySQL)**
- **estudiantes_odontologia**: Datos básicos de estudiantes
- **especialidades_estudiante**: Especialidades y horarios configurados
- **disponibilidad_estudiante**: Tracking de disponibilidad en tiempo real
- **asignaciones_horario**: Asignaciones específicas por horario

## 🔌 API Endpoints

### **POST /api/estudiantes/registro-completo**
Registra un estudiante completo con especialidades y horarios.

**Request Body:**
```json
{
  "nombre_completo": "Juan Pérez García",
  "email": "juan.perez@universidad.cl",
  "telefono": "+56912345678",
  "anio_carrera": "5to",
  "casos_necesarios": 12,
  "ciudad": "Metropolitana",
  "especialidades_horarios": [
    {
      "especialidad": "Endodoncia",
      "clinica": "Clínica Integral Adulto y Gerontología",
      "dia_semana": "lunes",
      "hora_inicio": "08:00",
      "hora_fin": "13:00",
      "capacidad_pacientes": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Estudiante registrado exitosamente con especialidades y horarios",
  "data": {
    "estudiante": { ... },
    "especialidades_registradas": 1,
    "codigo_estudiante": "DENT123456"
  }
}
```

### **GET /api/estudiantes/verificar-email/:email**
Verifica la disponibilidad de un email.

### **GET /api/estudiantes/estadisticas**
Obtiene estadísticas del sistema.

## 🎨 Características de UI/UX

### **Diseño Moderno**
- **Paleta de colores** profesional y médica
- **Tipografía** Inter para máxima legibilidad
- **Iconografía** Font Awesome para claridad visual
- **Animaciones suaves** para mejor experiencia

### **Responsividad Completa**
- **Mobile First** design
- **Breakpoints** optimizados para todos los dispositivos
- **Touch-friendly** para dispositivos móviles
- **Accesibilidad** mejorada con ARIA labels

### **Validación Inteligente**
- **Validación en tiempo real** de campos
- **Verificación de email** automática
- **Prevención de conflictos** de horarios
- **Mensajes de error** claros y específicos

### **Navegación Intuitiva**
- **Progreso visual** del formulario
- **Navegación entre pasos** fluida
- **Botones contextuales** según el estado
- **Feedback inmediato** de acciones

## 🔒 Seguridad y Validaciones

### **Validaciones del Frontend**
- Campos requeridos
- Formato de email
- Formato de teléfono
- Rango de casos necesarios
- Conflictos de horarios

### **Validaciones del Backend**
- Sanitización de datos
- Validación de clínicas permitidas
- Verificación de días válidos
- Prevención de solapamientos
- Transacciones de base de datos

### **Seguridad**
- Rate limiting por IP
- Validación de entrada
- Sanitización de SQL
- Headers de seguridad (Helmet)
- CORS configurado

## 🧪 Testing y Debugging

### **Archivos de Prueba**
- `test-validation.html`: Prueba de validaciones
- `test-registration.js`: Prueba del endpoint de registro
- `debug-email.js`: Debug de verificación de email

### **Logs del Sistema**
- Logs detallados de operaciones
- Tracking de errores
- Métricas de rendimiento

## 🚀 Despliegue

### **Desarrollo Local**
```bash
npm run dev
```

### **Producción**
```bash
npm start
NODE_ENV=production
```

### **Variables de Entorno de Producción**
```env
NODE_ENV=production
DB_HOST=production-db-host
DB_USER=production-user
DB_PASSWORD=production-password
DB_NAME=dental_matching
PORT=5000
```

## 📊 Monitoreo y Mantenimiento

### **Health Check**
```
GET /health
```

### **Logs del Sistema**
- Errores de validación
- Conflictos de horarios
- Operaciones de base de datos
- Métricas de rendimiento

### **Backup de Base de Datos**
```bash
mysqldump -u root -p dental_matching > backup.sql
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email**: info@sistemadental.cl
- **Teléfono**: +56 9 1234 5678
- **Issues**: Usa la sección de Issues de GitHub

## 🔄 Changelog

### **v2.0.0 - Sistema de Matching Completo**
- ✨ Nuevo formulario de 2 pasos
- 🏥 Sistema de especialidades y horarios
- 🎨 UI/UX completamente rediseñada
- 🔒 Validaciones avanzadas
- 📱 Diseño 100% responsivo
- 🚀 API endpoints optimizados

### **v1.0.0 - Sistema Básico**
- 📝 Formulario básico de registro
- 🗄️ Base de datos simple
- 🔐 Validaciones básicas

---

**Desarrollado con ❤️ para la comunidad odontológica**
