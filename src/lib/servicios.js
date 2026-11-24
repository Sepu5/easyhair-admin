
// ---- Validaciones del formulario ----

// Acepta "30" pero no "", "3.5" ni "abc" (el formulario entrega textos)
function esEntero(valor) {
  const texto = String(valor).trim();
  return texto !== "" && Number.isInteger(Number(texto));
}

export function validarServicio({ nombre, duracion, precio }) {
  const errores = {};
  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) errores.nombre = "Escribe el nombre del servicio.";
  else if (nombreLimpio.length > 100) errores.nombre = "El nombre no puede superar los 100 caracteres.";

  if (!esEntero(duracion) || Number(duracion) <= 0) errores.duracion = "La duración debe ser un número entero mayor a 0.";
  if (!esEntero(precio) || Number(precio) < 0) errores.precio = "El precio debe ser un número entero de 0 o más.";
  return errores;
}