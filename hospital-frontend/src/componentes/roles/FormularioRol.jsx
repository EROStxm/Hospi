import { useState } from 'react';

const FormularioRol = ({ rol, onGuardar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nombre: rol?.nombre || '',
    nivel: rol?.nivel || 1,
    descripcion: rol?.descripcion || '',
    puede_aprobar_material: rol?.puede_aprobar_material || false,
    puede_asignar_tecnico: rol?.puede_asignar_tecnico || false,
    puede_gestionar_inventario: rol?.puede_gestionar_inventario || false,
    puede_ver_todas_solicitudes: rol?.puede_ver_todas_solicitudes || false,
  });

  const [errores, setErrores] = useState({});

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }
    
    if (formData.nivel < 1 || formData.nivel > 100) {
      nuevosErrores.nivel = 'El nivel debe estar entre 1 y 100';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      onGuardar(formData);
    }
  };

  return (
    <div className="formulario-rol">
      <div className="form-card">
        <h2>{rol ? 'Editar Rol' : 'Nuevo Rol'}</h2>
        
        <form onSubmit={manejarSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="nombre">Nombre del Rol *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                className={errores.nombre ? 'error' : ''}
              />
              {errores.nombre && (
                <span className="error-text">{errores.nombre}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="nivel">Nivel Jerárquico *</label>
              <input
                type="number"
                id="nivel"
                name="nivel"
                value={formData.nivel}
                onChange={manejarCambio}
                min="1"
                max="100"
                className={errores.nivel ? 'error' : ''}
              />
              {errores.nivel && (
                <span className="error-text">{errores.nivel}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={manejarCambio}
              rows="3"
            />
          </div>

          <div className="form-section">
            <h3>Permisos del Rol</h3>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="puede_aprobar_material"
                  checked={formData.puede_aprobar_material}
                  onChange={manejarCambio}
                />
                Puede aprobar uso de materiales
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="puede_asignar_tecnico"
                  checked={formData.puede_asignar_tecnico}
                  onChange={manejarCambio}
                />
                Puede asignar técnicos
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="puede_gestionar_inventario"
                  checked={formData.puede_gestionar_inventario}
                  onChange={manejarCambio}
                />
                Puede gestionar inventario
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="puede_ver_todas_solicitudes"
                  checked={formData.puede_ver_todas_solicitudes}
                  onChange={manejarCambio}
                />
                Puede ver todas las solicitudes
              </label>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary">
              {rol ? 'Actualizar Rol' : 'Crear Rol'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioRol;