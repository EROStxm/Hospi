import api, { API_URL } from './api';

export const solicitudService = {
  // Obtener todas las solicitudes (según rol)
  getAll: async (params?: any) => {
    const response = await api.get('/solicitudes', { params });
    return response.data;
  },

  // Mis solicitudes
  getMisSolicitudes: async () => {
    const response = await api.get('/mis-solicitudes');
    return response.data;
  },

  // Solicitudes para firmar (jefe de servicio)
  getParaFirmar: async () => {
    const response = await api.get('/solicitudes-para-firmar');
    return response.data;
  },

  // Solicitudes pendientes de soporte
  getPendientesSoporte: async () => {
    const response = await api.get('/solicitudes-pendientes');
    return response.data;
  },

  // Solicitudes por sector
  getPorSector: async () => {
    const response = await api.get('/solicitudes-sector');
    return response.data;
  },

  // Obtener solicitud por ID
  getById: async (id: number) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  // Crear nueva solicitud
  create: async (data: any) => {
    const response = await api.post('/solicitudes', data);
    return response.data;
  },

  // Firmar solicitud
  firmar: async (id: number, firma_data?: string) => {
    const response = await api.post(`/solicitudes/${id}/firmar`, { firma_data });
    return response.data;
  },

  // Asignar técnico
  asignarTecnico: async (id: number, tecnico_id: number) => {
    const response = await api.post(`/solicitudes/${id}/asignar-tecnico`, { tecnico_id });
    return response.data;
  },

  // Completar trabajo
  completarTrabajo: async (id: number, observaciones: string) => {
    const response = await api.post(`/solicitudes/${id}/completar-trabajo`, { observaciones });
    return response.data;
  },

  // Usar material
  usarMaterial: async (id: number, material_id: number, cantidad_usada: number) => {
    const response = await api.post(`/solicitudes/${id}/usar-material`, {
      material_id,
      cantidad_usada,
    });
    return response.data;
  },

  // Obtener QR
  getQRCode: async (id: number): Promise<string> => {
    const response = await api.get(`/solicitudes/${id}/qr`);
    return response.data.qr || response.data.url;
  },

  // Obtener URL del PDF
  getPDFUrl: (id: number): string => {
    return `${API_URL}/solicitudes/${id}/pdf`;
  },

  // Obtener estadísticas (dashboard)
  getEstadisticas: async () => {
    const response = await api.get('/estadisticas');
    return response.data;
  },
};