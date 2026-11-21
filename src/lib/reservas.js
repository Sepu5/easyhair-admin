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

// ---- Llamadas al backend ----

// Peluqueros activos (para el filtro de la agenda)
export async function cargarPeluqueros(pedirFn) {
  const peluqueros = await pedirFn("/api/peluqueros");
  return peluqueros.filter((peluquero) => peluquero.activo !== false);
}

// Agenda de un día.
// El backend entrega la agenda de UN peluquero, así que para "todos"
// se piden todas a la vez (en paralelo con Promise.all) y se juntan.
export async function cargarAgenda(pedirFn, fecha, peluqueros, peluqueroId) {
  const ids = peluqueroId ? [peluqueroId] : peluqueros.map((peluquero) => peluquero.id);
  const respuestas = await Promise.all(
    ids.map((id) => pedirFn(`/api/reservas/agenda?fecha=${fecha}&peluqueroId=${id}`))
  );
  return ordenarPorHora(respuestas.flat());
}

// ---- Acciones sobre una reserva ----

// Qué botones mostrar según las reglas del backend:
// todo solo con reservas pendientes, y atender solo el mismo día de la reserva
export function accionesDisponibles(reserva, hoy = fechaHoy()) {
  const pendiente = puedeModificarse(reserva);
  return {
    atender: pendiente && reserva.fecha === hoy,
    noAsistio: pendiente,
    cancelar: pendiente,
    reprogramar: pendiente,
  };
}

// El staff siempre tiene que explicar por qué cancela
export function validarMotivo(motivo) {
  const texto = motivo.trim();
  if (!texto) return "Indica el motivo de la cancelación.";
  if (texto.length > 200) return "El motivo no puede superar los 200 caracteres.";
  return "";
}

export function validarReprogramacion({ fecha, hora }, hoy = fechaHoy()) {
  const errores = {};
  if (!fecha) errores.fecha = "Elige una fecha.";
  else if (fecha < hoy) errores.fecha = "No se puede usar una fecha pasada.";
  if (!hora) errores.hora = "Elige una hora disponible.";
  return errores;
}

export function atenderReserva(pedirFn, id) {
  return pedirFn(`/api/reservas/${id}/atender`, { method: "PUT" });
}

export function marcarNoAsistio(pedirFn, id) {
  return pedirFn(`/api/reservas/${id}/no-asistio`, { method: "PUT" });
}

export function cancelarReserva(pedirFn, id, motivo) {
  return pedirFn(`/api/reservas/${id}/cancelar`, { method: "PUT", body: { motivo: motivo.trim() } });
}

export function reprogramarReserva(pedirFn, id, fecha, hora) {
  return pedirFn(`/api/reservas/${id}/reprogramar`, { method: "PUT", body: { fecha, hora } });
}

// Horas libres de un peluquero en una fecha (ej. ["10:00", "11:00"])
export async function cargarHorasLibres(pedirFn, fecha, peluqueroId) {
  const respuesta = await pedirFn(`/api/reservas/disponibilidad?fecha=${fecha}&peluqueroId=${peluqueroId}`);
  return respuesta.horasDisponibles || [];
}

// ---- Bloqueos de horario ----

export function validarBloqueo({ hora, motivo }) {
  const errores = {};
  if (!hora) errores.hora = "Elige la hora que quieres bloquear.";
  if (motivo.trim().length > 100) errores.motivo = "El motivo no puede superar los 100 caracteres.";
  return errores;
}

// Bloqueos del día ordenados por hora
export async function cargarBloqueos(pedirFn, fecha, peluqueroId) {
  const bloqueos = await pedirFn(`/api/bloqueos?fecha=${fecha}&peluqueroId=${peluqueroId}`);
  return [...bloqueos].sort((a, b) => a.hora.localeCompare(b.hora));
}

export function crearBloqueo(pedirFn, { peluqueroId, fecha, hora, motivo }) {
  return pedirFn("/api/bloqueos", {
    method: "POST",
    body: { peluqueroId: Number(peluqueroId), fecha, hora, motivo: motivo.trim() },
  });
}

export function eliminarBloqueo(pedirFn, id) {
  return pedirFn(`/api/bloqueos/${id}`, { method: "DELETE" });
}
