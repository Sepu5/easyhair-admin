import {
  listarPeluqueros,
  crearPeluquero,
  editarPeluquero,
  validarPeluquero,
  armarPeluquero,
} from "@/lib/peluqueros";

const { module, test } = QUnit;

module("peluqueros", () => {
  test("lista los peluqueros ordenados por nombre", async (assert) => {
    const pedirFalso = async () => [
      { id: 1, nombre: "Valeria" },
      { id: 2, nombre: "Ana" },
    ];

    const peluqueros = await listarPeluqueros(pedirFalso);

    assert.deepEqual(peluqueros.map((p) => p.nombre), ["Ana", "Valeria"]);
  });

  test("crear manda un POST con el peluquero", async (assert) => {
    let llamada = null;
    const pedirFalso = async (ruta, opciones) => {
      llamada = { ruta, opciones };
      return {};
    };

    await crearPeluquero(pedirFalso, { nombre: "Ana" });

    assert.equal(llamada.ruta, "/api/peluqueros");
    assert.equal(llamada.opciones.method, "POST");
    assert.deepEqual(llamada.opciones.body, { nombre: "Ana" });
  });

  test("editar manda un PUT a la ruta del peluquero", async (assert) => {
    let llamada = null;
    const pedirFalso = async (ruta, opciones) => {
      llamada = { ruta, opciones };
      return {};
    };

    await editarPeluquero(pedirFalso, 3, { nombre: "Ana" });

    assert.equal(llamada.ruta, "/api/peluqueros/3");
    assert.equal(llamada.opciones.method, "PUT");
  });

  test("un peluquero correcto no tiene errores", (assert) => {
    const errores = validarPeluquero({ nombre: "Ana", correo: "ana@easyhair.cl" });
    assert.deepEqual(errores, {});
  });

  test("el nombre es requerido y máximo 100 caracteres", (assert) => {
    assert.ok(validarPeluquero({ nombre: "  ", correo: "ana@easyhair.cl" }).nombre);
    assert.ok(validarPeluquero({ nombre: "a".repeat(101), correo: "ana@easyhair.cl" }).nombre);
    assert.notOk(validarPeluquero({ nombre: "a".repeat(100), correo: "ana@easyhair.cl" }).nombre);
  });

  test("el correo es requerido y debe tener formato válido", (assert) => {
    assert.ok(validarPeluquero({ nombre: "Ana", correo: "" }).correo);
    assert.ok(validarPeluquero({ nombre: "Ana", correo: "ana@" }).correo);
    assert.ok(validarPeluquero({ nombre: "Ana", correo: "ana.easyhair.cl" }).correo);
    assert.notOk(validarPeluquero({ nombre: "Ana", correo: "ana@easyhair.cl" }).correo);
  });

  test("armarPeluquero limpia espacios y deja el correo en minúsculas", (assert) => {
    const cuerpo = armarPeluquero({ nombre: " Ana ", correo: " Ana@EasyHair.cl ", activo: true });

    assert.deepEqual(cuerpo, { nombre: "Ana", correo: "ana@easyhair.cl", activo: true });
  });
});