import { formatearPrecio, formatearFecha } from "@/lib/formato";

// Historial de compras de materiales
export default function TablaCompras({ compras }) {
  if (compras.length === 0) {
    return <div className="alert alert-light border">Aún no hay compras registradas.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Material</th>
            <th>Cantidad</th>
            <th>Costo total</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id}>
              <td>{formatearFecha(compra.fecha)}</td>
              <td className="fw-semibold">{compra.nombreMaterial}</td>
              <td>{compra.cantidad}</td>
              <td>{formatearPrecio(compra.costoTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
