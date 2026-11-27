import { ESTADOS } from "@/lib/reservas";

// Filtros de la agenda: fecha, peluquero y estado.
// con onCambiar(campo, valor) le avisamos a la página qué filtro cambió.
export default function FiltrosAgenda({ filtros, peluqueros, onCambiar }) {
  return (
    <div className="row g-2 mb-3">
      <div className="col-12 col-md-4">
        <label htmlFor="fecha" className="form-label small">Fecha</label>
        <input
          id="fecha"
          type="date"
          className="form-control"
          value={filtros.fecha}
          onChange={(e) => onCambiar("fecha", e.target.value)}
        />
      </div>

      <div className="col-12 col-md-4">
        <label htmlFor="peluquero" className="form-label small">Peluquero</label>
        <select
          id="peluquero"
          className="form-select"
          value={filtros.peluqueroId}
          onChange={(e) => onCambiar("peluqueroId", e.target.value)}
        >
          <option value="">Todos</option>
          {peluqueros.map((peluquero) => (
            <option key={peluquero.id} value={peluquero.id}>
              {peluquero.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-4">
        <label htmlFor="estado" className="form-label small">Estado</label>
        <select
          id="estado"
          className="form-select"
          value={filtros.estado}
          onChange={(e) => onCambiar("estado", e.target.value)}
        >
          <option value="">Todos</option>
          {Object.entries(ESTADOS).map(([valor, info]) => (
            <option key={valor} value={valor}>
              {info.texto}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
