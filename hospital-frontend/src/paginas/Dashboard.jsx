// src/paginas/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiClock, FiCheckCircle, FiTool, FiEye } from 'react-icons/fi';
import api from '../servicios/api';
import '../estilos/dashboard.css';

const Dashboard = ({ usuario }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    en_proceso: 0,
    completadas: 0,
    stock_bajo: 0,
    recientes: []
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const response = await api.get('/estadisticas');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      completado: { label: 'Completado', className: 'status-completado' },
      pendiente_solicitante: { label: 'Pendiente', className: 'status-pendiente' },
      pendiente_jefe_seccion: { label: 'En revisión', className: 'status-proceso' },
      pendiente_jefe_activos: { label: 'En revisión', className: 'status-proceso' },
      pendiente_soporte: { label: 'En espera', className: 'status-pendiente' },
      asignado: { label: 'Asignado', className: 'status-proceso' },
      en_proceso: { label: 'En proceso', className: 'status-proceso' },
      pendiente_conformacion: { label: 'Por confirmar', className: 'status-pendiente' },
      pendiente_jefe_mantenimiento: { label: 'En revisión', className: 'status-proceso' }
    };
    return estados[estado] || { label: estado, className: 'status-pendiente' };
  };

  const esAdmin = usuario?.rol?.nombre === 'admin_sistema';
  const esSoporte = ['jefe_soporte', 'soporte_tecnico'].includes(usuario?.rol?.nombre);

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema</p>
      </div>

      <div className="welcome-card">
        <h2>¡Bienvenido, {usuario?.nombre_completo || 'Usuario'}!</h2>
        <p>{usuario?.rol?.nombre} - {usuario?.grado}</p>
        <p className="last-login">
          Último acceso: {usuario?.ultimo_ingreso_en ? formatearFecha(usuario.ultimo_ingreso_en) : 'Primer acceso'}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/solicitudes')}>
          <div className="stat-header">
            <div className="stat-icon blue">📋</div>
            <span className="stat-title">Total Solicitudes</span>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change">Ver todas</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/solicitudes-pendientes')}>
          <div className="stat-header">
            <div className="stat-icon orange">⏳</div>
            <span className="stat-title">Pendientes</span>
          </div>
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-change">Requieren atención</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">⚙️</div>
            <span className="stat-title">En Proceso</span>
          </div>
          <div className="stat-value">{stats.en_proceso}</div>
          <div className="stat-change">En ejecución</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">✅</div>
            <span className="stat-title">Completadas</span>
          </div>
          <div className="stat-value">{stats.completadas}</div>
          <div className="stat-change">Finalizadas</div>
        </div>
      </div>

      {/* Alerta de stock bajo (solo admin/soporte) */}
      {(esAdmin || esSoporte) && stats.stock_bajo > 0 && (
        <div className="alert-warning" onClick={() => navigate('/materiales')}>
          <FiAlertTriangle /> Hay {stats.stock_bajo} materiales con stock bajo. Click para revisar.
        </div>
      )}

      {/* Solicitudes recientes */}
      <div className="recent-section">
        <div className="section-header">
          <h3 className="section-title">Solicitudes Recientes</h3>
          <button className="btn-link" onClick={() => navigate('/solicitudes')}>
            Ver todas →
          </button>
        </div>

        <div className="recent-list">
          {stats.recientes.length === 0 ? (
            <p className="no-data">No hay solicitudes recientes</p>
          ) : (
            stats.recientes.map((solicitud) => {
              const estado = getEstadoBadge(solicitud.estado);
              return (
                <div 
                  key={solicitud.id} 
                  className="recent-item"
                  onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
                >
                  <div className="recent-icon">
                    <FiTool />
                  </div>
                  <div className="recent-content">
                    <div className="recent-title">
                      #{solicitud.id} - {solicitud.titulo}
                    </div>
                    <div className="recent-meta">
                      <span>{solicitud.equipo?.nombre || 'Sin equipo'}</span>
                      <span>•</span>
                      <span>{solicitud.sector?.nombre || 'Sin sector'}</span>
                      <span>•</span>
                      <span>{formatearFecha(solicitud.creado_en)}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${estado.className}`}>
                    {estado.label}
                  </span>
                  <FiEye className="view-icon" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-actions">
        <button className="quick-btn" onClick={() => navigate('/nueva-solicitud')}>
          📝 Nueva Solicitud
        </button>
        <button className="quick-btn" onClick={() => navigate('/mis-solicitudes')}>
          🔍 Mis Solicitudes
        </button>
        {esAdmin && (
          <>
            <button className="quick-btn" onClick={() => navigate('/equipos')}>
              🔧 Equipos
            </button>
            <button className="quick-btn" onClick={() => navigate('/usuarios')}>
              👥 Usuarios
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;