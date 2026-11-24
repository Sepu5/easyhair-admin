// Lógica de los servicios (sin React, para poder probarla fácil)

// Todos los servicios ordenados por nombre
export async function cargarServicios(pedirFn) {
  const servicios = await pedirFn("/api/servicios");
  return [...servicios].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function crearServicio(pedirFn, servicio) {
  return pedirFn("/api/servicios", { method: "POST", body: servicio });
}

export function editarServicio(pedirFn, id, servicio) {
  return pedirFn(`/api/servicios/${id}`, { method: "PUT", body: servicio });
}

// El backend no lo borra: lo deja inactivo y deja de aparecer en la lista
export function eliminarServicio(pedirFn, id) {
  return pedirFn(`/api/servicios/${id}`, { method: "DELETE" });
}

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
  if (!esEntero(precio) || Number(precio) <= 0) errores.precio = "El precio debe ser un número entero mayor a 0.";
  return errores;
}

// Convierte lo que escribió el usuario en lo que espera el backend
export function armarServicio({ nombre, descripcion, duracion, precio }) {
  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    duracion: Number(duracion),
    precio: Number(precio),
  };
}