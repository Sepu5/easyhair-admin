// Lógica del dashboard (sin React, para poder probarla fácil)
import { cargarAgenda, cargarPeluqueros, contarPorEstado } from "@/lib/reservas";

// Pide todo lo que muestra el dashboard al mismo tiempo (en paralelo con Promise.all),
// así la página carga en lo que tarda la petición más lenta y no en la suma de todas.
export async function cargarDashboard(pedirFn, hoy) {
  const [anio, mes] = hoy.split("-").map(Number);

  const [resumenMes, reservasHoy, stockBajo, consumosPendientes] = await Promise.all([
    pedirFn(`/api/movimientos/resumen?anio=${anio}&mes=${mes}`),
    cargarPeluqueros(pedirFn).then((peluqueros) => cargarAgenda(pedirFn, hoy, peluqueros, "")),
    pedirFn("/api/materiales/stock-bajo"),
    pedirFn("/api/consumos?estado=PENDIENTE"),
  ]);

  return { resumenMes, reservasHoy, stockBajo, consumosPendientes };
}

// Números de las tarjetas de arriba
export function armarTarjetas({ resumenMes, reservasHoy, stockBajo, consumosPendientes }) {
  const conteo = contarPorEstado(reservasHoy);
  return {
    ingresosMes: resumenMes?.totalIngresos || 0,
    gananciaMes: resumenMes?.ganancia || 0,
    reservasHoy: reservasHoy.length,
    pendientesHoy: conteo.PENDIENTE,
    stockBajo: stockBajo.length,
    consumosPendientes: consumosPendientes.length,
  };
}

// Las reservas de hoy que todavía falta atender, de la más temprana a la más tarde
export function proximasReservas(reservasHoy) {
  return reservasHoy.filter((reserva) => reserva.estado === "PENDIENTE");
}

// Cuánto falta comprar para volver al stock mínimo (al menos 1)
export function cantidadAComprar(material) {
  return Math.max(material.stockMinimo - material.stock, 0) + 1;
}

// "enero" ... "diciembre" para el título del resumen del mes
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function nombreMes(hoy) {
  const mes = Number(hoy.split("-")[1]);
  return MESES[mes - 1];
}

// ---- Consumos de materiales que registra el staff ----

export function aprobarConsumo(pedirFn, id) {
  return pedirFn(`/api/consumos/${id}/aprobar`, { method: "PUT" });
}

export function rechazarConsumo(pedirFn, id) {
  return pedirFn(`/api/consumos/${id}/rechazar`, { method: "PUT" });
}

// "2026-11-24T15:30:00" -> "24-11-2026 15:30"
export function formatearFechaHora(fechaHora) {
  if (!fechaHora) return "";
  const [fecha, hora] = fechaHora.split("T");
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}-${mes}-${anio} ${hora.slice(0, 5)}`;
}
