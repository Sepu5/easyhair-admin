import FilaPeluquero from "@/components/peluqueros/FilaPeluquero";

// Tabla con los peluqueros de la peluquería
export default function TablaPeluqueros({ peluqueros, onEditar }) {
  if (peluqueros.length === 0) {
    return <div className="alert alert-light border">Aún no hay peluqueros registrados.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {peluqueros.map((peluquero) => (
            <FilaPeluquero key={peluquero.id} peluquero={peluquero} onEditar={onEditar} />
          ))}
        </tbody>
      </table>
    </div>
  );
}