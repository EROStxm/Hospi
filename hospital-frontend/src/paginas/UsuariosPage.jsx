// src/paginas/UsuariosPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFilter, FiEye, FiEyeOff } from 'react-icons/fi';
import { usuarioService } from '../servicios/usuarioService';
import { catalogosService } from '../servicios/catalogosService';
import '../estilos/usuarios.css';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [sectorFiltro, setSectorFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  
  const [formData, setFormData] = useState({
    codigo_militar: '',
    nombre_completo: '',
    email: '',
    contrasena: '',
    grado: '',
    especialidad: '',
    telefono: '',
    rol_id: '',
    sector_id: '',
    esta_activo: true
  });

  const [errores, setErrores] = useState({});

  const gradosMilitares = [
    'Capitán', 'Mayor', 'Teniente Coronel', 'Coronel',
    'Teniente', 'Sargento', 'Cabo', 'Soldado'
  ];

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, search, rolFiltro, sectorFiltro, estadoFiltro]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      await Promise.all([
        cargarUsuarios(),
        cargarRoles(),
        cargarSectores()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.obtenerTodos();
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setUsuarios(Array.isArray(datos) ? datos : []);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.error(error.message || 'Error al cargar usuarios');
      setUsuarios([]);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await catalogosService.obtenerRoles();
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setRoles(Array.isArray(datos) ? datos : []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
      setRoles([]);
    }
  };

  const cargarSectores = async () => {
    try {
      const response = await catalogosService.obtenerSectores();
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

  const filtrarUsuarios = () => {
    let filtrados = [...usuarios];
    
    if (search) {
      filtrados = filtrados.filter(u => 
        u.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
        u.codigo_militar?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.grado?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (rolFiltro) {
      filtrados = filtrados.filter(u => u.rol_id == rolFiltro);
    }
    
    if (sectorFiltro) {
      filtrados = filtrados.filter(u => u.sector_id == sectorFiltro);
    }
    
    if (estadoFiltro !== '') {
      filtrados = filtrados.filter(u => u.esta_activo === (estadoFiltro === 'true'));
    }
    
    setUsuariosFiltrados(filtrados);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.codigo_militar?.trim()) {
      nuevosErrores.codigo_militar = 'El código militar es requerido';
    }
    
    if (!formData.nombre_completo?.trim()) {
      nuevosErrores.nombre_completo = 'El nombre es requerido';
    }
    
    if (!usuarioEditando && !formData.contrasena?.trim()) {
      nuevosErrores.contrasena = 'La contraseña es requerida';
    }
    
    if (!formData.rol_id) {
      nuevosErrores.rol_id = 'Seleccione un rol';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }
    
    try {
      // Si es edición y no se cambió la contraseña, no enviarla
      const dataToSend = { ...formData };
      if (usuarioEditando && !dataToSend.contrasena) {
        delete dataToSend.contrasena;
      }
      
      let response;
      if (usuarioEditando) {
        response = await usuarioService.actualizar(usuarioEditando.id, dataToSend);
      } else {
        response = await usuarioService.crear(dataToSend);
      }
      
      if (response.success) {
        toast.success(usuarioEditando ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        cerrarFormulario();
        await cargarUsuarios();
      } else {
        toast.error(response.message || 'Error al guardar el usuario');
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      toast.error(error.message || 'Error al guardar el usuario');
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      codigo_militar: usuario.codigo_militar || '',
      nombre_completo: usuario.nombre_completo || '',
      email: usuario.email || '',
      contrasena: '',
      grado: usuario.grado || '',
      especialidad: usuario.especialidad || '',
      telefono: usuario.telefono || '',
      rol_id: usuario.rol_id || '',
      sector_id: usuario.sector_id || '',
      esta_activo: usuario.esta_activo !== false
    });
    setMostrarFormulario(true);
    setErrores({});
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    
    try {
      await usuarioService.eliminar(id);
      toast.success('Usuario eliminado exitosamente');
      await cargarUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error(error.message || 'Error al eliminar el usuario');
    }
  };

  const handleToggleEstado = async (usuario) => {
    const nuevoEstado = !usuario.esta_activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Está seguro de ${accion} este usuario?`)) return;
    
    try {
      await usuarioService.cambiarEstado(usuario.id, nuevoEstado);
      toast.success(`Usuario ${accion}do exitosamente`);
      await cargarUsuarios();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast.error(error.message || `Error al ${accion} el usuario`);
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setUsuarioEditando(null);
    setFormData({
      codigo_militar: '',
      nombre_completo: '',
      email: '',
      contrasena: '',
      grado: '',
      especialidad: '',
      telefono: '',
      rol_id: '',
      sector_id: '',
      esta_activo: true
    });
    setErrores({});
    setMostrarPassword(false);
  };

  const handleLimpiarFiltros = () => {
    setSearch('');
    setRolFiltro('');
    setSectorFiltro('');
    setEstadoFiltro('');
  };

  const filtrosActivos = search || rolFiltro || sectorFiltro || estadoFiltro !== '';

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="subtitle">Administración del personal del hospital</p>
        </div>
        <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
          <FiPlus /> Nuevo Usuario
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, email o grado..."
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
                <label>Rol</label>
                <select 
                  value={rolFiltro} 
                  onChange={(e) => setRolFiltro(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todos los roles</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>

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

      {/* Info de resultados */}
      <div className="resultados-info">
        <span>{usuariosFiltrados.length} usuarios encontrados</span>
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
              <th>Grado</th>
              <th>Rol</th>
              <th>Sector</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="7" className="text-center">Cargando...</td></tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No hay usuarios registrados</td></tr>
            ) : (
              usuariosFiltrados.map(usuario => (
                <tr key={usuario.id}>
                  <td><strong>{usuario.codigo_militar}</strong></td>
                  <td>{usuario.nombre_completo}</td>
                  <td>{usuario.grado || '-'}</td>
                  <td>{usuario.rol?.nombre || 'N/A'}</td>
                  <td>{usuario.sector?.nombre || 'N/A'}</td>
                  <td>
                    <span className={`estado-badge ${usuario.esta_activo ? 'estado-activo' : 'estado-inactivo'}`}>
                      {usuario.esta_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(usuario)} title="Editar">
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon" onClick={() => handleToggleEstado(usuario)} title={usuario.esta_activo ? 'Desactivar' : 'Activar'}>
                      {usuario.esta_activo ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button className="btn-icon danger" onClick={() => handleEliminar(usuario.id)} title="Eliminar">
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
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={cerrarFormulario}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Código Militar *</label>
                  <input
                    type="text"
                    value={formData.codigo_militar}
                    onChange={(e) => setFormData({...formData, codigo_militar: e.target.value})}
                    className={errores.codigo_militar ? 'error' : ''}
                  />
                  {errores.codigo_militar && <span className="error-text">{errores.codigo_militar}</span>}
                </div>
                
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    className={errores.nombre_completo ? 'error' : ''}
                  />
                  {errores.nombre_completo && <span className="error-text">{errores.nombre_completo}</span>}
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Contraseña {!usuarioEditando && '*'}</label>
                  <div className="password-input">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={formData.contrasena}
                      onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                      className={errores.contrasena ? 'error' : ''}
                      placeholder={usuarioEditando ? 'Dejar vacío para no cambiar' : ''}
                    />
                    <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}>
                      {mostrarPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errores.contrasena && <span className="error-text">{errores.contrasena}</span>}
                </div>
                
                <div className="form-group">
                  <label>Grado</label>
                  <select
                    value={formData.grado}
                    onChange={(e) => setFormData({...formData, grado: e.target.value})}
                  >
                    <option value="">Seleccione...</option>
                    {gradosMilitares.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Especialidad</label>
                  <input
                    type="text"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={formData.rol_id}
                    onChange={(e) => setFormData({...formData, rol_id: e.target.value})}
                    className={errores.rol_id ? 'error' : ''}
                  >
                    <option value="">Seleccione...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                  {errores.rol_id && <span className="error-text">{errores.rol_id}</span>}
                </div>
                
                <div className="form-group">
                  <label>Sector</label>
                  <select
                    value={formData.sector_id}
                    onChange={(e) => setFormData({...formData, sector_id: e.target.value})}
                  >
                    <option value="">Seleccione...</option>
                    {sectores.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Estado</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.esta_activo}
                        onChange={(e) => setFormData({...formData, esta_activo: e.target.checked})}
                      />
                      Usuario activo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={cerrarFormulario}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave /> {usuarioEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;