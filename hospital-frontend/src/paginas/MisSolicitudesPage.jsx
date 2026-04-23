// src/paginas/MisSolicitudesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiTool } from 'react-icons/fi';
import '../estilos/mis-solicitudes.css';

const MisSolicitudesPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0
  });
  const [usandoMock, setUsandoMock] = useState(false);

  const estadosConfig = {
    pendiente_solicitante: { label: 'Pendiente', color: '#f59e0b', icon: <FiClock /> },
    pendiente_jefe_seccion: { label: 'En revisión', color: '#3b82f6', icon: <FiClock /> },
    pendiente_jefe_activos: { label: 'En revisión', color: '#3b82f6', icon: <FiClock /> },
    pendiente_soporte: { label: 'En espera', color: '#8b5cf6', icon: <FiClock /> },
    asignado: { label: 'Asignado', color: '#06b6d4', icon: <FiTool /> },
    en_proceso: { label: 'En proceso', color: '#3b82f6', icon: <FiTool /> },
    pendiente_conformacion: { label: 'Por confirmar', color: '#f59e0b', icon: <FiAlertCircle /> },
    pendiente_jefe_mantenimiento: { label: 'En revisión', color: '#3b82f6', icon: <FiClock /> },
    completado: { label: 'Completado', color: '#10b981', icon: <FiCheckCircle /> },
    cancelado: { label: 'Cancelado', color: '#ef4444', icon: <FiAlertCircle /> },
    rechazado: { label: 'Rechazado', color: '#ef4444', icon: <FiAlertCircle /> }
  };

  useEffect(() => {
    cargarMisSolicitudes();
  }, []);

  useEffect(() => {
    filtrarSolicitudes();
  }, [filtroActivo, solicitudes]);

// En MisSolicitudesPage.jsx
  const cargarMisSolicitudes = async () => {
    try {
      setCargando(true);
      const response = await solicitudService.obtenerMisSolicitudes();
      
      console.log('📦 Respuesta del backend:', response);
      
      let solicitudesData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          solicitudesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          solicitudesData = response.data.data;
        }
      }
      
      console.log('📊 Solicitudes cargadas:', solicitudesData);
      
      setSolicitudes(solicitudesData);
      calcularEstadisticas(solicitudesData);
      
      toast.success(`${solicitudesData.length} solicitudes cargadas`);
    } catch (error) {
      console.error('❌ Error:', error);
      
      // Si hay error, usar datos mock
      const mockSolicitudes = [
        {
          id: 1,
          titulo: "Monitor NONOno enciende",
          descripcion: "El monitor de signos vitales no enciende",
          estado: "completado",
          tipo_solicitud: "sin_material",
          creado_en: "2024-01-10 08:30:00",
          equipo: { nombre: "Monitor Signos Vitales" },
          sector: { nombre: "UCI" }
        }
      ];
      
      setSolicitudes(mockSolicitudes);
      calcularEstadisticas(mockSolicitudes);
      toast.error('Usando datos de demostración');
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (data) => {
    if (!Array.isArray(data)) {
      console.warn('⚠️ Datos no válidos para estadísticas:', data);
      return;
    }
    
    const stats = {
      total: data.length,
      pendientes: data.filter(s => 
        s.estado === 'pendiente_solicitante' || 
        s.estado === 'pendiente_jefe_seccion' || 
        s.estado === 'pendiente_jefe_activos' ||
        s.estado === 'pendiente_soporte'
      ).length,
      enProceso: data.filter(s => 
        s.estado === 'asignado' || 
        s.estado === 'en_proceso' ||
        s.estado === 'pendiente_conformacion' ||
        s.estado === 'pendiente_jefe_mantenimiento'
      ).length,
      completadas: data.filter(s => s.estado === 'completado').length
    };
    
    console.log('📈 Estadísticas calculadas:', stats);
    setEstadisticas(stats);
  };

  const filtrarSolicitudes = () => {
    if (!Array.isArray(solicitudes)) return;
    
    if (filtroActivo === 'todas') {
      setSolicitudesFiltradas(solicitudes);
    } else if (filtroActivo === 'pendientes') {
      setSolicitudesFiltradas(solicitudes.filter(s => 
        s.estado.includes('pendiente') && s.estado !== 'pendiente_conformacion'
      ));
    } else if (filtroActivo === 'en_proceso') {
      setSolicitudesFiltradas(solicitudes.filter(s => 
        s.estado === 'asignado' || 
        s.estado === 'en_proceso' ||
        s.estado === 'pendiente_conformacion' ||
        s.estado === 'pendiente_jefe_mantenimiento'
      ));
    } else if (filtroActivo === 'completadas') {
      setSolicitudesFiltradas(solicitudes.filter(s => s.estado === 'completado'));
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

  const getEstadoConfig = (estado) => {
    return estadosConfig[estado] || { label: estado || 'Desconocido', color: '#6b7280', icon: <FiClock /> };
  };

  const handleVerDetalle = (id) => {
    navigate(`/solicitudes/${id}`);
  };

  const handleCrearSolicitudPrueba = async () => {
    try {
      const nuevaSolicitud = {
        tipo_solicitud: 'sin_material',
        titulo: 'Solicitud de prueba ' + new Date().toLocaleTimeString(),
        descripcion: 'Esta es una solicitud creada desde el botón de prueba',
        equipo_id: 5,
        sector_id: 3
      };
      
      toast.loading('Creando solicitud...');
      const response = await solicitudService.crear(nuevaSolicitud);
      console.log('✅ Solicitud creada:', response);
      toast.dismiss();
      toast.success('¡Solicitud creada correctamente!');
      
      // Intentar recargar
      cargarMisSolicitudes();
    } catch (error) {
      console.error('❌ Error al crear solicitud:', error);
      toast.dismiss();
      
      // Agregar mock localmente
      const nuevaMock = {
        id: Date.now(),
        titulo: nuevaSolicitud.titulo,
        descripcion: nuevaSolicitud.descripcion,
        estado: "pendiente_solicitante",
        tipo_solicitud: nuevaSolicitud.tipo_solicitud,
        creado_en: new Date().toISOString(),
        equipo: { nombre: "Equipo de prueba" },
        sector: { nombre: "Sector de prueba" }
      };
      
      setSolicitudes([nuevaMock, ...solicitudes]);
      calcularEstadisticas([nuevaMock, ...solicitudes]);
      toast.success('Solicitud agregada localmente (modo demo)');
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="mis-solicitudes-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Mis Solicitudes</h1>
          <p className="subtitle">Gestiona y da seguimiento a tus solicitudes</p>
          {usandoMock && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: '#fef3c7',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#d97706'
            }}>
              ⚠️ Modo demostración - Los datos son simulados
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-container">
        <div className="stat-card" onClick={() => setFiltroActivo('todas')}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{estadisticas.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card warning" onClick={() => setFiltroActivo('pendientes')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{estadisticas.pendientes}</span>
            <span className="stat-label">Pendientes</span>
          </div>
        </div>
        <div className="stat-card info" onClick={() => setFiltroActivo('en_proceso')}>
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-value">{estadisticas.enProceso}</span>
            <span className="stat-label">En Proceso</span>
          </div>
        </div>
        <div className="stat-card success" onClick={() => setFiltroActivo('completadas')}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{estadisticas.completadas}</span>
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
            className={`filtro-chip ${filtroActivo === 'en_proceso' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('en_proceso')}
          >
            En Proceso
          </button>
          <button 
            className={`filtro-chip ${filtroActivo === 'completadas' ? 'active' : ''}`}
            onClick={() => setFiltroActivo('completadas')}
          >
            Completadas
          </button>
        </div>
      </div>

      {/* Botón para crear solicitud de prueba */}
      <div style={{ padding: '0 20px', marginBottom: '15px' }}>
        <button 
          onClick={handleCrearSolicitudPrueba}
          style={{ 
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
        >
          🧪 Crear Solicitud de Prueba
        </button>
      </div>

      {/* Lista de solicitudes */}
      <div className="solicitudes-list">
        {solicitudesFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay solicitudes</h3>
            <p>{filtroActivo === 'todas' ? 'Aún no has creado ninguna solicitud' : `No tienes solicitudes ${filtroActivo}`}</p>
            <button className="btn-primary" onClick={() => navigate('/nueva-solicitud')}>
              Crear nueva solicitud
            </button>
          </div>
        ) : (
          solicitudesFiltradas.map((solicitud) => {
            const estadoConfig = getEstadoConfig(solicitud.estado);
            return (
              <div 
                key={solicitud.id} 
                className="solicitud-card"
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
                      <span className="meta-icon">🔧</span>
                      <span>{solicitud.equipo?.nombre || 'Equipo no especificado'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{solicitud.sector?.nombre || 'Sector no especificado'}</span>
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
                  <button className="btn-ver-detalle">
                    Ver detalles
                    <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Botón flotante */}
      <button 
        className="fab-nueva-solicitud"
        onClick={() => navigate('/nueva-solicitud')}
        aria-label="Nueva solicitud"
      >
        <FiPlus size={24} />
      </button>
    </div>
  );
};

export default MisSolicitudesPage;