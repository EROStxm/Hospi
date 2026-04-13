import './Navbar.css';

const Navbar = ({ usuario, onLogout, onMenuClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <button className="menu-toggle" onClick={onMenuClick}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <span className="navbar-logo">🏥</span>
          <span className="navbar-title">Hospital Militar</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-name">{usuario?.nombre_completo || 'Usuario'}</div>
            <div className="user-role">{usuario?.rol?.nombre} - {usuario?.grado}</div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;