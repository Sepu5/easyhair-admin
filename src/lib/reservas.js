// Lógica de las reservas (sin React, para poder probarla fácil)

// Estados que maneja reservas-service, con su texto y color de Bootstrap
export const ESTADOS = {
  PENDIENTE: { texto: "Pendiente", color: "warning" },
  ATENDIDA: { texto: "Atendida", color: "success" },
  CANCELADA: { texto: "Cancelada", color: "secondary" },
  NO_ASISTIO: { texto: "No asistió", color: "danger" },
};

// Fecha de hoy en formato "AAAA-MM-DD" (la hora local, no la de Londres)
export function fechaHoy(ahora = new Date()) {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Ordena por hora ("10:00" < "11:00") y luego por peluquero, sin cambiar el arreglo original
export function ordenarPorHora(reservas) {
  return [...reservas].sort((a, b) => {
    if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
    return (a.nombrePeluquero || "").localeCompare(b.nombrePeluquero || "");
  });
}

// estado vacío = todas
export function filtrarPorEstado(reservas, estado) {
  if (!estado) return reservas;
  return reservas.filter((reserva) => reserva.estado === estado);
}

// { PENDIENTE: 2, ATENDIDA: 1, CANCELADA: 0, NO_ASISTIO: 0 }
export function contarPorEstado(reservas) {
  const conteo = {};
  Object.keys(ESTADOS).forEach((estado) => {
    conteo[estado] = 0;
  });
  reservas.forEach((reserva) => {
    if (conteo[reserva.estado] !== undefined) conteo[reserva.estado]++;
  });
  return conteo;
}

// El backend solo deja atender, cancelar o reprogramar reservas pendientes
export function puedeModificarse(reserva) {
  return reserva.estado === "PENDIENTE";
}
