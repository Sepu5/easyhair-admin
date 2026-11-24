import { TIPOS, CATEGORIAS } from "@/lib/finanzas";
import { formatearPrecio } from "@/lib/formato";

// Total del mes por categoría (separado en ingresos y egresos)
export default function ResumenCategorias({ categorias }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white fw-semibold">Por categoría</div>
      {categorias.length === 0 ? (
        <div className="card-body text-muted">Sin movimientos este mes.</div>
      ) : (
        <table className="table mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Categoría</th>
              <th>Tipo</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((item) => (
              <tr key={`${item.tipo}-${item.categoria}`}>
                <td>{CATEGORIAS[item.categoria] || item.categoria}</td>
                <td>
                  <span className={`badge text-bg-${TIPOS[item.tipo]?.color || "secondary"}`}>
                    {TIPOS[item.tipo]?.texto || item.tipo}
                  </span>
                </td>
                <td className="text-end">{formatearPrecio(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
