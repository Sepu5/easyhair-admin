import FilaServicio from "@/components/servicios/FilaServicio";

// Tabla con los servicios de la peluquería
export default function TablaServicios({ servicios, onEditar, onEliminar }) {
  if (servicios.length === 0) {
    return <div className="alert alert-light border">Aún no hay servicios registrados.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Duración</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <FilaServicio key={servicio.id} servicio={servicio} onEditar={onEditar} onEliminar={onEliminar} />
          ))}
        </tbody>
      </table>
    </div>
  );
}