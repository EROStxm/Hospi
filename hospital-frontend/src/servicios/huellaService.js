import api from './api';
// src/servicios/huellaService.js
export const huellaService = {
  // Registrar huella de un usuario
  registrar: async (userId, template) => {
    const response = await api.post('/huellas/registrar', {
      user_id: userId,
      template: template
    });
    return response.data;
  },

  // Verificar huella (login)
  verificar: async (template) => {
    const response = await api.post('/login-huella', { template });
    return response.data;
  },

  // Eliminar huella de un usuario
  eliminar: async (userId) => {
    const response = await api.post(`/huellas/eliminar/${userId}`);
    return response.data;
  },

  // Obtener usuarios con huella registrada
  obtenerUsuariosConHuella: async () => {
    const response = await api.get('/huellas/usuarios');
    return response.data;
  }
};