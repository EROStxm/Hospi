import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import notificacionService from '../servicios/notificacionService';
import Layout from '../componentes/comunes/Layout';

const NotificacionesPage = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
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
            setNotificaciones(response.data.data);
            setTotalPaginas(response.data.last_page);
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
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            );
            toast.success('Notificación marcada como leída');
        } catch (error) {
            toast.error('Error al marcar notificación');
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionService.marcarTodasLeidas();
            setNotificaciones(prev =>
                prev.map(n => ({ ...n, leida: true }))
            );
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            toast.error('Error al marcar notificaciones');
        }
    };

    const handleEliminar = async (id) => {
        try {
            await notificacionService.eliminarNotificacion(id);
            setNotificaciones(prev => prev.filter(n => n.id !== id));
            toast.success('Notificación eliminada');
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

            <style jsx>{`
                .notificaciones-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .notificaciones-header {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .titulo-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .icono-titulo {
                    font-size: 28px;
                }
                .titulo-section h1 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                }
                .acciones-header {
                    display: flex;
                    gap: 12px;
                }
                .filtro-select {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                }
                .btn-marcar-todas {
                    padding: 8px 16px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-marcar-todas:hover {
                    background: #1d4ed8;
                }
                .notificaciones-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .notificacion-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                }
                .notificacion-card.no-leida {
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                }
                .notificacion-info { border-left: 4px solid #3b82f6; }
                .notificacion-success { border-left: 4px solid #10b981; }
                .notificacion-warning { border-left: 4px solid #f59e0b; }
                .notificacion-danger { border-left: 4px solid #ef4444; }
                .notificacion-default { border-left: 4px solid #9ca3af; }
                .notificacion-contenido {
                    display: flex;
                    gap: 12px;
                }
                .notificacion-icono {
                    font-size: 24px;
                }
                .notificacion-detalle {
                    flex: 1;
                }
                .notificacion-titulo {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .badge-nueva {
                    background: #3b82f6;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                }
                .notificacion-mensaje {
                    color: #6b7280;
                    margin: 0 0 12px 0;
                    line-height: 1.5;
                }
                .notificacion-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                }
                .notificacion-fecha {
                    color: #9ca3af;
                }
                .acciones {
                    display: flex;
                    gap: 12px;
                }
                .btn-marcar, .btn-eliminar {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                }
                .btn-marcar {
                    color: #2563eb;
                }
                .btn-marcar:hover {
                    background: #eff6ff;
                }
                .btn-eliminar {
                    color: #ef4444;
                }
                .btn-eliminar:hover {
                    background: #fee2e2;
                }
                .cargando, .vacio {
                    text-align: center;
                    padding: 60px;
                    background: white;
                    border-radius: 12px;
                    color: #6b7280;
                }
                .icono-vacio {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }
                .paginacion {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-top: 24px;
                    padding: 16px;
                    background: white;
                    border-radius: 12px;
                }
                .btn-pagina {
                    padding: 8px 16px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .btn-pagina:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .pagina-info {
                    color: #6b7280;
                    font-size: 14px;
                }
            `}</style>
        </Layout>
    );
};

export default NotificacionesPage;