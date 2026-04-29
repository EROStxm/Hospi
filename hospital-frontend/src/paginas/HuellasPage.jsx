import { useState, useEffect } from 'react';
import Layout from '../componentes/comunes/Layout';
import { usuarioService } from '../servicios/usuarioService';
import { huellaService } from '../servicios/huellaService';
import '../estilos/huellas.css';
import toast from 'react-hot-toast';
// src/paginas/HuellasPage.jsx
const HuellasPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modoEnroll, setModoEnroll] = useState(false);
  const [usuarioEnroll, setUsuarioEnroll] = useState(null);
  const [conexionESP, setConexionESP] = useState(false);

  useEffect(() => {
    cargarUsuarios();
    verificarConexionESP();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.obtenerTodos();
      
      // ✅ CORREGIDO: Extraer el array correctamente
      let usuariosArray = [];
      if (response.success) {
        if (Array.isArray(response.data)) {
          usuariosArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          usuariosArray = response.data.data;
        } else if (response.data?.usuarios && Array.isArray(response.data.usuarios)) {
          usuariosArray = response.data.usuarios;
        }
      }
      
      setUsuarios(usuariosArray);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error cargando usuarios');
      setUsuarios([]); // ✅ Asegurar que siempre sea un array
    } finally {
      setCargando(false);
    }
  };

  const verificarConexionESP = () => {
    // Simular verificación de conexión con ESP32
    setConexionESP(true);
  };

  const startEnrollment = async (user) => {
    setModoEnroll(true);
    setUsuarioEnroll(user);
    
    toast.loading(
      <div>
        <strong>Registrando huella para {user.nombre_completo}</strong><br />
        1. Coloca tu dedo en el sensor<br />
        2. Espera a que confirme<br />
        3. Retira y vuelve a colocar el mismo dedo
      </div>,
      { id: 'enroll', duration: 30000 }
    );

    try {
      // Intentar conectar con ESP32
      const response = await fetch('http://192.168.0.10/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, action: 'enroll' })
      });
      
      if (response.ok) {
        await waitForEnrollmentComplete(user.id);
      } else {
        throw new Error('Error de comunicación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo conectar con el sensor', { id: 'enroll' });
      setModoEnroll(false);
      setUsuarioEnroll(null);
    }
  };

  const waitForEnrollmentComplete = (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTemplate = "base64_encoded_fingerprint_template_" + Date.now();
        
        huellaService.registrar(userId, mockTemplate)
          .then(() => {
            toast.success(`✅ Huella registrada correctamente`, { id: 'enroll' });
            cargarUsuarios();
          })
          .catch(() => {
            toast.error('Error guardando la huella en el servidor', { id: 'enroll' });
          })
          .finally(() => {
            setModoEnroll(false);
            setUsuarioEnroll(null);
            resolve();
          });
      }, 10000);
    });
  };

  const deleteHuella = async (user) => {
    if (!confirm(`¿Eliminar huella de ${user.nombre_completo}?`)) return;
    
    toast.loading('Eliminando huella...', { id: 'delete' });
    
    try {
      await huellaService.eliminar(user.id);
      toast.success('Huella eliminada', { id: 'delete' });
      cargarUsuarios();
    } catch (error) {
      toast.error('Error eliminando huella', { id: 'delete' });
    }
  };

  if (cargando) {
    return (
      <Layout>
        <div className="loading">Cargando usuarios...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="huellas-container">
        <div className="header">
          <h1>🖐️ Gestión de Huellas Digitales</h1>
          <div className={`esp-status ${conexionESP ? 'connected' : 'disconnected'}`}>
            {conexionESP ? '✅ Sensor AS608 conectado' : '❌ Sensor no disponible'}
          </div>
        </div>

        <div className="info-card">
          <h3>📋 Instrucciones</h3>
          <ol>
            <li>Selecciona un usuario de la lista</li>
            <li>Haz clic en <strong>"Registrar Huella"</strong></li>
            <li>Coloca tu <strong>dedo pulgar</strong> en el sensor AS608</li>
            <li>Espera la primera lectura y retira el dedo</li>
            <li>Vuelve a colocar el <strong>mismo dedo</strong> para confirmar</li>
            <li>La huella quedará registrada y asociada al usuario</li>
          </ol>
        </div>

        {modoEnroll && (
          <div className="enroll-progress">
            <div className="spinner"></div>
            <p>Registrando huella para <strong>{usuarioEnroll?.nombre_completo}</strong></p>
            <p className="hint">Coloca tu dedo en el sensor...</p>
          </div>
        )}

        <div className="usuarios-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Grado</th>
                <th>Rol</th>
                <th>Estado Huella</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-message">No hay usuarios registrados</td>
                </tr>
              ) : (
                usuarios.map(user => (
                  <tr key={user.id}>
                    <td>{user.codigo_militar}</td>
                    <td>{user.nombre_completo}</td>
                    <td>{user.grado || '-'}</td>
                    <td>{user.rol?.nombre || '-'}</td>
                    <td>
                      {user.huella ? (
                        <span className="badge-success">
                          ✅ Registrada
                          <small>{user.huella_registrada_en ? new Date(user.huella_registrada_en).toLocaleDateString() : ''}</small>
                        </span>
                      ) : (
                        <span className="badge-warning">❌ No registrada</span>
                      )}
                    </td>
                    <td>
                      {!user.huella ? (
                        <button
                          onClick={() => startEnrollment(user)}
                          className="btn-register"
                          disabled={modoEnroll}
                        >
                          {modoEnroll && usuarioEnroll?.id === user.id ? 'Registrando...' : 'Registrar Huella'}
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteHuella(user)}
                          className="btn-delete"
                          disabled={modoEnroll}
                        >
                          Eliminar Huella
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default HuellasPage;