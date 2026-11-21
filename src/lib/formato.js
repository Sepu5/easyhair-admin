// Formatos chilenos para mostrar datos en el panel

// 25000 -> "$25.000"
export function formatearPrecio(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CL");
}

// "2026-11-21" -> "21-11-2026"
export function formatearFecha(fechaIso) {
  if (!fechaIso) return "";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}-${mes}-${anio}`;
}
