// src/paginas/SolicitudesSectorPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiEye, FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiUser, FiMapPin, FiBox } from 'react-icons/fi';
import '../estilos/solicitudes-sector.css';

const SolicitudesSectorPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual] = useState(JSON.parse(localStorage.getItem('usuario') || '{}'));
  
  // Filtros
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const estadosConfig = {
    pendiente_solicitante: { label: 'Pendiente Solicitante', color: '#f59e0b', icon: <FiClock /> },
    pendiente_jefe_seccion: { label: 'Pendiente tu firma', color: '#ef4444', icon: <FiAlertCircle /> },
    pendiente_jefe_activos: { label: 'En revisión', color: '#3b82f6', icon: <FiClock /> },
    pendiente_soporte: { label: 'En espera', color: '#8b5cf6', icon: <FiClock /> },
    asignado: { label: 'Asignado', color: '#06b6d4', icon: <FiTool /> },
    en_proceso: { label: 'En proceso', color: '#3b82f6', icon: <FiTool /> },
    pendiente_conformacion: { label: 'Por confirmar', color: '#f59e0b', icon: <FiAlertCircle /> },
    completado: { label: 'Completado', color: '#10b981', icon: <FiCheckCircle /> },
    rechazado: { label: 'Rechazado', color: '#ef4444', icon: <FiAlertCircle /> }
  };

  const opcionesEstado = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente_jefe_seccion', label: '🔴 Pendientes de tu firma' },
    { value: 'pendiente_solicitante', label: 'Pendiente Solicitante' },
    { value: 'pendiente_jefe_activos', label: 'En revisión Jefe Activos' },
    { value: 'pendiente_soporte', label: 'Pendiente Soporte' },
    { value: 'asignado', label: 'Asignado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'pendiente_conformacion', label: 'Por Confirmar' },
    { value: 'completado', label: 'Completado' }
  ];

  useEffect(() => {
    cargarSolicitudesSector();
  }, []);

  useEffect(() => {
    filtrarSolicitudes();
  }, [solicitudes, search, estadoFiltro]);

  const cargarSolicitudesSector = async () => {
    try {
      setCargando(true);
      const response = await solicitudService.obtenerPorSector();
      console.log('📦 Solicitudes del sector:', response);
      
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setSolicitudes(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar solicitudes del sector');
    } finally {
      setCargando(false);
    }
  };

  const filtrarSolicitudes = () => {
    let filtradas = [...solicitudes];
    
    if (search) {
      filtradas = filtradas.filter(s => 
        s.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        s.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        s.solicitante?.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toString().includes(search)
      );
    }
    
    if (estadoFiltro) {
      filtradas = filtradas.filter(s => s.estado === estadoFiltro);
    }
    
    setSolicitudesFiltradas(filtradas);
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

  const handleLimpiarFiltros = () => {
    setSearch('');
    setEstadoFiltro('');
  };

  // Estadísticas
  const pendientesFirma = solicitudes.filter(s => s.estado === 'pendiente_jefe_seccion').length;
  const enProceso = solicitudes.filter(s => ['asignado', 'en_proceso', 'pendiente_soporte'].includes(s.estado)).length;
  const completadas = solicitudes.filter(s => s.estado === 'completado').length;

  const filtrosActivos = search || estadoFiltro;

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando solicitudes del sector...</p>
      </div>
    );
  }

  return (
    <div className="solicitudes-sector-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📋 Solicitudes del Sector</h1>
          <p className="subtitle">
            {usuarioActual?.sector?.nombre || 'Sector no asignado'} | 
            Jefe de Servicio
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-mini">
        <div className="stat-mini warning" onClick={() => setEstadoFiltro('pendiente_jefe_seccion')}>
          <FiAlertCircle />
          <span>{pendientesFirma} Pendientes de firma</span>
        </div>
        <div className="stat-mini info" onClick={() => setEstadoFiltro('')}>
          <FiTool />
          <span>{enProceso} En proceso</span>
        </div>
        <div className="stat-mini success" onClick={() => setEstadoFiltro('completado')}>
          <FiCheckCircle />
          <span>{completadas} Completadas</span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por ID, título o solicitante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className={`btn-filter ${mostrarFiltros ? 'active' : ''}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <FiFilter /> Filtros {filtrosActivos && <span className="filter-badge">●</span>}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="filtros-panel">
            <div className="filtro-group">
              <label>Estado</label>
              <select 
                value={estadoFiltro} 
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="filtro-select"
              >
                {opcionesEstado.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            
            <div className="filtro-actions">
              <button className="btn-limpiar" onClick={handleLimpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info resultados */}
      <div className="resultados-info">
        <span>{solicitudesFiltradas.length} solicitudes encontradas</span>
      </div>

      {/* Lista de solicitudes */}
      <div className="solicitudes-list">
        {solicitudesFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay solicitudes</h3>
            <p>No se encontraron solicitudes en este sector</p>
          </div>
        ) : (
          solicitudesFiltradas.map((solicitud) => {
            const estadoConfig = getEstadoConfig(solicitud.estado);
            const esUrgente = solicitud.estado === 'pendiente_jefe_seccion';
            
            return (
              <div 
                key={solicitud.id} 
                className={`solicitud-card ${esUrgente ? 'urgente' : ''}`}
                onClick={() => handleVerDetalle(solicitud.id)}
              >
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
                      <FiUser className="meta-icon" />
                      <span>{solicitud.solicitante?.nombre_completo || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <FiBox className="meta-icon" />
                      <span>{solicitud.equipo?.nombre || 'No especificado'}</span>
                    </div>
                    <div className="meta-item">
                      <FiClock className="meta-icon" />
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
                  {esUrgente && (
                    <span className="urgente-badge">
                      <FiAlertCircle /> Requiere tu atención
                    </span>
                  )}
                  <button className="btn-ver-detalle">
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

export default SolicitudesSectorPage;