import api from './api';

export const equipoService = {
  // Obtener todos los equipos
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/equipos', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipos' };
    }
  },

  // Obtener equipo por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el equipo' };
    }
  },

  // Crear nuevo equipo
  crear: async (equipo) => {
    try {
      const response = await api.post('/equipos', equipo);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el equipo' };
    }
  },

  // Actualizar equipo
  actualizar: async (id, equipo) => {
    try {
      const response = await api.put(`/equipos/${id}`, equipo);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el equipo' };
    }
  },

  // Eliminar equipo
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el equipo' };
    }
  },

  // Obtener equipos por sector
  obtenerPorSector: async (sectorId) => {
    try {
      const response = await api.get(`/equipos/sector/${sectorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipos del sector' };
    }
  },

  // Obtener equipos por categoría
  obtenerPorCategoria: async (categoriaId) => {
    try {
      const response = await api.get(`/equipos/categoria/${categoriaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipos de la categoría' };
    }
  }
};