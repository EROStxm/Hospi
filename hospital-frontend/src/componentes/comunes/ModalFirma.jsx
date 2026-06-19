// src/componentes/comunes/ModalFirma.jsx
import { useState, useEffect } from 'react';
import { FiX, FiEdit3, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import CanvasFirma from './CanvasFirma';
import api from '../../servicios/api';
import toast from 'react-hot-toast';
import './ModalFirma.css';

const ModalFirma = ({ onClose, onFirmaLista, obligatorio = false }) => {
  const [firmaActual, setFirmaActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modoDibujar, setModoDibujar] = useState(false);

  useEffect(() => {
    cargarFirma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarFirma = async () => {
    try {
      setCargando(true);
      const res = await api.get('/mi-firma');
      if (res.data?.tiene_firma) {
        setFirmaActual(res.data.firma_digital);
        setModoDibujar(false);
      } else {
        setModoDibujar(true);
      }
    } catch (e) {
      console.error('Error cargando firma:', e);
      setModoDibujar(true);
    } finally {
      setCargando(false);
    }
  };

  const guardarFirma = async (dataUrl) => {
    try {
      setGuardando(true);
      await api.post('/mi-firma', { firma: dataUrl });
      setFirmaActual(dataUrl);
      setModoDibujar(false);
      toast.success('✅ Firma guardada correctamente');
      onFirmaLista?.(dataUrl);
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al guardar la firma';
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarFirma = async () => {
    if (!confirm('¿Eliminar tu firma digital?')) return;
    try {
      await api.delete('/mi-firma');
      setFirmaActual(null);
      setModoDibujar(true);
      toast.success('Firma eliminada');
    } catch (e) {
      toast.error('Error al eliminar la firma');
    }
  };

  const usarFirmaExistente = () => {
    onFirmaLista?.(firmaActual);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={obligatorio ? undefined : onClose}>
      <div className="modal modal-firma" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FiEdit3 /> Mi Firma Digital</h2>
          {!obligatorio && (
            <button onClick={onClose} className="modal-close-btn"><FiX /></button>
          )}
        </div>

        <div className="modal-body">
          {cargando ? (
            <div className="firma-cargando">
              <div className="spinner-sm" />
              <span>Verificando firma...</span>
            </div>
          ) : modoDibujar ? (
            <>
              {obligatorio && (
                <div className="firma-aviso">
                  ⚠️ Para continuar, primero debe registrar su firma digital.
                  Esta se guardará y se reutilizará en todas sus futuras firmas.
                </div>
              )}
              <CanvasFirma onGuardar={guardarFirma} guardando={guardando} />
            </>
          ) : (
            <>
              <div className="firma-preview-label">Su firma registrada:</div>
              <div className="firma-preview-box">
                <img src={firmaActual} alt="Firma digital" />
              </div>
              <div className="firma-preview-actions">
                <button className="btn-firma-rehacer" onClick={() => setModoDibujar(true)}>
                  <FiEdit3 /> Volver a dibujar
                </button>
                <button className="btn-firma-eliminar" onClick={eliminarFirma}>
                  <FiTrash2 /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>

        {!modoDibujar && firmaActual && (
          <div className="modal-actions">
            {!obligatorio && (
              <button onClick={onClose} className="btn-cancelar">Cerrar</button>
            )}
            <button className="btn-success" onClick={usarFirmaExistente}>
              <FiCheckCircle /> Usar esta firma
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalFirma;