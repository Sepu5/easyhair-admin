import { formatearPrecio } from "@/lib/formato";

// Tarjetas con los ingresos, egresos y ganancia del mes
export default function TarjetasResumen({ resumen }) {
  if (!resumen) return null;

  const tarjetas = [
    { titulo: "Ingresos", valor: resumen.totalIngresos, color: "success" },
    { titulo: "Egresos", valor: resumen.totalEgresos, color: "danger" },
    { titulo: "Ganancia", valor: resumen.ganancia, color: resumen.ganancia < 0 ? "danger" : "primary" },
  ];

  return (
    <div className="row g-3 mb-4">
      {tarjetas.map((tarjeta) => (
        <div key={tarjeta.titulo} className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">{tarjeta.titulo}</div>
              <div className={`fs-4 fw-semibold text-${tarjeta.color}`}>{formatearPrecio(tarjeta.valor)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
