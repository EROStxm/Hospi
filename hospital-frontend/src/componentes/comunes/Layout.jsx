import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { authService } from '../../servicios/authService';
import './Layout.css';

const Layout = ({ children, usuario: usuarioProp, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const usuario = usuarioProp || JSON.parse(localStorage.getItem('usuario') || '{}');

  const manejarLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      try {
        await authService.logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  };

  return (
    <div className="layout-wrapper">
      <Navbar 
        usuario={usuario} 
        onLogout={manejarLogout}
        onMenuClick={() => setSidebarAbierto(!sidebarAbierto)}
      />
      
      <div className="layout-main">
        <Sidebar 
          usuario={usuario} 
          isOpen={sidebarAbierto}
          onClose={() => setSidebarAbierto(false)}
        />
        
        <div className={`layout-content ${sidebarAbierto ? 'sidebar-open' : ''}`}>
          <main className="content-main">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;