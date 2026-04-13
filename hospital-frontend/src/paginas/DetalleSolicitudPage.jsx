// src/paginas/DetalleSolicitudPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiUser, FiMapPin, FiBox, FiCalendar } from 'react-icons/fi';
import '../estilos/detalle-solicitud.css';

const DetalleSolicitudPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);

  const estadosConfig = {
    pendiente_solicitante: { label: 'Pendiente', color: '#f59e0b', icon: <FiClock /> },
    pendiente_jefe_seccion: { label: 'En revisión', color: '#3b82f6', icon: <FiClock /> },
    pendiente_jefe_activos: { label: 'En revisión', color: '#3b82f6', icon: <FiClock /> },
    pendiente_soporte: { label: 'En espera', color: '#8b5cf6', icon: <FiClock /> },
    asignado: { label: 'Asignado', color: '#06b6d4', icon: <FiTool /> },
    en_proceso: { label: 'En proceso', color: '#3b82f6', icon: <FiTool /> },
    pendiente_conformacion: { label: 'Por confirmar', color: '#f59e0b', icon: <FiAlertCircle /> },
    completado: { label: 'Completado', color: '#10b981', icon: <FiCheckCircle /> },
    rechazado: { label: 'Rechazado', color: '#ef4444', icon: <FiAlertCircle /> }
  };

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      setCargando(true);
      const response = await solicitudService.obtenerPorId(id);
      
      if (response.success) {
        setSolicitud(response.data);
      } else {
        toast.error('Error al cargar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoConfig = (estado) => {
    return estadosConfig[estado] || { label: estado, color: '#6b7280', icon: <FiClock /> };
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando solicitud...</p>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="error-container">
        <p>No se encontró la solicitud</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(solicitud.estado);

  return (
    <div className="detalle-solicitud-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>
        <div className="header-info">
          <h1>Solicitud #{solicitud.id}</h1>
          <span 
            className="estado-badge"
            style={{ backgroundColor: estadoConfig.color + '20', color: estadoConfig.color }}
          >
            {estadoConfig.icon} {estadoConfig.label}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="detalle-content">
        {/* Información general */}
        <div className="info-card">
          <h2>{solicitud.titulo}</h2>
          <p className="descripcion">{solicitud.descripcion}</p>
          
          <div className="info-grid">
            <div className="info-item">
              <FiUser className="icon" />
              <div>
                <label>Solicitante</label>
                <span>{solicitud.solicitante?.nombre_completo || 'N/A'}</span>
                <small>{solicitud.solicitante?.grado || ''}</small>
              </div>
            </div>
            
            <div className="info-item">
              <FiMapPin className="icon" />
              <div>
                <label>Sector</label>
                <span>{solicitud.sector?.nombre || 'N/A'}</span>
              </div>
            </div>
            
            <div className="info-item">
              <FiBox className="icon" />
              <div>
                <label>Equipo</label>
                <span>{solicitud.equipo?.nombre || 'No especificado'}</span>
                <small>{solicitud.equipo?.codigo_equipo}</small>
              </div>
            </div>
            
            <div className="info-item">
              <FiCalendar className="icon" />
              <div>
                <label>Fecha de creación</label>
                <span>{formatearFecha(solicitud.creado_en)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de estados */}
        <div className="timeline-card">
          <h3>Seguimiento</h3>
          
          <div className="timeline">
            {/* Solicitante */}
            <div className={`timeline-item ${solicitud.solicitante_firmo_en ? 'completed' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.solicitante_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>Firma del Solicitante</h4>
                <p>{solicitud.solicitante_firmo_en ? formatearFecha(solicitud.solicitante_firmo_en) : 'Pendiente'}</p>
              </div>
            </div>

            {/* Jefe Sección (solo si es con material) */}
            {solicitud.tipo_solicitud === 'con_material' && (
              <div className={`timeline-item ${solicitud.jefe_seccion_firmo_en ? 'completed' : 'pending'}`}>
                <div className="timeline-icon">
                  {solicitud.jefe_seccion_firmo_en ? <FiCheckCircle /> : <FiClock />}
                </div>
                <div className="timeline-content">
                  <h4>Firma Jefe de Sección</h4>
                  <p>{solicitud.jefe_seccion_firmo_en ? formatearFecha(solicitud.jefe_seccion_firmo_en) : 'Pendiente'}</p>
                </div>
              </div>
            )}

            {/* Jefe Activos (solo si es con material) */}
            {solicitud.tipo_solicitud === 'con_material' && (
              <div className={`timeline-item ${solicitud.jefe_activos_firmo_en ? 'completed' : 'pending'}`}>
                <div className="timeline-icon">
                  {solicitud.jefe_activos_firmo_en ? <FiCheckCircle /> : <FiClock />}
                </div>
                <div className="timeline-content">
                  <h4>Firma Jefe de Activos</h4>
                  <p>{solicitud.jefe_activos_firmo_en ? formatearFecha(solicitud.jefe_activos_firmo_en) : 'Pendiente'}</p>
                </div>
              </div>
            )}

            {/* Asignación de técnico */}
            <div className={`timeline-item ${solicitud.tecnico_asignado_id ? 'completed' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.tecnico_asignado_id ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>Técnico Asignado</h4>
                <p>{solicitud.tecnicoAsignado?.nombre_completo || 'Pendiente de asignación'}</p>
                {solicitud.tecnico_asignado_en && (
                  <small>{formatearFecha(solicitud.tecnico_asignado_en)}</small>
                )}
              </div>
            </div>

            {/* Trabajo terminado */}
            <div className={`timeline-item ${solicitud.trabajo_terminado_en ? 'completed' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.trabajo_terminado_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>Trabajo Realizado</h4>
                {solicitud.trabajo_terminado_en ? (
                  <>
                    <p>{formatearFecha(solicitud.trabajo_terminado_en)}</p>
                    {solicitud.notas_tecnico && (
                      <small className="notas">{solicitud.notas_tecnico}</small>
                    )}
                  </>
                ) : (
                  <p>Pendiente</p>
                )}
              </div>
            </div>

            {/* Conformación */}
            <div className={`timeline-item ${solicitud.conformacion_firmo_en ? 'completed' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.conformacion_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>Conformidad del Solicitante</h4>
                {solicitud.conformacion_firmo_en ? (
                  <>
                    <p>{formatearFecha(solicitud.conformacion_firmo_en)}</p>
                    {solicitud.conformacion_comentario && (
                      <small className="notas">{solicitud.conformacion_comentario}</small>
                    )}
                  </>
                ) : (
                  <p>Pendiente</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Materiales utilizados */}
        {solicitud.materiales && solicitud.materiales.length > 0 && (
          <div className="materiales-card">
            <h3>Materiales Utilizados</h3>
            <table className="materiales-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Material</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {solicitud.materiales.map((mat, idx) => (
                  <tr key={idx}>
                    <td>{mat.codigo}</td>
                    <td>{mat.nombre}</td>
                    <td>{mat.pivot?.cantidad_usada || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleSolicitudPage;