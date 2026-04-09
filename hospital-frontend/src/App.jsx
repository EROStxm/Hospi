import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from './servicios/authService';
import Login from './componentes/autenticacion/Login';
import Dashboard from './paginas/Dashboard';
import RolesPage from './paginas/RolesPage';
import './estilos/global.css';

// Componente wrapper para manejar la navegación
function AppContent() {
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    verificarAuth();
  }, []);

  const verificarAuth = () => {
    const estaAuth = authService.estaAutenticado();
    const usuarioGuardado = authService.obtenerUsuarioGuardado();
    
    console.log('Verificando auth:', { estaAuth, usuarioGuardado });
    
    setAutenticado(estaAuth);
    setUsuario(usuarioGuardado);
    setCargando(false);
  };

  const manejarLogin = (datosUsuario) => {
    console.log('Login exitoso, actualizando estado');
    setAutenticado(true);
    setUsuario(datosUsuario);
  };

  const manejarLogout = async () => {
    console.log('Cerrando sesión...');
    setCargando(true);
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setAutenticado(false);
      setUsuario(null);
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          autenticado ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={manejarLogin} />
          )
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          autenticado ? (
            <Dashboard usuario={usuario} onLogout={manejarLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/roles" 
        element={
          autenticado ? (
            <RolesPage onLogout={manejarLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/" 
        element={<Navigate to={autenticado ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;