const ListaRoles = ({ roles, onEditar, onEliminar }) => {
  return (
    <div className="lista-roles">
      <div className="table-container">
        <table className="roles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Descripción</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay roles registrados
                </td>
              </tr>
            ) : (
              roles.map((rol) => (
                <tr key={rol.id}>
                  <td>{rol.id}</td>
                  <td className="rol-nombre">{rol.nombre}</td>
                  <td>
                    <span className="nivel-badge">{rol.nivel}</span>
                  </td>
                  <td>{rol.descripcion || '-'}</td>
                  <td>
                    <div className="permisos-list">
                      {rol.puede_aprobar_material && (
                        <span className="permiso-badge">✓ Aprobar Material</span>
                      )}
                      {rol.puede_asignar_tecnico && (
                        <span className="permiso-badge">✓ Asignar Técnico</span>
                      )}
                      {rol.puede_gestionar_inventario && (
                        <span className="permiso-badge">✓ Gestionar Inventario</span>
                      )}
                      {rol.puede_ver_todas_solicitudes && (
                        <span className="permiso-badge">✓ Ver Todas Solicitudes</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => onEditar(rol)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onEliminar(rol.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaRoles;