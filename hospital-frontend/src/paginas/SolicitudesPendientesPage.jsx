// src/paginas/SolicitudesPendientesPage.jsx - CORREGIDO
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiEye, FiUserPlus, FiClock, FiAlertCircle } from 'react-icons/fi';
import '../estilos/solicitudes-pendientes.css';

const SolicitudesPendientesPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = async () => {
    try {
      setCargando(true);
      const response = await solicitudService.obtenerPendientesSoporte();
      
      console.log('📦 Respuesta pendientes:', response);
      
      if (response.success) {
        let datos = [];
        if (response.data?.data) {
          datos = response.data.data;
        } else if (response.data) {
          datos = response.data;
        } else if (Array.isArray(response)) {
          datos = response;
        }
        
        // Mostrar TODAS las que llegan (pendiente_soporte, asignado, en_proceso)
        // El backend ya filtra por estados: pendiente_soporte, asignado, en_proceso
        setSolicitudes(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando pendientes:', error);
      toast.error('Error al cargar solicitudes pendientes');
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

  // Separar por tipo
  const pendientesAsignar = solicitudes.filter(s => s.estado === 'pendiente_soporte');
  const enProceso = solicitudes.filter(s => ['asignado', 'en_proceso'].includes(s.estado));

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="pendientes-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Solicitudes de Soporte</h1>
          <p className="subtitle">Gestión de solicitudes de mantenimiento</p>
        </div>
      </div>

      {/* Sección: Pendientes de asignar */}
      <div className="seccion">
        <h2 className="seccion-titulo">
          <FiAlertCircle /> Pendientes de Asignar ({pendientesAsignar.length})
        </h2>
        
        <div className="pendientes-list">
          {pendientesAsignar.length === 0 ? (
            <div className="empty-state-small">
              <p>No hay solicitudes pendientes de asignación</p>
            </div>
          ) : (
            pendientesAsignar.map((solicitud) => (
              <div key={solicitud.id} className="pendiente-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <span className="solicitud-id">#{solicitud.id}</span>
                    <h3 className="solicitud-titulo">{solicitud.titulo}</h3>
                  </div>
                  <div className="estado-badge warning">
                    <FiClock /> Pendiente
                  </div>
                </div>
                
                <div className="card-body">
                  <p className="solicitud-descripcion">{solicitud.descripcion}</p>
                  
                  <div className="solicitud-meta">
                    <div className="meta-item">
                      <span className="meta-icon">🔧</span>
                      <span>{solicitud.equipo?.nombre || 'Equipo no especificado'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{solicitud.sector?.nombre || 'Sector no especificado'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">👤</span>
                      <span>Solicitante: {solicitud.solicitante?.nombre_completo || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>Creado: {formatearFecha(solicitud.creado_en)}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-asignar"
                    onClick={() => handleVerDetalle(solicitud.id)}
                  >
                    <FiUserPlus /> Asignar Técnico
                  </button>
                  <button 
                    className="btn-ver"
                    onClick={() => handleVerDetalle(solicitud.id)}
                  >
                    <FiEye /> Ver detalles
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección: En proceso */}
      <div className="seccion">
        <h2 className="seccion-titulo">
          <FiClock /> En Proceso ({enProceso.length})
        </h2>
        
        <div className="pendientes-list">
          {enProceso.length === 0 ? (
            <div className="empty-state-small">
              <p>No hay solicitudes en proceso</p>
            </div>
          ) : (
            enProceso.map((solicitud) => (
              <div key={solicitud.id} className="pendiente-card en-proceso">
                <div className="card-header">
                  <div className="card-title-section">
                    <span className="solicitud-id">#{solicitud.id}</span>
                    <h3 className="solicitud-titulo">{solicitud.titulo}</h3>
                  </div>
                  <div className="estado-badge info">
                    <FiClock /> {solicitud.estado === 'asignado' ? 'Asignado' : 'En Proceso'}
                  </div>
                </div>
                
                <div className="card-body">
                  <p className="solicitud-descripcion">{solicitud.descripcion}</p>
                  
                  <div className="solicitud-meta">
                    <div className="meta-item">
                      <span className="meta-icon">🔧</span>
                      <span>{solicitud.equipo?.nombre || 'Equipo no especificado'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{solicitud.sector?.nombre || 'Sector no especificado'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">👨‍🔧</span>
                      <span>Técnico: {solicitud.tecnicoAsignado?.nombre_completo || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>Creado: {formatearFecha(solicitud.creado_en)}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-ver"
                    onClick={() => handleVerDetalle(solicitud.id)}
                  >
                    <FiEye /> Ver detalles
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitudesPendientesPage;