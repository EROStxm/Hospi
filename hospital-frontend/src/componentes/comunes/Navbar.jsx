import { Link } from 'react-router-dom';

const Navbar = ({ usuario, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <span className="navbar-logo">🏥</span>
          <span className="navbar-title">Hospital Militar</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-name">{usuario.nombre_completo}</div>
            <div className="user-role">{usuario.rol?.nombre} - {usuario.grado}</div>
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