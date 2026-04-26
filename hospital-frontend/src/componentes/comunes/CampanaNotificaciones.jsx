import React, { useState, useEffect, useRef } from 'react';
// Importación correcta para React 19
//src/componentes/comunes/CampanaNotificaciones.jsx
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import notificacionService from '../../servicios/notificacionService';
import { useNavigate } from 'react-router-dom';
import './CampanaNotificaciones.css';

const CampanaNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [cargando, setCargando] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarConteo();
        const interval = setInterval(cargarConteo, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) cargarNotificaciones();
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const cargarConteo = async () => {
        try {
            const response = await notificacionService.obtenerConteoNoLeidas();
            setNoLeidas(response.no_leidas || 0);
        } catch (error) {
            console.error('Error cargando conteo:', error);
        }
    };

    const cargarNotificaciones = async () => {
        setCargando(true);
        try {
            const response = await notificacionService.obtenerNotificaciones(1);
            setNotificaciones(response.data.data || []);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleClickNotificacion = async (notificacion) => {
        if (!notificacion.leida) {
            try {
                await notificacionService.marcarLeida(notificacion.id);
                setNoLeidas(prev => Math.max(0, prev - 1));
                setNotificaciones(prev =>
                    prev.map(n => n.id === notificacion.id ? { ...n, leida: true } : n)
                );
            } catch (error) {
                console.error('Error marcando como leída:', error);
            }
        }
        
        if (notificacion.url) {
            navigate(notificacion.url);
            setIsOpen(false);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionService.marcarTodasLeidas();
            setNoLeidas(0);
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            toast.error('Error al marcar notificaciones');
        }
    };

    const handleEliminar = async (e, id) => {
        e.stopPropagation();
        try {
            const notif = notificaciones.find(n => n.id === id);
            await notificacionService.eliminarNotificacion(id);
            setNotificaciones(prev => prev.filter(n => n.id !== id));
            if (notif && !notif.leida) {
                setNoLeidas(prev => Math.max(0, prev - 1));
            }
            toast.success('Notificación eliminada');
        } catch (error) {
            toast.error('Error al eliminar notificación');
        }
    };

    const getIconoPorTipo = (tipo) => {
        const iconos = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            danger: '🔴'
        };
        return iconos[tipo] || '📢';
    };

    return (
        <div className="campana-notificaciones" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="btn-notificaciones"
                title="Notificaciones"
            >
                <FiBell className="icon-bell" />
                {noLeidas > 0 && (
                    <span className="badge-notificaciones">
                        {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="dropdown-notificaciones">
                    <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                        <div className="dropdown-actions">
                            {notificaciones.some(n => !n.leida) && (
                                <button 
                                    onClick={handleMarcarTodasLeidas} 
                                    className="btn-marcar-todas"
                                >
                                    <FiCheckCircle /> Marcar todas
                                </button>
                            )}
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="btn-cerrar"
                            >
                                <FiX />
                            </button>
                        </div>
                    </div>
                    
                    <div className="dropdown-body">
                        {cargando ? (
                            <div className="mensaje-cargando">
                                <div className="spinner"></div>
                                <p>Cargando...</p>
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div className="mensaje-vacio">
                                <FiBell className="icono-vacio" />
                                <p>No hay notificaciones</p>
                            </div>
                        ) : (
                            notificaciones.map((notificacion) => (
                                <div
                                    key={notificacion.id}
                                    onClick={() => handleClickNotificacion(notificacion)}
                                    className={`notificacion-item ${!notificacion.leida ? 'no-leida' : ''}`}
                                >
                                    <div className="notificacion-contenido">
                                        <span className="notificacion-icono">
                                            {getIconoPorTipo(notificacion.tipo)}
                                        </span>
                                        <div className="notificacion-detalle">
                                            <div className="notificacion-titulo">
                                                {notificacion.titulo}
                                                {!notificacion.leida && (
                                                    <span className="badge-nueva">Nueva</span>
                                                )}
                                            </div>
                                            <p className="notificacion-mensaje">
                                                {notificacion.mensaje}
                                            </p>
                                            <div className="notificacion-footer">
                                                <span className="notificacion-fecha">
                                                    {formatDistanceToNow(new Date(notificacion.creado_en), { 
                                                        addSuffix: true, 
                                                        locale: es 
                                                    })}
                                                </span>
                                                <button 
                                                    onClick={(e) => handleEliminar(e, notificacion.id)} 
                                                    className="btn-eliminar"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {!notificacion.leida && (
                                        <div className="notificacion-indicador"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    {notificaciones.length > 0 && (
                        <div className="dropdown-footer">
                            <button 
                                onClick={() => { 
                                    navigate('/notificaciones'); 
                                    setIsOpen(false); 
                                }} 
                                className="btn-ver-todas"
                            >
                                Ver todas las notificaciones
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CampanaNotificaciones;