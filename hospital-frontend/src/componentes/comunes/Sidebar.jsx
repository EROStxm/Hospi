import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ usuario }) => {
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
    if (rol === 'admin_sistema') {
      items.push({ path: '/solicitudes', icon: '📋', label: 'Todas Solicitudes' });
      items.push({ path: '/roles', icon: '👥', label: 'Roles' });
      items.push({ path: '/usuarios', icon: '👤', label: 'Usuarios' });
      items.push({ path: '/equipos', icon: '🔧', label: 'Equipos' });
      items.push({ path: '/materiales', icon: '📦', label: 'Materiales' });
    }
    
    return items;
  };

  const allMenuItems = [...menuItems, ...getMenuByRole()];

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {allMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;