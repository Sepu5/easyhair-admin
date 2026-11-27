// Lógica del inventario. La dejamos sin React para poder probarla fácil con QUnit

// ---- Llamadas al backend ----

// Materiales activos ordenados por nombre
export async function cargarMateriales(pedirFn) {
  const materiales = await pedirFn("/api/materiales");
  return [...materiales].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// Cuáles tienen stock bajo lo decide el backend (stock <= stock mínimo)
export function cargarStockBajo(pedirFn) {
  return pedirFn("/api/materiales/stock-bajo");
}

// Compras, con las más nuevas primero
export async function cargarCompras(pedirFn) {
  const compras = await pedirFn("/api/compras");
  return [...compras].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
}

// Pedimos las tres listas a la vez (en paralelo con Promise.all)
export async function cargarInventario(pedirFn) {
  const [materiales, bajos, compras] = await Promise.all([
    cargarMateriales(pedirFn),
    cargarStockBajo(pedirFn),
    cargarCompras(pedirFn),
  ]);
  return { materiales, bajos, compras };
}

export function crearMaterial(pedirFn, material) {
  return pedirFn("/api/materiales", { method: "POST", body: material });
}

export function editarMaterial(pedirFn, id, material) {
  return pedirFn(`/api/materiales/${id}`, { method: "PUT", body: material });
}

// Al registrar la compra, el backend suma el stock y anota el gasto en Finanzas
export function registrarCompra(pedirFn, compra) {
  return pedirFn("/api/compras", { method: "POST", body: compra });
}

// ---- Validaciones de los formularios ----

// Acepta "30" pero no "", "3.5" ni "abc" (los inputs siempre nos entregan texto)
function esEntero(valor) {
  const texto = String(valor).trim();
  return texto !== "" && Number.isInteger(Number(texto));
}

export function validarMaterial({ nombre, unidad, stock, stockMinimo, precioUnitario }) {
  const errores = {};

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) errores.nombre = "Escribe el nombre del material.";
  else if (nombreLimpio.length > 100) errores.nombre = "El nombre no puede superar los 100 caracteres.";

  const unidadLimpia = unidad.trim();
  if (!unidadLimpia) errores.unidad = "Escribe la unidad (ej: ml, gr o unidades).";
  else if (unidadLimpia.length > 20) errores.unidad = "La unidad no puede superar los 20 caracteres.";

  if (!esEntero(stock) || Number(stock) < 0) errores.stock = "El stock debe ser un número entero de 0 o más.";
  if (!esEntero(stockMinimo) || Number(stockMinimo) < 0) {
    errores.stockMinimo = "El stock mínimo debe ser un número entero de 0 o más.";
  }

  // el precio es opcional, pero si lo escriben tiene que ser válido
  const precio = String(precioUnitario).trim();
  if (precio !== "" && (!esEntero(precio) || Number(precio) < 0)) {
    errores.precioUnitario = "El precio debe ser un número entero de 0 o más.";
  }
  return errores;
}

export function validarCompra({ materialId, cantidad, costoTotal }) {
  const errores = {};
  if (!materialId) errores.materialId = "Elige el material comprado.";
  if (!esEntero(cantidad) || Number(cantidad) <= 0) errores.cantidad = "La cantidad debe ser un número entero mayor a 0.";
  if (!esEntero(costoTotal) || Number(costoTotal) <= 0) {
    errores.costoTotal = "El costo total debe ser un número entero mayor a 0.";
  }
  return errores;
}

// ---- Cuerpos para el backend ----

// Pasamos lo que escribió el usuario al formato que espera el backend (precio vacío = null)
export function armarMaterial({ nombre, unidad, stock, stockMinimo, precioUnitario, activo }) {
  const precio = String(precioUnitario).trim();
  return {
    nombre: nombre.trim(),
    unidad: unidad.trim(),
    stock: Number(stock),
    stockMinimo: Number(stockMinimo),
    precioUnitario: precio === "" ? null : Number(precio),
    activo,
  };
}

export function armarCompra({ materialId, cantidad, costoTotal }) {
  return {
    materialId: Number(materialId),
    cantidad: Number(cantidad),
    costoTotal: Number(costoTotal),
  };
}
