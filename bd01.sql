-- =====================================================
-- SISTEMA DE GESTIÓN DE SOLICITUDES DE MANTENIMIENTO
-- HOSPITAL MILITAR
-- VERSIÓN 1.0 - FASE 1 (SIN HARDWARE EXTERNO)
-- =====================================================

-- CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS hospital_mantenimiento;
USE hospital_mantenimiento;

-- =====================================================
-- 1. TABLA DE ROLES (JERARQUÍA Y PERMISOS)
-- =====================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nombre del rol: enfermera, doctor, jefe_sector, etc',
    nivel INT NOT NULL COMMENT 'Nivel jerárquico: 1=menor, 10=mayor',
    descripcion TEXT COMMENT 'Descripción del rol y sus responsabilidades',
    
    -- Permisos específicos
    puede_solicitar_sin_material BOOLEAN DEFAULT TRUE COMMENT 'Puede solicitar mantenimiento sin material',
    puede_solicitar_con_material BOOLEAN DEFAULT FALSE COMMENT 'Puede solicitar mantenimiento con material',
    puede_aprobar_material BOOLEAN DEFAULT FALSE COMMENT 'Puede aprobar el uso de materiales',
    puede_asignar_tecnico BOOLEAN DEFAULT FALSE COMMENT 'Puede asignar técnicos a solicitudes',
    puede_gestionar_inventario BOOLEAN DEFAULT FALSE COMMENT 'Puede gestionar inventario de materiales',
    puede_ver_todas_solicitudes BOOLEAN DEFAULT FALSE COMMENT 'Puede ver todas las solicitudes del hospital',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nivel (nivel)
) ENGINE=InnoDB COMMENT='Roles y permisos del sistema';

-- =====================================================
-- 2. TABLA DE SECTORES (ÁREAS DEL HOSPITAL)
-- =====================================================
CREATE TABLE sectores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL COMMENT 'Código identificador: CARDIO, URGEN, etc',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del sector: Cardiología, Urgencias, etc',
    piso INT COMMENT 'Piso donde se ubica',
    ala VARCHAR(50) COMMENT 'Ala: Norte, Sur, Este, Oeste',
    telefono_extension VARCHAR(20) COMMENT 'Extensión telefónica',
    es_critico BOOLEAN DEFAULT FALSE COMMENT 'Sector crítico: UCI, Quirófanos, etc',
    esta_activo BOOLEAN DEFAULT TRUE COMMENT 'Sector activo en el sistema',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_codigo (codigo),
    INDEX idx_es_critico (es_critico),
    INDEX idx_esta_activo (esta_activo)
) ENGINE=InnoDB COMMENT='Sectores o áreas del hospital';

-- =====================================================
-- 3. TABLA DE CATEGORÍAS DE EQUIPOS
-- =====================================================
CREATE TABLE categorias_equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la categoría: Monitores, Ventiladores, etc',
    descripcion TEXT COMMENT 'Descripción de la categoría',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB COMMENT='Categorías de equipos médicos y técnicos';

-- =====================================================
-- 4. TABLA DE EQUIPOS (ACTIVOS FIJOS DEL HOSPITAL)
-- =====================================================
CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_equipo VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código único del equipo: EQ-001, MON-123, etc',
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del equipo',
    descripcion TEXT COMMENT 'Descripción detallada',
    
    -- Relaciones
    categoria_id INT NOT NULL COMMENT 'Categoría del equipo',
    sector_id INT NOT NULL COMMENT 'Sector donde está ubicado el equipo',
    
    -- Datos técnicos
    marca VARCHAR(100) COMMENT 'Marca del equipo',
    modelo VARCHAR(100) COMMENT 'Modelo del equipo',
    numero_serie VARCHAR(100) COMMENT 'Número de serie del equipo',
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'operativo' COMMENT 'Estado: operativo, mantenimiento, averiado, baja',
    fecha_adquisicion DATE COMMENT 'Fecha de compra o instalación',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias_equipos(id),
    FOREIGN KEY (sector_id) REFERENCES sectores(id),
    
    INDEX idx_codigo_equipo (codigo_equipo),
    INDEX idx_categoria_id (categoria_id),
    INDEX idx_sector_id (sector_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB COMMENT='Catálogo de equipos del hospital (activos fijos)';

-- =====================================================
-- 5. TABLA DE USUARIOS (PERSONAL DEL HOSPITAL)
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_militar VARCHAR(20) UNIQUE NOT NULL COMMENT 'Código militar único del personal',
    nombre_completo VARCHAR(255) NOT NULL COMMENT 'Nombre completo',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Correo institucional',
    contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
    
    -- Datos personales
    grado VARCHAR(100) COMMENT 'Grado militar: Capitán, Teniente, etc',
    especialidad VARCHAR(255) COMMENT 'Especialidad médica si aplica',
    telefono VARCHAR(20) COMMENT 'Teléfono de contacto',
    
    -- Relaciones
    rol_id INT NOT NULL COMMENT 'Rol del usuario',
    sector_id INT NULL COMMENT 'Sector al que pertenece (NULL para soporte/admin)',
    
    -- Autenticación biométrica (Fase 1 - solo huella desde celular)
    hash_huella VARCHAR(255) NULL COMMENT 'Hash de la huella digital registrada',
    huella_registrada_en TIMESTAMP NULL COMMENT 'Fecha de registro de huella',
    
    -- Estado y auditoría
    esta_activo BOOLEAN DEFAULT TRUE COMMENT 'Usuario activo en el sistema',
    ultimo_ingreso_en TIMESTAMP NULL COMMENT 'Último inicio de sesión',
    ultimo_ingreso_ip VARCHAR(45) NULL COMMENT 'IP del último acceso',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (sector_id) REFERENCES sectores(id) ON DELETE SET NULL,
    
    INDEX idx_codigo_militar (codigo_militar),
    INDEX idx_email (email),
    INDEX idx_rol_id (rol_id),
    INDEX idx_sector_id (sector_id),
    INDEX idx_esta_activo (esta_activo),
    INDEX idx_hash_huella (hash_huella)
) ENGINE=InnoDB COMMENT='Usuarios del sistema (personal hospitalario)';

-- =====================================================
-- 6. TABLA DE MATERIALES (INVENTARIO)
-- =====================================================
CREATE TABLE materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código interno del material',
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del material',
    descripcion TEXT COMMENT 'Descripción detallada',
    categoria VARCHAR(100) COMMENT 'Categoría: eléctrico, mecánico, médico, etc',
    
    -- Control de inventario
    stock INT NOT NULL DEFAULT 0 COMMENT 'Cantidad disponible actual',
    stock_minimo INT NOT NULL DEFAULT 5 COMMENT 'Stock mínimo para alerta',
    unidad VARCHAR(50) NOT NULL COMMENT 'Unidad: piezas, metros, litros, etc',
    
    -- Información de compra
    costo_unitario DECIMAL(10,2) NULL COMMENT 'Costo unitario aproximado',
    proveedor VARCHAR(255) NULL COMMENT 'Proveedor habitual',
    
    esta_activo BOOLEAN DEFAULT TRUE COMMENT 'Material activo en inventario',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_codigo (codigo),
    INDEX idx_categoria (categoria),
    INDEX idx_stock (stock),
    INDEX idx_esta_activo (esta_activo)
) ENGINE=InnoDB COMMENT='Catálogo de materiales e inventario';

-- =====================================================
-- 7. TABLA DE SOLICITUDES (REPORTES) - CON 5 FIRMAS
-- =====================================================
CREATE TABLE solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Datos de la solicitud
    tipo_solicitud ENUM('sin_material', 'con_material') NOT NULL COMMENT 'Tipo de solicitud',
    titulo VARCHAR(255) NOT NULL COMMENT 'Título/resumen del problema',
    descripcion TEXT NOT NULL COMMENT 'Descripción detallada',
    
    -- Equipo relacionado
    equipo_id INT NOT NULL COMMENT 'ID del equipo que presenta la falla',
    
    -- Fotos adjuntas (se guardan en servidor, acá la referencia)
    rutas_fotos JSON NULL COMMENT 'Rutas de las fotos adjuntas',
    
    -- Relaciones principales
    solicitante_id INT NOT NULL COMMENT 'ID del usuario que solicita',
    sector_id INT NOT NULL COMMENT 'Sector donde ocurre el problema',
    
    -- =====================================================
    -- LAS 5 FIRMAS DEL PROCESO
    -- =====================================================
    
    -- 1. FIRMA DEL SOLICITANTE (quien reporta el problema)
    solicitante_firmo_en TIMESTAMP NULL COMMENT 'Fecha y hora firma del solicitante',
    solicitante_ip VARCHAR(45) NULL COMMENT 'IP desde donde firmó el solicitante',
    solicitante_dispositivo VARCHAR(255) NULL COMMENT 'Dispositivo usado para firmar',
    
    -- 2. FIRMA DEL JEFE DE SECCIÓN (jefe del área donde ocurre el problema)
    jefe_seccion_firmo_en TIMESTAMP NULL COMMENT 'Fecha y hora firma del jefe de sección',
    jefe_seccion_id INT NULL COMMENT 'ID del jefe de sección que firmó',
    jefe_seccion_ip VARCHAR(45) NULL COMMENT 'IP desde donde firmó el jefe de sección',
    
    -- 3. FIRMA DEL JEFE DE ACTIVOS FIJOS (valida existencia y codificación del equipo)
    jefe_activos_firmo_en TIMESTAMP NULL COMMENT 'Fecha y hora firma del jefe de activos fijos',
    jefe_activos_id INT NULL COMMENT 'ID del jefe de activos fijos que firmó',
    jefe_activos_ip VARCHAR(45) NULL COMMENT 'IP desde donde firmó el jefe de activos fijos',
    
    -- 4. FIRMA DE CONFORMACIÓN (usuario final confirma que el trabajo quedó bien)
    conformacion_firmo_en TIMESTAMP NULL COMMENT 'Fecha y hora firma de conformación',
    conformacion_id INT NULL COMMENT 'ID del usuario que dio conformidad',
    conformacion_ip VARCHAR(45) NULL COMMENT 'IP desde donde se dio conformidad',
    conformacion_comentario TEXT NULL COMMENT 'Comentario sobre la conformidad',
    
    -- 5. FIRMA DEL JEFE DE MANTENIMIENTO (cierra la solicitud)
    jefe_mantenimiento_firmo_en TIMESTAMP NULL COMMENT 'Fecha y hora firma del jefe de mantenimiento',
    jefe_mantenimiento_id INT NULL COMMENT 'ID del jefe de mantenimiento que firmó',
    jefe_mantenimiento_ip VARCHAR(45) NULL COMMENT 'IP desde donde firmó el jefe de mantenimiento',
    
    -- =====================================================
    -- ESTADOS DEL FLUJO
    -- =====================================================
    estado ENUM(
        'pendiente_solicitante',      -- Esperando firma del solicitante
        'pendiente_jefe_seccion',     -- Esperando firma del jefe de sección
        'pendiente_jefe_activos',     -- Esperando firma del jefe de activos fijos
        'pendiente_soporte',          -- En cola de soporte técnico
        'asignado',                    -- Asignado a un técnico
        'en_proceso',                 -- Trabajo en curso
        'pendiente_conformacion',     -- Esperando firma de conformación
        'pendiente_jefe_mantenimiento',-- Esperando firma de cierre
        'completado',                 -- Solicitud completada
        'rechazado',                  -- Solicitud rechazada
        'archivado'                   -- Archivada
    ) DEFAULT 'pendiente_solicitante' COMMENT 'Estado actual de la solicitud',
    
    -- Asignación a soporte técnico
    tecnico_asignado_id INT NULL COMMENT 'Técnico asignado (usuario con rol soporte)',
    tecnico_asignado_en TIMESTAMP NULL COMMENT 'Fecha de asignación',
    
    -- Finalización del trabajo técnico
    trabajo_terminado_en TIMESTAMP NULL COMMENT 'Fecha de finalización del trabajo',
    notas_tecnico TEXT NULL COMMENT 'Notas del técnico al finalizar',
    
    -- Respaldo físico (PDF)
    pdf_generado_en TIMESTAMP NULL COMMENT 'Fecha de generación del PDF',
    pdf_ruta VARCHAR(500) NULL COMMENT 'Ruta del archivo PDF generado',
    codigo_qr VARCHAR(255) NULL COMMENT 'Código QR para seguimiento',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (equipo_id) REFERENCES equipos(id),
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
    FOREIGN KEY (sector_id) REFERENCES sectores(id),
    FOREIGN KEY (jefe_seccion_id) REFERENCES usuarios(id),
    FOREIGN KEY (jefe_activos_id) REFERENCES usuarios(id),
    FOREIGN KEY (conformacion_id) REFERENCES usuarios(id),
    FOREIGN KEY (jefe_mantenimiento_id) REFERENCES usuarios(id),
    FOREIGN KEY (tecnico_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_solicitante_id (solicitante_id),
    INDEX idx_sector_id (sector_id),
    INDEX idx_equipo_id (equipo_id),
    INDEX idx_tecnico_asignado_id (tecnico_asignado_id),
    INDEX idx_estado (estado),
    INDEX idx_tipo_solicitud (tipo_solicitud),
    INDEX idx_creado_en (creado_en),
    INDEX idx_codigo_qr (codigo_qr)
) ENGINE=InnoDB COMMENT='Solicitudes de mantenimiento y soporte técnico';

-- =====================================================
-- 8. TABLA DE MATERIALES UTILIZADOS EN SOLICITUDES
-- =====================================================
CREATE TABLE solicitudes_materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL COMMENT 'ID de la solicitud',
    material_id INT NOT NULL COMMENT 'ID del material usado',
    cantidad_usada INT NOT NULL COMMENT 'Cantidad utilizada',
    
    -- Registro de quién autorizó/registró el uso
    registrado_por_id INT NOT NULL COMMENT 'Usuario que registró el uso',
    registrado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    
    notas TEXT NULL COMMENT 'Notas sobre el uso del material',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiales(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id),
    
    INDEX idx_solicitud_id (solicitud_id),
    INDEX idx_material_id (material_id),
    UNIQUE KEY unique_solicitud_material (solicitud_id, material_id)
) ENGINE=InnoDB COMMENT='Materiales consumidos en cada solicitud';

-- =====================================================
-- 9. TABLA DE COMENTARIOS Y SEGUIMIENTO
-- =====================================================
CREATE TABLE comentarios_solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL COMMENT 'ID de la solicitud',
    usuario_id INT NOT NULL COMMENT 'Usuario que comenta',
    comentario TEXT NOT NULL COMMENT 'Contenido del comentario',
    
    -- Tipo de comentario
    tipo_comentario ENUM('observacion', 'actualizacion', 'cierre', 'rechazo') DEFAULT 'observacion',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    
    INDEX idx_solicitud_id (solicitud_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB COMMENT='Historial de comentarios y seguimiento';

-- =====================================================
-- 10. TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL COMMENT 'Usuario destinatario',
    tipo VARCHAR(50) NOT NULL COMMENT 'Tipo: solicitud_creada, firma_requerida, etc',
    titulo VARCHAR(255) NOT NULL COMMENT 'Título de la notificación',
    mensaje TEXT NOT NULL COMMENT 'Mensaje detallado',
    
    -- Datos relacionados
    solicitud_id INT NULL COMMENT 'Solicitud relacionada (si aplica)',
    leido_en TIMESTAMP NULL COMMENT 'Fecha de lectura',
    
    -- Datos de envío
    enviado_via ENUM('push', 'email', 'web') DEFAULT 'web' COMMENT 'Medio de envío',
    id_externo VARCHAR(255) NULL COMMENT 'ID de notificación externa (Firebase, etc)',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE SET NULL,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_leido_en (leido_en),
    INDEX idx_creado_en (creado_en),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB COMMENT='Sistema de notificaciones';

-- =====================================================
-- 11. TABLA DE LOGS DE ACTIVIDAD (AUDITORÍA)
-- =====================================================
CREATE TABLE logs_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL COMMENT 'Usuario que realizó la acción (NULL si es sistema)',
    accion VARCHAR(100) NOT NULL COMMENT 'Acción realizada: login, crear_solicitud, firmar, etc',
    entidad_tipo VARCHAR(50) NULL COMMENT 'Tipo de entidad: solicitud, usuario, material',
    entidad_id INT NULL COMMENT 'ID de la entidad afectada',
    
    -- Detalles
    datos_anteriores JSON NULL COMMENT 'Datos previos (para actualizaciones)',
    datos_nuevos JSON NULL COMMENT 'Datos nuevos',
    direccion_ip VARCHAR(45) NULL COMMENT 'IP desde donde se realizó',
    agente_usuario VARCHAR(500) NULL COMMENT 'Navegador/dispositivo usado',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_entidad (entidad_tipo, entidad_id),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB COMMENT='Registro de auditoría de todas las acciones';

-- =====================================================
-- DATOS INICIALES - INSERTS DE ROLES
-- =====================================================
INSERT INTO roles (nombre, nivel, descripcion, puede_solicitar_sin_material, puede_solicitar_con_material, puede_aprobar_material, puede_asignar_tecnico, puede_gestionar_inventario, puede_ver_todas_solicitudes) VALUES
('enfermera', 1, 'Personal de enfermería - Puede solicitar mantenimiento sin material', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE),
('enfermero_jefe', 3, 'Jefe de enfermeras - Puede solicitar y aprobar materiales básicos', TRUE, TRUE, TRUE, FALSE, FALSE, FALSE),
('doctor', 4, 'Médico general - Puede solicitar mantenimiento sin material', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE),
('especialista', 5, 'Médico especialista - Puede solicitar con y sin material', TRUE, TRUE, FALSE, FALSE, FALSE, FALSE),
('jefe_seccion', 7, 'Jefe de sección médica - Aprueba solicitudes de su área', TRUE, TRUE, TRUE, FALSE, FALSE, TRUE),
('jefe_activos_fijos', 8, 'Jefe de activos fijos - Valida equipos y codificación', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE),
('soporte_tecnico', 2, 'Personal de soporte - Gestiona solicitudes asignadas', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),
('jefe_soporte', 6, 'Jefe de soporte técnico - Asigna técnicos y gestiona equipo', FALSE, FALSE, FALSE, TRUE, TRUE, TRUE),
('jefe_mantenimiento', 9, 'Jefe de mantenimiento - Aprueba cierre de solicitudes', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('admin_sistema', 10, 'Administrador del sistema - Control total', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- =====================================================
-- DATOS INICIALES - CATEGORÍAS DE EQUIPOS
-- =====================================================
INSERT INTO categorias_equipos (nombre, descripcion) VALUES
('Monitores', 'Monitores de signos vitales, monitores cardiacos, etc'),
('Ventiladores', 'Ventiladores mecánicos, respiradores'),
('Equipos de Imagen', 'Rayos X, Tomógrafos, Resonancias, Ecógrafos'),
('Bombas de Infusión', 'Bombas de medicamentos, jeringas automáticas'),
('Electrocardiógrafos', 'Equipos para electrocardiogramas'),
('Computadoras', 'PCs, laptops, tablets del área médica'),
('Impresoras', 'Impresoras de etiquetas, recetas, reportes'),
('Equipos de Laboratorio', 'Analizadores, centrifugadoras, microscopios'),
('Mobiliario Hospitalario', 'Camas, camillas, sillas de ruedas'),
('Infraestructura', 'Aire acondicionado, iluminación, instalaciones');

-- =====================================================
-- DATOS INICIALES - SECTORES
-- =====================================================
INSERT INTO sectores (codigo, nombre, piso, ala, es_critico) VALUES
('CARDIO', 'Cardiología', 2, 'Norte', FALSE),
('URGEN', 'Urgencias', 1, 'Centro', TRUE),
('QUIR', 'Quirófanos', 3, 'Este', TRUE),
('HOSP', 'Hospitalización', 2, 'Sur', FALSE),
('UCI', 'Unidad de Cuidados Intensivos', 3, 'Oeste', TRUE),
('IMAG', 'Imagenología', 1, 'Norte', FALSE),
('LAB', 'Laboratorio Clínico', 1, 'Este', FALSE),
('PED', 'Pediatría', 2, 'Oeste', FALSE),
('TRAUMA', 'Traumatología', 2, 'Centro', FALSE);

-- =====================================================
-- DATOS INICIALES - EQUIPOS DE EJEMPLO
-- =====================================================
INSERT INTO equipos (codigo_equipo, nombre, descripcion, categoria_id, sector_id, marca, modelo, estado) VALUES
('MON-001', 'Monitor de Signos Vitales', 'Monitor multiparamétrico para UCI', 
 (SELECT id FROM categorias_equipos WHERE nombre = 'Monitores' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'UCI' LIMIT 1), 'Philips', 'MX450', 'operativo'),
('MON-002', 'Monitor Cardiaco', 'Monitor cardiaco de cabecera',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Monitores' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'CARDIO' LIMIT 1), 'GE Healthcare', 'B850', 'operativo'),
('VEN-001', 'Ventilador Mecánico', 'Ventilador para cuidados intensivos',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Ventiladores' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'UCI' LIMIT 1), 'Drager', 'Evita V300', 'operativo'),
('RAY-001', 'Equipo de Rayos X', 'Rayos X digital móvil',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Equipos de Imagen' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'IMAG' LIMIT 1), 'Siemens', 'Mobilett Elara', 'operativo'),
('PC-001', 'Computadora Estación Enfermería', 'PC para registro de pacientes',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Computadoras' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'HOSP' LIMIT 1), 'Dell', 'OptiPlex 3090', 'operativo'),
('IMP-001', 'Impresora Etiquetas', 'Impresora para pulseras y etiquetas',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Impresoras' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'HOSP' LIMIT 1), 'Zebra', 'ZD420', 'operativo'),
('BOM-001', 'Bomba de Infusión', 'Bomba de infusión de medicamentos',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Bombas de Infusión' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'PED' LIMIT 1), 'Baxter', 'Sigma Spectrum', 'operativo'),
('ECG-001', 'Electrocardiógrafo', 'Equipo para electrocardiogramas',
 (SELECT id FROM categorias_equipos WHERE nombre = 'Electrocardiógrafos' LIMIT 1),
 (SELECT id FROM sectores WHERE codigo = 'CARDIO' LIMIT 1), 'Mindray', 'BeneHeart R12', 'operativo');

-- =====================================================
-- DATOS INICIALES - USUARIO ADMINISTRADOR (contraseña: admin123)
-- NOTA: La contraseña 'admin123' hasheada con bcrypt (costo 10)
-- =====================================================
INSERT INTO usuarios (codigo_militar, nombre_completo, email, contrasena, grado, rol_id, esta_activo) VALUES
('ADMIN001', 'Administrador del Sistema', 'admin@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Civil', 
(SELECT id FROM roles WHERE nombre = 'admin_sistema' LIMIT 1), TRUE);

-- =====================================================
-- DATOS INICIALES - USUARIOS DE EJEMPLO (PARA PRUEBAS)
-- =====================================================
-- Contraseña para todos: 12345678
INSERT INTO usuarios (codigo_militar, nombre_completo, email, contrasena, grado, especialidad, rol_id, sector_id, esta_activo) VALUES
-- Jefes de sección
('JEFSEC001', 'Dr. Carlos Mendoza', 'carlos.mendoza@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Coronel', 'Cardiología', 
 (SELECT id FROM roles WHERE nombre = 'jefe_seccion' LIMIT 1), (SELECT id FROM sectores WHERE codigo = 'CARDIO' LIMIT 1), TRUE),
 
('JEFSEC002', 'Dra. Laura Vargas', 'laura.vargas@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Teniente Coronel', 'Urgencias',
 (SELECT id FROM roles WHERE nombre = 'jefe_seccion' LIMIT 1), (SELECT id FROM sectores WHERE codigo = 'URGEN' LIMIT 1), TRUE),

-- Jefe de Activos Fijos
('JEFACT001', 'Ing. Roberto Sánchez', 'roberto.sanchez@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mayor', 'Ingeniero Biomédico',
 (SELECT id FROM roles WHERE nombre = 'jefe_activos_fijos' LIMIT 1), NULL, TRUE),

-- Jefe de Mantenimiento
('JEFMANT001', 'Ing. Miguel Torres', 'miguel.torres@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mayor', 'Ingeniero Mecánico',
 (SELECT id FROM roles WHERE nombre = 'jefe_mantenimiento' LIMIT 1), NULL, TRUE),

-- Doctores y Especialistas
('DOC001', 'Dra. Ana Ramírez', 'ana.ramirez@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Capitán', 'Cardiología',
 (SELECT id FROM roles WHERE nombre = 'especialista' LIMIT 1), (SELECT id FROM sectores WHERE codigo = 'CARDIO' LIMIT 1), TRUE),

('DOC002', 'Dr. Luis Fernández', 'luis.fernandez@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Teniente', 'Medicina General',
 (SELECT id FROM roles WHERE nombre = 'doctor' LIMIT 1), (SELECT id FROM sectores WHERE codigo = 'URGEN' LIMIT 1), TRUE),

-- Enfermeras
('ENF001', 'María Gonzales', 'maria.gonzales@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sargento Primero', 'Enfermería',
 (SELECT id FROM roles WHERE nombre = 'enfermera' LIMIT 1), (SELECT id FROM sectores WHERE codigo = 'HOSP' LIMIT 1), TRUE),

('ENF002', 'José Martínez', 'jose.martinez@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sargento', 'Enfermería',
 (SELECT id FROM roles WHERE nombre = 'enfermera' LIMIT 1), (SELECT id FROM sectores WHERE codigo = 'UCI' LIMIT 1), TRUE),

-- Soporte Técnico
('TEC001', 'Carlos Rojas', 'carlos.rojas@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cabo Primero', 'Electrónico',
 (SELECT id FROM roles WHERE nombre = 'soporte_tecnico' LIMIT 1), NULL, TRUE),

('TEC002', 'Pedro Castillo', 'pedro.castillo@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cabo', 'Mecánico',
 (SELECT id FROM roles WHERE nombre = 'soporte_tecnico' LIMIT 1), NULL, TRUE),

('JEFSOP001', 'Ing. Ricardo Díaz', 'ricardo.diaz@hospital.mil', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mayor', 'Ingeniero Electrónico',
 (SELECT id FROM roles WHERE nombre = 'jefe_soporte' LIMIT 1), NULL, TRUE);

-- =====================================================
-- DATOS INICIALES - MATERIALES DE EJEMPLO
-- =====================================================
INSERT INTO materiales (codigo, nombre, descripcion, categoria, stock, stock_minimo, unidad) VALUES
('CABLE-HDMI', 'Cable HDMI 2m', 'Cable para conexión de monitores', 'electrónico', 25, 5, 'piezas'),
('FUENTE-PC', 'Fuente de poder 500W', 'Fuente para computadoras', 'electrónico', 8, 3, 'piezas'),
('MULTICONTACTO', 'Multicontacto 5 tomas', 'Regleta con protección', 'eléctrico', 15, 5, 'piezas'),
('BATERIA-UPS', 'Batería UPS 12V 7Ah', 'Batería para sistemas de respaldo', 'eléctrico', 12, 4, 'piezas'),
('VENTILADOR', 'Ventilador 120mm', 'Ventilador para equipos', 'mecánico', 20, 6, 'piezas'),
('TINTA-IMPRESORA', 'Cartucho tinta negra', 'Para impresoras láser', 'consumible', 10, 3, 'unidades'),
('PAPEL-BOND', 'Papel bond A4', 'Resma 500 hojas', 'consumible', 45, 10, 'resmas'),
('DESTORNILLADOR', 'Juego destornilladores', 'Set de precisión', 'herramienta', 8, 2, 'juegos'),
('SENSOR-TEMP', 'Sensor de temperatura', 'Para equipos médicos', 'electrónico', 15, 5, 'piezas'),
('BATERIA-AA', 'Baterías AA', 'Pack de 4 unidades', 'consumible', 100, 20, 'paquetes');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para solicitudes con información completa
CREATE VIEW vw_solicitudes_completas AS
SELECT 
    s.id,
    s.tipo_solicitud,
    s.titulo,
    s.descripcion,
    s.estado,
    s.creado_en,
    s.solicitante_firmo_en,
    s.jefe_seccion_firmo_en,
    s.jefe_activos_firmo_en,
    s.conformacion_firmo_en,
    s.jefe_mantenimiento_firmo_en,
    s.trabajo_terminado_en,
    -- Datos del solicitante
    u_sol.nombre_completo AS solicitante_nombre,
    u_sol.grado AS solicitante_grado,
    -- Datos del sector
    sec.nombre AS sector_nombre,
    sec.codigo AS sector_codigo,
    -- Datos del equipo
    eq.codigo_equipo,
    eq.nombre AS equipo_nombre,
    cat.nombre AS categoria_equipo,
    -- Datos del técnico asignado
    u_tec.nombre_completo AS tecnico_nombre,
    -- Descripción del estado
    CASE 
        WHEN s.estado = 'pendiente_solicitante' THEN 'Pendiente firma del solicitante'
        WHEN s.estado = 'pendiente_jefe_seccion' THEN 'Pendiente firma del jefe de sección'
        WHEN s.estado = 'pendiente_jefe_activos' THEN 'Pendiente firma de activos fijos'
        WHEN s.estado = 'pendiente_soporte' THEN 'En cola de soporte'
        WHEN s.estado = 'asignado' THEN 'Asignado a técnico'
        WHEN s.estado = 'en_proceso' THEN 'Trabajo en curso'
        WHEN s.estado = 'pendiente_conformacion' THEN 'Esperando conformidad'
        WHEN s.estado = 'pendiente_jefe_mantenimiento' THEN 'Esperando cierre'
        WHEN s.estado = 'completado' THEN 'Completado'
        WHEN s.estado = 'rechazado' THEN 'Rechazado'
        ELSE s.estado
    END AS descripcion_estado
FROM solicitudes s
LEFT JOIN usuarios u_sol ON s.solicitante_id = u_sol.id
LEFT JOIN sectores sec ON s.sector_id = sec.id
LEFT JOIN equipos eq ON s.equipo_id = eq.id
LEFT JOIN categorias_equipos cat ON eq.categoria_id = cat.id
LEFT JOIN usuarios u_tec ON s.tecnico_asignado_id = u_tec.id;

-- Vista para alertas de inventario
CREATE VIEW vw_alerta_inventario AS
SELECT 
    m.id,
    m.codigo,
    m.nombre,
    m.stock,
    m.stock_minimo,
    m.unidad,
    (m.stock - m.stock_minimo) AS diferencia_stock,
    CASE 
        WHEN m.stock <= 0 THEN 'CRÍTICO - SIN STOCK'
        WHEN m.stock < m.stock_minimo THEN 'ALERTA - Stock bajo'
        WHEN m.stock = m.stock_minimo THEN 'EN LÍMITE'
        ELSE 'OK'
    END AS nivel_alerta
FROM materiales m
WHERE m.esta_activo = TRUE
ORDER BY nivel_alerta DESC, stock ASC;

-- Vista para equipos con sus últimos mantenimientos
CREATE VIEW vw_equipos_ultimo_mantenimiento AS
SELECT 
    e.id,
    e.codigo_equipo,
    e.nombre AS equipo_nombre,
    e.estado,
    sec.nombre AS sector_nombre,
    cat.nombre AS categoria_nombre,
    (
        SELECT MAX(s.creado_en) 
        FROM solicitudes s 
        WHERE s.equipo_id = e.id AND s.estado = 'completado'
    ) AS ultimo_mantenimiento,
    (
        SELECT COUNT(*) 
        FROM solicitudes s 
        WHERE s.equipo_id = e.id AND s.estado IN ('completado', 'en_proceso')
    ) AS total_mantenimientos
FROM equipos e
LEFT JOIN sectores sec ON e.sector_id = sec.id
LEFT JOIN categorias_equipos cat ON e.categoria_id = cat.id;

-- =====================================================
-- TRIGGER PARA LOG AUTOMÁTICO
-- =====================================================

DELIMITER //

-- Trigger para registrar creación de solicitudes en logs_actividad
CREATE TRIGGER trg_solicitudes_after_insert
AFTER INSERT ON solicitudes
FOR EACH ROW
BEGIN
    INSERT INTO logs_actividad (usuario_id, accion, entidad_tipo, entidad_id, direccion_ip)
    VALUES (NEW.solicitante_id, 'crear_solicitud', 'solicitud', NEW.id, NEW.solicitante_ip);
END//

-- Trigger para registrar cambios de estado en solicitudes
CREATE TRIGGER trg_solicitudes_after_update
AFTER UPDATE ON solicitudes
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO logs_actividad (usuario_id, accion, entidad_tipo, entidad_id, datos_anteriores, datos_nuevos)
        VALUES (NULL, 'cambiar_estado', 'solicitud', NEW.id, 
                JSON_OBJECT('estado_anterior', OLD.estado),
                JSON_OBJECT('estado_nuevo', NEW.estado));
    END IF;
END//

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes en solicitudes
CREATE INDEX idx_solicitudes_estado_creado ON solicitudes(estado, creado_en);
CREATE INDEX idx_solicitudes_solicitante_estado ON solicitudes(solicitante_id, estado);
CREATE INDEX idx_solicitudes_sector_estado ON solicitudes(sector_id, estado);
CREATE INDEX idx_solicitudes_equipo_estado ON solicitudes(equipo_id, estado);

-- Índice para búsqueda de usuarios por rol y sector
CREATE INDEX idx_usuarios_rol_sector ON usuarios(rol_id, sector_id);

-- Índice para búsqueda de equipos por código
CREATE INDEX idx_equipos_codigo_estado ON equipos(codigo_equipo, estado);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================