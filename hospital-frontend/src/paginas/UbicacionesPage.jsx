// src/paginas/UbicacionesPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFilter } from 'react-icons/fi';
import { ubicacionService } from '../servicios/ubicacionService';
import { sectorService } from '../servicios/sectorService';

const UbicacionesPage = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ubicacionEditando, setUbicacionEditando] = useState(null);
  
  const [search, setSearch] = useState('');
  const [sectorFiltro, setSectorFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  
  const [formData, setFormData] = useState({
    sector_id: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    piso: '',
    numero_consultorio: '',
    es_critico: false,
    esta_activo: true
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    filtrarUbicaciones();
  }, [ubicaciones, search, sectorFiltro, estadoFiltro]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      await Promise.all([
        cargarUbicaciones(),
        cargarSectores()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setCargando(false);
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
      toast.error(error.message || 'Error al cargar ubicaciones');
      setUbicaciones([]);
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

  const filtrarUbicaciones = () => {
    let filtradas = [...ubicaciones];
    
    if (search) {
      filtradas = filtradas.filter(u => 
        u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        u.codigo?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sectorFiltro) {
      filtradas = filtradas.filter(u => u.sector_id == sectorFiltro);
    }
    
    if (estadoFiltro !== '') {
      filtradas = filtradas.filter(u => u.esta_activo === (estadoFiltro === 'true'));
    }
    
    setUbicacionesFiltradas(filtradas);
  };

  const validarFormulario = () => {
    if (!formData.sector_id) {
      toast.error('Debe seleccionar un sector');
      return false;
    }
    if (!formData.codigo?.trim()) {
      toast.error('El código es requerido');
      return false;
    }
    if (!formData.nombre?.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    try {
      let response;
      if (ubicacionEditando) {
        response = await ubicacionService.actualizar(ubicacionEditando.id, formData);
      } else {
        response = await ubicacionService.crear(formData);
      }
      
      if (response.success) {
        toast.success(ubicacionEditando ? 'Ubicación actualizada exitosamente' : 'Ubicación creada exitosamente');
        cerrarFormulario();
        await cargarUbicaciones();
      } else {
        toast.error(response.message || 'Error al guardar la ubicación');
      }
    } catch (error) {
      console.error('Error guardando ubicación:', error);
      toast.error(error.message || 'Error al guardar la ubicación');
    }
  };

  const handleEditar = (ubicacion) => {
    setUbicacionEditando(ubicacion);
    setFormData({
      sector_id: ubicacion.sector_id || '',
      codigo: ubicacion.codigo || '',
      nombre: ubicacion.nombre || '',
      descripcion: ubicacion.descripcion || '',
      piso: ubicacion.piso || '',
      numero_consultorio: ubicacion.numero_consultorio || '',
      es_critico: ubicacion.es_critico || false,
      esta_activo: ubicacion.esta_activo !== false
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta ubicación? Esta acción no se puede deshacer.')) return;
    
    try {
      await ubicacionService.eliminar(id);
      toast.success('Ubicación eliminada exitosamente');
      await cargarUbicaciones();
    } catch (error) {
      console.error('Error eliminando ubicación:', error);
      toast.error(error.message || 'Error al eliminar la ubicación');
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setUbicacionEditando(null);
    setFormData({
      sector_id: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      piso: '',
      numero_consultorio: '',
      es_critico: false,
      esta_activo: true
    });
  };

  const handleLimpiarFiltros = () => {
    setSearch('');
    setSectorFiltro('');
    setEstadoFiltro('');
  };

  const filtrosActivos = search || sectorFiltro || estadoFiltro !== '';

  return (
    <div className="ubicaciones-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Ubicaciones</h1>
          <p className="subtitle">Administración de consultorios, boxes y áreas específicas</p>
        </div>
        <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
          <FiPlus /> Nueva Ubicación
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
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
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
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

      {/* Info resultados */}
      <div className="resultados-info">
        <span>{ubicacionesFiltradas.length} ubicaciones encontradas</span>
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
              <th>Piso</th>
              <th>Consultorio</th>
              <th>Crítico</th>
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
            ) : ubicacionesFiltradas.length === 0 ? (
              <tr><td colSpan="8" className="text-center">
                No hay ubicaciones registradas
              </td></tr>
            ) : (
              ubicacionesFiltradas.map(ubicacion => (
                <tr key={ubicacion.id}>
                  <td><strong>{ubicacion.codigo}</strong></td>
                  <td>{ubicacion.nombre}</td>
                  <td>{ubicacion.sector?.nombre || 'N/A'}</td>
                  <td>{ubicacion.piso || '-'}</td>
                  <td>{ubicacion.numero_consultorio || '-'}</td>
                  <td>
                    <span className={`estado-badge ${ubicacion.es_critico ? 'estado-critico' : ''}`}>
                      {ubicacion.es_critico ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${ubicacion.esta_activo ? 'estado-activo' : 'estado-inactivo'}`}>
                      {ubicacion.esta_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEditar(ubicacion)}
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => handleEliminar(ubicacion.id)}
                      title="Eliminar"
                    >
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
              <h2>{ubicacionEditando ? 'Editar Ubicación' : 'Nueva Ubicación'}</h2>
              <button onClick={cerrarFormulario}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
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
                  <label>Código *</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    required
                    placeholder="Ej: CONSULT-101"
                  />
                </div>
                
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                    placeholder="Ej: Consultorio 101"
                  />
                </div>
                
                <div className="form-group">
                  <label>Piso</label>
                  <input
                    type="number"
                    value={formData.piso}
                    onChange={(e) => setFormData({...formData, piso: e.target.value})}
                    placeholder="Número de piso"
                  />
                </div>
                
                <div className="form-group">
                  <label>N° Consultorio</label>
                  <input
                    type="text"
                    value={formData.numero_consultorio}
                    onChange={(e) => setFormData({...formData, numero_consultorio: e.target.value})}
                    placeholder="Ej: 101, A-101"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="2"
                    placeholder="Descripción adicional de la ubicación"
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.es_critico}
                      onChange={(e) => setFormData({...formData, es_critico: e.target.checked})}
                    />
                    Área crítica
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.esta_activo}
                      onChange={(e) => setFormData({...formData, esta_activo: e.target.checked})}
                    />
                    Ubicación activa
                  </label>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={cerrarFormulario}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave /> {ubicacionEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UbicacionesPage;