import { formatearPrecio } from "@/lib/formato";

// Una fila de la tabla de servicios
export default function FilaServicio({ servicio, onEditar, onEliminar }) {
  return (
    <tr>
      <td className="fw-semibold">{servicio.nombre}</td>
      <td>{servicio.descripcion || "—"}</td>
      <td>{servicio.duracion} min</td>
      <td>{formatearPrecio(servicio.precio)}</td>
      <td>
        <span className={`badge ${servicio.activo ? "text-bg-success" : "text-bg-secondary"}`}>
          {servicio.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td>
        <div className="d-flex gap-1">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEditar(servicio)}>
            <i className="bi bi-pencil"></i> Editar
          </button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(servicio)}>
            <i className="bi bi-trash"></i> Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}