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
  const [infoSensor, setInfoSensor] = useState(null);

  useEffect(() => {
    cargarUsuarios();
    obtenerInfoSensor();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.obtenerTodos();
      let usuariosArray = [];
      if (response.success && response.data) {
        usuariosArray = Array.isArray(response.data) ? response.data : (response.data.data || []);
      }
      setUsuarios(usuariosArray);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error cargando usuarios');
    } finally {
      setCargando(false);
    }
  };

  const obtenerInfoSensor = async () => {
    try {
      // Aquí podrías tener un endpoint para obtener info del sensor
      // Por ahora simulamos
      setInfoSensor({ memoria: 0, total: 127 });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const limpiarMemoriaSensor = async () => {
    if (!confirm('⚠️ ¿ESTÁS SEGURO? Esto eliminará TODAS las huellas almacenadas en el sensor.\n\nEsto no afecta las huellas guardadas en la base de datos.')) return;
    
    const toastId = toast.loading('Limpiando memoria del sensor...');
    
    // Enviar comando al ESP32 (vía serial o HTTP)
    // Por ahora mostramos instrucciones manuales
    toast.success('✅ Conectate al ESP32 por serial y presiona "2" para limpiar', { id: toastId, duration: 5000 });
  };

  const iniciarRegistro = async (user) => {
    if (registrando) {
      toast.error('Ya hay un registro en curso');
      return;
    }

    setRegistrando(true);
    setUsuarioRegistro(user);
    setPasoActual(1);

    const toastId = toast.loading(`👆 Iniciando registro para ${user.nombre_completo}...`, {
      duration: 90000  // Aumentado a 90 segundos
    });

    try {
      // 1. Iniciar registro en el servidor
      const response = await fetch('http://192.168.0.10:8000/api/huellas/iniciar-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, nombre: user.nombre_completo })
      });

      if (!response.ok) throw new Error('Error al iniciar el registro');

      // 2. Polling para ver el progreso (aumentado a 60 segundos)
      let completado = false;
      let intentos = 0;
      const maxIntentos = 60;  // 60 segundos

      while (!completado && intentos < maxIntentos) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusRes = await fetch(`http://192.168.0.10:8000/api/huellas/estado/${user.id}`);
        const status = await statusRes.json();
        
        setPasoActual(status.paso || 1);
        
        const mensajes = {
          1: `👆 ${user.nombre_completo}: Coloca tu dedo en el sensor...`,
          2: `🗑️ ${user.nombre_completo}: Retira el dedo...`,
          3: `👆 ${user.nombre_completo}: Coloca el MISMO dedo nuevamente...`,
          4: `✅ ${user.nombre_completo}: ¡Registrando huella...`
        };
        
        toast.loading(mensajes[status.paso] || mensajes[1], { id: toastId });
        
        if (status.completado) {
          completado = true;
          toast.success(`✅ ¡Huella registrada correctamente para ${user.nombre_completo}!`, { id: toastId });
          await cargarUsuarios();
          break;
        }
        
        if (status.error) {
          throw new Error(status.message || 'Error en el registro');
        }
        
        intentos++;
      }
      
      if (!completado) {
        throw new Error('Tiempo de espera agotado (60 segundos)');
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(`❌ Error: ${error.message}`, { id: toastId });
    } finally {
      setRegistrando(false);
      setUsuarioRegistro(null);
      setPasoActual(0);
    }
  };

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

  if (cargando) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
    );
  }

  return (
      <div className="huellas-container">
        <div className="header">
          <h1>🖐️ Gestión de Huellas Digitales</h1>
          <button 
            onClick={limpiarMemoriaSensor}
            className="btn-clear"
            title="Limpiar memoria del sensor AS608"
          >
            🗑️ Limpiar Sensor
          </button>
        </div>

        {infoSensor && (
          <div className="sensor-info">
            <span>📀 Memoria sensor: {infoSensor.memoria}/{infoSensor.total}</span>
          </div>
        )}

        <div className="info-card">
          <h3>📋 Instrucciones</h3>
          <ol>
            <li>Selecciona un usuario de la lista</li>
            <li>Haz clic en <strong>"Registrar Huella"</strong></li>
            <li>Coloca tu <strong>dedo</strong> en el sensor AS608</li>
            <li>Espera la primera lectura (LED parpadeará)</li>
            <li>Retira el dedo cuando se indique</li>
            <li>Vuelve a colocar el <strong>mismo dedo</strong> para confirmar</li>
            <li>La huella quedará registrada automáticamente</li>
          </ol>
        </div>

        {registrando && (
          <div className="enroll-progress">
            <div className="spinner"></div>
            <p>Registrando huella para <strong>{usuarioRegistro?.nombre_completo}</strong></p>
            <p className="hint">
              {pasoActual === 1 && '👆 Coloca tu dedo en el sensor...'}
              {pasoActual === 2 && '🗑️ Retira el dedo...'}
              {pasoActual === 3 && '👆 Coloca el mismo dedo nuevamente...'}
              {pasoActual === 4 && '✅ Guardando huella...'}
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(pasoActual / 4) * 100}%` }}></div>
            </div>
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