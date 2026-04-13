import api from './api';

export const usuarioService = {
  // Obtener todos los usuarios
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/usuarios', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  // Obtener técnicos
  obtenerTecnicos: async () => {
    try {
      const response = await api.get('/tecnicos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener técnicos' };
    }
  },

  // Obtener usuario por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el usuario' };
    }
  },

  // Crear nuevo usuario
  crear: async (usuario) => {
    try {
      const response = await api.post('/usuarios', usuario);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el usuario' };
    }
  },

  // Actualizar usuario
  actualizar: async (id, usuario) => {
    try {
      const response = await api.put(`/usuarios/${id}`, usuario);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el usuario' };
    }
  },

  // Eliminar usuario
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el usuario' };
    }
  },

  // Cambiar contraseña
  cambiarPassword: async (id, contrasena) => {
    try {
      const response = await api.post(`/usuarios/${id}/cambiar-password`, { contrasena });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar contraseña' };
    }
  }
};