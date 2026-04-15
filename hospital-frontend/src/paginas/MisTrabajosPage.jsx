// src/paginas/MisTrabajosPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiEye, FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiPackage } from 'react-icons/fi';
import '../estilos/mis-trabajos.css';

const MisTrabajosPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('todas');

  const estadosConfig = {
    asignado: { label: 'Asignado', color: '#06b6d4', icon: <FiTool /> },
    en_proceso: { label: 'En proceso', color: '#3b82f6', icon: <FiTool /> },
    pendiente_conformacion: { label: 'Por confirmar', color: '#f59e0b', icon: <FiAlertCircle /> },
    completado: { label: 'Completado', color: '#10b981', icon: <FiCheckCircle /> }
  };

  useEffect(() => {
    cargarMisTrabajos();
  }, []);

  const cargarMisTrabajos = async () => {
    try {
      setCargando(true);
      // Usamos el endpoint de pendientes que filtra por técnico asignado
      const response = await solicitudService.obtenerPendientesSoporte();
      
      if (response.success) {
        const datos = response.data?.data || response.data || [];
        // Filtrar solo las asignadas al técnico actual
        const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
        const misTrabajos = Array.isArray(datos) 
          ? datos.filter(s => s.tecnico_asignado_id === usuarioActual.id)
          : [];
        setSolicitudes(misTrabajos);
      }
    } catch (error) {
      console.error('Error cargando trabajos:', error);
      toast.error('Error al cargar tus trabajos');
    } finally {
      setCargando(false);
    }
  };

  const solicitudesFiltradas = () => {
    if (filtroActivo === 'todas') return solicitudes;
    if (filtroActivo === 'pendientes') {
      return solicitudes.filter(s => ['asignado', 'en_proceso'].includes(s.estado));
    }
    if (filtroActivo === 'completadas') {
      return solicitudes.filter(s => s.estado === 'completado');
    }
    return solicitudes;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstadoConfig = (estado) => {
    return estadosConfig[estado] || { label: estado, color: '#6b7280', icon: <FiClock /> };
  };

  const handleVerDetalle = (id) => {
    navigate(`/solicitudes/${id}`);
  };

  const handleIniciarTrabajo = (id) => {
    // Por ahora solo navega al detalle
    navigate(`/solicitudes/${id}`);
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus trabajos...</p>
      </div>
    );
  }

  const filtradas = solicitudesFiltradas();
  const pendientes = solicitudes.filter(s => ['asignado', 'en_proceso'].includes(s.estado)).length;
  const completadas = solicitudes.filter(s => s.estado === 'completado').length;

  return (
    <div className="mis-trabajos-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Mis Trabajos</h1>
          <p className="subtitle">Solicitudes asignadas a ti</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card" onClick={() => setFiltroActivo('todas')}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{solicitudes.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card warning" onClick={() => setFiltroActivo('pendientes')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{pendientes}</span>
            <span className="stat-label">Pendientes</span>
          </div>
        </div>
        <div className="stat-card success" onClick={() => setFiltroActivo('completadas')}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{completadas}</span>
            <span className="stat-label">Completadas</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-scroll">
          <button 
            className={`filtro-chip ${filtroActivo === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('todas')}
          >
            Todas
          </button>
          <button 
            className={`filtro-chip ${filtroActivo === 'pendientes' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('pendientes')}
          >
            Pendientes
          </button>
          <button 
            className={`filtro-chip ${filtroActivo === 'completadas' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('completadas')}
          >
            Completadas
          </button>
        </div>
      </div>

      {/* Lista de trabajos */}
      <div className="trabajos-list">
        {filtradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <h3>No hay trabajos asignados</h3>
            <p>No tienes solicitudes asignadas en este momento</p>
          </div>
        ) : (
          filtradas.map((solicitud) => {
            const estadoConfig = getEstadoConfig(solicitud.estado);
            return (
              <div key={solicitud.id} className="trabajo-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <span className="solicitud-id">#{solicitud.id}</span>
                    <h3 className="solicitud-titulo">{solicitud.titulo}</h3>
                  </div>
                  <div 
                    className="estado-badge"
                    style={{ backgroundColor: estadoConfig.color + '20', color: estadoConfig.color }}
                  >
                    <span className="estado-icon">{estadoConfig.icon}</span>
                    <span>{estadoConfig.label}</span>
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
                      <span>{formatearFecha(solicitud.creado_en)}</span>
                    </div>
                  </div>

                  {solicitud.tipo_solicitud === 'con_material' && (
                    <div className="tipo-badge material">
                      <span>📦</span>
                      <span>Requiere materiales</span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  {['asignado', 'en_proceso'].includes(solicitud.estado) && (
                    <button 
                      className="btn-trabajar"
                      onClick={() => handleIniciarTrabajo(solicitud.id)}
                    >
                      <FiPackage /> Trabajar
                    </button>
                  )}
                  <button 
                    className="btn-ver-detalle"
                    onClick={() => handleVerDetalle(solicitud.id)}
                  >
                    Ver detalles <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MisTrabajosPage;