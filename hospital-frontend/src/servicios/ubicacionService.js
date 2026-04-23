import api from './api';
// src/servicios/ubicacionService.js
export const ubicacionService = {
  // Obtener todas las ubicaciones
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/ubicaciones', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener ubicaciones' };
    }
  },

  // Obtener ubicaciones por sector
  obtenerPorSector: async (sectorId) => {
    try {
      const response = await api.get(`/sectores/${sectorId}/ubicaciones`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener ubicaciones del sector' };
    }
  },

  // Obtener ubicación por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/ubicaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener la ubicación' };
    }
  },

  // Crear nueva ubicación
  crear: async (ubicacion) => {
    try {
      const response = await api.post('/ubicaciones', ubicacion);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear la ubicación' };
    }
  },

  // Actualizar ubicación
  actualizar: async (id, ubicacion) => {
    try {
      const response = await api.put(`/ubicaciones/${id}`, ubicacion);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar la ubicación' };
    }
  },

  // Eliminar ubicación
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/ubicaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar la ubicación' };
    }
  }
};