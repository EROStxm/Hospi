// src/hooks/useAutoRefresh.js
import { useEffect, useRef } from 'react';
import { suscribirNotificaciones } from '../servicios/echo';

/**
 * Suscribe la página actual al canal de notificaciones del usuario
 * y ejecuta `onRefrescar` cada vez que llega una notificación nueva
 * relacionada con solicitudes.
 *
 * @param {function} onRefrescar - función a llamar (normalmente recarga datos)
 * @param {object} opciones
 *   - soloSiSolicitudId: number -> solo refresca si la notificación trae ese solicitud_id
 *   - debounceMs: número de ms para evitar refrescos en cascada (default 600)
 */
export const useAutoRefresh = (onRefrescar, opciones = {}) => {
  const { soloSiSolicitudId = null, debounceMs = 600 } = opciones;
  const timeoutRef = useRef(null);
  const callbackRef = useRef(onRefrescar);

  // Mantener la última versión del callback sin re-suscribir
  useEffect(() => {
    callbackRef.current = onRefrescar;
  }, [onRefrescar]);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!usuario?.id) return;

    const manejarNotificacion = (notif) => {
      // Si se pidió filtrar por una solicitud específica, respetarlo
      if (soloSiSolicitudId && notif.solicitud_id !== soloSiSolicitudId) {
        return;
      }

      // Debounce: si llegan varias notificaciones juntas (ej. al firmar
      // se notifica a 5 técnicos a la vez), solo refrescamos una vez
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current?.();
      }, debounceMs);
    };

    const desuscribir = suscribirNotificaciones(usuario.id, manejarNotificacion);

    return () => {
      desuscribir();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloSiSolicitudId, debounceMs]);
};
