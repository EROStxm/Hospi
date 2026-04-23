// src/servicios/catalogosService.js
import api from './api';

export const catalogosService = {
  // Roles
  obtenerRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener roles' };
    }
  },

  // Sectores
  obtenerSectores: async () => {
    try {
      const response = await api.get('/sectores');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener sectores' };
    }
  }
};