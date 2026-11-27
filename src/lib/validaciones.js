// Reglas de validación de los formularios del panel.
// Cada función devuelve un objeto de errores: { campo: "mensaje" }.
// Si el objeto viene vacío, el formulario está bien.

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarCorreo(correo) {
  const texto = correo.trim();
  if (!texto) return "Debes escribir tu correo.";
  if (texto.length > 100) return "El correo no puede superar los 100 caracteres.";
  if (!REGEX_CORREO.test(texto)) return "El correo no tiene un formato válido.";
  return "";
}

// Dejamos solo los campos que realmente tienen un mensaje
export function limpiar(errores) {
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));
}

export function validarLogin({ correo, contrasena }) {
  return limpiar({
    correo: validarCorreo(correo),
    contrasena: !contrasena ? "Debes escribir tu contraseña." : "",
  });
}
