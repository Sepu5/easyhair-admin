import { ESTADOS, contarPorEstado } from "@/lib/reservas";

// Cuántas reservas hay de cada estado en el día
export default function ResumenEstados({ reservas }) {
  const conteo = contarPorEstado(reservas);

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <span className="badge text-bg-dark">Total: {reservas.length}</span>
      {Object.entries(ESTADOS).map(([valor, info]) => (
        <span key={valor} className={`badge text-bg-${info.color}`}>
          {info.texto}: {conteo[valor]}
        </span>
      ))}
    </div>
  );
}
