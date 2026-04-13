// src/paginas/NuevaSolicitudPage.jsx - VERSIÓN FINAL
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import toast from 'react-hot-toast';
import { FiSave, FiX } from 'react-icons/fi';
import '../estilos/nueva-solicitud.css';

const NuevaSolicitudPage = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [sectores, setSectores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  
  const [formData, setFormData] = useState({
    tipo_solicitud: 'sin_material',
    titulo: '',
    descripcion: '',
    sector_id: '',
    equipo_id: '',
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarSectores();
    cargarEquipos();
  }, []);

  useEffect(() => {
    if (formData.sector_id && Array.isArray(equipos)) {
      const filtrados = equipos.filter(e => e.sector_id == formData.sector_id);
      setEquiposFiltrados(filtrados);
    } else {
      setEquiposFiltrados([]);
    }
  }, [formData.sector_id, equipos]);

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
      
      if (data.success && Array.isArray(data.data)) {
        setSectores(data.data);
      } else if (Array.isArray(data)) {
        setSectores(data);
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
      
      if (data.success && Array.isArray(data.data)) {
        setEquipos(data.data);
      } else if (Array.isArray(data)) {
        setEquipos(data);
      } else {
        setEquipos([]);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      setEquipos([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errores[name]) {
      setErrores({ ...errores, [name]: null });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.titulo.trim()) {
      nuevosErrores.titulo = 'El título es requerido';
    }
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.sector_id) {
      nuevosErrores.sector_id = 'Seleccione un sector';
    }
    
    if (!formData.equipo_id) {
      nuevosErrores.equipo_id = 'Seleccione un equipo';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    
    setCargando(true);
    
    try {
      const response = await solicitudService.crear(formData);
      
      if (response.success) {
        toast.success('¡Solicitud creada correctamente!');
        navigate('/mis-solicitudes');
      }
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      toast.error(error.response?.data?.message || 'Error al crear la solicitud');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="nueva-solicitud-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Nueva Solicitud</h1>
          <p className="subtitle">Complete el formulario para crear una solicitud de mantenimiento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="solicitud-form">
        {/* Tipo de Solicitud */}
        <div className="form-section">
          <label className="form-label">Tipo de Solicitud *</label>
          <div className="tipo-solicitud-group">
            <label className={`tipo-option ${formData.tipo_solicitud === 'sin_material' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipo_solicitud"
                value="sin_material"
                checked={formData.tipo_solicitud === 'sin_material'}
                onChange={handleChange}
              />
              <span className="tipo-icon">🔧</span>
              <span className="tipo-text">Sin Material</span>
              <small>No requiere aprobación adicional</small>
            </label>
            
            <label className={`tipo-option ${formData.tipo_solicitud === 'con_material' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipo_solicitud"
                value="con_material"
                checked={formData.tipo_solicitud === 'con_material'}
                onChange={handleChange}
              />
              <span className="tipo-icon">📦</span>
              <span className="tipo-text">Con Material</span>
              <small>Requiere aprobación de jefe de servicio</small>
            </label>
          </div>
        </div>

        {/* Sector */}
        <div className="form-group">
          <label className="form-label">Sector *</label>
          <select
            name="sector_id"
            value={formData.sector_id}
            onChange={handleChange}
            className={`form-select ${errores.sector_id ? 'error' : ''}`}
          >
            <option value="">Seleccione un sector</option>
            {Array.isArray(sectores) && sectores.map(sector => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
              </option>
            ))}
          </select>
          {errores.sector_id && <span className="error-text">{errores.sector_id}</span>}
        </div>

        {/* Equipo */}
        <div className="form-group">
          <label className="form-label">Equipo *</label>
          <select
            name="equipo_id"
            value={formData.equipo_id}
            onChange={handleChange}
            className={`form-select ${errores.equipo_id ? 'error' : ''}`}
            disabled={!formData.sector_id}
          >
            <option value="">
              {!formData.sector_id ? 'Primero seleccione un sector' : 'Seleccione un equipo'}
            </option>
            {Array.isArray(equiposFiltrados) && equiposFiltrados.map(equipo => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.codigo_equipo} - {equipo.nombre}
              </option>
            ))}
          </select>
          {errores.equipo_id && <span className="error-text">{errores.equipo_id}</span>}
        </div>

        {/* Título */}
        <div className="form-group">
          <label className="form-label">Título *</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Monitor no enciende"
            className={`form-input ${errores.titulo ? 'error' : ''}`}
          />
          {errores.titulo && <span className="error-text">{errores.titulo}</span>}
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describa el problema detalladamente..."
            rows="5"
            className={`form-textarea ${errores.descripcion ? 'error' : ''}`}
          />
          {errores.descripcion && <span className="error-text">{errores.descripcion}</span>}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/mis-solicitudes')}
          >
            <FiX /> Cancelar
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={cargando}
          >
            {cargando ? 'Creando...' : <><FiSave /> Crear Solicitud</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaSolicitudPage;