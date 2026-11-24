import {
  cargarServicios,
  crearServicio,
  editarServicio,
  eliminarServicio,
  validarServicio,
} from "@/lib/servicios";

const { module, test } = QUnit;

module("servicios", () => {
  test("carga los servicios ordenados por nombre", async (assert) => {
    const pedirFalso = async () => [
      { id: 1, nombre: "Tinte" },
      { id: 2, nombre: "Corte" },
    ];

    const servicios = await cargarServicios(pedirFalso);

    assert.deepEqual(servicios.map((s) => s.nombre), ["Corte", "Tinte"]);
  });

  test("crear manda un POST con el servicio", async (assert) => {
    let llamada = null;
    const pedirFalso = async (ruta, opciones) => {
      llamada = { ruta, opciones };
      return {};
    };

    await crearServicio(pedirFalso, { nombre: "Corte" });

    assert.equal(llamada.ruta, "/api/servicios");
    assert.equal(llamada.opciones.method, "POST");
    assert.deepEqual(llamada.opciones.body, { nombre: "Corte" });
  });

  test("editar manda un PUT a la ruta del servicio", async (assert) => {
    let llamada = null;
    const pedirFalso = async (ruta, opciones) => {
      llamada = { ruta, opciones };
      return {};
    };

    await editarServicio(pedirFalso, 5, { nombre: "Corte" });

    assert.equal(llamada.ruta, "/api/servicios/5");
    assert.equal(llamada.opciones.method, "PUT");
  });

  test("eliminar manda un DELETE a la ruta del servicio", async (assert) => {
    let llamada = null;
    const pedirFalso = async (ruta, opciones) => {
      llamada = { ruta, opciones };
      return null;
    };

    await eliminarServicio(pedirFalso, 5);

    assert.equal(llamada.ruta, "/api/servicios/5");
    assert.equal(llamada.opciones.method, "DELETE");
  });

  test("un servicio correcto no tiene errores", (assert) => {
    const errores = validarServicio({ nombre: "Corte", duracion: "30", precio: "8000" });
    assert.deepEqual(errores, {});
  });

  test("el nombre es requerido y máximo 100 caracteres", (assert) => {
    assert.ok(validarServicio({ nombre: "  ", duracion: "30", precio: "0" }).nombre);
    assert.ok(validarServicio({ nombre: "a".repeat(101), duracion: "30", precio: "0" }).nombre);
    assert.notOk(validarServicio({ nombre: "a".repeat(100), duracion: "30", precio: "0" }).nombre);
  });

  test("el precio es entero y no puede ser negativo", (assert) => {
    assert.notOk(validarServicio({ nombre: "Corte", duracion: "30", precio: "0" }).precio);
    assert.ok(validarServicio({ nombre: "Corte", duracion: "30", precio: "-1" }).precio);
    assert.ok(validarServicio({ nombre: "Corte", duracion: "30", precio: "10.5" }).precio);
    assert.ok(validarServicio({ nombre: "Corte", duracion: "30", precio: "" }).precio);
  });

  test("la duración es entera y mayor a 0", (assert) => {
    assert.ok(validarServicio({ nombre: "Corte", duracion: "0", precio: "0" }).duracion);
    assert.ok(validarServicio({ nombre: "Corte", duracion: "abc", precio: "0" }).duracion);
    assert.ok(validarServicio({ nombre: "Corte", duracion: "", precio: "0" }).duracion);
    assert.notOk(validarServicio({ nombre: "Corte", duracion: "45", precio: "0" }).duracion);
  });
});