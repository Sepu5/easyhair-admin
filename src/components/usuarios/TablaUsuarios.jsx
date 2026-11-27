import EtiquetaRol from "@/components/usuarios/EtiquetaRol";
import { esCuentaPropia } from "@/lib/usuarios";

// Tabla con las cuentas registradas.
// La cuenta del admin que inició sesión la marcamos con "(tú)": no la dejamos
// cambiar de rol ni eliminar (el backend tampoco lo permite) y sus datos se editan en Perfil.
export default function TablaUsuarios({ usuarios, idSesion, onEditar, onCambiarRol, onEliminar }) {
  if (usuarios.length === 0) {
    return <div className="alert alert-light border">No hay usuarios con estos filtros.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => {
            const propia = esCuentaPropia(usuario, idSesion);
            return (
              <tr key={usuario.id}>
                <td className="fw-semibold">
                  {usuario.nombre}
                  {propia && <span className="text-muted fw-normal ms-1">(tú)</span>}
                </td>
                <td>{usuario.correo}</td>
                <td>
                  <EtiquetaRol rol={usuario.rol} />
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onEditar(usuario)}
                      disabled={propia}
                    >
                      <i className="bi bi-pencil"></i> Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onCambiarRol(usuario)}
                      disabled={propia}
                    >
                      <i className="bi bi-person-gear"></i> Cambiar rol
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onEliminar(usuario)}
                      disabled={propia}
                    >
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
