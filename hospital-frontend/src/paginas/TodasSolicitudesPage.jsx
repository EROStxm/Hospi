// src/paginas/TodasSolicitudesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiEye, FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import '../estilos/todas-solicitudes.css';

const TodasSolicitudesPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [sectores, setSectores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [sectorFiltro, setSectorFiltro] = useState('');
  const [equipoFiltro, setEquipoFiltro] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');
  const [anioFiltro, setAnioFiltro] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

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

  const opcionesEstado = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente_solicitante', label: 'Pendiente Solicitante' },
    { value: 'pendiente_jefe_seccion', label: 'Pendiente Jefe Sección' },
    { value: 'pendiente_soporte', label: 'Pendiente Soporte' },
    { value: 'asignado', label: 'Asignado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'pendiente_conformacion', label: 'Por Confirmar' },
    { value: 'completado', label: 'Completado' },
    { value: 'rechazado', label: 'Rechazado' }
  ];

  const meses = [
    { value: '', label: 'Todos los meses' },
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const anios = () => {
    const currentYear = new Date().getFullYear();
    const years = [{ value: '', label: 'Todos los años' }];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    return years;
  };

  useEffect(() => {
    cargarSectores();
    cargarEquipos();
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [paginaActual, estadoFiltro, sectorFiltro, equipoFiltro, mesFiltro, anioFiltro]);

  const cargarSectores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/sectores', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Sectores response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setSectores(data.data);
      } else if (Array.isArray(data)) {
        setSectores(data);
      } else if (data.data && Array.isArray(data.data.data)) {
        setSectores(data.data.data);
      } else {
        setSectores([]);
      }
    } catch (error) {
      console.error('Error cargando sectores:', error);
      setSectores([]);
    }
  };

  const cargarEquipos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/equipos', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Equipos response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setEquipos(data.data);
      } else if (Array.isArray(data)) {
        setEquipos(data);
      } else if (data.data && Array.isArray(data.data.data)) {
        setEquipos(data.data.data);
      } else {
        setEquipos([]);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      setEquipos([]);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      
      const params = {
        page: paginaActual,
        per_page: 15,
        ...(estadoFiltro && { estado: estadoFiltro }),
        ...(sectorFiltro && { sector_id: sectorFiltro }),
        ...(equipoFiltro && { equipo_id: equipoFiltro }),
        ...(mesFiltro && { mes: mesFiltro }),
        ...(anioFiltro && { anio: anioFiltro }),
        ...(search && { search: search })
      };
      
      const response = await solicitudService.obtenerTodas(params);
      console.log('Solicitudes response:', response);
      
      if (response.success) {
        let datos = [];
        if (response.data?.data) {
          datos = response.data.data;
        } else if (response.data) {
          datos = response.data;
        } else if (Array.isArray(response)) {
          datos = response;
        }
        
        setSolicitudes(Array.isArray(datos) ? datos : []);
        setTotalPaginas(response.data?.last_page || response.last_page || 1);
        setTotalRegistros(response.data?.total || response.total || datos.length);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    setPaginaActual(1);
    cargarSolicitudes();
  };

  const handleLimpiarFiltros = () => {
    setSearch('');
    setEstadoFiltro('');
    setSectorFiltro('');
    setEquipoFiltro('');
    setMesFiltro('');
    setAnioFiltro('');
    setPaginaActual(1);
    setTimeout(() => cargarSolicitudes(), 100);
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

  // Filtrar equipos por sector seleccionado
  const equiposFiltrados = sectorFiltro 
    ? equipos.filter(e => e.sector_id == sectorFiltro)
    : equipos;

  return (
    <div className="todas-solicitudes-page">
      <div className="page-header">
        <h1>Todas las Solicitudes</h1>
        <p className="subtitle">Gestión completa de solicitudes de mantenimiento</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <form onSubmit={handleBuscar} className="search-form">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por ID, título, solicitante o equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn-search">Buscar</button>
          <button 
            type="button" 
            className="btn-filter"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <FiFilter /> Filtros {mostrarFiltros ? '▲' : '▼'}
          </button>
        </form>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="filtros-panel">
          <div className="filtros-header">
            <h3>Filtros</h3>
            <button className="btn-cerrar" onClick={() => setMostrarFiltros(false)}>
              <FiX />
            </button>
          </div>
          
          <div className="filtros-grid">
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
            
            <div className="filtro-group">
              <label>Sector</label>
              <select 
                value={sectorFiltro} 
                onChange={(e) => {
                  setSectorFiltro(e.target.value);
                  setEquipoFiltro(''); // Reset equipo al cambiar sector
                }}
                className="filtro-select"
              >
                <option value="">Todos los sectores</option>
                {Array.isArray(sectores) && sectores.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.nombre}</option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label>Equipo</label>
              <select 
                value={equipoFiltro} 
                onChange={(e) => setEquipoFiltro(e.target.value)}
                className="filtro-select"
                disabled={!sectorFiltro && equipos.length > 0}
              >
                <option value="">Todos los equipos</option>
                {equiposFiltrados.map(equipo => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.codigo_equipo} - {equipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label>Mes</label>
              <select 
                value={mesFiltro} 
                onChange={(e) => setMesFiltro(e.target.value)}
                className="filtro-select"
              >
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label>Año</label>
              <select 
                value={anioFiltro} 
                onChange={(e) => setAnioFiltro(e.target.value)}
                className="filtro-select"
              >
                {anios().map(anio => (
                  <option key={anio.value} value={anio.value}>{anio.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filtro-actions">
            <button className="btn-aplicar" onClick={() => { setPaginaActual(1); cargarSolicitudes(); setMostrarFiltros(false); }}>
              Aplicar Filtros
            </button>
            <button className="btn-limpiar" onClick={handleLimpiarFiltros}>
              Limpiar Todo
            </button>
          </div>
        </div>
      )}

      {/* Info de resultados */}
      <div className="resultados-info">
        <span>{totalRegistros} solicitudes encontradas</span>
        {(estadoFiltro || sectorFiltro || equipoFiltro || mesFiltro || anioFiltro) && (
          <span className="filtros-activos">
            Filtros activos
          </span>
        )}
      </div>

      {/* Tabla de solicitudes */}
      <div className="solicitudes-table-container">
        {cargando && solicitudes.length === 0 ? (
          <div className="loading-table">
            <div className="spinner"></div>
            <p>Cargando solicitudes...</p>
          </div>
        ) : (
          <table className="solicitudes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Solicitante</th>
                <th>Sector</th>
                <th>Equipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No hay solicitudes registradas</td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => {
                  const estadoConfig = getEstadoConfig(solicitud.estado);
                  return (
                    <tr key={solicitud.id} onClick={() => handleVerDetalle(solicitud.id)}>
                      <td className="solicitud-id">#{solicitud.id}</td>
                      <td className="solicitud-titulo">{solicitud.titulo}</td>
                      <td>{solicitud.solicitante?.nombre_completo || 'N/A'}</td>
                      <td>{solicitud.sector?.nombre || 'N/A'}</td>
                      <td>{solicitud.equipo?.nombre || 'N/A'}</td>
                      <td>
                        <span 
                          className="estado-badge"
                          style={{ backgroundColor: estadoConfig.color + '20', color: estadoConfig.color }}
                        >
                          {estadoConfig.label}
                        </span>
                      </td>
                      <td>{formatearFecha(solicitud.creado_en)}</td>
                      <td>
                        <button 
                          className="btn-ver"
                          onClick={(e) => { e.stopPropagation(); handleVerDetalle(solicitud.id); }}
                        >
                          <FiEye /> Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button 
            className="btn-pagina"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(paginaActual - 1)}
          >
            <FiChevronLeft /> Anterior
          </button>
          
          <span className="pagina-info">
            Página {paginaActual} de {totalPaginas}
          </span>
          
          <button 
            className="btn-pagina"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(paginaActual + 1)}
          >
            Siguiente <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default TodasSolicitudesPage;