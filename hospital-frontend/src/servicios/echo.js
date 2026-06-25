// src/servicios/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Leer las variables de entorno de Vite
const reverbHost   = import.meta.env.VITE_REVERB_HOST   || window.location.hostname;
const reverbPort   = import.meta.env.VITE_REVERB_PORT   || 8080;
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
const reverbKey = import.meta.env.VITE_REVERB_APP_KEY || 'q7siqytufkhm8cfor7wq';

let echoInstance = null;

export const getEcho = () => {
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem('token');
  if (!token) return null;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL || ''}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};

/**
 * Destruir la instancia (usar al hacer logout)
 */
export const destroyEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};

/**
 * Suscribirse al canal de notificaciones del usuario actual
 * @param {number} usuarioId
 * @param {function} callback - recibe la notificación
 * @returns función para desuscribirse
 */
export const suscribirNotificaciones = (usuarioId, callback) => {
  const echo = getEcho();
  if (!echo || !usuarioId) return () => {};

  const canal = echo.private(`notificaciones.${usuarioId}`);

  canal.listen('.nueva-notificacion', (e) => {
    console.log('🔔 Nueva notificación WebSocket:', e.notificacion);
    callback(e.notificacion);
  });

  canal.error((error) => {
    console.warn('⚠️ Error en canal de notificaciones:', error);
  });

  // Devolver función de limpieza
  return () => {
    echo.leave(`notificaciones.${usuarioId}`);
  };
};