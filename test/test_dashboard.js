import { cargarDashboard, armarTarjetas, proximasReservas, cantidadAComprar, nombreMes } from "@/lib/dashboard";

const { module, test } = QUnit;

const HOY = "2026-11-24";

// pedir falso: responde según la ruta y anota las rutas que se pidieron
function crearPedirFalso() {
  const rutas = [];
  const respuestas = {
    "/api/movimientos/resumen?anio=2026&mes=11": { totalIngresos: 120000, totalEgresos: 30000, ganancia: 90000 },
    "/api/peluqueros": [{ id: 1, nombre: "Valeria", activo: true }],
    [`/api/reservas/agenda?fecha=${HOY}&peluqueroId=1`]: [
      { id: 2, hora: "12:00", estado: "PENDIENTE" },
      { id: 1, hora: "10:00", estado: "ATENDIDA" },
    ],
    "/api/materiales/stock-bajo": [{ id: 7, nombre: "Tintura", stock: 1, stockMinimo: 3 }],
    "/api/consumos?estado=PENDIENTE": [{ id: 4 }, { id: 5 }],
  };
  const pedirFalso = async (ruta) => {
    rutas.push(ruta);
    return respuestas[ruta] ?? [];
  };
  return { pedirFalso, rutas };
}

module("dashboard", () => {
  test("cargarDashboard pide el resumen del mes, la agenda de hoy, el stock bajo y los consumos pendientes", async (assert) => {
    const { pedirFalso, rutas } = crearPedirFalso();

    const datos = await cargarDashboard(pedirFalso, HOY);

    assert.ok(rutas.includes("/api/movimientos/resumen?anio=2026&mes=11"));
    assert.ok(rutas.includes("/api/materiales/stock-bajo"));
    assert.ok(rutas.includes("/api/consumos?estado=PENDIENTE"));
    assert.equal(datos.resumenMes.ganancia, 90000);
    assert.deepEqual(datos.reservasHoy.map((r) => r.id), [1, 2]); // ordenadas por hora
    assert.equal(datos.consumosPendientes.length, 2);
  });

  test("armarTarjetas calcula los números de las tarjetas", async (assert) => {
    const { pedirFalso } = crearPedirFalso();
    const datos = await cargarDashboard(pedirFalso, HOY);

    assert.deepEqual(armarTarjetas(datos), {
      ingresosMes: 120000,
      gananciaMes: 90000,
      reservasHoy: 2,
      pendientesHoy: 1,
      stockBajo: 1,
      consumosPendientes: 2,
    });
  });

  test("sin datos del mes las tarjetas quedan en 0", (assert) => {
    const tarjetas = armarTarjetas({ resumenMes: null, reservasHoy: [], stockBajo: [], consumosPendientes: [] });
    assert.equal(tarjetas.ingresosMes, 0);
    assert.equal(tarjetas.reservasHoy, 0);
  });

  test("proximasReservas deja solo las pendientes", (assert) => {
    const lista = proximasReservas([
      { id: 1, estado: "ATENDIDA" },
      { id: 2, estado: "PENDIENTE" },
      { id: 3, estado: "CANCELADA" },
    ]);
    assert.deepEqual(lista.map((r) => r.id), [2]);
  });

  test("cantidadAComprar sube el stock por sobre el mínimo", (assert) => {
    assert.equal(cantidadAComprar({ stock: 1, stockMinimo: 3 }), 3);
    assert.equal(cantidadAComprar({ stock: 3, stockMinimo: 3 }), 1);
  });

  test("nombreMes devuelve el mes en español", (assert) => {
    assert.equal(nombreMes(HOY), "noviembre");
    assert.equal(nombreMes("2026-01-05"), "enero");
  });
});

module("dashboard del staff", () => {
  test("el staff solo pide la agenda de hoy", async (assert) => {
    const { pedirFalso, rutas } = crearPedirFalso();

    const datos = await cargarDashboard(pedirFalso, HOY, false);

    assert.notOk(rutas.includes("/api/movimientos/resumen?anio=2026&mes=11"));
    assert.notOk(rutas.includes("/api/materiales/stock-bajo"));
    assert.notOk(rutas.includes("/api/consumos?estado=PENDIENTE"));
    assert.deepEqual(datos.reservasHoy.map((r) => r.id), [1, 2]);
  });

  test("las tarjetas del staff no fallan sin datos de admin", async (assert) => {
    const { pedirFalso } = crearPedirFalso();
    const datos = await cargarDashboard(pedirFalso, HOY, false);

    const tarjetas = armarTarjetas(datos);

    assert.equal(tarjetas.reservasHoy, 2);
    assert.equal(tarjetas.ingresosMes, 0);
    assert.equal(tarjetas.consumosPendientes, 0);
  });
});
