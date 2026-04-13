// src/paginas/MaterialesPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import '../estilos/materiales.css';
import { materialService } from '../servicios/materialService';

const MaterialesPage = () => {
  const [materiales, setMateriales] = useState([]);
  const [materialesFiltrados, setMaterialesFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [materialEditando, setMaterialEditando] = useState(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [stockBajoFiltro, setStockBajoFiltro] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    stock: 0,
    stock_minimo: 5,
    unidad: 'piezas',
    costo_unitario: '',
    esta_activo: true
  });

  const [errores, setErrores] = useState({});

  const categorias = ['insumos_medicos', 'sensores', 'accesorios', 'filtros', 'electricos', 'ferreteria', 'iluminacion', 'lubricantes'];
  const unidades = ['piezas', 'litros', 'metros', 'juegos', 'cajas', 'paquetes'];

  // Obtener categorías únicas de los materiales existentes
  const categoriasUnicas = [...new Set(materiales.map(m => m.categoria).filter(Boolean))];

  useEffect(() => {
    cargarMateriales();
  }, []);

  useEffect(() => {
    filtrarMateriales();
  }, [materiales, search, categoriaFiltro, stockBajoFiltro, estadoFiltro]);

  // En cargarMateriales:
    const cargarMateriales = async () => {
    try {
        setCargando(true);
        const response = await materialService.obtenerTodos();
        
        if (response.success) {
        const datos = response.data?.data || response.data || response;
        setMateriales(Array.isArray(datos) ? datos : []);
        }
    } catch (error) {
        console.error('Error cargando materiales:', error);
        toast.error('Error al cargar materiales');
    } finally {
        setCargando(false);
    }
    };

    // En handleSubmit:
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
        toast.error('Por favor complete los campos requeridos');
        return;
    }
    
    try {
        let response;
        if (materialEditando) {
        response = await materialService.actualizar(materialEditando.id, formData);
        } else {
        response = await materialService.crear(formData);
        }
        
        if (response.success) {
        toast.success(materialEditando ? 'Material actualizado' : 'Material creado');
        setMostrarFormulario(false);
        setMaterialEditando(null);
        setFormData({
            codigo: '', nombre: '', descripcion: '', categoria: '',
            stock: 0, stock_minimo: 5, unidad: 'piezas', costo_unitario: '', esta_activo: true
        });
        cargarMateriales();
        }
    } catch (error) {
        toast.error(error.message || 'Error al guardar el material');
    }
    };

    // En handleEliminar:
    const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este material?')) return;
    
    try {
        await materialService.eliminar(id);
        toast.success('Material eliminado');
        cargarMateriales();
    } catch (error) {
        toast.error(error.message || 'Error al eliminar');
    }
    };

    // En handleAjustarStock:
    const handleAjustarStock = async (material, cantidad, tipo) => {
    try {
        await materialService.ajustarStock(material.id, cantidad, tipo);
        toast.success(`Stock ${tipo === 'entrada' ? 'aumentado' : 'disminuido'}`);
        cargarMateriales();
    } catch (error) {
        toast.error(error.message || 'Error al ajustar stock');
    }
    };

  const filtrarMateriales = () => {
    let filtrados = [...materiales];
    
    if (search) {
      filtrados = filtrados.filter(m => 
        m.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        m.codigo?.toLowerCase().includes(search.toLowerCase()) ||
        m.descripcion?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (categoriaFiltro) {
      filtrados = filtrados.filter(m => m.categoria === categoriaFiltro);
    }
    
    if (stockBajoFiltro) {
      filtrados = filtrados.filter(m => m.stock <= m.stock_minimo);
    }
    
    if (estadoFiltro !== '') {
      filtrados = filtrados.filter(m => m.esta_activo === (estadoFiltro === 'true'));
    }
    
    setMaterialesFiltrados(filtrados);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.codigo?.trim()) {
      nuevosErrores.codigo = 'El código es requerido';
    }
    
    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }
    
    if (formData.stock < 0) {
      nuevosErrores.stock = 'El stock no puede ser negativo';
    }
    
    if (formData.stock_minimo < 1) {
      nuevosErrores.stock_minimo = 'El stock mínimo debe ser al menos 1';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleEditar = (material) => {
    setMaterialEditando(material);
    setFormData({
      codigo: material.codigo || '',
      nombre: material.nombre || '',
      descripcion: material.descripcion || '',
      categoria: material.categoria || '',
      stock: material.stock || 0,
      stock_minimo: material.stock_minimo || 5,
      unidad: material.unidad || 'piezas',
      costo_unitario: material.costo_unitario || '',
      esta_activo: material.esta_activo !== false
    });
    setMostrarFormulario(true);
  };
  
  const handleLimpiarFiltros = () => {
    setSearch('');
    setCategoriaFiltro('');
    setStockBajoFiltro(false);
    setEstadoFiltro('');
  };

  const filtrosActivos = search || categoriaFiltro || stockBajoFiltro || estadoFiltro !== '';

  const stockBajoCount = materiales.filter(m => m.stock <= m.stock_minimo).length;

  return (
    <div className="materiales-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Materiales</h1>
          <p className="subtitle">Administración del inventario y suministros</p>
        </div>
        <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
          <FiPlus /> Nuevo Material
        </button>
      </div>

      {/* Alertas de stock bajo */}
      {stockBajoCount > 0 && (
        <div className="alert-warning">
          <FiAlertTriangle /> {stockBajoCount} material(es) con stock bajo
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o descripción..."
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
                <label>Categoría</label>
                <select 
                  value={categoriaFiltro} 
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todas las categorías</option>
                  {categoriasUnicas.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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

              <div className="filtro-group checkbox-filter">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={stockBajoFiltro}
                    onChange={(e) => setStockBajoFiltro(e.target.checked)}
                  />
                  Solo stock bajo
                </label>
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
        <span>{materialesFiltrados.length} materiales encontrados</span>
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
              <th>Categoría</th>
              <th>Stock</th>
              <th>Stock Mín.</th>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="8" className="text-center">Cargando...</td></tr>
            ) : materialesFiltrados.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No hay materiales registrados</td></tr>
            ) : (
              materialesFiltrados.map(material => {
                const stockBajo = material.stock <= material.stock_minimo;
                return (
                  <tr key={material.id} className={stockBajo ? 'stock-bajo' : ''}>
                    <td><strong>{material.codigo}</strong></td>
                    <td>{material.nombre}</td>
                    <td>{material.categoria || '-'}</td>
                    <td className={stockBajo ? 'text-danger' : ''}>
                      {material.stock}
                    </td>
                    <td>{material.stock_minimo}</td>
                    <td>{material.unidad}</td>
                    <td>
                      <span className={`estado-badge ${material.esta_activo ? 'estado-activo' : 'estado-inactivo'}`}>
                        {material.esta_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="acciones-grupo">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleAjustarStock(material, 1, 'entrada')}
                          title="Aumentar stock"
                        >
                          +1
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleAjustarStock(material, 1, 'salida')}
                          title="Disminuir stock"
                          disabled={material.stock <= 0}
                        >
                          -1
                        </button>
                        <button className="btn-icon" onClick={() => handleEditar(material)} title="Editar">
                          <FiEdit2 />
                        </button>
                        <button className="btn-icon danger" onClick={() => handleEliminar(material.id)} title="Eliminar">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{materialEditando ? 'Editar Material' : 'Nuevo Material'}</h2>
              <button onClick={() => { setMostrarFormulario(false); setMaterialEditando(null); setErrores({}); }}>
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
                
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="">Seleccione...</option>
                    {categorias.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Unidad</label>
                  <select
                    value={formData.unidad}
                    onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                  >
                    {unidades.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    className={errores.stock ? 'error' : ''}
                  />
                  {errores.stock && <span className="error-text">{errores.stock}</span>}
                </div>
                
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({...formData, stock_minimo: parseInt(e.target.value) || 5})}
                    className={errores.stock_minimo ? 'error' : ''}
                  />
                  {errores.stock_minimo && <span className="error-text">{errores.stock_minimo}</span>}
                </div>
                
                <div className="form-group">
                  <label>Costo Unitario</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costo_unitario}
                    onChange={(e) => setFormData({...formData, costo_unitario: e.target.value})}
                  />
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
                      Material activo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => { setMostrarFormulario(false); setMaterialEditando(null); setErrores({}); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave /> {materialEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialesPage;