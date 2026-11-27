// Lógica de los peluqueros. La dejamos sin React para poder probarla fácil con QUnit
import { validarCorreo } from "@/lib/validaciones";

// Peluqueros activos ordenados por nombre (el backend solo nos entrega los activos)
export async function listarPeluqueros(pedirFn) {
  const peluqueros = await pedirFn("/api/peluqueros");
  return [...peluqueros].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function crearPeluquero(pedirFn, peluquero) {
  return pedirFn("/api/peluqueros", { method: "POST", body: peluquero });
}

export function editarPeluquero(pedirFn, id, peluquero) {
  return pedirFn(`/api/peluqueros/${id}`, { method: "PUT", body: peluquero });
}

// ---- Validaciones del formulario ----

export function validarPeluquero({ nombre, correo }) {
  const errores = {};
  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) errores.nombre = "Escribe el nombre del peluquero.";
  else if (nombreLimpio.length > 100) errores.nombre = "El nombre no puede superar los 100 caracteres.";

  if (!correo.trim()) {
    errores.correo = "Escribe el correo del peluquero.";
  } else {
    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) errores.correo = errorCorreo;
  }
  return errores;
}

// Dejamos los datos como los espera el backend (correo sin espacios y en minúsculas)
export function armarPeluquero({ nombre, correo, activo }) {
  return {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    activo,
  };
}