import EtiquetaRol from "@/components/usuarios/EtiquetaRol";

// Tabla con las cuentas registradas.
// La cuenta del admin que inició sesión se marca con "(tú)".
export default function TablaUsuarios({ usuarios, idSesion }) {
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
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td className="fw-semibold">
                {usuario.nombre}
                {usuario.id === idSesion && <span className="text-muted fw-normal ms-1">(tú)</span>}
              </td>
              <td>{usuario.correo}</td>
              <td>
                <EtiquetaRol rol={usuario.rol} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
