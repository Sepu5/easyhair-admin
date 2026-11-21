// Todo lo que la web le pide al backend pasa por aquí.

// URL del gateway (se cambia en .env.local)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://54.152.113.142";

// Nombre con el que se guarda el token en el navegador
export const CLAVE_TOKEN = "easyhair_token";

// Evento que avisa al resto del panel que el token ya no sirve (vencido o inválido)
export const EVENTO_SESION_EXPIRADA = "easyhair:sesion-expirada";

export function leerToken() {
  // en el servidor no existe localStorage
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(CLAVE_TOKEN);
}

// Arma los headers: JSON y el token si hay sesión
export function armarHeaders(token, extras = {}) {
  const headers = { "Content-Type": "application/json", ...extras };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// El backend responde los errores como { "mensaje": "..." }
export function mensajeDeError(status, datos) {
  if (datos && datos.mensaje) {
    return datos.mensaje;
  }
  if (status === 401) {
    return "Debes iniciar sesión";
  }
  if (status === 403) {
    return "No tienes permiso para hacer esto";
  }
  return `Error del servidor (${status})`;
}

// Hace una petición al gateway.
// Ej: pedir("/api/servicios")  o  pedir("/api/servicios", { method: "POST", body: servicio })
// Devuelve los datos de la respuesta o lanza un Error con el mensaje del backend.
export async function pedir(ruta, opciones = {}) {
  const { body, headers, ...resto } = opciones;
  const token = leerToken();

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...resto,
      headers: armarHeaders(token, headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  // algunas respuestas vienen vacías (ej. al eliminar)
  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = texto;
    }
  }

  // si mandamos un token y el gateway lo rechaza, la sesión expiró
  if (respuesta.status === 401 && token) {
    window.dispatchEvent(new window.Event(EVENTO_SESION_EXPIRADA));
  }

  if (!respuesta.ok) {
    const error = new Error(mensajeDeError(respuesta.status, datos));
    error.status = respuesta.status;
    throw error;
  }

  return datos;
}
