import { formatearFecha, formatearPrecio } from "@/lib/formato";

// Datos de la reserva que se muestran dentro de los modales
export default function ResumenReserva({ reserva }) {
  return (
    <div className="bg-light rounded p-2 mb-3 small">
      <div className="fw-semibold">{reserva.nombreCliente}</div>
      <div>
        {formatearFecha(reserva.fecha)} a las {reserva.hora} con {reserva.nombrePeluquero}
      </div>
      <div className="text-muted">
        {reserva.servicios} · {formatearPrecio(reserva.total)}
      </div>
    </div>
  );
}
