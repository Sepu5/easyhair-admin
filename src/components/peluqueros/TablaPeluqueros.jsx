import FilaPeluquero from "@/components/peluqueros/FilaPeluquero";

// Tabla con los peluqueros de la peluquería.
// Si puedeEditar es false (staff) no mostramos la columna de acciones.
export default function TablaPeluqueros({ peluqueros, onEditar, puedeEditar = true }) {
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
            {puedeEditar && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {peluqueros.map((peluquero) => (
            <FilaPeluquero key={peluquero.id} peluquero={peluquero} onEditar={onEditar} puedeEditar={puedeEditar} />
          ))}
        </tbody>
      </table>
    </div>
  );
}