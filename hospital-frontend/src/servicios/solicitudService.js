// src/servicios/solicitudService.js
import api from './api';

export const solicitudService = {
  // Obtener MIS solicitudes (para app móvil y usuarios normales)
  obtenerMisSolicitudes: async (params = {}) => {
    const response = await api.get('/mis-solicitudes', { params });
    // Si la respuesta tiene data.data, devolvemos eso, si no, la respuesta completa
    const data = response.data;
    return {
      ...data,
      data: data.data?.data || data.data || [] // Maneja tanto paginación como array directo
    };
  },

  // Obtener solicitudes pendientes para soporte
  obtenerPendientesSoporte: async () => {
    const response = await api.get('/solicitudes-pendientes');
    const data = response.data;
    return {
      ...data,
      data: data.data?.data || data.data || []
    };
  },

  // Obtener solicitudes de mi sector (jefe de servicio)
  obtenerPorSector: async () => {
    const response = await api.get('/solicitudes-sector');
    const data = response.data;
    return {
      ...data,
      data: data.data?.data || data.data || []
    };
  },

  // Obtener solicitudes para firmar (jefe)
  obtenerParaFirmar: async () => {
    const response = await api.get('/solicitudes-para-firmar');
    const data = response.data;
    return {
      ...data,
      data: data.data?.data || data.data || []
    };
  },

  // Obtener TODAS las solicitudes (admin)
  obtenerTodas: async (params = {}) => {
    const response = await api.get('/solicitudes', { params });
    const data = response.data;
    return {
      ...data,
      data: data.data?.data || data.data || []
    };
  },

  // Obtener detalle de una solicitud
  obtenerPorId: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  // Crear nueva solicitud
  crear: async (datos) => {
    const response = await api.post('/solicitudes', datos);
    return response.data;
  },

  // Firmar solicitud
  firmar: async (id, comentario = null) => {
    const response = await api.post(`/solicitudes/${id}/firmar`, { comentario });
    return response.data;
  },

  // Asignar técnico
  asignarTecnico: async (id, tecnicoId) => {
    const response = await api.post(`/solicitudes/${id}/asignar-tecnico`, { tecnico_id: tecnicoId });
    return response.data;
  },

  // Completar trabajo técnico
  completarTrabajo: async (id, notas) => {
    const response = await api.post(`/solicitudes/${id}/completar-trabajo`, { notas_tecnico: notas });
    return response.data;
  },

  // Registrar uso de materiales
  usarMaterial: async (id, materiales) => {
    const response = await api.post(`/solicitudes/${id}/usar-material`, { materiales });
    return response.data;
  },

  // Generar PDF
  async generarPdf(id) {
      const response = await api.get(`/solicitudes/${id}/pdf`, {
          responseType: 'blob' // Importante para descargar archivo
      });
      return response;
  },

  // Obtener QR
  async obtenerQr(id) {
      const response = await api.get(`/solicitudes/${id}/qr`);
      return response.data;
  }
  
};