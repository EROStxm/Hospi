import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import notificacionService from '../servicios/notificacionService';
import Layout from '../componentes/comunes/Layout';
import '../estilos/notificaciones.css'; // ← Importar CSS

const NotificacionesPage = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [filtro, setFiltro] = useState('todas');

    useEffect(() => {
        cargarNotificaciones();
    }, [pagina, filtro]);

    const cargarNotificaciones = async () => {
        setCargando(true);
        try {
            const response = await notificacionService.obtenerNotificaciones(
                pagina,
                filtro === 'no_leidas'
            );
            
            const notificacionesData = response.data.data || [];
            
            const notificacionesConLeida = notificacionesData.map(n => ({
                ...n,
                leida: n.leido_en !== null
            }));
            
            setNotificaciones(notificacionesConLeida);
            setTotalPaginas(response.data.last_page);
            setTotalRegistros(response.data.total);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setCargando(false);
        }
    };

    const handleMarcarLeida = async (id) => {
        try {
            await notificacionService.marcarLeida(id);
            setNotificaciones(prev =>
                prev.map(n => n.id === id ? { ...n, leida: true, leido_en: new Date().toISOString() } : n)
            );
            toast.success('Notificación marcada como leída');
            window.dispatchEvent(new CustomEvent('recargar-notificaciones'));
        } catch (error) {
            toast.error('Error al marcar notificación');
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionService.marcarTodasLeidas();
            setNotificaciones(prev =>
                prev.map(n => ({ ...n, leida: true, leido_en: new Date().toISOString() }))
            );
            toast.success('Todas las notificaciones marcadas como leídas');
            window.dispatchEvent(new CustomEvent('recargar-notificaciones'));
        } catch (error) {
            toast.error('Error al marcar notificaciones');
        }
    };

    const handleEliminar = async (id) => {
        try {
            await notificacionService.eliminarNotificacion(id);
            setNotificaciones(prev => prev.filter(n => n.id !== id));
            toast.success('Notificación eliminada');
            window.dispatchEvent(new CustomEvent('recargar-notificaciones'));
        } catch (error) {
            toast.error('Error al eliminar notificación');
        }
    };

    const getIconoPorTipo = (tipo) => {
        const iconos = {
            info: '🔵',
            success: '✅',
            warning: '⚠️',
            danger: '🔴'
        };
        return iconos[tipo] || '📢';
    };

    const getColorPorTipo = (tipo) => {
        const colores = {
            info: 'notificacion-info',
            success: 'notificacion-success',
            warning: 'notificacion-warning',
            danger: 'notificacion-danger'
        };
        return colores[tipo] || 'notificacion-default';
    };

    return (
        <Layout>
            <div className="notificaciones-container">
                <div className="notificaciones-header">
                    <div className="titulo-section">
                        <span className="icono-titulo">🔔</span>
                        <h1>Notificaciones</h1>
                        {totalRegistros > 0 && (
                            <span className="total-badge">{totalRegistros}</span>
                        )}
                    </div>
                    <div className="acciones-header">
                        <select
                            value={filtro}
                            onChange={(e) => {
                                setFiltro(e.target.value);
                                setPagina(1);
                            }}
                            className="filtro-select"
                        >
                            <option value="todas">Todas</option>
                            <option value="no_leidas">No leídas</option>
                        </select>
                        <button
                            onClick={handleMarcarTodasLeidas}
                            className="btn-marcar-todas"
                        >
                            ✓✓ Marcar todas
                        </button>
                    </div>
                </div>

                <div className="notificaciones-lista">
                    {cargando ? (
                        <div className="cargando">Cargando notificaciones...</div>
                    ) : notificaciones.length === 0 ? (
                        <div className="vacio">
                            <span className="icono-vacio">🔔</span>
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        notificaciones.map((notificacion) => (
                            <div
                                key={notificacion.id}
                                className={`notificacion-card ${getColorPorTipo(notificacion.tipo)} ${!notificacion.leida ? 'no-leida' : ''}`}
                            >
                                <div className="notificacion-contenido">
                                    <div className="notificacion-icono">
                                        {getIconoPorTipo(notificacion.tipo)}
                                    </div>
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
                                                {format(new Date(notificacion.creado_en), "PPP 'a las' p", {
                                                    locale: es
                                                })}
                                            </span>
                                            <div className="acciones">
                                                {!notificacion.leida && (
                                                    <button
                                                        onClick={() => handleMarcarLeida(notificacion.id)}
                                                        className="btn-marcar"
                                                    >
                                                        ✓ Marcar leída
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEliminar(notificacion.id)}
                                                    className="btn-eliminar"
                                                >
                                                    🗑 Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {totalPaginas > 1 && (
                    <div className="paginacion">
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                            className="btn-pagina"
                        >
                            Anterior
                        </button>
                        <span className="pagina-info">
                            Página {pagina} de {totalPaginas}
                        </span>
                        <button
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={pagina === totalPaginas}
                            className="btn-pagina"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NotificacionesPage;