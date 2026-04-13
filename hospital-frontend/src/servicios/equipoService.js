import api from './api';

export const equipoService = {
  obtenerTodos: async () => {
    const response = await api.get('/equipos');
    return response.data;
  },
  
  obtenerPorSector: async (sectorId) => {
    const response = await api.get(`/equipos/sector/${sectorId}`);
    return response.data;
  },
};