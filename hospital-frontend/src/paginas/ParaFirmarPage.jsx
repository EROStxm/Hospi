// src/paginas/ParaFirmarPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiEye, FiAlertCircle, FiUser, FiMapPin, FiBox } from 'react-icons/fi';
import '../estilos/para-firmar.css';

const ParaFirmarPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual] = useState(JSON.parse(localStorage.getItem('usuario') || '{}'));

  useEffect(() => {
    cargarSolicitudesParaFirmar();
  }, []);

  const cargarSolicitudesParaFirmar = async () => {
    try {
      setCargando(true);
      const response = await solicitudService.obtenerParaFirmar();
      console.log('📦 Solicitudes para firmar:', response);
      
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setSolicitudes(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar solicitudes pendientes de firma');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDetalle = (id) => {
    navigate(`/solicitudes/${id}`);
  };

  const handleFirmar = async (id) => {
    try {
      const response = await solicitudService.firmar(id);
      if (response.success) {
        toast.success('¡Solicitud firmada correctamente!');
        cargarSolicitudesParaFirmar(); // Recargar lista
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al firmar');
    }
  };

  const getTiempoEspera = (fechaCreacion) => {
    if (!fechaCreacion) return 'N/A';
    const creado = new Date(fechaCreacion);
    const ahora = new Date();
    const diffHoras = Math.floor((ahora - creado) / (1000 * 60 * 60));
    
    if (diffHoras < 1) return 'Menos de 1 hora';
    if (diffHoras < 24) return `${diffHoras} horas`;
    const dias = Math.floor(diffHoras / 24);
    return `${dias} días`;
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando solicitudes pendientes de firma...</p>
      </div>
    );
  }

  return (
    <div className="para-firmar-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📝 Solicitudes para Firmar</h1>
          <p className="subtitle">
            Sector: {usuarioActual?.sector?.nombre || 'No asignado'} | 
            Rol: {usuarioActual?.rol?.nombre || 'N/A'}
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="resumen-card">
        <div className="resumen-item">
          <FiAlertCircle className="icon-warning" />
          <div>
            <span className="resumen-numero">{solicitudes.length}</span>
            <span className="resumen-label">Pendientes de firma</span>
          </div>
        </div>
        <div className="resumen-item">
          <FiClock className="icon-info" />
          <div>
            <span className="resumen-label">Tu firma es requerida para continuar el proceso</span>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="solicitudes-list">
        {solicitudes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>¡No hay solicitudes pendientes!</h3>
            <p>No tienes solicitudes esperando tu firma en este momento</p>
            <button className="btn-primary" onClick={() => navigate('/solicitudes-sector')}>
              Ver todas las solicitudes del sector
            </button>
          </div>
        ) : (
          solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="solicitud-card">
              <div className="card-header">
                <div className="card-title-section">
                  <span className="solicitud-id">#{solicitud.id}</span>
                  <span className="tiempo-espera">
                    <FiClock /> {getTiempoEspera(solicitud.creado_en)}
                  </span>
                  <h3 className="solicitud-titulo">{solicitud.titulo}</h3>
                </div>
                <div className="estado-badge warning">
                  <FiClock /> Pendiente de firma
                </div>
              </div>
              
              <div className="card-body">
                <p className="solicitud-descripcion">{solicitud.descripcion}</p>
                
                <div className="solicitud-meta">
                  <div className="meta-item">
                    <FiUser className="meta-icon" />
                    <span>Solicitante: {solicitud.solicitante?.nombre_completo || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <FiBox className="meta-icon" />
                    <span>Equipo: {solicitud.equipo?.nombre || 'No especificado'}</span>
                  </div>
                  <div className="meta-item">
                    <FiMapPin className="meta-icon" />
                    <span>Sector: {solicitud.sector?.nombre || 'N/A'}</span>
                  </div>
                </div>

                {solicitud.tipo_solicitud === 'con_material' && (
                  <div className="tipo-badge material">
                    <span>📦</span>
                    <span>Requiere materiales - Necesita tu aprobación</span>
                  </div>
                )}

                <div className="info-adicional">
                  <p>
                    <strong>📅 Creada:</strong> {formatearFecha(solicitud.creado_en)}
                  </p>
                  {solicitud.solicitante_firmo_en && (
                    <p className="firmado-info">
                      ✅ Firmado por solicitante: {formatearFecha(solicitud.solicitante_firmo_en)}
                    </p>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn-ver"
                  onClick={() => handleVerDetalle(solicitud.id)}
                >
                  <FiEye /> Ver detalles
                </button>
                <button 
                  className="btn-firmar"
                  onClick={() => handleFirmar(solicitud.id)}
                >
                  <FiCheckCircle /> Firmar y Aprobar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParaFirmarPage;