// src/paginas/EquiposPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFilter } from 'react-icons/fi';
import '../estilos/equipos.css';

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState(null);
  
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
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: 'operativo'
  });

  const estadosEquipo = ['operativo', 'mantenimiento', 'averiado', 'fuera_servicio'];
  
  // Obtener marcas únicas para el filtro
  const marcasUnicas = [...new Set(equipos.map(e => e.marca).filter(Boolean))];

  useEffect(() => {
    cargarEquipos();
    cargarSectores();
  }, []);

  useEffect(() => {
    filtrarEquipos();
  }, [equipos, search, sectorFiltro, estadoFiltro, marcaFiltro]);

  const cargarEquipos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/equipos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const datos = data.data?.data || data.data || data;
        setEquipos(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      toast.error('Error al cargar equipos');
    } finally {
      setCargando(false);
    }
  };

  const cargarSectores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/sectores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const datos = data.data?.data || data.data || data;
        setSectores(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando sectores:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = equipoEditando 
        ? `http://localhost:8000/api/equipos/${equipoEditando.id}`
        : 'http://localhost:8000/api/equipos';
      
      const method = equipoEditando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(equipoEditando ? 'Equipo actualizado' : 'Equipo creado');
        setMostrarFormulario(false);
        setEquipoEditando(null);
        setFormData({
          codigo_equipo: '', nombre: '', descripcion: '', categoria_id: '1',
          sector_id: '', marca: '', modelo: '', numero_serie: '', estado: 'operativo'
        });
        cargarEquipos();
      }
    } catch (error) {
      toast.error('Error al guardar el equipo');
    }
  };

  const handleEditar = (equipo) => {
    setEquipoEditando(equipo);
    setFormData({
      ...equipo,
      categoria_id: equipo.categoria_id || '1'
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este equipo?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/equipos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Equipo eliminado');
      cargarEquipos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
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
              <th>Marca</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="7" className="text-center">Cargando...</td></tr>
            ) : equiposFiltrados.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No hay equipos registrados</td></tr>
            ) : (
              equiposFiltrados.map(equipo => (
                <tr key={equipo.id}>
                  <td><strong>{equipo.codigo_equipo}</strong></td>
                  <td>{equipo.nombre}</td>
                  <td>{equipo.sector?.nombre || 'N/A'}</td>
                  <td>{equipo.marca || '-'}</td>
                  <td>{equipo.modelo || '-'}</td>
                  <td>
                    <span className={`estado-badge estado-${equipo.estado}`}>
                      {equipo.estado?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(equipo)}>
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleEliminar(equipo.id)}>
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
              <button onClick={() => { setMostrarFormulario(false); setEquipoEditando(null); }}>
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
                  />
                </div>
                
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
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
                  />
                </div>
                
                <div className="form-group">
                  <label>Modelo</label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>N° Serie</label>
                  <input
                    type="text"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => { setMostrarFormulario(false); setEquipoEditando(null); }}>
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