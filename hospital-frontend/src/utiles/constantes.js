// URL de la API
//export const API_URL = 'http://localhost:8000/api';
//export const API_URL = 'http://192.168.0.10:8000/api';

// src/utiles/constantes.js

// Detectar si estamos en el celular o en la PC
const getApiUrl = () => {
  // Si estamos en el navegador
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Si accedemos desde un celular (IP de la red local)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Usar la IP del servidor (tu PC)
      return 'http://192.168.0.10:8000/api';
    }
  }
  
  // Si estamos en la PC
  return 'http://192.168.0.10:8000/api';
};

export const API_URL = getApiUrl();

console.log('🌐 API URL configurada:', API_URL);

//src/utiles/constantes.js
// Roles del sistema
export const ROLES = {
  ADMIN: 'admin_sistema',
  JEFE_SOPORTE: 'jefe_soporte',
  SOPORTE_TECNICO: 'soporte_tecnico',
  JEFE_SERVICIO: 'jefe_servicio',
  ESPECIALISTA: 'especialista',
  DOCTOR: 'doctor',
  ENFERMERO_JEFE: 'enfermero_jefe',
  ENFERMERA: 'enfermera'
};

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
  ARCHIVADO: 'archivado'
};

// Tipos de solicitud
export const TIPOS_SOLICITUD = {
  SIN_MATERIAL: 'sin_material',
  CON_MATERIAL: 'con_material'
};