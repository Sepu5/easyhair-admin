import { ETIQUETAS_ROL, ROLES, contarPorRol } from "@/lib/usuarios";

// Buscador por nombre o correo, filtro por rol y cuántos hay de cada rol.
// con onCambiar(campo, valor) le avisamos a la página qué filtro cambió.
export default function FiltrosUsuarios({ filtros, usuarios, onCambiar }) {
  const conteo = contarPorRol(usuarios);

  return (
    <>
      <div className="row g-2 mb-2">
        <div className="col-12 col-md-8">
          <label htmlFor="buscar" className="form-label small">Buscar</label>
          <input
            id="buscar"
            type="search"
            className="form-control"
            placeholder="Nombre o correo"
            value={filtros.texto}
            onChange={(e) => onCambiar("texto", e.target.value)}
          />
        </div>
        <div className="col-12 col-md-4">
          <label htmlFor="rol" className="form-label small">Rol</label>
          <select id="rol" className="form-select" value={filtros.rol} onChange={(e) => onCambiar("rol", e.target.value)}>
            <option value="">Todos</option>
            {ROLES.map((rol) => (
              <option key={rol} value={rol}>
                {ETIQUETAS_ROL[rol].texto}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="badge text-bg-light border">Total: {usuarios.length}</span>
        {ROLES.map((rol) => (
          <span key={rol} className={`badge ${ETIQUETAS_ROL[rol].color}`}>
            {ETIQUETAS_ROL[rol].texto}: {conteo[rol]}
          </span>
        ))}
      </div>
    </>
  );
}
