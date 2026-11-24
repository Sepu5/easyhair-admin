import {
  mesActual,
  mesValido,
  separarMes,
  rangoDelMes,
  cargarMovimientos,
  cargarResumen,
  cargarResumenPeluqueros,
  cargarResumenCategorias,
  cargarFinanzas,
  nombrePeluquero,
  crearMovimiento,
  eliminarMovimiento,
  validarMovimiento,
  armarMovimiento,
} from "@/lib/finanzas";

const { module, test } = QUnit;

const movimientoCorrecto = { tipo: "EGRESO", categoria: "ARRIENDO", monto: "300000", fecha: "2026-11-01", descripcion: "" };

// pedir falso que anota la última llamada
function pedirQueAnota(guardar) {
  return async (ruta, opciones) => {
    guardar.ruta = ruta;
    guardar.opciones = opciones;
    return {};
  };
}

module("finanzas: meses", () => {
  test("mesActual devuelve AAAA-MM con ceros", (assert) => {
    assert.equal(mesActual(new Date(2026, 10, 5)), "2026-11");
    assert.equal(mesActual(new Date(2026, 0, 9)), "2026-01");
  });

  test("mesValido acepta meses reales y años que acepta el backend", (assert) => {
    assert.ok(mesValido("2026-11"));
    assert.notOk(mesValido(""));
    assert.notOk(mesValido("2026-13"));
    assert.notOk(mesValido("2026-1"));
    assert.notOk(mesValido("1999-05"));
  });

  test("separarMes devuelve el año y el mes como números", (assert) => {
    assert.deepEqual(separarMes("2026-03"), { anio: 2026, mes: 3 });
  });

  test("rangoDelMes da el primer y el último día del mes", (assert) => {
    assert.deepEqual(rangoDelMes("2026-11"), { desde: "2026-11-01", hasta: "2026-11-30" });
    assert.deepEqual(rangoDelMes("2026-12"), { desde: "2026-12-01", hasta: "2026-12-31" });
    assert.equal(rangoDelMes("2026-02").hasta, "2026-02-28");
    assert.equal(rangoDelMes("2028-02").hasta, "2028-02-29");
  });
});

module("finanzas: llamadas al backend", () => {
  test("movimientos pide el rango del mes y agrega el tipo solo si se eligió", async (assert) => {
    const llamada = {};
    await cargarMovimientos(pedirQueAnota(llamada), "2026-11", "");
    assert.equal(llamada.ruta, "/api/movimientos?desde=2026-11-01&hasta=2026-11-30");

    await cargarMovimientos(pedirQueAnota(llamada), "2026-11", "EGRESO");
    assert.equal(llamada.ruta, "/api/movimientos?desde=2026-11-01&hasta=2026-11-30&tipo=EGRESO");
  });

  test("los resúmenes piden el año y el mes como números", async (assert) => {
    const llamada = {};

    await cargarResumen(pedirQueAnota(llamada), "2026-03");
    assert.equal(llamada.ruta, "/api/movimientos/resumen?anio=2026&mes=3");

    await cargarResumenPeluqueros(pedirQueAnota(llamada), "2026-03");
    assert.equal(llamada.ruta, "/api/movimientos/resumen/peluqueros?anio=2026&mes=3");

    await cargarResumenCategorias(pedirQueAnota(llamada), "2026-03");
    assert.equal(llamada.ruta, "/api/movimientos/resumen/categorias?anio=2026&mes=3");
  });

  test("cargarFinanzas junta movimientos, resúmenes y peluqueros", async (assert) => {
    const pedirFalso = async (ruta) => {
      if (ruta.startsWith("/api/movimientos/resumen/peluqueros")) return [{ peluqueroId: 1, totalIngresos: 5000 }];
      if (ruta.startsWith("/api/movimientos/resumen/categorias")) return [{ categoria: "SERVICIO", tipo: "INGRESO", total: 5000 }];
      if (ruta.startsWith("/api/movimientos/resumen")) return { totalIngresos: 5000, totalEgresos: 2000, ganancia: 3000 };
      if (ruta.startsWith("/api/movimientos")) return [{ id: 1 }];
      return [{ id: 1, nombre: "Valeria" }];
    };

    const datos = await cargarFinanzas(pedirFalso, "2026-11", "");

    assert.equal(datos.movimientos.length, 1);
    assert.equal(datos.resumen.ganancia, 3000);
    assert.equal(datos.porPeluquero[0].peluqueroId, 1);
    assert.equal(datos.porCategoria[0].categoria, "SERVICIO");
    assert.equal(datos.peluqueros[0].nombre, "Valeria");
  });

  test("nombrePeluquero usa el nombre o, si no está, el número", (assert) => {
    const peluqueros = [{ id: 1, nombre: "Valeria" }];

    assert.equal(nombrePeluquero(peluqueros, 1), "Valeria");
    assert.equal(nombrePeluquero(peluqueros, 9), "Peluquero #9");
  });

  test("crear manda un POST y eliminar un DELETE a la ruta del movimiento", async (assert) => {
    const llamada = {};

    await crearMovimiento(pedirQueAnota(llamada), { monto: 5000 });
    assert.equal(llamada.ruta, "/api/movimientos");
    assert.equal(llamada.opciones.method, "POST");
    assert.deepEqual(llamada.opciones.body, { monto: 5000 });

    await eliminarMovimiento(pedirQueAnota(llamada), 8);
    assert.equal(llamada.ruta, "/api/movimientos/8");
    assert.equal(llamada.opciones.method, "DELETE");
  });
});

module("finanzas: formulario", () => {
  test("un movimiento correcto no tiene errores (la descripción es opcional)", (assert) => {
    assert.deepEqual(validarMovimiento(movimientoCorrecto), {});
  });

  test("el tipo y la categoría tienen que ser de las listas", (assert) => {
    assert.ok(validarMovimiento({ ...movimientoCorrecto, tipo: "" }).tipo);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, tipo: "OTRO" }).tipo);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, categoria: "" }).categoria);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, categoria: "COMIDA" }).categoria);
    assert.notOk(validarMovimiento({ ...movimientoCorrecto, tipo: "INGRESO", categoria: "SERVICIO" }).categoria);
  });

  test("el monto es un entero mayor a 0", (assert) => {
    assert.notOk(validarMovimiento({ ...movimientoCorrecto, monto: "1" }).monto);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, monto: "0" }).monto);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, monto: "-5" }).monto);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, monto: "10.5" }).monto);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, monto: "" }).monto);
  });

  test("la fecha es obligatoria y la descripción máximo 200 caracteres", (assert) => {
    assert.ok(validarMovimiento({ ...movimientoCorrecto, fecha: "" }).fecha);
    assert.ok(validarMovimiento({ ...movimientoCorrecto, descripcion: "a".repeat(201) }).descripcion);
    assert.notOk(validarMovimiento({ ...movimientoCorrecto, descripcion: "a".repeat(200) }).descripcion);
  });

  test("armarMovimiento convierte el monto en número y limpia la descripción", (assert) => {
    const cuerpo = armarMovimiento({ ...movimientoCorrecto, descripcion: " Arriendo de noviembre " });

    assert.deepEqual(cuerpo, {
      tipo: "EGRESO",
      categoria: "ARRIENDO",
      monto: 300000,
      fecha: "2026-11-01",
      descripcion: "Arriendo de noviembre",
    });
  });
});
