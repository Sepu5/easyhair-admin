// Aviso con los materiales que hay que comprar (si no hay ninguno, no dibuja nada)
export default function AlertaStockBajo({ materiales }) {
  if (materiales.length === 0) return null;

  const cantidad = materiales.length;
  return (
    <div className="alert alert-warning" role="alert">
      <strong>Stock bajo en {cantidad} {cantidad === 1 ? "material" : "materiales"}:</strong>{" "}
      {materiales.map((material) => `${material.nombre} (${material.stock} ${material.unidad})`).join(", ")}
    </div>
  );
}
