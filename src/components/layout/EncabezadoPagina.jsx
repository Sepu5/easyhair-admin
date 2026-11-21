// Título y descripción que va arriba de cada página del panel
export default function EncabezadoPagina({ titulo, descripcion }) {
  return (
    <div className="mt-4 mb-3">
      <h4>{titulo}</h4>
      {descripcion && <p className="text-muted mb-0">{descripcion}</p>}
    </div>
  );
}
