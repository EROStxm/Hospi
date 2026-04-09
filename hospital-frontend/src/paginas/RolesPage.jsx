import { useState, useEffect } from 'react';
import { rolService } from '../servicios/rolService';
import ListaRoles from '../componentes/roles/ListaRoles';
import FormularioRol from '../componentes/roles/FormularioRol';
import '../estilos/roles.css';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [rolEditando, setRolEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setCargando(true);
      const respuesta = await rolService.obtenerTodos();
      setRoles(respuesta.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los roles');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const manejarCrear = () => {
    setRolEditando(null);
    setMostrarFormulario(true);
  };

  const manejarEditar = (rol) => {
    setRolEditando(rol);
    setMostrarFormulario(true);
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol?')) {
      return;
    }

    try {
      await rolService.eliminar(id);
      await cargarRoles();
      alert('Rol eliminado correctamente');
    } catch (err) {
      alert(err.message || 'Error al eliminar el rol');
    }
  };

  const manejarGuardar = async (datosRol) => {
    try {
      if (rolEditando) {
        await rolService.actualizar(rolEditando.id, datosRol);
        alert('Rol actualizado correctamente');
      } else {
        await rolService.crear(datosRol);
        alert('Rol creado correctamente');
      }
      
      setMostrarFormulario(false);
      setRolEditando(null);
      await cargarRoles();
    } catch (err) {
      alert(err.message || 'Error al guardar el rol');
    }
  };

  const manejarCancelar = () => {
    setMostrarFormulario(false);
    setRolEditando(null);
  };

  if (cargando) {
    return <div className="loading">Cargando roles...</div>;
  }

  return (
    <div className="roles-page">
      <div className="page-header">
        <h1>Gestión de Roles</h1>
        <div>
          <button className="btn-primary" onClick={manejarCrear}>
            + Nuevo Rol
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <FormularioRol
          rol={rolEditando}
          onGuardar={manejarGuardar}
          onCancelar={manejarCancelar}
        />
      )}

      <ListaRoles
        roles={roles}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
      />
    </div>
  );
};

export default RolesPage;