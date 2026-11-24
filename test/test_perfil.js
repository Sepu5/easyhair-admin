import { cargarPerfil, guardarPerfil, validarPerfil, armarPerfil } from "@/lib/perfil";

const { module, test } = QUnit;

const perfilCorrecto = { nombre: "Valeria Soto", correo: "valeria@easyhair.cl", password: "", confirmar: "" };

// pedir falso que anota la última llamada
function pedirQueAnota(guardar) {
  return async (ruta, opciones) => {
    guardar.ruta = ruta;
    guardar.opciones = opciones;
    return {};
  };
}

module("perfil", () => {
  test("cargarPerfil pide el usuario por su id", async (assert) => {
    const llamada = {};
    await cargarPerfil(pedirQueAnota(llamada), 3);

    assert.equal(llamada.ruta, "/api/usuarios/3");
  });

  test("guardarPerfil manda un PUT con los datos", async (assert) => {
    const llamada = {};
    await guardarPerfil(pedirQueAnota(llamada), 3, { nombre: "Valeria" });

    assert.equal(llamada.ruta, "/api/usuarios/3");
    assert.equal(llamada.opciones.method, "PUT");
    assert.deepEqual(llamada.opciones.body, { nombre: "Valeria" });
  });

  test("un perfil correcto no tiene errores (la contraseña es opcional)", (assert) => {
    assert.deepEqual(validarPerfil(perfilCorrecto), {});
  });

  test("el nombre es requerido y tiene de 3 a 100 caracteres", (assert) => {
    assert.ok(validarPerfil({ ...perfilCorrecto, nombre: "  " }).nombre);
    assert.ok(validarPerfil({ ...perfilCorrecto, nombre: "ab" }).nombre);
    assert.notOk(validarPerfil({ ...perfilCorrecto, nombre: "abc" }).nombre);
    assert.notOk(validarPerfil({ ...perfilCorrecto, nombre: "a".repeat(100) }).nombre);
    assert.ok(validarPerfil({ ...perfilCorrecto, nombre: "a".repeat(101) }).nombre);
  });

  test("el correo tiene que tener un formato válido", (assert) => {
    assert.ok(validarPerfil({ ...perfilCorrecto, correo: "" }).correo);
    assert.ok(validarPerfil({ ...perfilCorrecto, correo: "valeria@" }).correo);
    assert.notOk(validarPerfil({ ...perfilCorrecto, correo: "valeria@easyhair.cl" }).correo);
  });

  test("la contraseña nueva tiene de 6 a 72 caracteres y tiene que coincidir", (assert) => {
    assert.ok(validarPerfil({ ...perfilCorrecto, password: "12345", confirmar: "12345" }).password);
    assert.ok(validarPerfil({ ...perfilCorrecto, password: "a".repeat(73), confirmar: "a".repeat(73) }).password);
    assert.deepEqual(validarPerfil({ ...perfilCorrecto, password: "123456", confirmar: "123456" }), {});
    assert.ok(validarPerfil({ ...perfilCorrecto, password: "123456", confirmar: "654321" }).confirmar);
  });

  test("armarPerfil deja el correo en minúsculas y no manda contraseña vacía", (assert) => {
    const cuerpo = armarPerfil({ nombre: " Valeria ", correo: " Valeria@EasyHair.cl ", password: "", confirmar: "" });

    assert.deepEqual(cuerpo, { nombre: "Valeria", correo: "valeria@easyhair.cl" });
  });

  test("armarPerfil manda la contraseña cuando se escribió una nueva", (assert) => {
    const cuerpo = armarPerfil({ ...perfilCorrecto, password: "123456", confirmar: "123456" });

    assert.equal(cuerpo.password, "123456");
  });
});
