import { CLAVE_TOKEN } from "@/lib/api";

// Nombre con el que guardamos los datos del usuario (nombre, correo, rol)
export const CLAVE_USUARIO = "easyhair_usuario";

// Roles que pueden entrar al panel (el CLIENTE solo usa la app)
export const ROLES_PANEL = ["ADMIN", "STAFF"];

// Leemos lo que viene dentro del token JWT (id, rol, exp...) sin validarlo.
// La validación de verdad la hace el gateway con la clave secreta; aquí solo lo usamos para saber cuándo vence.
export function leerDatosToken(token) {
  try {
    const parte = token.split(".")[1];
    // el JWT usa base64url, así que lo pasamos a base64 normal antes de decodificar
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((letra) => "%" + letra.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ojo: exp viene en segundos y Date.now() en milisegundos
export function tokenVencido(token, ahora = Date.now()) {
  const datos = leerDatosToken(token);
  if (!datos || !datos.exp) {
    return true;
  }
  return datos.exp * 1000 <= ahora;
}

export function puedeEntrarAlPanel(rol) {
  return ROLES_PANEL.includes(rol);
}

export function guardarSesion(token, usuario) {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

// Devuelve { token, usuario } si hay una sesión válida, o null si no hay.
// Si el token venció, borramos la sesión.
export function leerSesion(ahora = Date.now()) {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem(CLAVE_TOKEN);
  const texto = localStorage.getItem(CLAVE_USUARIO);
  if (!token || !texto) {
    return null;
  }

  if (tokenVencido(token, ahora)) {
    borrarSesion();
    return null;
  }

  try {
    return { token, usuario: JSON.parse(texto) };
  } catch {
    borrarSesion();
    return null;
  }
}


// ---- Renovación del token ----

// Si al token le queda menos de 1 hora, pedimos uno nuevo
export const MARGEN_RENOVACION = 60 * 60 * 1000;

// Dice si conviene renovar: el token sigue vigente pero está por vencer
export function debeRenovar(token, ahora = Date.now(), margen = MARGEN_RENOVACION) {
  const datos = leerDatosToken(token);
  if (!datos || !datos.exp) {
    return false;
  }
  const vence = datos.exp * 1000;
  return vence > ahora && vence - ahora <= margen;
}

// Le pedimos un token nuevo al backend usando el actual (dura otras 24 horas).
// El backend vuelve a leer el usuario, así que si le cambiaron el rol nos llega actualizado.
export async function renovarSesion(pedirFn) {
  const respuesta = await pedirFn("/api/auth/refresh", { method: "POST" });
  return { token: respuesta.token, usuario: respuesta.usuario };
}
