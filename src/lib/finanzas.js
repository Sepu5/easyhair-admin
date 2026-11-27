// Lógica de las finanzas. La dejamos sin React para poder probarla fácil con QUnit

// Tipos y categorías que acepta finanzas-service, con el texto y el color de Bootstrap que usamos
export const TIPOS = {
  INGRESO: { texto: "Ingreso", color: "success" },
  EGRESO: { texto: "Egreso", color: "danger" },
};

export const CATEGORIAS = {
  SERVICIO: "Servicio",
  MATERIAL: "Material",
  ARRIENDO: "Arriendo",
  SERVICIOS_BASICOS: "Servicios básicos",
  SUELDOS: "Sueldos",
  OTRO: "Otro",
};

// ---- Meses ----

// Mes de hoy en formato "AAAA-MM" (el formato que usa <input type="month">)
export function mesActual(ahora = new Date()) {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  return `${anio}-${mes}`;
}

// Nuestro backend solo acepta años entre 2000 y 2100
export function mesValido(mes) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) return false;
  const anio = Number(mes.slice(0, 4));
  return anio >= 2000 && anio <= 2100;
}

// "2026-11" -> { anio: 2026, mes: 11 }
export function separarMes(mes) {
  const [anio, numero] = mes.split("-");
  return { anio: Number(anio), mes: Number(numero) };
}

// "2026-11" -> { desde: "2026-11-01", hasta: "2026-11-30" }
export function rangoDelMes(mes) {
  const { anio, mes: numero } = separarMes(mes);
  // truco: el día 0 del mes siguiente es el último día de este mes
  const ultimoDia = new Date(anio, numero, 0).getDate();
  return { desde: `${mes}-01`, hasta: `${mes}-${String(ultimoDia).padStart(2, "0")}` };
}

// ---- Llamadas al backend ----

// Movimientos del mes (si el tipo viene vacío, traemos todos)
export function cargarMovimientos(pedirFn, mes, tipo) {
  const { desde, hasta } = rangoDelMes(mes);
  const filtroTipo = tipo ? `&tipo=${tipo}` : "";
  return pedirFn(`/api/movimientos?desde=${desde}&hasta=${hasta}${filtroTipo}`);
}

// { totalIngresos, totalEgresos, ganancia }
export function cargarResumen(pedirFn, mes) {
  const { anio, mes: numero } = separarMes(mes);
  return pedirFn(`/api/movimientos/resumen?anio=${anio}&mes=${numero}`);
}

export function cargarResumenPeluqueros(pedirFn, mes) {
  const { anio, mes: numero } = separarMes(mes);
  return pedirFn(`/api/movimientos/resumen/peluqueros?anio=${anio}&mes=${numero}`);
}

export function cargarResumenCategorias(pedirFn, mes) {
  const { anio, mes: numero } = separarMes(mes);
  return pedirFn(`/api/movimientos/resumen/categorias?anio=${anio}&mes=${numero}`);
}

// Pedimos todo lo de la página a la vez (en paralelo con Promise.all).
// Los peluqueros los pedimos para mostrar el nombre en el resumen por peluquero.
export async function cargarFinanzas(pedirFn, mes, tipo) {
  const [movimientos, resumen, porPeluquero, porCategoria, peluqueros] = await Promise.all([
    cargarMovimientos(pedirFn, mes, tipo),
    cargarResumen(pedirFn, mes),
    cargarResumenPeluqueros(pedirFn, mes),
    cargarResumenCategorias(pedirFn, mes),
    pedirFn("/api/peluqueros"),
  ]);
  return { movimientos, resumen, porPeluquero, porCategoria, peluqueros };
}

// El resumen solo trae el id; si el peluquero ya no está en la lista, mostramos el número
export function nombrePeluquero(peluqueros, id) {
  const peluquero = peluqueros.find((p) => p.id === id);
  return peluquero ? peluquero.nombre : `Peluquero #${id}`;
}

export function crearMovimiento(pedirFn, movimiento) {
  return pedirFn("/api/movimientos", { method: "POST", body: movimiento });
}

// Ojo: es un borrado de verdad, el movimiento no se puede recuperar
export function eliminarMovimiento(pedirFn, id) {
  return pedirFn(`/api/movimientos/${id}`, { method: "DELETE" });
}

// ---- Formulario ----

// Acepta "30" pero no "", "3.5" ni "abc" (los inputs siempre nos entregan texto)
function esEntero(valor) {
  const texto = String(valor).trim();
  return texto !== "" && Number.isInteger(Number(texto));
}

export function validarMovimiento({ tipo, categoria, monto, fecha, descripcion }) {
  const errores = {};
  if (!Object.keys(TIPOS).includes(tipo)) errores.tipo = "Elige si es un ingreso o un egreso.";
  if (!Object.keys(CATEGORIAS).includes(categoria)) errores.categoria = "Elige la categoría.";
  if (!esEntero(monto) || Number(monto) <= 0) errores.monto = "El monto debe ser un número entero mayor a 0.";
  if (!fecha) errores.fecha = "Elige la fecha.";
  if (descripcion.trim().length > 200) errores.descripcion = "La descripción no puede superar los 200 caracteres.";
  return errores;
}

// Pasamos lo que escribió el usuario al formato que espera el backend
export function armarMovimiento({ tipo, categoria, monto, fecha, descripcion }) {
  return {
    tipo,
    categoria,
    monto: Number(monto),
    fecha,
    descripcion: descripcion.trim(),
  };
}
