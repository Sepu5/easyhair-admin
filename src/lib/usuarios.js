// Lógica del mantenedor de usuarios (sin React, para poder probarla fácil).
// Todo esto es solo para el ADMIN: el backend responde 403 a cualquier otro rol.
import { validarCorreo } from "@/lib/validaciones";

export const ROLES = ["ADMIN", "STAFF", "CLIENTE"];

// Texto y color de cada rol para mostrarlo en la tabla
export const ETIQUETAS_ROL = {
  ADMIN: { texto: "Administrador", color: "text-bg-dark" },
  STAFF: { texto: "Staff", color: "text-bg-primary" },
  CLIENTE: { texto: "Cliente", color: "text-bg-secondary" },
};

// ---- Llamadas al backend ----

export function listarUsuarios(pedirFn) {
  return pedirFn("/api/usuarios");
}

export function crearUsuario(pedirFn, usuario) {
  return pedirFn("/api/usuarios", { method: "POST", body: usuario });
}

export function cambiarRol(pedirFn, id, rol) {
  return pedirFn(`/api/usuarios/${id}/rol`, { method: "PUT", body: { rol } });
}

export function eliminarUsuario(pedirFn, id) {
  return pedirFn(`/api/usuarios/${id}`, { method: "DELETE" });
}

// ---- Filtros y conteos ----

// Filtra por nombre o correo (sin importar mayúsculas) y por rol ("" = todos)
export function filtrarUsuarios(usuarios, { texto = "", rol = "" } = {}) {
  const buscado = texto.trim().toLowerCase();
  return usuarios.filter((usuario) => {
    const coincideTexto =
      !buscado ||
      usuario.nombre.toLowerCase().includes(buscado) ||
      usuario.correo.toLowerCase().includes(buscado);
    const coincideRol = !rol || usuario.rol === rol;
    return coincideTexto && coincideRol;
  });
}

// Cuántos usuarios hay de cada rol
export function contarPorRol(usuarios) {
  const conteo = { ADMIN: 0, STAFF: 0, CLIENTE: 0 };
  usuarios.forEach((usuario) => {
    if (conteo[usuario.rol] !== undefined) conteo[usuario.rol] += 1;
  });
  return conteo;
}

// El admin no puede cambiarse el rol ni borrarse a sí mismo (el backend responde 409)
export function esCuentaPropia(usuario, idSesion) {
  return usuario.id === idSesion;
}

// ---- Validaciones del formulario (las mismas reglas que el backend) ----

export function validarUsuario({ nombre, correo, password, rol }) {
  const errores = {};

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) errores.nombre = "Escribe el nombre.";
  else if (nombreLimpio.length < 3) errores.nombre = "El nombre debe tener al menos 3 letras.";
  else if (nombreLimpio.length > 100) errores.nombre = "El nombre no puede superar los 100 caracteres.";

  if (!correo.trim()) {
    errores.correo = "Escribe el correo.";
  } else {
    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) errores.correo = errorCorreo;
  }

  if (!password) errores.password = "Escribe una contraseña.";
  else if (password.length < 6) errores.password = "La contraseña debe tener al menos 6 caracteres.";

  if (!ROLES.includes(rol)) errores.rol = "Elige un rol.";

  return errores;
}

// Deja los datos como los espera el backend
export function armarUsuario({ nombre, correo, password, rol }) {
  return {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    password,
    rol,
  };
}
