// src/utils/constants.ts

// URL del servidor (cambiar según tu red)
//export const API_URL = 'http://192.168.0.10:8000/api';
export const API_URL = 'http://10.144.66.211:8000/api';
export const ESP32_URL = 'http://192.168.0.25';

// Estados de solicitudes
export const ESTADOS_SOLICITUD = {
  PENDIENTE_SOLICITANTE: 'pendiente_solicitante',
  PENDIENTE_JEFE_SECCION: 'pendiente_jefe_seccion',
  PENDIENTE_JEFE_ACTIVOS: 'pendiente_jefe_activos',
  PENDIENTE_SOPORTE: 'pendiente_soporte',
  ASIGNADO: 'asignado',
  EN_PROCESO: 'en_proceso',
  PENDIENTE_CONFORMACION: 'pendiente_conformacion',
  PENDIENTE_JEFE_MANTENIMIENTO: 'pendiente_jefe_mantenimiento',
  COMPLETADO: 'completado',
  RECHAZADO: 'rechazado',
  ARCHIVADO: 'archivado',
} as const;

// Tipos de solicitud
export const TIPOS_SOLICITUD = {
  SIN_MATERIAL: 'sin_material',
  CON_MATERIAL: 'con_material',
} as const;

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin_sistema',
  JEFE_SOPORTE: 'jefe_soporte',
  SOPORTE_TECNICO: 'soporte_tecnico',
  JEFE_SERVICIO: 'jefe_servicio',
} as const;

// Estados de equipos
export const ESTADOS_EQUIPO = {
  OPERATIVO: 'operativo',
  MANTENIMIENTO: 'mantenimiento',
  AVERIADO: 'averiado',
  BAJA: 'baja',
} as const;

// Colores por estado
export const COLORES_ESTADO: Record<string, string> = {
  pendiente_solicitante: '#f59e0b',
  pendiente_jefe_seccion: '#8b5cf6',
  pendiente_jefe_activos: '#ec4898',
  pendiente_soporte: '#3b82f6',
  asignado: '#10b981',
  en_proceso: '#06b6d4',
  pendiente_conformacion: '#84cc16',
  pendiente_jefe_mantenimiento: '#f97316',
  completado: '#6b7280',
  rechazado: '#ef4444',
  archivado: '#9ca3af',
  operativo: '#10b981',
  mantenimiento: '#f59e0b',
  averiado: '#ef4444',
  baja: '#6b7280',
};

// Textos de estado
export const TEXTOS_ESTADO: Record<string, string> = {
  pendiente_solicitante: 'Pendiente',
  pendiente_jefe_seccion: 'En revisión',
  pendiente_jefe_activos: 'Rev. Activos',
  pendiente_soporte: 'En soporte',
  asignado: 'Asignada',
  en_proceso: 'En proceso',
  pendiente_conformacion: 'Conformación',
  pendiente_jefe_mantenimiento: 'Rev. Mantenimiento',
  completado: 'Completada',
  rechazado: 'Rechazada',
  archivado: 'Archivada',
  operativo: 'Operativo',
  mantenimiento: 'Mantenimiento',
  averiado: 'Averiado',
  baja: 'Dado de Baja',
};

// MQTT Topics
export const MQTT_TOPICS = {
  HUELLAS: 'hospital/huellas',
  COMANDOS: 'hospital/comandos',
} as const;

// Timeouts
export const TIMEOUTS = {
  FETCH: 30000,
  POLLING: 1000,
  REGISTRO_HUELLA: 60000,
} as const;