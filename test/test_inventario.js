import {
  cargarMateriales,
  cargarStockBajo,
  cargarCompras,
  cargarInventario,
  crearMaterial,
  editarMaterial,
  registrarCompra,
  validarMaterial,
  validarCompra,
  armarMaterial,
  armarCompra,
} from "@/lib/inventario";

const { module, test } = QUnit;

const materialCorrecto = { nombre: "Tinte", unidad: "ml", stock: "10", stockMinimo: "3", precioUnitario: "" };

// pedir falso que anota la última llamada
function pedirQueAnota(guardar) {
  return async (ruta, opciones) => {
    guardar.ruta = ruta;
    guardar.opciones = opciones;
    return {};
  };
}

module("inventario: llamadas al backend", () => {
  test("carga los materiales ordenados por nombre", async (assert) => {
    const pedirFalso = async () => [
      { id: 1, nombre: "Tinte" },
      { id: 2, nombre: "Shampoo" },
    ];

    const materiales = await cargarMateriales(pedirFalso);

    assert.deepEqual(materiales.map((m) => m.nombre), ["Shampoo", "Tinte"]);
  });

  test("el stock bajo se pide a su ruta", async (assert) => {
    const llamada = {};
    await cargarStockBajo(pedirQueAnota(llamada));

    assert.equal(llamada.ruta, "/api/materiales/stock-bajo");
  });

  test("las compras quedan con las más nuevas primero", async (assert) => {
    const pedirFalso = async () => [
      { id: 1, fecha: "2026-11-10" },
      { id: 2, fecha: "2026-11-12" },
      { id: 3, fecha: "2026-11-12" },
    ];

    const compras = await cargarCompras(pedirFalso);

    assert.deepEqual(compras.map((c) => c.id), [3, 2, 1]);
  });

  test("cargarInventario junta materiales, stock bajo y compras", async (assert) => {
    const pedirFalso = async (ruta) => {
      if (ruta === "/api/materiales") return [{ id: 1, nombre: "Tinte" }];
      if (ruta === "/api/materiales/stock-bajo") return [{ id: 1, nombre: "Tinte" }];
      return [{ id: 7, fecha: "2026-11-20" }];
    };

    const inventario = await cargarInventario(pedirFalso);

    assert.equal(inventario.materiales.length, 1);
    assert.equal(inventario.bajos.length, 1);
    assert.equal(inventario.compras[0].id, 7);
  });

  test("crear material manda un POST", async (assert) => {
    const llamada = {};
    await crearMaterial(pedirQueAnota(llamada), { nombre: "Tinte" });

    assert.equal(llamada.ruta, "/api/materiales");
    assert.equal(llamada.opciones.method, "POST");
    assert.deepEqual(llamada.opciones.body, { nombre: "Tinte" });
  });

  test("editar material manda un PUT a la ruta del material", async (assert) => {
    const llamada = {};
    await editarMaterial(pedirQueAnota(llamada), 4, { nombre: "Tinte" });

    assert.equal(llamada.ruta, "/api/materiales/4");
    assert.equal(llamada.opciones.method, "PUT");
  });

  test("registrar compra manda un POST a compras", async (assert) => {
    const llamada = {};
    await registrarCompra(pedirQueAnota(llamada), { materialId: 1, cantidad: 5, costoTotal: 9000 });

    assert.equal(llamada.ruta, "/api/compras");
    assert.equal(llamada.opciones.method, "POST");
    assert.deepEqual(llamada.opciones.body, { materialId: 1, cantidad: 5, costoTotal: 9000 });
  });
});

module("inventario: validaciones", () => {
  test("un material correcto no tiene errores (el precio es opcional)", (assert) => {
    assert.deepEqual(validarMaterial(materialCorrecto), {});
  });

  test("el nombre es requerido y máximo 100 caracteres", (assert) => {
    assert.ok(validarMaterial({ ...materialCorrecto, nombre: " " }).nombre);
    assert.ok(validarMaterial({ ...materialCorrecto, nombre: "a".repeat(101) }).nombre);
    assert.notOk(validarMaterial({ ...materialCorrecto, nombre: "a".repeat(100) }).nombre);
  });

  test("la unidad es requerida y máximo 20 caracteres", (assert) => {
    assert.ok(validarMaterial({ ...materialCorrecto, unidad: "" }).unidad);
    assert.ok(validarMaterial({ ...materialCorrecto, unidad: "a".repeat(21) }).unidad);
    assert.notOk(validarMaterial({ ...materialCorrecto, unidad: "unidades" }).unidad);
  });

  test("el stock y el stock mínimo son enteros de 0 o más", (assert) => {
    assert.notOk(validarMaterial({ ...materialCorrecto, stock: "0", stockMinimo: "0" }).stock);
    assert.ok(validarMaterial({ ...materialCorrecto, stock: "-1" }).stock);
    assert.ok(validarMaterial({ ...materialCorrecto, stock: "2.5" }).stock);
    assert.ok(validarMaterial({ ...materialCorrecto, stock: "" }).stock);
    assert.ok(validarMaterial({ ...materialCorrecto, stockMinimo: "-1" }).stockMinimo);
    assert.ok(validarMaterial({ ...materialCorrecto, stockMinimo: "" }).stockMinimo);
  });

  test("si se escribe el precio tiene que ser un entero de 0 o más", (assert) => {
    assert.notOk(validarMaterial({ ...materialCorrecto, precioUnitario: "0" }).precioUnitario);
    assert.notOk(validarMaterial({ ...materialCorrecto, precioUnitario: "1500" }).precioUnitario);
    assert.ok(validarMaterial({ ...materialCorrecto, precioUnitario: "-5" }).precioUnitario);
    assert.ok(validarMaterial({ ...materialCorrecto, precioUnitario: "10.5" }).precioUnitario);
  });

  test("una compra correcta no tiene errores", (assert) => {
    assert.deepEqual(validarCompra({ materialId: "1", cantidad: "5", costoTotal: "9000" }), {});
  });

  test("la compra pide material, cantidad y costo mayores a 0", (assert) => {
    const errores = validarCompra({ materialId: "", cantidad: "0", costoTotal: "-3" });

    assert.ok(errores.materialId);
    assert.ok(errores.cantidad);
    assert.ok(errores.costoTotal);
  });
});

module("inventario: cuerpos para el backend", () => {
  test("armarMaterial convierte a números y deja el precio vacío en null", (assert) => {
    const cuerpo = armarMaterial({ ...materialCorrecto, nombre: " Tinte ", unidad: " ml ", activo: true });

    assert.deepEqual(cuerpo, {
      nombre: "Tinte",
      unidad: "ml",
      stock: 10,
      stockMinimo: 3,
      precioUnitario: null,
      activo: true,
    });
  });

  test("armarMaterial manda el precio como número cuando se escribe", (assert) => {
    const cuerpo = armarMaterial({ ...materialCorrecto, precioUnitario: "1500", activo: true });

    assert.equal(cuerpo.precioUnitario, 1500);
  });

  test("armarCompra convierte los textos en números", (assert) => {
    const cuerpo = armarCompra({ materialId: "2", cantidad: "5", costoTotal: "9000" });

    assert.deepEqual(cuerpo, { materialId: 2, cantidad: 5, costoTotal: 9000 });
  });
});
