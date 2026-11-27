// Lógica del perfil de la cuenta. La dejamos sin React para poder probarla fácil con QUnit
import { validarCorreo } from "@/lib/validaciones";

export function cargarPerfil(pedirFn, id) {
  return pedirFn(`/api/usuarios/${id}`);
}

export function guardarPerfil(pedirFn, id, datos) {
  return pedirFn(`/api/usuarios/${id}`, { method: "PUT", body: datos });
}

// La contraseña es opcional: si la dejan vacía, el backend mantiene la actual
export function validarPerfil({ nombre, correo, password, confirmar }) {
  const errores = {};

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) errores.nombre = "Escribe tu nombre.";
  else if (nombreLimpio.length < 3) errores.nombre = "El nombre debe tener al menos 3 letras.";
  else if (nombreLimpio.length > 100) errores.nombre = "El nombre no puede superar los 100 caracteres.";

  const errorCorreo = validarCorreo(correo);
  if (errorCorreo) errores.correo = errorCorreo;

  if (password) {
    if (password.length < 6) errores.password = "La contraseña debe tener al menos 6 caracteres.";
    else if (password.length > 72) errores.password = "La contraseña no puede superar los 72 caracteres.";
    else if (confirmar !== password) errores.confirmar = "Las contraseñas no coinciden.";
  }
  return errores;
}

// Solo mandamos la contraseña si escribieron una nueva
export function armarPerfil({ nombre, correo, password }) {
  const datos = { nombre: nombre.trim(), correo: correo.trim().toLowerCase() };
  if (password) datos.password = password;
  return datos;
}
