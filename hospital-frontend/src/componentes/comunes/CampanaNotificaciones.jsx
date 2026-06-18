// src/componentes/comunes/CampanaNotificaciones.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { suscribirNotificaciones } from '../../servicios/echo';
import api from '../../servicios/api';
import toast from 'react-hot-toast';
import './CampanaNotificaciones.css';

const CampanaNotificaciones = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones]   = useState([]);
  const [noLeidas, setNoLeidas]               = useState(0);
  const [abierto, setAbierto]                 = useState(false);
  const [cargando, setCargando]               = useState(false);
  const panelRef                              = useRef(null);
  const pollingRef                            = useRef(null);

  // ─── Cargar notificaciones desde la API ──────────────────────────────────
  const cargarNotificaciones = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      const res = await api.get('/notificaciones?per_page=20');
      const data = res.data?.data ?? res.data ?? [];
      const lista = Array.isArray(data) ? data : (data.data ?? []);
      setNotificaciones(lista);
      setNoLeidas(lista.filter(n => !n.leido_en).length);
    } catch (e) {
      console.warn('No se pudieron cargar notificaciones:', e.message);
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  // ─── Agregar notificación en tiempo real (WebSocket) ─────────────────────
  const agregarNotificacionRT = useCallback((nuevaNotif) => {
    setNotificaciones(prev => [nuevaNotif, ...prev].slice(0, 50));
    setNoLeidas(prev => prev + 1);

    // Toast según tipo
    const iconos = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };
    toast(nuevaNotif.titulo, {
      icon: iconos[nuevaNotif.tipo] ?? '🔔',
      duration: 5000,
    });
  }, []);

  // ─── Setup inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!usuario?.id) return;

    // 1) Carga inicial
    cargarNotificaciones();

    // 2) WebSocket con Reverb
    const desuscribir = suscribirNotificaciones(usuario.id, agregarNotificacionRT);

    // 3) Polling de respaldo cada 30 s (por si WebSocket cae)
    pollingRef.current = setInterval(() => cargarNotificaciones(true), 30_000);

    // Cierre del panel al hacer click fuera
    const handleClickFuera = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);

    return () => {
      desuscribir();
      clearInterval(pollingRef.current);
      document.removeEventListener('mousedown', handleClickFuera);
    };
  }, [cargarNotificaciones, agregarNotificacionRT]);

  // ─── Marcar una como leída ────────────────────────────────────────────────
  const marcarLeida = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.put(`/notificaciones/${id}/leida`);
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leido_en: new Date().toISOString() } : n)
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marcando leída:', e);
    }
  };

  // ─── Marcar todas como leídas ────────────────────────────────────────────
  const marcarTodasLeidas = async () => {
    try {
      await api.put('/notificaciones/marcar-todas-leidas');
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leido_en: n.leido_en ?? new Date().toISOString() }))
      );
      setNoLeidas(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (e) {
      toast.error('Error al marcar notificaciones');
    }
  };

  // ─── Eliminar notificación ────────────────────────────────────────────────
  const eliminar = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.delete(`/notificaciones/${id}`);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      const eliminada = notificaciones.find(n => n.id === id);
      if (eliminada && !eliminada.leido_en) setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error eliminando notificación:', e);
    }
  };

  // ─── Click en una notificación ────────────────────────────────────────────
  const handleClick = (notif) => {
    if (!notif.leido_en) marcarLeida(notif.id);
    setAbierto(false);
    if (notif.solicitud_id) {
      navigate(`/solicitudes/${notif.solicitud_id}`);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const formatearTiempo = (fecha) => {
    if (!fecha) return '';
    const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
    if (diff < 60)  return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const colorTipo = { success: '#10b981', warning: '#f59e0b', info: '#3b82f6', error: '#ef4444' };
  const iconoTipo = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };

  return (
    <div className="campana-wrapper" ref={panelRef}>
      {/* ── Botón campana ── */}
      <button
        className="campana-btn"
        onClick={() => setAbierto(!abierto)}
        aria-label="Notificaciones"
      >
        <FiBell size={20} />
        {noLeidas > 0 && (
          <span className="campana-badge">{noLeidas > 99 ? '99+' : noLeidas}</span>
        )}
      </button>

      {/* ── Panel desplegable ── */}
      {abierto && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-header">
            <span className="notif-header-title">
              <FiBell /> Notificaciones
              {noLeidas > 0 && <span className="badge-inline">{noLeidas}</span>}
            </span>
            <div className="notif-header-actions">
              {noLeidas > 0 && (
                <button className="btn-marcar-todas" onClick={marcarTodasLeidas} title="Marcar todas como leídas">
                  <FiCheckCircle size={15} />
                </button>
              )}
              <button className="btn-ver-todas" onClick={() => { setAbierto(false); navigate('/notificaciones'); }}>
                Ver todas
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="notif-list">
            {cargando ? (
              <div className="notif-empty">
                <div className="spinner-sm" />
                <span>Cargando...</span>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="notif-empty">
                <FiBell size={32} style={{ opacity: 0.3 }} />
                <span>Sin notificaciones</span>
              </div>
            ) : (
              notificaciones.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.leido_en ? 'unread' : ''}`}
                  onClick={() => handleClick(notif)}
                >
                  <div
                    className="notif-color-bar"
                    style={{ backgroundColor: colorTipo[notif.tipo] ?? '#6b7280' }}
                  />
                  <div className="notif-icon-wrap">
                    <span>{iconoTipo[notif.tipo] ?? '🔔'}</span>
                  </div>
                  <div className="notif-body">
                    <p className="notif-titulo">{notif.titulo}</p>
                    <p className="notif-mensaje">{notif.mensaje}</p>
                    <span className="notif-tiempo">{formatearTiempo(notif.creado_en)}</span>
                  </div>
                  <div className="notif-actions">
                    {!notif.leido_en && (
                      <button
                        className="btn-notif-action"
                        onClick={(e) => marcarLeida(notif.id, e)}
                        title="Marcar como leída"
                      >
                        <FiCheck size={12} />
                      </button>
                    )}
                    <button
                      className="btn-notif-action danger"
                      onClick={(e) => eliminar(notif.id, e)}
                      title="Eliminar"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampanaNotificaciones;