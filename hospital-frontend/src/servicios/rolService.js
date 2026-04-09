import api from './api';

export const rolService = {
  // Obtener todos los roles
  obtenerTodos: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener roles' };
    }
  },

  // Obtener rol por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el rol' };
    }
  },

  // Crear nuevo rol
  crear: async (rol) => {
    try {
      const response = await api.post('/roles', rol);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el rol' };
    }
  },

  // Actualizar rol
  actualizar: async (id, rol) => {
    try {
      const response = await api.put(`/roles/${id}`, rol);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el rol' };
    }
  },

  // Eliminar rol
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el rol' };
    }
  }
};