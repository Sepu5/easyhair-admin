// Filtros de la página: mes y tipo de movimiento
// onCambiar(campo, valor) le avisa a la página qué filtro cambió
export default function FiltrosFinanzas({ filtros, onCambiar }) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-sm-6 col-md-3">
        <label htmlFor="filtro-mes" className="form-label">
          Mes
        </label>
        <input
          id="filtro-mes"
          type="month"
          className="form-control"
          value={filtros.mes}
          onChange={(e) => onCambiar("mes", e.target.value)}
        />
      </div>
      <div className="col-sm-6 col-md-3">
        <label htmlFor="filtro-tipo" className="form-label">
          Tipo
        </label>
        <select
          id="filtro-tipo"
          className="form-select"
          value={filtros.tipo}
          onChange={(e) => onCambiar("tipo", e.target.value)}
        >
          <option value="">Todos</option>
          <option value="INGRESO">Ingresos</option>
          <option value="EGRESO">Egresos</option>
        </select>
      </div>
    </div>
  );
}
