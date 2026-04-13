import api from './api';

export const sectorService = {
  // Obtener todos los sectores
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/sectores', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener sectores' };
    }
  },

  // Obtener sector por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/sectores/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el sector' };
    }
  },

  // Crear nuevo sector
  crear: async (sector) => {
    try {
      const response = await api.post('/sectores', sector);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el sector' };
    }
  },

  // Actualizar sector
  actualizar: async (id, sector) => {
    try {
      const response = await api.put(`/sectores/${id}`, sector);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el sector' };
    }
  },

  // Eliminar sector
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/sectores/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el sector' };
    }
  }
};