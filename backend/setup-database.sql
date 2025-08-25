-- Script para configurar la base de datos del sistema de matching dental
-- Ejecutar este script en MySQL/MariaDB

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS dental_matching
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE dental_matching;

-- Crear la tabla de estudiantes si no existe
CREATE TABLE IF NOT EXISTS estudiantes_odontologia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_estudiante VARCHAR(20) UNIQUE NULL, -- Ahora es NULL por defecto
    nombre_completo VARCHAR(255) NOT NULL,
    año_carrera ENUM('4to', '5to') NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    universidad VARCHAR(255),
    ciudad VARCHAR(100) NOT NULL,
    especialidades JSON NOT NULL,
    dias_disponibles JSON NOT NULL,
    horarios_disponibles JSON NOT NULL,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_email (email),
    INDEX idx_codigo_estudiante (codigo_estudiante),
    INDEX idx_ciudad (ciudad),
    INDEX idx_universidad (universidad),
    INDEX idx_estado (estado),
    INDEX idx_fecha_registro (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de códigos de estudiantes para evitar duplicados (opcional)
CREATE TABLE IF NOT EXISTS codigos_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_codigo (codigo),
    INDEX idx_usado (usado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunos códigos de ejemplo
INSERT IGNORE INTO codigos_estudiantes (codigo) VALUES
('EST-2024-001'),
('EST-2024-002'),
('EST-2024-003'),
('EST-2024-004'),
('EST-2024-005');

-- Mostrar mensaje de confirmación
SELECT 'Base de datos dental_matching configurada correctamente' as mensaje;
SELECT 'Tabla estudiantes_odontologia creada' as tabla_estudiantes;
SELECT 'Tabla codigos_estudiantes creada' as tabla_codigos;
SELECT 'Códigos de ejemplo insertados' as codigos_ejemplo;
SELECT 'NOTA: Los códigos se asignarán desde otra API durante el matching' as nota_importante;
