import api from './api';

export const authService = {
  login: async (codigo_militar, password) => {
    try {
      const response = await api.post('/login', { codigo_militar, password });
      
      // DEBUG: Ver qué responde el servidor
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        // Guardar token y usuario
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('usuario', JSON.stringify(response.data.user));
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  },

  obtenerUsuarioGuardado: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  estaAutenticado: () => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    return !!(token && usuario);
  },

  obtenerToken: () => {
    return localStorage.getItem('token');
  }
};