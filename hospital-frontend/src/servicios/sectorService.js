import api from './api';

export const sectorService = {
  obtenerTodos: async () => {
    const response = await api.get('/sectores');
    return response.data;
  },
};