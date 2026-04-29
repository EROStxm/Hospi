// src/services/huellaService.ts
import api from './api';

// IP del ESP32 (cambiar según tu red)
import { ESP32_URL } from '../utils/constants';
const ESP32_IP = ESP32_URL;

// Función fetch con timeout manual
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number = 5000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    ),
  ]) as Promise<Response>;
};

export const huellaService = {
  // Verificar si el ESP32 está conectado
  verificarESP32: async (): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(`${ESP32_IP}/estado`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 3000);
      return response.ok;
    } catch (error) {
      console.error('ESP32 no disponible:', error);
      return false;
    }
  },

  // Iniciar registro de huella (envía comando al ESP32)
  iniciarRegistro: async (userId: number): Promise<any> => {
    try {
      const response = await fetchWithTimeout(`${ESP32_IP}/iniciar-registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      }, 10000);
      
      if (!response.ok) {
        throw new Error('Error al iniciar registro');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error iniciando registro:', error);
      throw error;
    }
  },

  // Verificar estado del registro (polling)
  verificarEstadoRegistro: async (userId: number): Promise<any> => {
    try {
      const response = await fetchWithTimeout(`${ESP32_IP}/estado-registro/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 3000);
      return await response.json();
    } catch (error) {
      console.error('Error verificando estado:', error);
      return { paso: 0, completado: false, error: true };
    }
  },

  // Obtener estado actual del sensor
  getEstadoSensor: async (): Promise<any> => {
    try {
      const response = await fetchWithTimeout(`${ESP32_IP}/estado`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 3000);
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      return { registrando: false, paso: 0, error: true };
    }
  },

  // Limpiar memoria del sensor
  limpiarSensor: async (): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(`${ESP32_IP}/limpiar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 5000);
      return response.ok;
    } catch (error) {
      console.error('Error limpiando sensor:', error);
      return false;
    }
  },

  // Obtener información del sensor (huellas almacenadas)
  getInfoSensor: async (): Promise<any> => {
    try {
      // Esta información viene del backend (Laravel)
      const response = await api.get('/huellas/info-sensor');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo info del sensor:', error);
      return { huellas_memoria: 0, capacidad_maxima: 127 };
    }
  },

  // Registrar huella en base de datos (llamada por el ESP32)
  registrarEnBD: async (userId: number, template: string): Promise<any> => {
    const response = await api.post('/huellas/registrar', {
      user_id: userId,
      template: template,
    });
    return response.data;
  },

  // Eliminar huella de un usuario
  eliminarHuella: async (userId: number): Promise<any> => {
    const response = await api.post(`/huellas/eliminar/${userId}`);
    return response.data;
  },

  // Verificar huella (login con huella)
  verificarHuella: async (template: string): Promise<any> => {
    const response = await api.post('/login-huella', { template });
    return response.data;
  },

  // Obtener usuarios con huella registrada
  obtenerUsuariosConHuella: async (): Promise<any> => {
    const response = await api.get('/huellas/usuarios');
    return response.data;
  },
};