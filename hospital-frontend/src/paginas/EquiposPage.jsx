// src/paginas/EquiposPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFilter } from 'react-icons/fi';
import { equipoService } from '../servicios/equipoService';
import { sectorService } from '../servicios/sectorService';
import { ubicacionService } from '../servicios/ubicacionService';
import '../estilos/equipos.css';

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState(null);

  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [sectorFiltro, setSectorFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [marcaFiltro, setMarcaFiltro] = useState('');
  
  const [formData, setFormData] = useState({
    codigo_equipo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '1',
    sector_id: '',
    ubicacion_id: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: 'operativo'
  });

  const estadosEquipo = ['operativo', 'mantenimiento', 'averiado', 'fuera_servicio'];
  
  // Obtener marcas únicas para el filtro
  const marcasUnicas = [...new Set(equipos.map(e => e.marca).filter(Boolean))];

  // Filtrar ubicaciones cuando cambia el sector seleccionado
  useEffect(() => {
    if (formData.sector_id && Array.isArray(ubicaciones)) {
      const filtradas = ubicaciones.filter(u => u.sector_id == formData.sector_id);
      setUbicacionesFiltradas(filtradas);
    } else {
      setUbicacionesFiltradas([]);
    }
  }, [formData.sector_id, ubicaciones]);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    filtrarEquipos();
  }, [equipos, search, sectorFiltro, estadoFiltro, marcaFiltro]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      await Promise.all([
        cargarEquipos(),
        cargarSectores(),
        cargarUbicaciones()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await equipoService.obtenerTodos();
      console.log('Equipos response:', response);
      
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setEquipos(Array.isArray(datos) ? datos : []);
      } else {
        setEquipos([]);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      toast.error(error.message || 'Error al cargar equipos');
      setEquipos([]);
    }
  };

  const cargarSectores = async () => {
    try {
      const response = await sectorService.obtenerTodos();
      
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setSectores(Array.isArray(datos) ? datos : []);
      } else {
        setSectores([]);
      }
    } catch (error) {
      console.error('Error cargando sectores:', error);
      setSectores([]);
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const response = await ubicacionService.obtenerTodos();
      
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setUbicaciones(Array.isArray(datos) ? datos : []);
      } else {
        setUbicaciones([]);
      }
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
      setUbicaciones([]);
    }
  };

  const filtrarEquipos = () => {
    let filtrados = [...equipos];
    
    // Filtro por búsqueda
    if (search) {
      filtrados = filtrados.filter(e => 
        e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        e.codigo_equipo?.toLowerCase().includes(search.toLowerCase()) ||
        e.modelo?.toLowerCase().includes(search.toLowerCase()) ||
        e.numero_serie?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtro por sector
    if (sectorFiltro) {
      filtrados = filtrados.filter(e => e.sector_id == sectorFiltro);
    }
    
    // Filtro por estado
    if (estadoFiltro) {
      filtrados = filtrados.filter(e => e.estado === estadoFiltro);
    }
    
    // Filtro por marca
    if (marcaFiltro) {
      filtrados = filtrados.filter(e => e.marca === marcaFiltro);
    }
    
    setEquiposFiltrados(filtrados);
  };

  const validarFormulario = () => {
    if (!formData.codigo_equipo?.trim()) {
      toast.error('El código del equipo es requerido');
      return false;
    }
    if (!formData.nombre?.trim()) {
      toast.error('El nombre del equipo es requerido');
      return false;
    }
    if (!formData.sector_id) {
      toast.error('Debe seleccionar un sector');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    try {
      let response;
      if (equipoEditando) {
        response = await equipoService.actualizar(equipoEditando.id, formData);
      } else {
        response = await equipoService.crear(formData);
      }
      
      if (response.success) {
        toast.success(equipoEditando ? 'Equipo actualizado exitosamente' : 'Equipo creado exitosamente');
        cerrarFormulario();
        await cargarEquipos();
      } else {
        toast.error(response.message || 'Error al guardar el equipo');
      }
    } catch (error) {
      console.error('Error guardando equipo:', error);
      toast.error(error.message || 'Error al guardar el equipo');
    }
  };

  const handleEditar = (equipo) => {
    setEquipoEditando(equipo);
    setFormData({
      codigo_equipo: equipo.codigo_equipo || '',
      nombre: equipo.nombre || '',
      descripcion: equipo.descripcion || '',
      categoria_id: equipo.categoria_id || '1',
      sector_id: equipo.sector_id || '',
      ubicacion_id: equipo.ubicacion_id || '',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      numero_serie: equipo.numero_serie || '',
      estado: equipo.estado || 'operativo'
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este equipo? Esta acción no se puede deshacer.')) return;
    
    try {
      await equipoService.eliminar(id);
      toast.success('Equipo eliminado exitosamente');
      await cargarEquipos();
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      toast.error(error.message || 'Error al eliminar el equipo');
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setEquipoEditando(null);
    setFormData({
      codigo_equipo: '',
      nombre: '',
      descripcion: '',
      categoria_id: '1',
      sector_id: '',
      ubicacion_id: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      estado: 'operativo'
    });
  };

  const handleLimpiarFiltros = () => {
    setSearch('');
    setSectorFiltro('');
    setEstadoFiltro('');
    setMarcaFiltro('');
  };

  const filtrosActivos = search || sectorFiltro || estadoFiltro || marcaFiltro;

  return (
    <div className="equipos-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Equipos</h1>
          <p className="subtitle">Administración del catálogo de equipos médicos</p>
        </div>
        <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
          <FiPlus /> Nuevo Equipo
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por código, nombre, modelo o serie..."
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
                <label>Sector</label>
                <select 
                  value={sectorFiltro} 
                  onChange={(e) => setSectorFiltro(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todos los sectores</option>
                  {sectores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="filtro-group">
                <label>Estado</label>
                <select 
                  value={estadoFiltro} 
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todos los estados</option>
                  {estadosEquipo.map(e => (
                    <option key={e} value={e}>
                      {e.charAt(0).toUpperCase() + e.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-group">
                <label>Marca</label>
                <select 
                  value={marcaFiltro} 
                  onChange={(e) => setMarcaFiltro(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todas las marcas</option>
                  {marcasUnicas.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filtro-actions">
              <button className="btn-limpiar" onClick={handleLimpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info de resultados */}
      <div className="resultados-info">
        <span>{equiposFiltrados.length} equipos encontrados</span>
        {filtrosActivos && (
          <span className="filtros-activos">Filtros activos</span>
        )}
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Sector</th>
              <th>Ubicación</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="8" className="text-center">
                <div className="spinner"></div>
                Cargando...
              </td></tr>
            ) : equiposFiltrados.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No hay equipos registrados</td>
              </tr>
            ) : (
              equiposFiltrados.map(equipo => (
                <tr key={equipo.id}>
                  <td><strong>{equipo.codigo_equipo}</strong></td>
                  <td>{equipo.nombre}</td>
                  <td>{equipo.sector?.nombre || 'N/A'}</td>
                  <td>{equipo.ubicacion?.nombre || equipo.ubicacion?.codigo || 'N/A'}</td>
                  <td>{equipo.marca || '-'}</td>
                  <td>{equipo.modelo || '-'}</td>
                  <td>
                    <span className={`estado-badge estado-${equipo.estado}`}>
                      {equipo.estado?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(equipo)} title="Editar">
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleEliminar(equipo.id)} title="Eliminar">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{equipoEditando ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
              <button onClick={cerrarFormulario}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    value={formData.codigo_equipo}
                    onChange={(e) => setFormData({...formData, codigo_equipo: e.target.value})}
                    required
                    placeholder="Ej: EQ-001"
                  />
                </div>
                
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                    placeholder="Ej: Ventilador Pulmonar"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
                    placeholder="Descripción detallada del equipo"
                  />
                </div>
                
                <div className="form-group">
                  <label>Sector *</label>
                  <select
                    value={formData.sector_id}
                    onChange={(e) => setFormData({...formData, sector_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {sectores.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ubicación</label>
                  <select
                    value={formData.ubicacion_id}
                    onChange={(e) => setFormData({...formData, ubicacion_id: e.target.value})}
                    disabled={!formData.sector_id}
                  >
                    <option value="">
                      {!formData.sector_id ? 'Primero seleccione un sector' : 'Seleccione ubicación'}
                    </option>
                    {ubicacionesFiltradas.map(u => (
                      <option key={u.id} value={u.id}>{u.codigo} - {u.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    {estadosEquipo.map(e => (
                      <option key={e} value={e}>
                        {e.charAt(0).toUpperCase() + e.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    placeholder="Ej: Philips, GE, Siemens"
                  />
                </div>
                
                <div className="form-group">
                  <label>Modelo</label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    placeholder="Ej: XR-2020"
                  />
                </div>
                
                <div className="form-group">
                  <label>N° Serie</label>
                  <input
                    type="text"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                    placeholder="Número de serie único"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={cerrarFormulario}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave /> {equipoEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquiposPage;