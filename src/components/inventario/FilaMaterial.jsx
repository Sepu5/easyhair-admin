import { formatearPrecio } from "@/lib/formato";

// Una fila de la tabla de materiales
export default function FilaMaterial({ material, bajo, onEditar, onComprar }) {
  return (
    <tr>
      <td className="fw-semibold">{material.nombre}</td>
      <td>
        {material.stock} {material.unidad}
      </td>
      <td>
        {material.stockMinimo} {material.unidad}
      </td>
      <td>{material.precioUnitario != null ? formatearPrecio(material.precioUnitario) : "—"}</td>
      <td>
        <span className={`badge ${bajo ? "text-bg-danger" : "text-bg-success"}`}>
          {bajo ? "Stock bajo" : "Stock normal"}
        </span>
      </td>
      <td>
        <div className="d-flex gap-1">
          <button type="button" className="btn btn-sm btn-outline-success" onClick={() => onComprar(material)}>
            <i className="bi bi-cart-plus"></i> Comprar
          </button>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEditar(material)}>
            <i className="bi bi-pencil"></i> Editar
          </button>
        </div>
      </td>
    </tr>
  );
}
