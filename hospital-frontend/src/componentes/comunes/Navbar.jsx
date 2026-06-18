// src/componentes/comunes/Navbar.jsx
import CampanaNotificaciones from './CampanaNotificaciones';
import './Navbar.css';

const Navbar = ({ usuario, onLogout, onMenuClick, sidebarAbierto }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">

        {/* ── Izquierda: hamburgesa + logo + título ── */}
        <div className="navbar-brand">
          <button
            className={`menu-toggle ${sidebarAbierto ? 'activo' : ''}`}
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>

          <span className="navbar-logo">🏥</span>

          <div>
            <span className="navbar-title">Hospital Militar</span>
            <span className="navbar-subtitle">Mantenimiento</span>
          </div>
        </div>

        {/* ── Derecha: campana + usuario + cerrar sesión ── */}
        <div className="navbar-user">
          <CampanaNotificaciones />

          <div className="user-info">
            <div className="user-name">
              {usuario?.nombre_completo || 'Usuario'}
            </div>
            <div className="user-role">
              {usuario?.grado} · {usuario?.rol?.nombre?.replace('_', ' ')}
            </div>
          </div>

          <button onClick={onLogout} className="btn-logout">
            Salir
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;