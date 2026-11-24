import FilaMaterial from "@/components/inventario/FilaMaterial";

// Tabla con los materiales; idsBajos son los que el backend marcó con stock bajo
export default function TablaMateriales({ materiales, idsBajos, onEditar, onComprar }) {
  if (materiales.length === 0) {
    return <div className="alert alert-light border">Aún no hay materiales registrados.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white">
        <thead className="table-light">
          <tr>
            <th>Material</th>
            <th>Stock</th>
            <th>Stock mínimo</th>
            <th>Precio unitario</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materiales.map((material) => (
            <FilaMaterial
              key={material.id}
              material={material}
              bajo={idsBajos.includes(material.id)}
              onEditar={onEditar}
              onComprar={onComprar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
