import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../servicios/authService';
import '../../estilos/login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo_militar: '9895625', // Precargado para pruebas
    password: 'admin123',      // Precargado para pruebas
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const respuesta = await authService.login(formData.codigo_militar, formData.password);
      
      if (respuesta.success) {
        // Notificar al componente padre
        onLoginSuccess(respuesta.user);
        
        // Navegar al dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError(respuesta.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🏥 Hospital Militar</h1>
          <p>Sistema de Gestión de Mantenimiento</p>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="codigo_militar">Código Militar</label>
            <input
              type="text"
              id="codigo_militar"
              name="codigo_militar"
              value={formData.codigo_militar}
              onChange={manejarCambio}
              placeholder="Ingrese su código militar"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={manejarCambio}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo: 9895625 / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;