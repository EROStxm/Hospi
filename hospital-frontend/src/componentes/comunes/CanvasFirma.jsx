// src/componentes/comunes/CanvasFirma.jsx
import { useRef, useState, useEffect, useCallback } from 'react';
import { FiRotateCcw, FiCheck } from 'react-icons/fi';
import './CanvasFirma.css';

/**
 * Lápiz digital para dibujar una firma a mano (mouse o touch).
 * onGuardar recibe un data URI PNG (string) listo para enviar al backend.
 */
const CanvasFirma = ({ onGuardar, guardando = false }) => {
  const canvasRef = useRef(null);
  const dibujando = useRef(false);
  const ultimoPunto = useRef({ x: 0, y: 0 });
  const [tieneTrazo, setTieneTrazo] = useState(false);

  // Inicializar el contexto UNA sola vez
  const inicializarContexto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Guardar dimensiones reales
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    
    // Resetear transformación y aplicar escala
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a5f';
  }, []);

  useEffect(() => {
    inicializarContexto();
    
    const handleResize = () => {
      // Guardar el dibujo actual antes de redimensionar
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      const img = new Image();
      
      img.onload = () => {
        inicializarContexto();
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inicializarContexto]);

  const obtenerCoordenadas = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const evento = e.touches ? e.touches[0] : e;
    return {
      x: evento.clientX - rect.left,
      y: evento.clientY - rect.top,
    };
  };

  const iniciarTrazo = (e) => {
    e.preventDefault();
    dibujando.current = true;
    ultimoPunto.current = obtenerCoordenadas(e);
  };

  const dibujar = (e) => {
    if (!dibujando.current) return;
    e.preventDefault();

    const ctx = canvasRef.current.getContext('2d');
    const punto = obtenerCoordenadas(e);

    ctx.beginPath();
    ctx.moveTo(ultimoPunto.current.x, ultimoPunto.current.y);
    ctx.lineTo(punto.x, punto.y);
    ctx.stroke();

    ultimoPunto.current = punto;
    if (!tieneTrazo) setTieneTrazo(true);
  };

  const terminarTrazo = () => {
    dibujando.current = false;
  };

  const limpiar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setTieneTrazo(false);
  }, []);

  const guardar = () => {
    if (!tieneTrazo) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onGuardar(dataUrl);
  };

  return (
    <div className="canvas-firma-wrapper">
      <div className="canvas-firma-area">
        <canvas
          ref={canvasRef}
          className="canvas-firma"
          onMouseDown={iniciarTrazo}
          onMouseMove={dibujar}
          onMouseUp={terminarTrazo}
          onMouseLeave={terminarTrazo}
          onTouchStart={iniciarTrazo}
          onTouchMove={dibujar}
          onTouchEnd={terminarTrazo}
        />
        {!tieneTrazo && (
          <div className="canvas-firma-placeholder">
            Dibuje su firma aquí (mouse o dedo)
          </div>
        )}
      </div>

      <div className="canvas-firma-actions">
        <button 
          type="button" 
          className="btn-firma-limpiar" 
          onClick={limpiar} 
          disabled={!tieneTrazo}
        >
          <FiRotateCcw /> Borrar
        </button>
        <button
          type="button"
          className="btn-firma-guardar"
          onClick={guardar}
          disabled={!tieneTrazo || guardando}
        >
          <FiCheck /> {guardando ? 'Guardando...' : 'Guardar Firma'}
        </button>
      </div>
    </div>
  );
};

export default CanvasFirma;