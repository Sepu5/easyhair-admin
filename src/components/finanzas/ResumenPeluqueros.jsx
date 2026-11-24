import { nombrePeluquero } from "@/lib/finanzas";
import { formatearPrecio } from "@/lib/formato";

// Ingresos del mes por peluquero (solo los ingresos por servicios)
export default function ResumenPeluqueros({ resumen, peluqueros }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white fw-semibold">Ingresos por peluquero</div>
      {resumen.length === 0 ? (
        <div className="card-body text-muted">Sin ingresos por servicios este mes.</div>
      ) : (
        <table className="table mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Peluquero</th>
              <th className="text-end">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map((item) => (
              <tr key={item.peluqueroId}>
                <td>{nombrePeluquero(peluqueros, item.peluqueroId)}</td>
                <td className="text-end">{formatearPrecio(item.totalIngresos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
