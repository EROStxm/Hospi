// src/paginas/NotificacionesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiFilter } from 'react-icons/fi';
import api from '../servicios/api';
import toast from 'react-hot-toast';
import '../estilos/notificaciones.css';

const NotificacionesPage = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [filtro, setFiltro]                 = useState('todas');

  const colorTipo = { success: '#10b981', warning: '#f59e0b', info: '#3b82f6', error: '#ef4444' };
  const iconoTipo = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const res = await api.get('/notificaciones?per_page=50');
      const data = res.data?.data ?? res.data ?? [];
      setNotificaciones(Array.isArray(data) ? data : (data.data ?? []));
    } catch (e) {
      toast.error('Error al cargar notificaciones');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const marcarLeida = async (id) => {
    await api.put(`/notificaciones/${id}/leida`);
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leido_en: new Date().toISOString() } : n)
    );
  };

  const marcarTodasLeidas = async () => {
    await api.put('/notificaciones/marcar-todas-leidas');
    setNotificaciones(prev =>
      prev.map(n => ({ ...n, leido_en: n.leido_en ?? new Date().toISOString() }))
    );
    toast.success('Todas marcadas como leídas');
  };

  const eliminar = async (id) => {
    await api.delete(`/notificaciones/${id}`);
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const handleClick = async (notif) => {
    if (!notif.leido_en) await marcarLeida(notif.id);
    if (notif.solicitud_id) navigate(`/solicitudes/${notif.solicitud_id}`);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filtradas = notificaciones.filter(n => {
    if (filtro === 'todas')    return true;
    if (filtro === 'no_leidas') return !n.leido_en;
    if (filtro === 'leidas')    return !!n.leido_en;
    return n.tipo === filtro;
  });

  const noLeidas = notificaciones.filter(n => !n.leido_en).length;

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-page-header">
        <div>
          <h1><FiBell /> Notificaciones</h1>
          {noLeidas > 0 && (
            <span className="notif-page-badge">{noLeidas} sin leer</span>
          )}
        </div>
        {noLeidas > 0 && (
          <button className="btn-marcar-page" onClick={marcarTodasLeidas}>
            <FiCheckCircle /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="notif-filtros">
        {[
          { key: 'todas',     label: 'Todas' },
          { key: 'no_leidas', label: 'Sin leer' },
          { key: 'info',      label: 'Info' },
          { key: 'warning',   label: 'Alertas' },
          { key: 'success',   label: 'Éxito' },
        ].map(f => (
          <button
            key={f.key}
            className={`filtro-chip ${filtro === f.key ? 'active' : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
            {f.key === 'no_leidas' && noLeidas > 0 && (
              <span className="chip-badge">{noLeidas}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="notif-page-loading">
          <div className="spinner" />
          <p>Cargando notificaciones...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="notif-page-empty">
          <FiBell size={48} style={{ opacity: 0.2 }} />
          <p>No hay notificaciones {filtro !== 'todas' ? `en esta categoría` : ''}</p>
        </div>
      ) : (
        <div className="notif-page-list">
          {filtradas.map(notif => (
            <div
              key={notif.id}
              className={`notif-page-item ${!notif.leido_en ? 'unread' : ''}`}
              onClick={() => handleClick(notif)}
            >
              <div
                className="notif-page-bar"
                style={{ background: colorTipo[notif.tipo] ?? '#6b7280' }}
              />
              <div className="notif-page-icon">{iconoTipo[notif.tipo] ?? '🔔'}</div>

              <div className="notif-page-body">
                <div className="notif-page-top">
                  <span className="notif-page-titulo">{notif.titulo}</span>
                  <span className="notif-page-fecha">{formatearFecha(notif.creado_en)}</span>
                </div>
                <p className="notif-page-mensaje">{notif.mensaje}</p>
                {notif.solicitud_id && (
                  <span className="notif-page-link">Ver solicitud #{notif.solicitud_id} →</span>
                )}
              </div>

              <div className="notif-page-btns" onClick={e => e.stopPropagation()}>
                {!notif.leido_en && (
                  <button
                    className="btn-np-action"
                    onClick={() => marcarLeida(notif.id)}
                    title="Marcar como leída"
                  >
                    <FiCheck size={14} />
                  </button>
                )}
                <button
                  className="btn-np-action danger"
                  onClick={() => eliminar(notif.id)}
                  title="Eliminar"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificacionesPage;