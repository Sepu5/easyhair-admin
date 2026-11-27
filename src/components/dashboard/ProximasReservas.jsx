import Link from "next/link";
import { formatearPrecio } from "@/lib/formato";

// Las reservas de hoy que todavía faltan por atender
export default function ProximasReservas({ reservas }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="bi bi-clock me-2"></i>Próximas reservas de hoy
          </h5>
          <Link href="/reservas" className="btn btn-sm btn-outline-primary">
            Ver agenda
          </Link>
        </div>

        {reservas.length === 0 ? (
          <p className="text-muted mb-0">No quedan reservas pendientes para hoy.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {reservas.map((reserva) => (
              <li key={reserva.id} className="list-group-item d-flex justify-content-between px-0">
                <span>
                  <strong className="me-2">{reserva.hora}</strong>
                  {reserva.nombreCliente}
                  <span className="text-muted small ms-2">con {reserva.nombrePeluquero}</span>
                </span>
                <span className="text-muted small">{formatearPrecio(reserva.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
