// src/componentes/comunes/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ usuario, isOpen, onClose }) => {
  const location = useLocation();
  const rol = usuario?.rol?.nombre;

  // ── Definición de menús por grupo ───────────────────────────────
  const grupos = [];

  // GRUPO 1: Principal (todos)
  grupos.push({
    label: 'Principal',
    items: [
      { path: '/dashboard',       icon: '📊', label: 'Dashboard' },
      { path: '/mis-solicitudes', icon: '📝', label: 'Mis Solicitudes' },
      { path: '/nueva-solicitud', icon: '➕', label: 'Nueva Solicitud' },
    ],
  });

  // GRUPO 2: según rol
  if (rol === 'jefe_servicio') {
    grupos.push({
      label: 'Jefe de Servicio',
      items: [
        { path: '/solicitudes-sector', icon: '📋', label: 'Solicitudes del Sector' },
        { path: '/para-firmar',        icon: '✍️',  label: 'Para Firmar' },
      ],
    });
  }

  if (rol === 'soporte_tecnico') {
    grupos.push({
      label: 'Soporte',
      items: [
        { path: '/solicitudes-pendientes', icon: '⏳', label: 'Pendientes' },
        { path: '/mis-asignaciones',       icon: '🔧', label: 'Mis Trabajos' },
      ],
    });
  }

  if (rol === 'jefe_soporte') {
    grupos.push({
      label: 'Jefatura de Soporte',
      items: [
        { path: '/solicitudes-pendientes', icon: '⏳', label: 'Pendientes' },
        { path: '/materiales',             icon: '📦', label: 'Inventario' },
      ],
    });
  }

  if (rol === 'admin_sistema') {
    grupos.push({
      label: 'Administración',
      items: [
        { path: '/solicitudes', icon: '📋', label: 'Todas las Solicitudes' },
        { path: '/usuarios',    icon: '👤', label: 'Usuarios' },
        { path: '/equipos',     icon: '🔧', label: 'Equipos' },
        { path: '/materiales',  icon: '📦', label: 'Materiales' },
        { path: '/sectores',    icon: '🏥', label: 'Sectores' },
        { path: '/ubicaciones', icon: '📍', label: 'Ubicaciones' },
        { path: '/roles',       icon: '👥', label: 'Roles' },
        { path: '/huellas',     icon: '🖐️', label: 'Huellas Digitales' },
      ],
    });
  }

  // Cuenta al final para todos
  grupos.push({
    label: 'Cuenta',
    items: [
      { path: '/notificaciones',           icon: '🔔', label: 'Notificaciones' },
      { action: 'abrir-firma', path: null, icon: '✍️', label: 'Mi Firma' },
    ],
  });
  // ────────────────────────────────────────────────────────────────

  const handleItemClick = () => {
    if (window.innerWidth <= 768) onClose();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Header solo visible en móvil */}
        <div className="sidebar-header">
          <h3>Menú</h3>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
            ×
          </button>
        </div>

        {/* Sección de usuario (solo desktop) */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {usuario?.nombre_completo?.[0] ?? '👤'}
            </div>
            <div>
              <div className="sidebar-user-name">
                {usuario?.nombre_completo?.split(' ')[0] ?? 'Usuario'}
              </div>
              <div className="sidebar-user-role">
                {usuario?.rol?.nombre?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Grupos de menú */}
        {grupos.map((grupo, gIdx) => (
          <div className="sidebar-group" key={gIdx}>
            <div className="sidebar-group-label">{grupo.label}</div>
            {grupo.items.map((item, iIdx) => {
              // Si es una acción (no ruta), renderizar botón
              if (item.action) {
                return (
                  <button
                    key={item.action}
                    className="sidebar-item sidebar-action-btn"
                    onClick={() => {
                      handleItemClick();
                      window.dispatchEvent(new CustomEvent('abrir-modal-firma'));
                    }}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-text">{item.label}</span>
                  </button>
                );
              }
              
              // Si es una ruta normal, renderizar Link
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={handleItemClick}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

      </aside>

      {/* Overlay oscuro en móvil */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
    </>
  );
};

export default Sidebar;