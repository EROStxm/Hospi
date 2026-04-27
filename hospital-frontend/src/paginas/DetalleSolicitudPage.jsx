// src/paginas/DetalleSolicitudPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { solicitudService } from '../servicios/solicitudService';
import { usuarioService } from '../servicios/usuarioService';
import { materialService } from '../servicios/materialService';
import { sectorService } from '../servicios/sectorService';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle, FiTool, 
  FiUser, FiMapPin, FiBox, FiCalendar, FiEdit2, FiCheck,
  FiUserPlus, FiPackage, FiMessageCircle, FiSend, FiX
} from 'react-icons/fi';
import '../estilos/detalle-solicitud.css';

import SubirImagenes from '../componentes/comunes/SubirImagenes';

// Cambiar esta línea:
// Por:
import { FiDownload, FiCode } from 'react-icons/fi';
// O usa: import { FiDownload, FiGrid } from 'react-icons/fi';

const DetalleSolicitudPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  
  // Estados para modales
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [mostrarModalCompletar, setMostrarModalCompletar] = useState(false);
  const [mostrarModalMateriales, setMostrarModalMateriales] = useState(false);
  const [mostrarModalConformidad, setMostrarModalConformidad] = useState(false);
  const [mostrarModalQr, setMostrarModalQr] = useState(false);
  
  // Estados para formularios
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('');
  const [notasTecnico, setNotasTecnico] = useState('');
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);
  const [comentarioConformidad, setComentarioConformidad] = useState('');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const estadosConfig = {
    pendiente_solicitante: { label: 'Pendiente Solicitante', color: '#f59e0b', icon: <FiClock /> },
    pendiente_jefe_seccion: { label: 'Pendiente Jefe Sección', color: '#3b82f6', icon: <FiClock /> },
    pendiente_jefe_activos: { label: 'Pendiente Jefe Activos', color: '#3b82f6', icon: <FiClock /> },
    pendiente_soporte: { label: 'Pendiente Soporte', color: '#8b5cf6', icon: <FiClock /> },
    asignado: { label: 'Asignado', color: '#06b6d4', icon: <FiTool /> },
    en_proceso: { label: 'En Proceso', color: '#3b82f6', icon: <FiTool /> },
    pendiente_conformacion: { label: 'Pendiente Conformidad', color: '#f59e0b', icon: <FiAlertCircle /> },
    pendiente_jefe_mantenimiento: { label: 'Pendiente Jefe Mant.', color: '#3b82f6', icon: <FiClock /> },
    completado: { label: 'Completado', color: '#10b981', icon: <FiCheckCircle /> },
    rechazado: { label: 'Rechazado', color: '#ef4444', icon: <FiAlertCircle /> }
  };

  useEffect(() => {
    cargarUsuarioActual();
    cargarSolicitud();
    cargarTecnicos();
    cargarMateriales();
    cargarSectores();
  }, [id]);

  const cargarUsuarioActual = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    setUsuarioActual(usuario);
  };

  const cargarSolicitud = async () => {
    try {
      setCargando(true);
      const response = await solicitudService.obtenerPorId(id);
      if (response.success) {
        setSolicitud(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  const cargarTecnicos = async () => {
    try {
      const response = await usuarioService.obtenerTecnicos();
      if (response.success) {
        setTecnicos(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando técnicos:', error);
    }
  };

  const cargarMateriales = async () => {
    try {
      const response = await materialService.obtenerTodos();
      if (response.success) {
        const datos = response.data?.data || response.data || [];
        setMateriales(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando materiales:', error);
    }
  };

  // ← FUNCIÓN AGREGADA PARA CARGAR SECTORES
  const cargarSectores = async () => {
    try {
      const response = await sectorService.obtenerTodos();
      if (response.success) {
        const datos = response.data?.data || response.data || response;
        setSectores(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error('Error cargando sectores:', error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoConfig = (estado) => {
    return estadosConfig[estado] || { label: estado, color: '#6b7280', icon: <FiClock /> };
  };

  // =============================================
  // PERMISOS
  // =============================================

  const puedeFirmarSolicitante = () => {
    return solicitud?.estado === 'pendiente_solicitante' && 
           usuarioActual?.id === solicitud?.solicitante_id;
  };

  const puedeFirmarJefeSeccion = () => {
    return solicitud?.estado === 'pendiente_jefe_seccion' && 
           usuarioActual?.rol?.nombre === 'jefe_servicio' &&
           usuarioActual?.sector_id === solicitud?.sector_id;
  };

  const puedeFirmarJefeActivos = () => {
    return solicitud?.estado === 'pendiente_jefe_activos' && 
           ['jefe_soporte', 'admin_sistema'].includes(usuarioActual?.rol?.nombre);
  };

  const puedeAsignarTecnico = () => {
    return solicitud?.estado === 'pendiente_soporte' && 
           ['jefe_soporte', 'admin_sistema'].includes(usuarioActual?.rol?.nombre);
  };

  const puedeCompletarTrabajo = () => {
    return ['asignado', 'en_proceso'].includes(solicitud?.estado) && 
           usuarioActual?.id === solicitud?.tecnico_asignado_id;
  };

  const puedeDarConformidad = () => {
    return solicitud?.estado === 'pendiente_conformacion' && 
           usuarioActual?.id === solicitud?.solicitante_id;
  };

  const puedeFirmarJefeMantenimiento = () => {
    return solicitud?.estado === 'pendiente_jefe_mantenimiento' && 
           ['jefe_soporte', 'admin_sistema'].includes(usuarioActual?.rol?.nombre);
  };

  const puedeUsarMateriales = () => {
    return ['asignado', 'en_proceso'].includes(solicitud?.estado) && 
           usuarioActual?.id === solicitud?.tecnico_asignado_id;
  };

  // =============================================
  // ACCIONES
  // =============================================

  const handleFirmarSolicitante = async () => {
    try {
      setCargandoAccion(true);
      const response = await solicitudService.firmar(id);
      if (response.success) {
        toast.success('Solicitud firmada correctamente');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al firmar la solicitud');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Firmar como jefe sección
  const handleFirmarJefeSeccion = async () => {
    try {
      setCargandoAccion(true);
      const response = await solicitudService.firmar(id);
      if (response.success) {
        toast.success('Firma registrada correctamente');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al firmar');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Firmar como jefe activos
  const handleFirmarJefeActivos = async () => {
    try {
      setCargandoAccion(true);
      const response = await solicitudService.firmar(id);
      if (response.success) {
        toast.success('Firma registrada correctamente');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al firmar');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Firmar como jefe de mantenimiento
  const handleFirmarJefeMantenimiento = async () => {
    try {
      setCargandoAccion(true);
      const response = await solicitudService.firmar(id);
      if (response.success) {
        toast.success('Solicitud cerrada correctamente');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al cerrar la solicitud');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Asignar técnico
  const handleAsignarTecnico = async () => {
    if (!tecnicoSeleccionado) {
      toast.error('Seleccione un técnico');
      return;
    }
    
    try {
      setCargandoAccion(true);
      const response = await solicitudService.asignarTecnico(id, tecnicoSeleccionado);
      if (response.success) {
        toast.success('Técnico asignado correctamente');
        setMostrarModalAsignar(false);
        setTecnicoSeleccionado('');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al asignar técnico');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Completar trabajo
  const handleCompletarTrabajo = async () => {
    if (!notasTecnico.trim()) {
      toast.error('Debe ingresar notas del trabajo realizado');
      return;
    }
    
    try {
      setCargandoAccion(true);
      const response = await solicitudService.completarTrabajo(id, notasTecnico);
      if (response.success) {
        toast.success('Trabajo completado. Esperando conformidad del solicitante');
        setMostrarModalCompletar(false);
        setNotasTecnico('');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al completar trabajo');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Dar conformidad
  const handleDarConformidad = async () => {
    try {
      setCargandoAccion(true);
      const response = await solicitudService.firmar(id, comentarioConformidad || 'Trabajo conforme');
      if (response.success) {
        toast.success('Conformidad registrada correctamente');
        setMostrarModalConformidad(false);
        setComentarioConformidad('');
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al dar conformidad');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Agregar material a la lista
  const handleAgregarMaterial = (materialId, cantidad) => {
    if (!materialId || !cantidad || cantidad < 1) return;
    
    const material = materiales.find(m => m.id == materialId);
    if (!material) return;
    
    setMaterialesSeleccionados([
      ...materialesSeleccionados,
      { id: materialId, nombre: material.nombre, cantidad: parseInt(cantidad) }
    ]);
  };

  // Eliminar material de la lista
  const handleEliminarMaterial = (index) => {
    const nuevos = materialesSeleccionados.filter((_, i) => i !== index);
    setMaterialesSeleccionados(nuevos);
  };

  // Registrar uso de materiales
  const handleRegistrarMateriales = async () => {
    if (materialesSeleccionados.length === 0) {
      toast.error('Agregue al menos un material');
      return;
    }
    
    try {
      setCargandoAccion(true);
      const materialesFormato = materialesSeleccionados.map(m => ({
        material_id: m.id,
        cantidad: m.cantidad
      }));
      
      const response = await solicitudService.usarMaterial(id, materialesFormato);
      if (response.success) {
        toast.success('Materiales registrados correctamente');
        setMostrarModalMateriales(false);
        setMaterialesSeleccionados([]);
        cargarSolicitud();
      }
    } catch (error) {
      toast.error('Error al registrar materiales');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Agregar comentario
  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) {
      toast.error('Escriba un comentario');
      return;
    }
    
    // Por ahora solo mostramos toast (el endpoint de comentarios no está implementado)
    toast.success('Comentario agregado (demo)');
    setNuevoComentario('');
  };

  const handleGenerarPdf = async () => {
    try {
      toast.loading('Generando PDF...', { id: 'pdf' });
      const response = await solicitudService.generarPdf(id);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `solicitud_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF generado correctamente', { id: 'pdf' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar PDF', { id: 'pdf' });
    }
  };

  const handleVerQr = async () => {
    try {
      toast.loading('Generando código QR...', { id: 'qr' });
      const response = await solicitudService.obtenerQr(id);
      
      if (response.success && response.qr_code) {
        setQrCode(response.qr_code);
        setMostrarModalQr(true);
        toast.success('QR generado correctamente', { id: 'qr' });
      } else {
        toast.error('Error al generar QR', { id: 'qr' });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar código QR', { id: 'qr' });
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando solicitud...</p>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="error-container">
        <p>No se encontró la solicitud</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(solicitud.estado);

  return (
    <div className="detalle-solicitud-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>
        <div className="header-info">
          <h1>Solicitud #{solicitud.id}</h1>
          <span 
            className="estado-badge"
            style={{ backgroundColor: estadoConfig.color + '20', color: estadoConfig.color }}
          >
            {estadoConfig.icon} {estadoConfig.label}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="detalle-content">
        {/* Información general */}
        <div className="info-card">
          <h2>{solicitud.titulo}</h2>
          <p className="descripcion">{solicitud.descripcion}</p>
          
          <div className="info-grid">
            <div className="info-item">
              <FiUser className="icon" />
              <div>
                <label>Solicitante</label>
                <span>{solicitud.solicitante?.nombre_completo || 'N/A'}</span>
                <small>{solicitud.solicitante?.grado || ''}</small>
              </div>
            </div>
            
            <div className="info-item">
              <FiMapPin className="icon" />
              <div>
                <label>Sector</label>
                <span>{solicitud.sector?.nombre || 'N/A'}</span>
              </div>
            </div>
            
            <div className="info-item">
              <FiBox className="icon" />
              <div>
                <label>Equipo</label>
                <span>{solicitud.equipo?.nombre || 'No especificado'}</span>
                <small>{solicitud.equipo?.codigo_equipo}</small>
              </div>
            </div>
            
            <div className="info-item">
              <FiCalendar className="icon" />
              <div>
                <label>Fecha de creación</label>
                <span>{formatearFecha(solicitud.creado_en)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="acciones-card">
          <h3>Acciones Disponibles</h3>
          <div className="acciones-botones">
            {puedeFirmarSolicitante() && (
              <button className="btn-accion btn-success" onClick={handleFirmarSolicitante} disabled={cargandoAccion}>
                <FiCheck /> Firmar como Solicitante
              </button>
            )}
            
            {puedeFirmarJefeSeccion() && (
              <button className="btn-accion btn-success" onClick={handleFirmarJefeSeccion} disabled={cargandoAccion}>
                <FiCheck /> Firmar como Jefe de Sección
              </button>
            )}
            
            {puedeFirmarJefeActivos() && (
              <button className="btn-accion btn-success" onClick={handleFirmarJefeActivos} disabled={cargandoAccion}>
                <FiCheck /> Firmar como Jefe de Activos
              </button>
            )}
            
            {puedeAsignarTecnico() && (
              <button className="btn-accion btn-primary" onClick={() => setMostrarModalAsignar(true)} disabled={cargandoAccion}>
                <FiUserPlus /> Asignar Técnico
              </button>
            )}
            
            {puedeCompletarTrabajo() && (
              <button className="btn-accion btn-primary" onClick={() => setMostrarModalCompletar(true)} disabled={cargandoAccion}>
                <FiEdit2 /> Completar Trabajo
              </button>
            )}
            
            {puedeUsarMateriales() && (
              <button className="btn-accion btn-warning" onClick={() => setMostrarModalMateriales(true)} disabled={cargandoAccion}>
                <FiPackage /> Registrar Materiales
              </button>
            )}
            
            {puedeDarConformidad() && (
              <button className="btn-accion btn-success" onClick={() => setMostrarModalConformidad(true)} disabled={cargandoAccion}>
                <FiCheckCircle /> Dar Conformidad
              </button>
            )}
            
            {puedeFirmarJefeMantenimiento() && (
              <button className="btn-accion btn-success" onClick={handleFirmarJefeMantenimiento} disabled={cargandoAccion}>
                <FiCheck /> Cerrar Solicitud
              </button>
            )}

            {/* Botones PDF y QR */}
            <button className="btn-accion btn-pdf" onClick={handleGenerarPdf}>
              <FiDownload /> Descargar PDF
            </button>

            <button className="btn-accion btn-qr" onClick={handleVerQr}>
              <FiCode /> Ver QR
            </button>
          </div>
        </div>

        {/* Quién debe firmar */}
        <div className="info-card firmas-pendientes">
          <h3>⏳ Firmas Pendientes</h3>
          <div className="firmas-list">
            {solicitud.estado === 'pendiente_solicitante' && (
              <div className="firma-item">
                <FiUser /> <strong>Debe firmar:</strong> {solicitud.solicitante?.nombre_completo} (Solicitante)
              </div>
            )}
            
            {solicitud.estado === 'pendiente_jefe_seccion' && (
              <div className="firma-item">
                <FiUser /> <strong>Debe firmar:</strong> Jefe de Servicio de {solicitud.sector?.nombre}
                <small className="sugerencia">
                  Sugerencia: {sectores.find(s => s.id === solicitud.sector_id)?.jefe_nombre || 'Dr. Fernando Castillo Rojas (Cardiología)'}
                </small>
              </div>
            )}
            
            {solicitud.estado === 'pendiente_jefe_activos' && (
              <div className="firma-item">
                <FiUser /> <strong>Debe firmar:</strong> Jefe de Soporte / Jefe de Activos
                <small className="sugerencia">Sugerencia: Roberto Méndez Torres (Jefe de Soporte)</small>
              </div>
            )}
            
            {solicitud.estado === 'pendiente_soporte' && (
              <div className="firma-item">
                <FiAlertCircle /> <strong>Esperando asignación de técnico</strong>
                <small>El Jefe de Soporte debe asignar un técnico</small>
              </div>
            )}
            
            {solicitud.estado === 'pendiente_conformacion' && (
              <div className="firma-item">
                <FiUser /> <strong>Debe dar conformidad:</strong> {solicitud.solicitante?.nombre_completo} (Solicitante)
              </div>
            )}
            
            {solicitud.estado === 'pendiente_jefe_mantenimiento' && (
              <div className="firma-item">
                <FiUser /> <strong>Debe firmar:</strong> Jefe de Soporte / Jefe de Mantenimiento
                <small className="sugerencia">Sugerencia: Roberto Méndez Torres (Jefe de Soporte)</small>
              </div>
            )}
            
            {solicitud.estado === 'completado' && (
              <div className="firma-item completado">
                <FiCheckCircle /> <strong>¡Solicitud completada!</strong>
              </div>
            )}
          </div>
        </div>

        {/* Timeline de estados */}
        <div className="timeline-card">
          <h3>Seguimiento</h3>
          
          <div className="timeline">
            {/* 1. Firma del Solicitante */}
            <div className={`timeline-item ${solicitud.solicitante_firmo_en ? 'completed' : solicitud.estado === 'pendiente_solicitante' ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.solicitante_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>1. Firma del Solicitante</h4>
                <p>{solicitud.solicitante_firmo_en ? formatearFecha(solicitud.solicitante_firmo_en) : 'Pendiente'}</p>
                <small>{solicitud.solicitante?.nombre_completo}</small>
              </div>
            </div>

            {/* 2. Aprobación del Jefe de Servicio */}
            <div className={`timeline-item ${solicitud.jefe_seccion_firmo_en ? 'completed' : solicitud.estado === 'pendiente_jefe_seccion' ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.jefe_seccion_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>2. Aprobación del Jefe de Servicio</h4>
                <p>{solicitud.jefe_seccion_firmo_en ? formatearFecha(solicitud.jefe_seccion_firmo_en) : 'Pendiente'}</p>
                {solicitud.jefeSeccion?.nombre_completo && (
                  <small>Firmado por: {solicitud.jefeSeccion.nombre_completo}</small>
                )}
              </div>
            </div>

            {/* 3. Firma Jefe de Activos - SIEMPRE SE MUESTRA */}
            <div className={`timeline-item ${solicitud.jefe_activos_firmo_en ? 'completed' : solicitud.estado === 'pendiente_jefe_activos' ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.jefe_activos_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>3. Autorización de Jefe de Activos/Soporte</h4>
                <p>{solicitud.jefe_activos_firmo_en ? formatearFecha(solicitud.jefe_activos_firmo_en) : 'Pendiente'}</p>
                {solicitud.jefeActivos?.nombre_completo && (
                  <small>Firmado por: {solicitud.jefeActivos.nombre_completo}</small>
                )}
              </div>
            </div>

            {/* 4. Asignación de Técnico */}
            <div className={`timeline-item ${solicitud.tecnico_asignado_id ? 'completed' : solicitud.estado === 'pendiente_soporte' ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.tecnico_asignado_id ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>4. Asignación de Técnico</h4>
                <p>{solicitud.tecnicoAsignado?.nombre_completo || 'Pendiente de asignación'}</p>
                {solicitud.tecnico_asignado_en && (
                  <small>Asignado: {formatearFecha(solicitud.tecnico_asignado_en)}</small>
                )}
              </div>
            </div>

            {/* 5. Trabajo Realizado */}
            <div className={`timeline-item ${solicitud.trabajo_terminado_en ? 'completed' : ['asignado', 'en_proceso'].includes(solicitud.estado) ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.trabajo_terminado_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>5. Trabajo Realizado</h4>
                {solicitud.trabajo_terminado_en ? (
                  <>
                    <p>{formatearFecha(solicitud.trabajo_terminado_en)}</p>
                    {solicitud.notas_tecnico && (
                      <small className="notas">{solicitud.notas_tecnico}</small>
                    )}
                  </>
                ) : (
                  <p>Pendiente</p>
                )}
              </div>
            </div>

            {/* 6. Conformidad del Solicitante */}
            <div className={`timeline-item ${solicitud.conformacion_firmo_en ? 'completed' : solicitud.estado === 'pendiente_conformacion' ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.conformacion_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>6. Conformidad del Solicitante</h4>
                {solicitud.conformacion_firmo_en ? (
                  <>
                    <p>{formatearFecha(solicitud.conformacion_firmo_en)}</p>
                    {solicitud.conformacion_comentario && (
                      <small className="notas">{solicitud.conformacion_comentario}</small>
                    )}
                  </>
                ) : (
                  <p>Pendiente</p>
                )}
              </div>
            </div>

            {/* 7. Cierre de Jefe de Mantenimiento */}
            <div className={`timeline-item ${solicitud.jefe_mantenimiento_firmo_en ? 'completed' : solicitud.estado === 'pendiente_jefe_mantenimiento' ? 'current' : 'pending'}`}>
              <div className="timeline-icon">
                {solicitud.jefe_mantenimiento_firmo_en ? <FiCheckCircle /> : <FiClock />}
              </div>
              <div className="timeline-content">
                <h4>7. Cierre y Validación Final</h4>
                {solicitud.jefe_mantenimiento_firmo_en ? (
                  <>
                    <p>{formatearFecha(solicitud.jefe_mantenimiento_firmo_en)}</p>
                    {solicitud.jefeMantenimiento?.nombre_completo && (
                      <small>Cerrado por: {solicitud.jefeMantenimiento.nombre_completo}</small>
                    )}
                  </>
                ) : (
                  <p>Pendiente</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de comentarios */}
        <div className="comentarios-card">
          <h3>Comentarios</h3>
          
          <div className="comentarios-list">
            {comentarios.length === 0 ? (
              <p className="no-comentarios">No hay comentarios aún</p>
            ) : (
              comentarios.map((c, idx) => (
                <div key={idx} className="comentario-item">
                  <strong>{c.usuario}</strong>
                  <p>{c.comentario}</p>
                  <small>{c.fecha}</small>
                </div>
              ))
            )}
          </div>
          
          <div className="comentario-form">
            <textarea
              placeholder="Agregar un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              rows="2"
            />
            <button onClick={handleAgregarComentario}>
              <FiSend /> Enviar
            </button>
          </div>
        </div>
        
        <div className="imagenes-card">
          <h3>📷 Imágenes</h3>
          <SubirImagenes 
            solicitudId={solicitud?.id}
            imagenesExistentes={solicitud?.rutas_fotos || []}
            onImagenesSubidas={(nuevasRutas) => {
              setSolicitud({
                ...solicitud,
                rutas_fotos: nuevasRutas
              });
            }}
          />
        </div>
      </div>

      {/* MODAL: Asignar Técnico */}
      {mostrarModalAsignar && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Asignar Técnico</h2>
              <button onClick={() => setMostrarModalAsignar(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <select 
                value={tecnicoSeleccionado} 
                onChange={(e) => setTecnicoSeleccionado(e.target.value)}
                className="form-select"
              >
                <option value="">Seleccione un técnico...</option>
                {tecnicos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setMostrarModalAsignar(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAsignarTecnico} disabled={cargandoAccion}>
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Completar Trabajo */}
      {mostrarModalCompletar && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Completar Trabajo</h2>
              <button onClick={() => setMostrarModalCompletar(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <label>Notas del trabajo realizado *</label>
              <textarea
                value={notasTecnico}
                onChange={(e) => setNotasTecnico(e.target.value)}
                placeholder="Describa el trabajo realizado..."
                rows="4"
                className="form-textarea"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setMostrarModalCompletar(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCompletarTrabajo} disabled={cargandoAccion}>
                Completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Registrar Materiales */}
      {mostrarModalMateriales && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Registrar Materiales Utilizados</h2>
              <button onClick={() => setMostrarModalMateriales(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="material-form">
                <select id="materialSelect" className="form-select">
                  <option value="">Seleccione material...</option>
                  {materiales.map(m => (
                    <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>
                  ))}
                </select>
                <input type="number" id="cantidadInput" min="1" defaultValue="1" className="form-input" />
                <button 
                  className="btn-add"
                  onClick={() => {
                    const select = document.getElementById('materialSelect');
                    const input = document.getElementById('cantidadInput');
                    handleAgregarMaterial(select.value, input.value);
                    select.value = '';
                    input.value = '1';
                  }}
                >
                  Agregar
                </button>
              </div>
              
              {materialesSeleccionados.length > 0 && (
                <div className="materiales-lista">
                  <h4>Materiales agregados:</h4>
                  {materialesSeleccionados.map((m, idx) => (
                    <div key={idx} className="material-item">
                      <span>{m.nombre} - Cantidad: {m.cantidad}</span>
                      <button onClick={() => handleEliminarMaterial(idx)}><FiX /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setMostrarModalMateriales(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleRegistrarMateriales} disabled={cargandoAccion}>
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Dar Conformidad */}
      {mostrarModalConformidad && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Dar Conformidad</h2>
              <button onClick={() => setMostrarModalConformidad(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <label>Comentario (opcional)</label>
              <textarea
                value={comentarioConformidad}
                onChange={(e) => setComentarioConformidad(e.target.value)}
                placeholder="Ej: Excelente trabajo, equipo funcionando correctamente"
                rows="3"
                className="form-textarea"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setMostrarModalConformidad(false)}>Cancelar</button>
              <button className="btn-success" onClick={handleDarConformidad} disabled={cargandoAccion}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR Code */}
      {mostrarModalQr && (
        <div className="modal-overlay" onClick={() => setMostrarModalQr(false)}>
          <div className="modal qr-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Código QR - Solicitud #{id}</h2>
              <button onClick={() => setMostrarModalQr(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '20px' }}>
              {qrCode && (
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="Código QR de la solicitud"
                  style={{ 
                    width: '220px', 
                    height: '220px', 
                    margin: '20px auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '10px'
                  }}
                />
              )}
              <p style={{ marginTop: '15px', color: '#6b7280', fontSize: '14px' }}>
                Escanea este código QR para ver los detalles de la solicitud #{id}
              </p>
              <p style={{ marginTop: '5px', color: '#9ca3af', fontSize: '12px' }}>
                Incluye: ID, título, estado, solicitante y fecha
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `qr_solicitud_${id}.png`;
                  link.href = `data:image/png;base64,${qrCode}`;
                  link.click();
                }}
              >
                Descargar QR
              </button>
              <button onClick={() => setMostrarModalQr(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleSolicitudPage;