import api from './api';

export const equipoService = {
  // Obtener todos los equipos
  getAll: async (params?: any) => {
    const response = await api.get('/equipos', { params });
    return response.data;
  },

  // Obtener equipos por sector
  getPorSector: async (sectorId: number) => {
    const response = await api.get(`/equipos/sector/${sectorId}`);
    return response.data;
  },

  // Obtener equipos por categoría
  getPorCategoria: async (categoriaId: number) => {
    const response = await api.get(`/equipos/categoria/${categoriaId}`);
    return response.data;
  },

  // Obtener equipo por ID
  getById: async (id: number) => {
    const response = await api.get(`/equipos/${id}`);
    return response.data;
  },
};