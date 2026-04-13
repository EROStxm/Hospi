import api from './api';

export const materialService = {
  // Obtener todos los materiales
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/materiales', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener materiales' };
    }
  },

  // Obtener material por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/materiales/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el material' };
    }
  },

  // Crear nuevo material
  crear: async (material) => {
    try {
      const response = await api.post('/materiales', material);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el material' };
    }
  },

  // Actualizar material
  actualizar: async (id, material) => {
    try {
      const response = await api.put(`/materiales/${id}`, material);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el material' };
    }
  },

  // Eliminar material
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/materiales/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el material' };
    }
  },

  // Ajustar stock
  ajustarStock: async (id, cantidad, tipo, notas = null) => {
    try {
      const response = await api.post(`/materiales/${id}/ajustar-stock`, {
        cantidad,
        tipo,
        notas
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al ajustar stock' };
    }
  },

  // Obtener materiales con stock bajo
  obtenerStockBajo: async () => {
    try {
      const response = await api.get('/materiales-stock-bajo');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener stock bajo' };
    }
  }
};