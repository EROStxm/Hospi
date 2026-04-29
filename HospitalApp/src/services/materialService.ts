import api from './api';

export const materialService = {
  // Obtener todos los materiales
  getAll: async (params?: any) => {
    const response = await api.get('/materiales', { params });
    return response.data;
  },

  // Obtener materiales con stock bajo
  getStockBajo: async () => {
    const response = await api.get('/materiales-stock-bajo');
    return response.data;
  },

  // Ajustar stock (admin)
  ajustarStock: async (id: number, cantidad: number, tipo: 'incrementar' | 'decrementar') => {
    const response = await api.post(`/materiales/${id}/ajustar-stock`, {
      cantidad,
      tipo,
    });
    return response.data;
  },
};