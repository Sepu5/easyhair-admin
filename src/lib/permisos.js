import { estaActiva, opcionesMenu } from "@/lib/menu";

// Secciones que puede ver cada rol.
// El STAFF trabaja en la peluquería: le dejamos ver la agenda, los servicios y los
// peluqueros, pero no la plata, el inventario ni las cuentas de usuario.
// Son las mismas reglas que pusimos en el backend (si no se cumplen, responde 403).
export const RUTAS_POR_ROL = {
  ADMIN: ["/", "/reservas", "/servicios", "/peluqueros", "/inventario", "/finanzas", "/usuarios", "/perfil"],
  STAFF: ["/", "/reservas", "/servicios", "/peluqueros", "/perfil"],
};

// Acciones que solo puede hacer el administrador
export const ACCIONES_ADMIN = [
  "editarServicios",
  "editarPeluqueros",
  "verResumenAdmin",
];

// Dice si el rol puede entrar a una ruta (incluidas sus subpáginas)
export function puedeVerRuta(rol, ruta) {
  const permitidas = RUTAS_POR_ROL[rol];
  if (!permitidas) {
    return false;
  }
  return permitidas.some((href) => estaActiva(href, ruta));
}

// Opciones del menú lateral que le corresponden al rol
export function menuDelRol(rol) {
  return opcionesMenu.filter((opcion) => puedeVerRuta(rol, opcion.href));
}

// Nombre del panel que mostramos arriba según quién entró
export function tituloPanel(rol) {
  return rol === "STAFF" ? "EasyHair Staff" : "EasyHair Admin";
}

// Dice si el rol puede hacer una acción (crear, editar, etc.)
export function puedeHacer(rol, accion) {
  if (rol === "ADMIN") {
    return true;
  }
  return !ACCIONES_ADMIN.includes(accion);
}
