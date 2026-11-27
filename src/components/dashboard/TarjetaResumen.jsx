// Tarjeta de color con un número grande (la sacamos del estilo de los templates de admin)
export default function TarjetaResumen({ titulo, valor, detalle, icono, color }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card text-white dashboard-card text-bg-${color} h-100`}>
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="dashboard-icon">
              <i className={`bi ${icono}`}></i>
            </div>
            <div className="ms-4">
              <h6 className="card-title mb-1">{titulo}</h6>
              <h3 className="card-text mb-0">{valor}</h3>
            </div>
          </div>
          {detalle && <p className="card-text small mt-3 mb-0">{detalle}</p>}
        </div>
      </div>
    </div>
  );
}
