-- =====================================================
-- CREAR BASE DE DATOS
-- =====================================================
DROP DATABASE IF EXISTS hospital_mantenimiento;
CREATE DATABASE hospital_mantenimiento;
USE hospital_mantenimiento;

-- =====================================================
-- 1. TABLA DE ROLES
-- =====================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nombre del rol',
    nivel INT NOT NULL COMMENT 'Nivel jerárquico: 1=menor, 10=mayor',
    descripcion TEXT COMMENT 'Descripción del rol',
    
    puede_aprobar_material BOOLEAN DEFAULT FALSE,
    puede_asignar_tecnico BOOLEAN DEFAULT FALSE,
    puede_gestionar_inventario BOOLEAN DEFAULT FALSE,
    puede_ver_todas_solicitudes BOOLEAN DEFAULT FALSE,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nivel (nivel)
) ENGINE=InnoDB COMMENT='Roles y permisos del sistema';

-- =====================================================
-- 2. TABLA DE SECTORES
-- =====================================================
CREATE TABLE sectores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    piso INT,
    telefono_extension VARCHAR(20),
    es_critico BOOLEAN DEFAULT FALSE,
    esta_activo BOOLEAN DEFAULT TRUE,
    
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
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB COMMENT='Categorías de equipos médicos y técnicos';

-- =====================================================
-- 4. TABLA DE EQUIPOS
-- =====================================================
CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_equipo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    categoria_id INT NOT NULL,
    sector_id INT NOT NULL,
    
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    
    estado VARCHAR(50) DEFAULT 'operativo',
    fecha_adquisicion DATE,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias_equipos(id),
    FOREIGN KEY (sector_id) REFERENCES sectores(id),
    
    INDEX idx_codigo_equipo (codigo_equipo),
    INDEX idx_categoria_id (categoria_id),
    INDEX idx_sector_id (sector_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB COMMENT='Catálogo de equipos del hospital';

-- =====================================================
-- 5. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_militar VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña en texto plano - TEMPORAL SOLO PARA DESARROLLO',
    
    grado VARCHAR(100),
    especialidad VARCHAR(255),
    telefono VARCHAR(20),
    
    rol_id INT NOT NULL,
    sector_id INT NULL,
    
    huella VARCHAR(255) NULL COMMENT 'Template de huella digital - TEXTO PLANO TEMPORAL',
    huella_registrada_en TIMESTAMP NULL,
    
    esta_activo BOOLEAN DEFAULT TRUE,
    ultimo_ingreso_en TIMESTAMP NULL,
    ultimo_ingreso_ip VARCHAR(45) NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (sector_id) REFERENCES sectores(id) ON DELETE SET NULL,
    
    INDEX idx_codigo_militar (codigo_militar),
    INDEX idx_email (email),
    INDEX idx_rol_id (rol_id),
    INDEX idx_sector_id (sector_id),
    INDEX idx_esta_activo (esta_activo)
) ENGINE=InnoDB COMMENT='Usuarios del sistema';

-- =====================================================
-- 6. TABLA DE MATERIALES
-- =====================================================
CREATE TABLE materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    unidad VARCHAR(50) NOT NULL,
    
    costo_unitario DECIMAL(10,2) NULL,
    
    esta_activo BOOLEAN DEFAULT TRUE,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_codigo (codigo),
    INDEX idx_categoria (categoria),
    INDEX idx_stock (stock),
    INDEX idx_esta_activo (esta_activo)
) ENGINE=InnoDB COMMENT='Catálogo de materiales e inventario';

-- =====================================================
-- 7. TABLA DE SOLICITUDES
-- =====================================================
CREATE TABLE solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    tipo_solicitud ENUM('sin_material', 'con_material') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    
    equipo_id INT NULL COMMENT 'Puede ser NULL si no hay equipo asignado',
    
    rutas_fotos JSON NULL,
    
    solicitante_id INT NOT NULL,
    sector_id INT NOT NULL,
    
    -- Firmas del proceso
    solicitante_firmo_en TIMESTAMP NULL,
    solicitante_ip VARCHAR(45) NULL,
    solicitante_dispositivo VARCHAR(255) NULL,
    
    jefe_seccion_firmo_en TIMESTAMP NULL,
    jefe_seccion_id INT NULL,
    jefe_seccion_ip VARCHAR(45) NULL,
    
    jefe_activos_firmo_en TIMESTAMP NULL,
    jefe_activos_id INT NULL,
    jefe_activos_ip VARCHAR(45) NULL,
    
    conformacion_firmo_en TIMESTAMP NULL,
    conformacion_id INT NULL,
    conformacion_ip VARCHAR(45) NULL,
    conformacion_comentario TEXT NULL,
    
    jefe_mantenimiento_firmo_en TIMESTAMP NULL,
    jefe_mantenimiento_id INT NULL,
    jefe_mantenimiento_ip VARCHAR(45) NULL,
    
    -- Estados
    estado ENUM(
        'pendiente_solicitante',
        'pendiente_jefe_seccion',
        'pendiente_jefe_activos',
        'pendiente_soporte',
        'asignado',
        'en_proceso',
        'pendiente_conformacion',
        'pendiente_jefe_mantenimiento',
        'completado',
        'rechazado',
        'archivado'
    ) DEFAULT 'pendiente_solicitante',
    
    tecnico_asignado_id INT NULL,
    tecnico_asignado_en TIMESTAMP NULL,
    
    trabajo_terminado_en TIMESTAMP NULL,
    notas_tecnico TEXT NULL,
    
    pdf_generado_en TIMESTAMP NULL,
    pdf_ruta VARCHAR(500) NULL,
    codigo_qr VARCHAR(255) NULL,
    
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
) ENGINE=InnoDB COMMENT='Solicitudes de mantenimiento';

-- =====================================================
-- 8. TABLA DE MATERIALES UTILIZADOS
-- =====================================================
CREATE TABLE solicitudes_materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    material_id INT NOT NULL,
    cantidad_usada INT NOT NULL,
    
    registrado_por_id INT NOT NULL,
    registrado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    notas TEXT NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiales(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id),
    
    INDEX idx_solicitud_id (solicitud_id),
    INDEX idx_material_id (material_id),
    UNIQUE KEY idx_unique_solicitud_material (solicitud_id, material_id)
) ENGINE=InnoDB COMMENT='Materiales consumidos en cada solicitud';

-- =====================================================
-- 9. TABLA DE COMENTARIOS
-- =====================================================
CREATE TABLE comentarios_solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    
    tipo_comentario ENUM('observacion', 'actualizacion', 'cierre', 'rechazo') DEFAULT 'observacion',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    
    INDEX idx_solicitud_id (solicitud_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB COMMENT='Historial de comentarios';

-- =====================================================
-- 10. TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    
    solicitud_id INT NULL,
    leido_en TIMESTAMP NULL,
    
    enviado_via ENUM('push', 'email', 'web') DEFAULT 'web',
    id_externo VARCHAR(255) NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE SET NULL,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_leido_en (leido_en),
    INDEX idx_creado_en (creado_en),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB COMMENT='Sistema de notificaciones';

-- =====================================================
-- 11. TABLA DE LOGS DE ACTIVIDAD
-- =====================================================
CREATE TABLE logs_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad_tipo VARCHAR(50) NULL,
    entidad_id INT NULL,
    
    datos_anteriores JSON NULL,
    datos_nuevos JSON NULL,
    direccion_ip VARCHAR(45) NULL,
    agente_usuario VARCHAR(500) NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_entidad (entidad_tipo, entidad_id),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB COMMENT='Registro de auditoría';

-- =====================================================
-- 12. TABLAS PARA FASE 2 (VACÍAS POR AHORA)
-- =====================================================
CREATE TABLE rfid_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    rfid_uid VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    dispositivo VARCHAR(100),
    exitoso BOOLEAN DEFAULT TRUE,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_rfid_uid (rfid_uid),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB COMMENT='Logs de lecturas RFID (Fase 2)';

CREATE TABLE esp32_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100),
    sector_id INT NULL,
    estado ENUM('online', 'offline', 'mantenimiento') DEFAULT 'offline',
    ultima_conexion TIMESTAMP NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sector_id) REFERENCES sectores(id) ON DELETE SET NULL,
    INDEX idx_device_id (device_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB COMMENT='Dispositivos ESP32 (Fase 2)';


-- =====================================================
-- INSERCIÓN DE DATOS DE PRUEBA
-- =====================================================

-- 1. ROLES BÁSICOS
INSERT INTO roles (nombre, nivel, descripcion, puede_aprobar_material, puede_asignar_tecnico, puede_gestionar_inventario, puede_ver_todas_solicitudes) VALUES
('enfermera', 1, 'Personal de enfermería básico', FALSE, FALSE, FALSE, FALSE),
('enfermero_jefe', 2, 'Jefe de enfermería', TRUE, FALSE, FALSE, TRUE),
('doctor', 3, 'Médico general', FALSE, FALSE, FALSE, FALSE),
('especialista', 4, 'Médico especialista', TRUE, FALSE, FALSE, FALSE),
('jefe_servicio', 5, 'Jefe de servicio médico', TRUE, FALSE, FALSE, TRUE),
('soporte_tecnico', 6, 'Técnico de mantenimiento', FALSE, TRUE, FALSE, TRUE),
('jefe_soporte', 7, 'Jefe de soporte técnico', TRUE, TRUE, TRUE, TRUE),
('admin_sistema', 10, 'Administrador del sistema', TRUE, TRUE, TRUE, TRUE);

-- 2. SECTORES
INSERT INTO sectores (codigo, nombre, piso, telefono_extension, es_critico, esta_activo) VALUES
('URG', 'Urgencias', 1, '1001', TRUE, TRUE),
('UCI', 'Unidad de Cuidados Intensivos', 2, '1002', TRUE, TRUE),
('CARDIO', 'Cardiología', 3, '1003', FALSE, TRUE),
('PED', 'Pediatría', 4, '1004', FALSE, TRUE),
('QROF', 'Quirófano', 2, '1005', TRUE, TRUE),
('LAB', 'Laboratorio', 1, '1006', FALSE, TRUE),
('RX', 'Radiología', 1, '1007', FALSE, TRUE),
('SOPORTE', 'Soporte Técnico', 0, '2000', FALSE, TRUE);

-- =====================================================
-- CONTINUACIÓN DE DATOS DE PRUEBA
-- =====================================================

-- 3. CATEGORÍAS DE EQUIPOS (continuación)
INSERT INTO categorias_equipos (nombre, descripcion) VALUES
('Monitores de Signos Vitales', 'Monitores para medición de constantes vitales'),
('Ventiladores Mecánicos', 'Equipos de ventilación asistida'),
('Desfibriladores', 'Equipos de desfibrilación cardíaca'),
('Bombas de Infusión', 'Bombas para administración de medicamentos'),
('Electrocardiógrafos', 'Equipos para ECG'),
('Rayos X', 'Equipos de radiología'),
('Esterilizadores', 'Autoclaves y equipos de esterilización'),
('Sistemas de Aire Acondicionado', 'HVAC y climatización'),
('Ascensores', 'Elevadores del hospital'),
('Sistemas de Iluminación', 'Luminarias quirúrgicas y generales');

-- 4. EQUIPOS
INSERT INTO equipos (codigo_equipo, nombre, descripcion, categoria_id, sector_id, marca, modelo, numero_serie, estado, fecha_adquisicion) VALUES
('COS-10-001', 'Monitor Signos Vitales UCI 01', 'Monitor multiparamétrico', 1, 2, 'Philips', 'MX800', 'SN-2021-001', 'operativo', '2021-03-15'),
('COS-10-002', 'Ventilador UCI 01', 'Ventilador mecánico', 2, 2, 'Dräger', 'Evita V500', 'SN-2021-002', 'operativo', '2021-03-15'),
('COS-10-003', 'Desfibrilador Urgencias', 'Desfibrilador bifásico', 3, 1, 'Zoll', 'R Series', 'SN-2021-003', 'operativo', '2021-04-20'),
('COS-10-004', 'Bomba Infusión Cardio 01', 'Bomba de infusión volumétrica', 4, 3, 'B Braun', 'Infusomat Space', 'SN-2021-004', 'operativo', '2021-05-10'),
('COS-10-005', 'Monitor Signos Vitales Quirófano', 'Monitor de anestesia', 1, 5, 'GE', 'Carescape B650', 'SN-2021-005', 'operativo', '2021-06-05'),
('COS-10-006', 'Electrocardiógrafo Cardio', 'ECG de 12 derivaciones', 5, 3, 'Mortara', 'ELI 280', 'SN-2021-006', 'mantenimiento', '2021-02-18'),
('COS-10-007', 'Equipo Rayos X Portátil', 'Radiología móvil', 6, 7, 'Siemens', 'Mobilett XP', 'SN-2021-007', 'operativo', '2021-07-22'),
('COS-10-008', 'Autoclave Central', 'Esterilizador a vapor', 7, 5, 'Tuttnauer', 'Elara 11', 'SN-2021-008', 'operativo', '2021-01-30'),
('COS-10-009', 'Monitor Signos Vitales Ped', 'Monitor pediátrico', 1, 4, 'Nihon Kohden', 'BSM-3763', 'SN-2021-009', 'operativo', '2021-08-12'),
('COS-10-010', 'Ventilador Pediátrico', 'Ventilador para pediatría', 2, 4, 'Dräger', 'Babylog VN500', 'SN-2021-010', 'averiado', '2021-09-05'),
('COS-10-011', 'Aire Acondicionado UCI', 'Sistema HVAC', 8, 2, 'Carrier', 'AquaSnap 30RB', 'SN-2021-011', 'operativo', '2021-11-10'),
('COS-10-012', 'Ascensor Principal', 'Elevador de personal', 9, 8, 'Otis', 'Gen2 Comfort', 'SN-2021-012', 'operativo', '2021-12-01');

-- 5. USUARIOS (INCLUYENDO AL ADMIN ERICK)
INSERT INTO usuarios (codigo_militar, nombre_completo, email, contrasena, grado, especialidad, telefono, rol_id, sector_id, esta_activo) VALUES
-- Admin del sistema (ERICK)
('9895625', 'Erick Administrador', 'erick.admin@hospitalmilitar.mil', 'admin123', 'Capitán', 'Sistemas', '555-1000', 8, 8, TRUE),

-- Jefe de Soporte
('9895001', 'Roberto Méndez Torres', 'roberto.mendez@hospitalmilitar.mil', 'jefesoporte123', 'Mayor', 'Ingeniería Biomédica', '555-1001', 7, 8, TRUE),

-- Técnicos de Soporte
('9895002', 'Carlos Ramírez López', 'carlos.ramirez@hospitalmilitar.mil', 'tecnico123', 'Sargento', 'Electromecánica', '555-1002', 6, 8, TRUE),
('9895003', 'Ana María Solís', 'ana.solis@hospitalmilitar.mil', 'tecnico123', 'Cabo', 'Electrónica', '555-1003', 6, 8, TRUE),
('9895004', 'Jorge Gutiérrez Paz', 'jorge.gutierrez@hospitalmilitar.mil', 'tecnico123', 'Sargento', 'Mecánica', '555-1004', 6, 8, TRUE),

-- Jefe Servicio Cardiología
('9895101', 'Dr. Fernando Castillo Rojas', 'fcastillo@hospitalmilitar.mil', 'jefecardio123', 'Coronel', 'Cardiología', '555-1101', 5, 3, TRUE),

-- Especialistas Cardiología
('9895102', 'Dra. Patricia Vargas León', 'pvargas@hospitalmilitar.mil', 'especialista123', 'Teniente Coronel', 'Cardiología Intervencionista', '555-1102', 4, 3, TRUE),

-- Doctores Cardiología
('9895103', 'Dr. Luis Enrique Paz', 'lpaz@hospitalmilitar.mil', 'doctor123', 'Mayor', 'Medicina Interna', '555-1103', 3, 3, TRUE),

-- Jefe Servicio Urgencias
('9895201', 'Dr. Miguel Ángel Soto', 'msoto@hospitalmilitar.mil', 'jefeurg123', 'Coronel', 'Medicina de Emergencias', '555-1201', 5, 1, TRUE),

-- Doctor Urgencias
('9895202', 'Dra. Carolina Méndez', 'cmendez@hospitalmilitar.mil', 'doctor123', 'Capitán', 'Medicina General', '555-1202', 3, 1, TRUE),

-- Enfermero Jefe Urgencias
('9895203', 'Lic. Martha Elena Ríos', 'mrios@hospitalmilitar.mil', 'enfermero123', 'Teniente', 'Enfermería', '555-1203', 2, 1, TRUE),

-- Enfermeras Urgencias
('9895204', 'Tec. Rosa María Flores', 'rflores@hospitalmilitar.mil', 'enfermera123', 'Sargento', 'Enfermería', '555-1204', 1, 1, TRUE),
('9895205', 'Tec. Juan Carlos Pérez', 'jcperez@hospitalmilitar.mil', 'enfermera123', 'Cabo', 'Enfermería', '555-1205', 1, 1, TRUE),

-- Jefe UCI
('9895301', 'Dr. Alberto Núñez Vega', 'anunez@hospitalmilitar.mil', 'jefeuci123', 'Coronel', 'Medicina Crítica', '555-1301', 5, 2, TRUE),

-- Especialista UCI
('9895302', 'Dr. Ricardo Silva Mora', 'rsilva@hospitalmilitar.mil', 'especialista123', 'Teniente Coronel', 'Terapia Intensiva', '555-1302', 4, 2, TRUE),

-- Enfermero Jefe UCI
('9895303', 'Lic. Patricia Solano Díaz', 'psolano@hospitalmilitar.mil', 'enfermero123', 'Capitán', 'Enfermería Crítica', '555-1303', 2, 2, TRUE),

-- Enfermera UCI
('9895304', 'Tec. María Isabel Cruz', 'micruz@hospitalmilitar.mil', 'enfermera123', 'Sargento', 'Enfermería', '555-1304', 1, 2, TRUE),

-- Jefe Pediatría
('9895401', 'Dra. Carmen Rosa Vega', 'cvega@hospitalmilitar.mil', 'jefeped123', 'Coronel', 'Pediatría', '555-1401', 5, 4, TRUE),

-- Doctora Pediatría
('9895402', 'Dr. José Manuel Paz', 'jpaz@hospitalmilitar.mil', 'doctor123', 'Mayor', 'Pediatría', '555-1402', 3, 4, TRUE),

-- Enfermera Pediatría
('9895403', 'Tec. Luisa Fernanda Rojas', 'lrojas@hospitalmilitar.mil', 'enfermera123', 'Sargento', 'Enfermería Pediátrica', '555-1403', 1, 4, TRUE),

-- Jefe Quirófano
('9895501', 'Dr. Oscar Renato Fuentes', 'ofuentes@hospitalmilitar.mil', 'jefequirofano123', 'Coronel', 'Cirugía General', '555-1501', 5, 5, TRUE),

-- Especialista Quirófano
('9895502', 'Dra. Verónica Paz Toledo', 'vpaz@hospitalmilitar.mil', 'especialista123', 'Teniente Coronel', 'Anestesiología', '555-1502', 4, 5, TRUE),

-- Enfermera Quirófano
('9895503', 'Tec. Gabriela Mistral', 'gmistral@hospitalmilitar.mil', 'enfermera123', 'Sargento', 'Enfermería Quirúrgica', '555-1503', 1, 5, TRUE),

-- Jefe Laboratorio
('9895601', 'Dr. Raúl Espinoza Méndez', 'respinoza@hospitalmilitar.mil', 'jefelab123', 'Coronel', 'Patología Clínica', '555-1601', 5, 6, TRUE),

-- Técnico Laboratorio
('9895602', 'Tec. Mario Bros Navarro', 'mbros@hospitalmilitar.mil', 'tecnico123', 'Sargento', 'Laboratorio Clínico', '555-1602', 6, 6, TRUE),

-- Jefe Radiología
('9895701', 'Dr. Enrique Salazar Linares', 'esalazar@hospitalmilitar.mil', 'jeferx123', 'Coronel', 'Radiología', '555-1701', 5, 7, TRUE),

-- Técnico Radiología
('9895702', 'Tec. Laura Elena Vega', 'lvega@hospitalmilitar.mil', 'tecnico123', 'Cabo', 'Radiología', '555-1702', 6, 7, TRUE);

-- 6. MATERIALES
INSERT INTO materiales (codigo, nombre, descripcion, categoria, stock, stock_minimo, unidad, costo_unitario, esta_activo) VALUES
('MAT-001', 'Electrodo para ECG', 'Electrodos desechables para monitoreo cardíaco', 'insumos_medicos', 500, 50, 'piezas', 5.50, TRUE),
('MAT-002', 'Gel Conductor', 'Gel para electrodos y ultrasonido', 'insumos_medicos', 50, 10, 'litros', 120.00, TRUE),
('MAT-003', 'Sensor SpO2 Adulto', 'Sensor de oxigenación para adulto', 'sensores', 25, 5, 'piezas', 450.00, TRUE),
('MAT-004', 'Sensor SpO2 Pediátrico', 'Sensor de oxigenación pediátrico', 'sensores', 15, 3, 'piezas', 520.00, TRUE),
('MAT-005', 'Brazalete Presión Adulto', 'Brazalete para toma de presión no invasiva', 'accesorios', 30, 5, 'piezas', 180.00, TRUE),
('MAT-006', 'Manguera de Ventilador', 'Circuito para ventilador mecánico adulto', 'accesorios', 20, 5, 'juegos', 850.00, TRUE),
('MAT-007', 'Filtro HEPA Ventilador', 'Filtro antibacteriano para ventilador', 'filtros', 40, 10, 'piezas', 95.00, TRUE),
('MAT-008', 'Batería Monitor 12V', 'Batería recargable para monitores', 'electricos', 12, 3, 'piezas', 1200.00, TRUE),
('MAT-009', 'Fusible 5A', 'Fusible de protección 5 amperios', 'electricos', 100, 20, 'piezas', 8.00, TRUE),
('MAT-010', 'Fusible 10A', 'Fusible de protección 10 amperios', 'electricos', 100, 20, 'piezas', 8.00, TRUE),
('MAT-011', 'Cable ECG 3 Derivaciones', 'Cable para monitor con 3 derivaciones', 'accesorios', 15, 3, 'piezas', 650.00, TRUE),
('MAT-012', 'Cable ECG 5 Derivaciones', 'Cable para monitor con 5 derivaciones', 'accesorios', 10, 2, 'piezas', 850.00, TRUE),
('MAT-013', 'Tornillo M4x10', 'Tornillería para equipos', 'ferreteria', 500, 50, 'piezas', 1.50, TRUE),
('MAT-014', 'Lámpara Quirófano LED', 'Lámpara de repuesto para lámpara quirúrgica', 'iluminacion', 8, 2, 'piezas', 3500.00, TRUE),
('MAT-015', 'Aceite Lubricante', 'Aceite para mantenimiento de equipos mecánicos', 'lubricantes', 10, 2, 'litros', 250.00, TRUE);

-- 7. SOLICITUDES (EJEMPLOS EN DIFERENTES ESTADOS)

-- Solicitud 1: Completada (sin material) - Cardiología
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id, 
    solicitante_firmo_en, solicitante_ip, solicitante_dispositivo,
    jefe_seccion_firmo_en, jefe_seccion_id, jefe_seccion_ip,
    jefe_activos_firmo_en, jefe_activos_id, jefe_activos_ip,
    conformacion_firmo_en, conformacion_id, conformacion_ip, conformacion_comentario,
    jefe_mantenimiento_firmo_en, jefe_mantenimiento_id, jefe_mantenimiento_ip,
    estado, tecnico_asignado_id, tecnico_asignado_en, trabajo_terminado_en, notas_tecnico,
    pdf_generado_en, pdf_ruta, codigo_qr)
VALUES (
    'sin_material', 'Monitor no enciende', 'El monitor de signos vitales no enciende al presionar el botón de encendido',
    5, 9, 3,
    '2024-01-10 08:30:00', '192.168.1.110', 'iPhone 13',
    '2024-01-10 08:45:00', 7, '192.168.1.101',
    '2024-01-10 09:00:00', 2, '192.168.1.250',
    '2024-01-10 11:30:00', 9, '192.168.1.110', 'Excelente trabajo, equipo funcionando correctamente',
    '2024-01-10 11:45:00', 2, '192.168.1.250',
    'completado', 3, '2024-01-10 09:15:00', '2024-01-10 11:15:00', 'Se reemplazó fusible de protección y se limpiaron contactos internos',
    '2024-01-10 12:00:00', '/pdfs/solicitud_1_20240110.pdf', 'QR-HOSP-001');

-- Material usado en solicitud 1
INSERT INTO solicitudes_materiales (solicitud_id, material_id, cantidad_usada, registrado_por_id, notas) VALUES
(1, 9, 2, 3, 'Fusibles de 5A reemplazados');

-- Comentario en solicitud 1
INSERT INTO comentarios_solicitudes (solicitud_id, usuario_id, comentario, tipo_comentario) VALUES
(1, 3, 'Solicitud recibida, asignando a técnico Carlos Ramírez', 'actualizacion');

-- Solicitud 2: Pendiente de firma jefe sección (con material) - UCI
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id,
    solicitante_firmo_en, solicitante_ip, solicitante_dispositivo,
    rutas_fotos, estado)
VALUES (
    'con_material', 'Ventilador con alarma de presión', 'El ventilador mecánico muestra alarma de presión alta intermitente',
    2, 17, 2,
    '2024-01-15 09:15:00', '192.168.1.130', 'Samsung Galaxy S22',
    '["/fotos/ventilador_uci_001.jpg", "/fotos/ventilador_uci_002.jpg"]',
    'pendiente_jefe_seccion');

-- Solicitud 3: Asignada a técnico - Urgencias
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id,
    solicitante_firmo_en, solicitante_ip, solicitante_dispositivo,
    jefe_seccion_firmo_en, jefe_seccion_id, jefe_seccion_ip,
    jefe_activos_firmo_en, jefe_activos_id, jefe_activos_ip,
    estado, tecnico_asignado_id, tecnico_asignado_en)
VALUES (
    'sin_material', 'Desfibrilador no carga', 'El desfibrilador no carga al presionar botón de carga',
    3, 10, 1,
    '2024-01-15 14:20:00', '192.168.1.120', 'iPad Pro',
    '2024-01-15 14:35:00', 10, '192.168.1.120',
    '2024-01-15 14:50:00', 2, '192.168.1.250',
    'asignado', 4, '2024-01-15 15:00:00');

-- Solicitud 4: Pendiente de firma del solicitante - Pediatría
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id,
    rutas_fotos, estado)
VALUES (
    'con_material', 'Monitor pediátrico con pantalla parpadeante', 'La pantalla del monitor pediátrico parpadea constantemente dificultando la lectura',
    9, 21, 4,
    '["/fotos/monitor_ped_001.jpg"]',
    'pendiente_solicitante');

-- Solicitud 5: En proceso - Quirófano
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id,
    solicitante_firmo_en, solicitante_ip, solicitante_dispositivo,
    jefe_seccion_firmo_en, jefe_seccion_id, jefe_seccion_ip,
    jefe_activos_firmo_en, jefe_activos_id, jefe_activos_ip,
    estado, tecnico_asignado_id, tecnico_asignado_en)
VALUES (
    'con_material', 'Autoclave no alcanza temperatura', 'El autoclave no alcanza la temperatura de esterilización requerida',
    8, 24, 5,
    '2024-01-14 10:00:00', '192.168.1.150', 'Samsung Galaxy Tab',
    '2024-01-14 10:20:00', 22, '192.168.1.151',
    '2024-01-14 10:40:00', 2, '192.168.1.250',
    'en_proceso', 5, '2024-01-14 11:00:00');

-- Solicitud 6: Pendiente de conformación - Radiología
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id,
    solicitante_firmo_en, solicitante_ip, solicitante_dispositivo,
    jefe_seccion_firmo_en, jefe_seccion_id, jefe_seccion_ip,
    jefe_activos_firmo_en, jefe_activos_id, jefe_activos_ip,
    estado, tecnico_asignado_id, tecnico_asignado_en, trabajo_terminado_en, notas_tecnico)
VALUES (
    'sin_material', 'Rayos X portátil no emite radiación', 'El equipo de rayos X portátil no emite radiación al disparar',
    7, 28, 7,
    '2024-01-13 09:00:00', '192.168.1.170', 'iPad Air',
    '2024-01-13 09:15:00', 27, '192.168.1.171',
    '2024-01-13 09:30:00', 2, '192.168.1.250',
    'pendiente_conformacion', 3, '2024-01-13 10:00:00', '2024-01-13 14:30:00', 'Se recalibró el tubo de rayos X y se actualizó firmware');

-- Solicitud 7: Rechazada - Cardiología
INSERT INTO solicitudes (tipo_solicitud, titulo, descripcion, equipo_id, solicitante_id, sector_id,
    solicitante_firmo_en, solicitante_ip, solicitante_dispositivo,
    estado)
VALUES (
    'con_material', 'Solicitud duplicada - Cancelar', 'Esta solicitud ya fue reportada en el ticket #001',
    6, 8, 3,
    '2024-01-16 08:00:00', '192.168.1.111', 'iPhone 14',
    'rechazado');

-- Comentario de rechazo
INSERT INTO comentarios_solicitudes (solicitud_id, usuario_id, comentario, tipo_comentario) VALUES
(7, 7, 'Solicitud duplicada. El equipo ya está en mantenimiento con solicitud #001', 'rechazo');

-- 8. NOTIFICACIONES
INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, solicitud_id, leido_en, enviado_via) VALUES
(7, 'firma_requerida', 'Firma pendiente - Ventilador UCI', 'Tiene una solicitud de material pendiente de firma para Ventilador UCI', 2, NULL, 'push'),
(4, 'asignacion_tecnico', 'Nueva solicitud asignada', 'Se le ha asignado la solicitud #003 - Desfibrilador Urgencias', 3, NULL, 'push'),
(27, 'conformacion_pendiente', 'Conformación de trabajo terminado', 'El técnico ha finalizado el trabajo en equipo Rayos X. Por favor confirme', 6, NULL, 'push'),
(2, 'stock_bajo', 'Alerta de stock bajo', 'El material Sensor SpO2 Pediátrico está por debajo del stock mínimo (3 unidades)', NULL, NULL, 'web'),
(2, 'stock_bajo', 'Alerta de stock bajo', 'El material Fusible 5A está por debajo del stock mínimo (15 unidades)', NULL, NULL, 'web');

-- 9. LOGS DE ACTIVIDAD
INSERT INTO logs_actividad (usuario_id, accion, entidad_tipo, entidad_id, datos_nuevos, direccion_ip, agente_usuario) VALUES
(1, 'login', 'usuario', 1, '{"email": "erick.admin@hospitalmilitar.mil"}', '192.168.1.100', 'Chrome/120.0'),
(9, 'crear_solicitud', 'solicitud', 1, '{"tipo": "sin_material", "equipo": "COS-10-005"}', '192.168.1.110', 'Mobile App iOS'),
(17, 'crear_solicitud', 'solicitud', 2, '{"tipo": "con_material", "equipo": "COS-10-002"}', '192.168.1.130', 'Mobile App Android'),
(2, 'asignar_tecnico', 'solicitud', 1, '{"tecnico_id": 3, "nombre": "Carlos Ramírez"}', '192.168.1.250', 'Chrome/120.0'),
(3, 'iniciar_trabajo', 'solicitud', 1, '{"estado": "en_proceso"}', '192.168.1.102', 'Chrome/120.0'),
(3, 'finalizar_trabajo', 'solicitud', 1, '{"notas": "Se reemplazó fusible de protección"}', '192.168.1.102', 'Chrome/120.0'),
(9, 'dar_conformidad', 'solicitud', 1, '{"comentario": "Excelente trabajo"}', '192.168.1.110', 'Mobile App iOS'),
(2, 'cerrar_solicitud', 'solicitud', 1, '{"estado": "completado"}', '192.168.1.250', 'Chrome/120.0');

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar estructura
SELECT 'Roles' as Tabla, COUNT(*) as Registros FROM roles
UNION ALL SELECT 'Sectores', COUNT(*) FROM sectores
UNION ALL SELECT 'Categorías Equipos', COUNT(*) FROM categorias_equipos
UNION ALL SELECT 'Equipos', COUNT(*) FROM equipos
UNION ALL SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'Materiales', COUNT(*) FROM materiales
UNION ALL SELECT 'Solicitudes', COUNT(*) FROM solicitudes
UNION ALL SELECT 'Solicitudes Materiales', COUNT(*) FROM solicitudes_materiales
UNION ALL SELECT 'Comentarios', COUNT(*) FROM comentarios_solicitudes
UNION ALL SELECT 'Notificaciones', COUNT(*) FROM notificaciones
UNION ALL SELECT 'Logs Actividad', COUNT(*) FROM logs_actividad;

-- Verificar usuario admin Erick
SELECT * FROM usuarios WHERE codigo_militar = '9895625';

-- Ver solicitudes con sus estados
SELECT s.id, s.titulo, s.estado, 
       u.nombre_completo as solicitante,
       sec.nombre as sector,
       e.nombre as equipo
FROM solicitudes s
JOIN usuarios u ON s.solicitante_id = u.id
JOIN sectores sec ON s.sector_id = sec.id
LEFT JOIN equipos e ON s.equipo_id = e.id
ORDER BY s.creado_en DESC;

