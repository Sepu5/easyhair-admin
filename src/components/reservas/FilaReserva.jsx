import AccionesReserva from "@/components/reservas/AccionesReserva";
import EtiquetaEstado from "@/components/reservas/EtiquetaEstado";
import { formatearPrecio } from "@/lib/formato";

// Una fila de la tabla de reservas
export default function FilaReserva({ reserva, hoy, onAccion }) {
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
        {reserva.motivoCancelacion && <div className="small text-muted">{reserva.motivoCancelacion}</div>}
      </td>
      <td>
        <AccionesReserva reserva={reserva} hoy={hoy} onAccion={onAccion} />
      </td>
    </tr>
  );
}
