// src/componentes/comunes/SubirImagenes.jsx
import { useState } from 'react';
import { FiUpload, FiCamera, FiX, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../servicios/api';
import './SubirImagenes.css';

const SubirImagenes = ({ solicitudId, imagenesExistentes = [], onImagenesSubidas }) => {
  const [imagenes, setImagenes] = useState(imagenesExistentes || []);
  const [subiendo, setSubiendo] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setSubiendo(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('imagenes[]', file);
    });
    
    try {
      const response = await api.post(`/solicitudes/${solicitudId}/upload-imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success(`${files.length} imagen(es) subida(s)`);
        const nuevasRutas = response.data.data.rutas_fotos;
        setImagenes(nuevasRutas);
        if (onImagenesSubidas) {
          onImagenesSubidas(nuevasRutas);
        }
      }
    } catch (error) {
      toast.error('Error al subir imágenes');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  const handleEliminar = async (index) => {
    // Por ahora solo elimina del estado local
    const nuevas = imagenes.filter((_, i) => i !== index);
    setImagenes(nuevas);
  };

  const handleVerPreview = (ruta) => {
    setPreview(ruta);
  };

  return (
    <div className="subir-imagenes">
      <div className="imagenes-grid">
        {imagenes.map((img, idx) => (
          <div key={idx} className="imagen-item" onClick={() => handleVerPreview(img)}>
            <img src={`http://localhost:8000${img}`} alt={`Imagen ${idx + 1}`} />
            <button 
              className="btn-eliminar"
              onClick={(e) => { e.stopPropagation(); handleEliminar(idx); }}
            >
              <FiX />
            </button>
          </div>
        ))}
        
        <label className="upload-placeholder">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={subiendo}
            style={{ display: 'none' }}
          />
          {subiendo ? (
            <div className="uploading">
              <div className="spinner-small"></div>
              <span>Subiendo...</span>
            </div>
          ) : (
            <>
              <FiPlus size={24} />
              <span>Agregar fotos</span>
              <small>JPG, PNG (max 5MB)</small>
            </>
          )}
        </label>
      </div>
      
      <div className="upload-actions">
        <button 
          className="btn-camera"
          onClick={() => {
            // Para cámara en móvil
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = handleFileSelect;
            input.click();
          }}
        >
          <FiCamera /> Tomar foto
        </button>
        <button 
          className="btn-gallery"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = handleFileSelect;
            input.click();
          }}
        >
          <FiUpload /> Galería
        </button>
      </div>
      
      {/* Modal preview */}
      {preview && (
        <div className="preview-modal" onClick={() => setPreview(null)}>
          <img src={`http://localhost:8000${preview}`} alt="Preview" />
          <button className="btn-cerrar" onClick={() => setPreview(null)}>
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
};

export default SubirImagenes;