import { cantidadAComprar } from "@/lib/dashboard";

// Materiales que están en el stock mínimo o bajo él
export default function StockBajo({ materiales }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-exclamation-triangle me-2 text-warning"></i>Materiales por comprar
        </h5>

        {materiales.length === 0 ? (
          <p className="text-muted mb-0">Todo el inventario está sobre el stock mínimo.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {materiales.map((material) => (
              <li key={material.id} className="list-group-item d-flex justify-content-between px-0">
                <span>
                  {material.nombre}
                  <span className="badge text-bg-warning ms-2">
                    quedan {material.stock} {material.unidad}
                  </span>
                </span>
                <span className="text-muted small">
                  comprar {cantidadAComprar(material)} {material.unidad}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
