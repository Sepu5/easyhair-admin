// Opciones del menú lateral.
// Se filtran según el rol del usuario en lib/permisos.js
export const opcionesMenu = [
  { href: "/", texto: "Dashboard", icono: "bi-house-fill" },
  { href: "/reservas", texto: "Reservas", icono: "bi-calendar-check" },
  { href: "/servicios", texto: "Servicios", icono: "bi-scissors" },
  { href: "/peluqueros", texto: "Peluqueros", icono: "bi-person-badge" },
  { href: "/inventario", texto: "Inventario", icono: "bi-box-seam" },
  { href: "/finanzas", texto: "Finanzas", icono: "bi-graph-up" },
  { href: "/usuarios", texto: "Usuarios", icono: "bi-people" },
];

// Dice si una opción del menú es la página actual
export function estaActiva(href, ruta) {
  if (href === "/") {
    return ruta === "/";
  }
  return ruta === href || ruta.startsWith(href + "/");
}
