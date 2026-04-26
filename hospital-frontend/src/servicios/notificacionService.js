import api from './api';

const notificacionService = {
    // Obtener todas las notificaciones
    async obtenerNotificaciones(page = 1, soloNoLeidas = false) {
        const response = await api.get('/notificaciones', {
            params: {
                page,
                leida: soloNoLeidas ? false : undefined
            }
        });
        return response.data;
    },
    
    // Obtener conteo de no leídas
    async obtenerConteoNoLeidas() {
        const response = await api.get('/notificaciones/conteo-no-leidas');
        return response.data;
    },
    
    // Marcar como leída
    async marcarLeida(id) {
        const response = await api.put(`/notificaciones/${id}/leida`);
        return response.data;
    },
    
    // Marcar todas como leídas
    async marcarTodasLeidas() {
        const response = await api.put('/notificaciones/marcar-todas-leidas');
        return response.data;
    },
    
    // Eliminar notificación
    async eliminarNotificacion(id) {
        const response = await api.delete(`/notificaciones/${id}`);
        return response.data;
    }
};

export default notificacionService;