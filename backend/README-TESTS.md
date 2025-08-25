# 🧪 Sistema de Tests de la API de Registro

## Descripción

Este sistema de tests verifica que la API de registro de estudiantes funcione correctamente **SIN** generación de códigos. Los códigos de estudiante se asignan desde otra API separada durante el proceso de matching.

## 🚀 Ejecutar Tests

### Opción 1: Usando npm
```bash
npm test
```

### Opción 2: Ejecutar directamente
```bash
node test-api.js
```

## 📋 Tests Incluidos

### 1. **Conexión a la Base de Datos**
- Verifica que la API pueda conectarse a la base de datos
- Test básico de conectividad

### 2. **Verificación de NO Generación de Códigos**
- ✅ Confirma que el campo `codigo_estudiante` permite NULL
- ✅ Verifica que no existe la función `generateUniqueStudentCode`
- ✅ Asegura que la API solo se encarga del registro

### 3. **Test de Registro Básico**
- Registra un estudiante con datos básicos
- Verifica que se inserte **SIN** código asignado
- Confirma que el campo `codigo_estudiante` sea `NULL`

### 4. **Test de Registro Completo**
- Registra un estudiante con especialidades y horarios
- Verifica la inserción en ambas tablas
- Confirma que no se genere código automáticamente

### 5. **Test de Verificación de Email**
- Verifica la funcionalidad de verificación de disponibilidad
- Confirma que emails únicos sean detectados como disponibles

### 6. **Test de Estadísticas**
- Verifica que se puedan obtener estadísticas del sistema
- Confirma conteos de estudiantes y agrupaciones

### 7. **Limpieza de Datos de Test**
- Elimina automáticamente todos los datos de prueba
- Mantiene la base de datos limpia

## 🎯 Objetivos del Sistema

### ✅ **Lo que SÍ hace esta API:**
- Registro de estudiantes con datos básicos
- Registro de especialidades y horarios
- Verificación de disponibilidad de emails
- Obtención de estadísticas del sistema
- Validación de datos de entrada

### ❌ **Lo que NO hace esta API:**
- **NO genera códigos de estudiante**
- **NO asigna identificadores únicos**
- **NO maneja el proceso de matching**

## 🔄 Flujo de Trabajo

```
1. Estudiante se registra → API guarda datos SIN código
2. Otra API de matching → Asigna código único
3. Sistema completo → Estudiante con código asignado
```

## 📊 Resultados Esperados

### Test Exitoso:
```
🎉 ¡TODOS LOS TESTS PASARON! La API está funcionando correctamente.
```

### Si Fallan Tests:
```
⚠️  Algunos tests fallaron. Revisa los errores arriba.
```

## 🛠️ Requisitos

- Base de datos MySQL configurada
- Variables de entorno configuradas en `.env`
- Dependencias instaladas (`npm install`)

## 🔧 Configuración

Asegúrate de tener configurado tu archivo `.env`:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
DB_PORT=3306
```

## 📝 Notas Importantes

- Los tests crean datos temporales que se eliminan automáticamente
- No se modifican datos existentes en la base de datos
- Los tests verifican específicamente que NO se generen códigos
- La API está diseñada para trabajar en conjunto con otra API de matching

## 🚨 Solución de Problemas

### Error de Conexión:
- Verifica que MySQL esté ejecutándose
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos exista

### Tests Fallando:
- Revisa los logs de error específicos
- Confirma que la estructura de la base de datos sea correcta
- Verifica que no haya funciones de generación de códigos

## 📞 Soporte

Si tienes problemas con los tests, verifica:
1. Configuración de la base de datos
2. Variables de entorno
3. Dependencias instaladas
4. Estructura de la base de datos
