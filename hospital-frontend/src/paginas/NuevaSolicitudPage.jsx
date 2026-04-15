// src/paginas/NuevaSolicitudPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import { sectorService } from '../servicios/sectorService';
import { equipoService } from '../servicios/equipoService';
import { ubicacionService } from '../servicios/ubicacionService';
import toast from 'react-hot-toast';
import { FiSave, FiX, FiCamera, FiCheckCircle } from 'react-icons/fi';
import '../estilos/nueva-solicitud.css';
import SubirImagenes from '../componentes/comunes/SubirImagenes';

const NuevaSolicitudPage = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [sectores, setSectores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
  
  const [solicitudCreadaId, setSolicitudCreadaId] = useState(null);
  const [imagenesSubidas, setImagenesSubidas] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo_solicitud: 'sin_material',
    titulo: '',
    descripcion: '',
    sector_id: '',
    ubicacion_id: '',
    equipo_id: '',
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarSectores();
    cargarEquipos();
    cargarUbicaciones();
  }, []);

  useEffect(() => {
    if (formData.sector_id && Array.isArray(equipos)) {
      const filtrados = equipos.filter(e => e.sector_id == formData.sector_id);
      setEquiposFiltrados(filtrados);
    } else {
      setEquiposFiltrados([]);
    }
  }, [formData.sector_id, equipos]);

  useEffect(() => {
    if (formData.sector_id && Array.isArray(ubicaciones)) {
      const filtradas = ubicaciones.filter(u => u.sector_id == formData.sector_id);
      setUbicacionesFiltradas(filtradas);
    } else {
      setUbicacionesFiltradas([]);
    }
  }, [formData.sector_id, ubicaciones]);

  // =============================================
  // FUNCIONES CORREGIDAS PARA CARGAR DATOS
  // =============================================
  
  const cargarSectores = async () => {
    try {
      const response = await sectorService.obtenerTodos();
      console.log('📦 Sectores response:', response);
      
      if (response.success) {
        // Manejar diferentes formatos de respuesta
        let datos = [];
        if (response.data?.data) {
          datos = response.data.data; // Paginated
        } else if (response.data) {
          datos = response.data;
        } else {
          datos = response;
        }
        setSectores(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando sectores:', error);
      setSectores([]);
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await equipoService.obtenerTodos();
      console.log('📦 Equipos response:', response);
      
      if (response.success) {
        let datos = [];
        if (response.data?.data) {
          datos = response.data.data;
        } else if (response.data) {
          datos = response.data;
        } else {
          datos = response;
        }
        setEquipos(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      setEquipos([]);
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const response = await ubicacionService.obtenerTodos();
      console.log('📦 Ubicaciones response:', response);
      
      if (response.success) {
        let datos = [];
        if (response.data?.data) {
          datos = response.data.data;
        } else if (response.data) {
          datos = response.data;
        } else {
          datos = response;
        }
        setUbicaciones(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
      setUbicaciones([]);
    }
  };

  // =============================================
  // RESTO DEL CÓDIGO IGUAL
  // =============================================

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
        setSolicitudCreadaId(response.data.id);
        toast.success('¡Solicitud creada! Ahora puedes agregar fotos');
      }
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      toast.error(error.response?.data?.message || 'Error al crear la solicitud');
    } finally {
      setCargando(false);
    }
  };

  const handleFinalizar = () => {
    if (imagenesSubidas) {
      toast.success('¡Solicitud completada con fotos!');
    }
    navigate('/mis-solicitudes');
  };

  // Si ya se creó la solicitud, mostrar sección de fotos
  if (solicitudCreadaId) {
    return (
      <div className="nueva-solicitud-page">
        <div className="page-header">
          <div className="header-content">
            <h1>📸 Agregar Evidencia</h1>
            <p className="subtitle">Puedes agregar fotos para ayudar a identificar el problema</p>
          </div>
        </div>

        <div className="upload-section">
          <div className="success-badge">
            <FiCheckCircle className="success-icon" />
            <span>Solicitud #{solicitudCreadaId} creada exitosamente</span>
          </div>

          <div className="upload-container">
            <h3>
              <FiCamera /> Fotos de la solicitud (opcional)
            </h3>
            <SubirImagenes 
              solicitudId={solicitudCreadaId}
              onImagenesSubidas={() => {
                setImagenesSubidas(true);
                toast.success('¡Fotos agregadas correctamente!');
              }}
            />
          </div>

          <div className="form-actions">
            <button 
              className="btn-primary"
              onClick={handleFinalizar}
            >
              {imagenesSubidas ? '✅ Finalizar y ver solicitudes' : '⏭️ Omitir fotos y finalizar'}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate(`/solicitudes/${solicitudCreadaId}`)}
            >
              👁️ Ver solicitud creada
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario normal
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
            {sectores.length > 0 ? (
              sectores.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.nombre}</option>
              ))
            ) : (
              <option disabled>Cargando sectores...</option>
            )}
          </select>
          {errores.sector_id && <span className="error-text">{errores.sector_id}</span>}
        </div>

        {/* Ubicación específica */}
        <div className="form-group">
          <label className="form-label">Ubicación específica</label>
          <select
            name="ubicacion_id"
            value={formData.ubicacion_id}
            onChange={handleChange}
            className="form-select"
            disabled={!formData.sector_id}
          >
            <option value="">
              {!formData.sector_id ? 'Primero seleccione un sector' : 'Seleccione ubicación (opcional)'}
            </option>
            {ubicacionesFiltradas.map(ubicacion => (
              <option key={ubicacion.id} value={ubicacion.id}>
                {ubicacion.codigo} - {ubicacion.nombre}
              </option>
            ))}
          </select>
          <small className="form-hint">Ayuda a localizar el equipo más rápido</small>
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
            {equiposFiltrados.map(equipo => (
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