import EtiquetaEstado from "@/components/reservas/EtiquetaEstado";
import { formatearPrecio } from "@/lib/formato";

// Una fila de la tabla de reservas
export default function FilaReserva({ reserva }) {
  return (
    <tr>
      <td className="fw-semibold">{reserva.hora}</td>
      <td>
        {reserva.nombreCliente || "Sin nombre"}
        <div className="small text-muted">{reserva.correoCliente}</div>
      </td>
      <td>{reserva.nombrePeluquero}</td>
      <td>{reserva.servicios}</td>
      <td>{formatearPrecio(reserva.total)}</td>
      <td>
        <EtiquetaEstado estado={reserva.estado} />
      </td>
    </tr>
  );
}
