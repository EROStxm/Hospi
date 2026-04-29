import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ usuario, isOpen, onClose }) => {
  const location = useLocation();
  const rol = usuario?.rol?.nombre;
  
  // Menú base - visible para todos
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  ];

  // Menú según rol
  const getMenuByRole = () => {
    const items = [];
    
    // Todos pueden ver sus solicitudes
    items.push({ path: '/mis-solicitudes', icon: '📝', label: 'Mis Solicitudes' });
    items.push({ path: '/nueva-solicitud', icon: '➕', label: 'Nueva Solicitud' });
    
    // Jefe de servicio
    if (rol === 'jefe_servicio') {
      items.push({ path: '/solicitudes-sector', icon: '📋', label: 'Sector' });
      items.push({ path: '/para-firmar', icon: '✍️', label: 'Para Firmar' });
    }
    
    // Soporte técnico
    if (rol === 'soporte_tecnico') {
      items.push({ path: '/solicitudes-pendientes', icon: '⏳', label: 'Pendientes' });
      items.push({ path: '/mis-asignaciones', icon: '🔧', label: 'Mis Trabajos' });
    }
    
    // Jefe de soporte
    if (rol === 'jefe_soporte') {
      items.push({ path: '/solicitudes-pendientes', icon: '⏳', label: 'Pendientes' });
      items.push({ path: '/asignar-tecnicos', icon: '👨‍🔧', label: 'Asignar' });
      items.push({ path: '/inventario', icon: '📦', label: 'Inventario' });
    }
    
    // Admin
    // En getMenuByRole(), agregar para admin:
    if (rol === 'admin_sistema') {
      items.push({ path: '/solicitudes', icon: '📋', label: 'Todas Solicitudes' });
      items.push({ path: '/roles', icon: '👥', label: 'Roles' });
      items.push({ path: '/usuarios', icon: '👤', label: 'Usuarios' });
      items.push({ path: '/equipos', icon: '🔧', label: 'Equipos' });
      items.push({ path: '/materiales', icon: '📦', label: 'Materiales' });
      items.push({ path: '/sectores', icon: '🏥', label: 'Sectores' });
      items.push({ path: '/ubicaciones', icon: '📍', label: 'Ubicaciones' }); // NUEVO
      items.push({ path: '/huellas', icon: '🖐️', label: 'Huellas Digitales' }); // 🆕 AGREGAR
    }
    
    return items;
  };

  const allMenuItems = [...menuItems, ...getMenuByRole()];


  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menú Principal</h3>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>
        <div className="sidebar-menu">
          {allMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  onClose();
                }
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;