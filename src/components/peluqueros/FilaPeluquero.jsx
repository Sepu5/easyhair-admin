// Una fila de la tabla de peluqueros
export default function FilaPeluquero({ peluquero, onEditar, puedeEditar = true }) {
  return (
    <tr>
      <td className="fw-semibold">{peluquero.nombre}</td>
      <td>{peluquero.correo}</td>
      <td>
        <span className={`badge ${peluquero.activo ? "text-bg-success" : "text-bg-secondary"}`}>
          {peluquero.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      {puedeEditar && (
        <td>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEditar(peluquero)}>
            <i className="bi bi-pencil"></i> Editar
          </button>
        </td>
      )}
    </tr>
  );
}