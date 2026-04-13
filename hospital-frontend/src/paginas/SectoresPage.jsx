// src/paginas/SectoresPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFilter } from 'react-icons/fi';
import { sectorService } from '../servicios/sectorService';
import '../estilos/sectores.css';

const SectoresPage = () => {
  const [sectores, setSectores] = useState([]);
  const [sectoresFiltrados, setSectoresFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [sectorEditando, setSectorEditando] = useState(null);
  
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [criticoFiltro, setCriticoFiltro] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    piso: '',
    telefono_extension: '',
    es_critico: false,
    esta_activo: true
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarSectores();
  }, []);

  useEffect(() => {
    filtrarSectores();
  }, [sectores, search, estadoFiltro, criticoFiltro]);

  const cargarSectores = async () => {
    try {
      setCargando(true);
      const response = await sectorService.obtenerTodos();
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setSectores(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      toast.error('Error al cargar sectores');
    } finally {
      setCargando(false);
    }
  };

  const filtrarSectores = () => {
    let filtrados = [...sectores];
    
    if (search) {
      filtrados = filtrados.filter(s => 
        s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        s.codigo?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (estadoFiltro !== '') {
      filtrados = filtrados.filter(s => s.esta_activo === (estadoFiltro === 'true'));
    }
    
    if (criticoFiltro !== '') {
      filtrados = filtrados.filter(s => s.es_critico === (criticoFiltro === 'true'));
    }
    
    setSectoresFiltrados(filtrados);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.codigo?.trim()) {
      nuevosErrores.codigo = 'El código es requerido';
    }
    
    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast.error('Complete los campos requeridos');
      return;
    }
    
    try {
      let response;
      if (sectorEditando) {
        response = await sectorService.actualizar(sectorEditando.id, formData);
      } else {
        response = await sectorService.crear(formData);
      }
      
      if (response.success) {
        toast.success(sectorEditando ? 'Sector actualizado' : 'Sector creado');
        setMostrarFormulario(false);
        setSectorEditando(null);
        setFormData({
          codigo: '', nombre: '', piso: '', telefono_extension: '',
          es_critico: false, esta_activo: true
        });
        cargarSectores();
      }
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleEditar = (sector) => {
    setSectorEditando(sector);
    setFormData(sector);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este sector?')) return;
    
    try {
      await sectorService.eliminar(id);
      toast.success('Sector eliminado');
      cargarSectores();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleLimpiarFiltros = () => {
    setSearch('');
    setEstadoFiltro('');
    setCriticoFiltro('');
  };

  const filtrosActivos = search || estadoFiltro !== '' || criticoFiltro !== '';

  return (
    <div className="sectores-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Sectores</h1>
          <p className="subtitle">Administración de áreas y departamentos del hospital</p>
        </div>
        <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
          <FiPlus /> Nuevo Sector
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

              <div className="filtro-group">
                <label>Criticidad</label>
                <select 
                  value={criticoFiltro} 
                  onChange={(e) => setCriticoFiltro(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todos</option>
                  <option value="true">Críticos</option>
                  <option value="false">No críticos</option>
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
        <span>{sectoresFiltrados.length} sectores encontrados</span>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Piso</th>
              <th>Extensión</th>
              <th>Crítico</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="7" className="text-center">Cargando...</td></tr>
            ) : sectoresFiltrados.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No hay sectores</td></tr>
            ) : (
              sectoresFiltrados.map(sector => (
                <tr key={sector.id}>
                  <td><strong>{sector.codigo}</strong></td>
                  <td>{sector.nombre}</td>
                  <td>{sector.piso || '-'}</td>
                  <td>{sector.telefono_extension || '-'}</td>
                  <td>
                    <span className={`estado-badge ${sector.es_critico ? 'estado-critico' : ''}`}>
                      {sector.es_critico ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${sector.esta_activo ? 'estado-activo' : 'estado-inactivo'}`}>
                      {sector.esta_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(sector)}>
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleEliminar(sector.id)}>
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
              <h2>{sectorEditando ? 'Editar Sector' : 'Nuevo Sector'}</h2>
              <button onClick={() => { setMostrarFormulario(false); setSectorEditando(null); }}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    className={errores.codigo ? 'error' : ''}
                  />
                  {errores.codigo && <span className="error-text">{errores.codigo}</span>}
                </div>
                
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className={errores.nombre ? 'error' : ''}
                  />
                  {errores.nombre && <span className="error-text">{errores.nombre}</span>}
                </div>
                
                <div className="form-group">
                  <label>Piso</label>
                  <input
                    type="number"
                    value={formData.piso}
                    onChange={(e) => setFormData({...formData, piso: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Extensión Tel.</label>
                  <input
                    type="text"
                    value={formData.telefono_extension}
                    onChange={(e) => setFormData({...formData, telefono_extension: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.es_critico}
                      onChange={(e) => setFormData({...formData, es_critico: e.target.checked})}
                    />
                    Sector crítico
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.esta_activo}
                      onChange={(e) => setFormData({...formData, esta_activo: e.target.checked})}
                    />
                    Sector activo
                  </label>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave /> {sectorEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectoresPage;