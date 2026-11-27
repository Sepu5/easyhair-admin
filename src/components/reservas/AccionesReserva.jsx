import { accionesDisponibles } from "@/lib/reservas";

// Botones de cada reserva. Solo mostramos los que el backend permite.
// con onAccion(tipo, reserva) le avisamos a la página qué se quiere hacer.
export default function AccionesReserva({ reserva, hoy, onAccion }) {
  const acciones = accionesDisponibles(reserva, hoy);

  if (!acciones.noAsistio) {
    return <span className="text-muted small">—</span>;
  }

  return (
    <div className="d-flex flex-wrap gap-1">
      {acciones.atender && (
        <button type="button" className="btn btn-sm btn-success" onClick={() => onAccion("atender", reserva)}>
          <i className="bi bi-check-lg"></i> Atender
        </button>
      )}
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onAccion("noAsistio", reserva)}>
        No asistió
      </button>
      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onAccion("reprogramar", reserva)}>
        Reprogramar
      </button>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onAccion("cancelar", reserva)}>
        Cancelar
      </button>
    </div>
  );
}
