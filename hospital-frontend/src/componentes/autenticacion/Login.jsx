// src/componentes/autenticacion/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../servicios/authService';
import '../../estilos/login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo_militar: '',
    password: '',
  });
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const respuesta = await authService.login(
        formData.codigo_militar,
        formData.password
      );
      if (respuesta.success) {
        onLoginSuccess(respuesta.user);
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

        {/* ── Header ── */}
        <div className="login-header">
          <span className="login-emblem"></span>
          <h1>Hospital Militar</h1>
          <p>Sistema de Gestión de Mantenimiento</p>
          <div className="login-divider" />
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── Formulario ── */}
        <form onSubmit={manejarSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="codigo_militar">Código Militar</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type="text"
                id="codigo_militar"
                name="codigo_militar"
                value={formData.codigo_militar}
                onChange={manejarCambio}
                placeholder="Ej: 9895625"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={manejarCambio}
                placeholder="Ingrese su contraseña"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={cargando}>
            <span className="btn-login-content">
              {cargando ? (
                <>
                  <span className="btn-spinner" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </span>
          </button>
        </form>

        {/* ── Footer ── */}
        <div className="login-footer">
          <p>Acceso restringido — Personal autorizado únicamente</p>
        </div>

      </div>
    </div>
  );
};

export default Login;