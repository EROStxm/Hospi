import { useState, useEffect } from 'react';
import Layout from '../componentes/comunes/Layout';
import { usuarioService } from '../servicios/usuarioService';
import { huellaService } from '../servicios/huellaService';
import toast from 'react-hot-toast';
import '../estilos/huellas.css';

const HuellasPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [usuarioRegistro, setUsuarioRegistro] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  const [conexionMQTT, setConexionMQTT] = useState(false);

  // ========== CARGAR USUARIOS ==========
  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.obtenerTodos();
      let usuariosArray = [];
      if (response.success && response.data) {
        usuariosArray = Array.isArray(response.data) ? response.data : (response.data.data || []);
      }
      setUsuarios(usuariosArray);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error cargando usuarios');
    } finally {
      setCargando(false);
    }
  };

  // ========== EFECTOS ==========
  useEffect(() => {
    cargarUsuarios();
    conectarMQTT();
    
    return () => {
      desconectarMQTT();
    };
  }, []);

  // ========== CONEXIÓN MQTT ==========
  const conectarMQTT = async () => {
    try {
      // Verificar si el ESP32 está conectado a MQTT
      // Por ahora simulamos conexión
      setConexionMQTT(true);
      console.log("✅ MQTT conectado");
    } catch (error) {
      console.error("❌ Error MQTT:", error);
      setConexionMQTT(false);
    }
  };

  const desconectarMQTT = () => {
    console.log("🔌 Desconectando MQTT");
  };

  // ========== ENVIAR COMANDO POR MQTT ==========
  const enviarComandoMQTT = (comando, userId = null) => {
    const mensaje = { comando };
    if (userId) mensaje.user_id = userId;
    
    console.log("📤 Enviando comando MQTT:", mensaje);
    
    // Aquí iría la publicación real al broker MQTT
    // client.publish("hospital/comandos", JSON.stringify(mensaje));
    
    return true;
  };

  // ========== REGISTRAR HUELLA ==========
  const iniciarRegistro = async (user) => {
    if (registrando) {
      toast.error('Ya hay un registro en curso');
      return;
    }

    if (!conexionMQTT) {
      toast.error('❌ ESP32 no conectado');
      return;
    }

    setRegistrando(true);
    setUsuarioRegistro(user);
    setPasoActual(1);

    const toastId = toast.loading(`👆 Iniciando registro para ${user.nombre_completo}...`, {
      duration: 60000
    });

    try {
      // Enviar comando al ESP32 via MQTT
      enviarComandoMQTT("registrar", user.id);
      
      // Simular progreso (en realidad los mensajes vendrían por MQTT)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasoActual(2);
      toast.loading(`🗑️ ${user.nombre_completo}: Retira el dedo...`, { id: toastId });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasoActual(3);
      toast.loading(`👆 ${user.nombre_completo}: Coloca el MISMO dedo...`, { id: toastId });
      
      await new Promise(resolve => setTimeout(resolve, 8000));
      setPasoActual(4);
      
      // Simular guardado en BD
      await huellaService.registrar(user.id, `${user.id}_${Date.now()}`);
      
      toast.success(`✅ ¡Huella registrada correctamente para ${user.nombre_completo}!`, { id: toastId });
      await cargarUsuarios();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(`❌ Error: ${error.message}`, { id: toastId });
    } finally {
      setRegistrando(false);
      setUsuarioRegistro(null);
      setPasoActual(0);
    }
  };

  // ========== ELIMINAR HUELLA ==========
  const eliminarHuella = async (user) => {
    if (!confirm(`¿Eliminar huella de ${user.nombre_completo}?`)) return;
    
    const toastId = toast.loading('Eliminando huella...');
    
    try {
      await huellaService.eliminar(user.id);
      toast.success('✅ Huella eliminada correctamente', { id: toastId });
      await cargarUsuarios();
    } catch (error) {
      toast.error('❌ Error eliminando la huella', { id: toastId });
    }
  };

  // ========== LIMPIAR SENSOR ==========
  const limpiarSensor = async () => {
    if (!confirm('⚠️ ¿LIMPIAR TODA LA MEMORIA DEL SENSOR?')) return;
    
    const toastId = toast.loading('Limpiando memoria del sensor...');
    
    try {
      enviarComandoMQTT("limpiar");
      toast.success('✅ Comando de limpieza enviado al ESP32', { id: toastId });
    } catch (error) {
      toast.error('❌ Error al limpiar sensor', { id: toastId });
    }
  };

  // ========== RENDER ==========
  if (cargando) {
    return (
      
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
          <p className="ml-3">Cargando usuarios...</p>
        </div>
      
    );
  }

  return (
    
      <div className="huellas-container">
        <div className="header">
          <h1>🖐️ Gestión de Huellas Digitales</h1>
          <div className="header-buttons">
            <span className={`esp-status ${conexionMQTT ? 'connected' : 'disconnected'}`}>
              {conexionMQTT ? '✅ ESP32 Online' : '❌ ESP32 Offline'}
            </span>
            <button onClick={limpiarSensor} className="btn-clear" title="Limpiar memoria del sensor">
              🗑️ Limpiar Sensor
            </button>
          </div>
        </div>

        <div className="info-card">
          <h3>📋 Instrucciones</h3>
          <ol>
            <li>Selecciona un usuario de la lista</li>
            <li>Haz clic en <strong>"Registrar Huella"</strong></li>
            <li>Coloca tu <strong>dedo</strong> en el sensor AS608</li>
            <li>Espera la primera lectura y retira el dedo</li>
            <li>Vuelve a colocar el <strong>mismo dedo</strong> para confirmar</li>
            <li>La huella quedará registrada automáticamente</li>
          </ol>
        </div>

        {registrando && (
          <div className="enroll-progress">
            <div className="spinner"></div>
            <p>Registrando huella para <strong>{usuarioRegistro?.nombre_completo}</strong></p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(pasoActual / 4) * 100}%` }}></div>
            </div>
            <p className="hint">
              {pasoActual === 1 && '👆 Coloca tu dedo en el sensor...'}
              {pasoActual === 2 && '🗑️ Retira el dedo...'}
              {pasoActual === 3 && '👆 Coloca el mismo dedo nuevamente...'}
              {pasoActual === 4 && '✅ Guardando huella...'}
            </p>
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
                        <span className="badge-success">✅ Registrada</span>
                      ) : (
                        <span className="badge-warning">❌ No registrada</span>
                      )}
                    </td>
                    <td>
                      {!user.huella ? (
                        <button
                          onClick={() => iniciarRegistro(user)}
                          className="btn-register"
                          disabled={registrando}
                        >
                          {registrando && usuarioRegistro?.id === user.id ? 'Registrando...' : 'Registrar Huella'}
                        </button>
                      ) : (
                        <button
                          onClick={() => eliminarHuella(user)}
                          className="btn-delete"
                          disabled={registrando}
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
    
  );
};

export default HuellasPage;