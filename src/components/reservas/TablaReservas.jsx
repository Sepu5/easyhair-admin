import FilaReserva from "@/components/reservas/FilaReserva";

// Tabla con las reservas del día
export default function TablaReservas({ reservas }) {
  if (reservas.length === 0) {
    return <div className="alert alert-light border">No hay reservas para este día con estos filtros.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Peluquero</th>
            <th>Servicios</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <FilaReserva key={reserva.id} reserva={reserva} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
