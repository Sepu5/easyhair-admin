import { TIPOS, CATEGORIAS } from "@/lib/finanzas";
import { formatearPrecio, formatearFecha } from "@/lib/formato";

// Tabla con los movimientos del mes
export default function TablaMovimientos({ movimientos, onEliminar }) {
  if (movimientos.length === 0) {
    return <div className="alert alert-light border">No hay movimientos en este mes con estos filtros.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th className="text-end">Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => {
            const tipo = TIPOS[movimiento.tipo];
            return (
              <tr key={movimiento.id}>
                <td>{formatearFecha(movimiento.fecha)}</td>
                <td>
                  <span className={`badge text-bg-${tipo?.color || "secondary"}`}>{tipo?.texto || movimiento.tipo}</span>
                </td>
                <td>{CATEGORIAS[movimiento.categoria] || movimiento.categoria}</td>
                <td>{movimiento.descripcion || "—"}</td>
                <td className={`text-end fw-semibold text-${tipo?.color || "secondary"}`}>{formatearPrecio(movimiento.monto)}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(movimiento)}>
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
